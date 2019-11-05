const mysql = require('mysql')

const connection = mysql.createConnection(
    {
        host:'localhost',
        user:'root',
        password:'root',
        database:'nodefinalassignment'
    }
)

function getAllBands(emailid){
    return new Promise(function(resolve, reject){
        connection.query(`SELECT * from bands b where b.email='${emailid}'`,
        function(err,rows,cols){
            if(err)
            {
                reject(err)
            }
            else 
                resolve(rows)
        })
    })
}

function checkCredentials(emailid,password)
{
    return new Promise(function(resolve,reject){
        connection.query(`select * from user u where u.email='${emailid}' and u.password='${password}'`,
        function(err,rows,cols){
            if(err)
                reject(err)
            else
                resolve(rows)
        })
    })
}

function addNewBand(bandname,name)
{
    return new Promise(function(resolve,reject){
        connection.query(`insert into bands(bandname,email) values(?,?)`,
        [bandname,name],
        function(err,rows){
            if(err)
                reject(err)
            else
                resolve()
        })
    })
}

function addNewUser(emailid,password,uname,college,dob)
{
    return new Promise(function(resolve,reject){
        connection.query(`insert into user(email,password,username,college,dateofbirth) values(?,?,?,?,?)`,
        [emailid,password,uname,college,dob],
        function(err,rows){
            if(err)
                reject(err)
            else
                resolve()
        })
    })
}

function removeBand(bandid)
{
    return new Promise(function(resolve,reject){
        connection.query(`delete from bands where bandid=?`,
        [bandid],
        function(err,rows,cols){
            if(err)
                reject(err)
            else
                resolve()
        })
    })
}

function updateBand(bandid,bandname)
{
    return new Promise(function(resolve,reject){
        connection.query(`update bands set bandname=? where bandid=?`,
        [bandname,bandid],
        function(err,rows,cols){
            if(err)
                reject(err)
            else
                resolve()
        })
    })
}

function resetPassword(email,password)
{
    return new Promise(function(resolve,reject){
        connection.query(`update user set password=? where email=?`,
        [password,email],
        function(err,rows,cols){
            if(err)
                reject(err)
            else
                resolve()
        })
    })
}

module.exports={
    getAllBands,
    addNewBand,
    checkCredentials,
    addNewUser,
    removeBand,
    updateBand,
    resetPassword
}