const express = require('express')
const server = express();
const session = require('express-session')
const db = require('./db')
const methodOverride= require('method-override')
const nodemailer = require('nodemailer')
server.set('view engine','hbs')
server.use(methodOverride('_method'))
server.use(express.static(__dirname + '/public'));

var MySqlStore = require('express-mysql-session')(session)

var options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'session_test'
};

var sessionStore = new MySqlStore(options);

server.use(session({
  key: 'session_cookie_name',
  secret: 'session_cookie_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));


server.use(express.json())
server.use(express.urlencoded({extended:true}))

const loggedInOnly = (failure = "/login") => (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.redirect(failure);
    }
  };
  
  server.get("/", loggedInOnly(), (req, res) => {
    db.getAllBands(req.session.user.email)
      .then((bands) => {
        res.render("index", {
        username: req.session.user.username,
        bands
        })
      })
      .catch((err) => {
        res.send(err)
      })
  })
  
  server.get("/login", (req, res) => {
    if (req.session.user) {
      res.redirect("/");
    } else {
      res.render("login");
    }
  });
  
  server.delete('/delete', (req, res) => {
    let id = req.body.bandDelete;
    db.removeBand(id)
      .then(() => {
        res.redirect('/')
      })
      .catch((err) => {
        res.send(err)
      })
  })
  
  
  server.post("/signup", (req, res) => {
    const { email, password,name,college,dateofbirth } = req.body;
    db.addNewUser(email, password,name,college,dateofbirth)
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => {
      res.send(err)
    });
  });
  
  server.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.checkCredentials(email, password).then((check) => {
      if (check.length > 0) {
        req.session.user = {
          email: check[0].email,
          username:check[0].username
        };
        res.redirect("/");
      }
      else {
        res.sendStatus(401);
      }
    });
  });
  
  server.post('/add', (req, res) => {
    let band = req.body.band;
    let emailid = req.session.user.email;
    
    db.addNewBand(band, emailid)
      .then(() => {
        res.redirect('/')
      })
      .catch((err) => {
        res.send(err)
      })
  })
  server.put('/update', (req, res) => {
    let bandId = req.body.id;
    let bandName = req.body.bandname;
    db.updateBand(bandId, bandName)
      .then(() => {
        res.redirect("/")
      })
      .catch((err) => {
        console.log(err);
        res.send(err)
      })
  })
  
  server.get('/edit/:id',(req,res)=>{
      res.render("editView",{
          id:req.params.id
      })
  })
  
  server.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
  });
  
  server.get('/forgetPasswordView',(req,res)=>{
    res.render('forgetPasswordView')
  })

  server.post('/forgotpassword', (req, res) => {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'youremail@gmail.com',
        pass: 'yourpassword'
      }
    });
    let no = Math.floor(1000 + Math.random() * 9000);
    req.session.no = no.toString();
    let email = req.body.forgetEmail
    req.session.email = email
    var mailOptions = {
      from: 'youremail@gmail.com',
      to: req.body.forgetEmail,
      subject: 'RESET PASSWORD',
      text: no.toString()
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    res.render('enterOtpView')
  })
  
  server.get('/resetpassword', (req, res) => {
    res.render('login')
  })
  
  server.post('/resetpassword', function (req, res) {
    db.resetPassword(req.session.email, req.body.confirm_psw)
      .then(() => {
        res.redirect('/')
      })
      .catch((err) => {
        res.send(err)
      })
  })
  
  server.post('/otpset', (req, res) => {
    let no = (req.session.no).toString();
    if (no.localeCompare(req.body.otp) == 0)
      res.render('resetPasswordView')
    else
      res.render('login')
  })
  
server.listen(1009,()=>console.log('Starting'))