/*
* Title:Server library
* Author: Monir Hossain
*
*/

//dependencies 
const http = require('http');

const {handleReqRes}= require('../controller/handleReqRes.js');
const environment= require('../controller/environment.js');
//const dataa = require('./lib/data.js');
//const {sentTwilioSms}= require('./controller/notifications.js');

//app object - module scaffolding

const server = {};

//testing the notification
//sentTwilioSms('01948325474','Hello World',(err)=>{
//    console.log(err);
//});


/*
* testing file system functions

* test create file funciton
dataa.create('test','newFile',{'name':'Monir'},(err)=>{
    console.log(err);
});

*test read file function
dataa.read('test','newFile', (err,data)=>{
    if(!err){console.log(data);}
    else console.log(err);
});

*test update file funciton
dataa.update('test','newFile',{'name':'Tarek'},(err)=>{
    console.log(err);
});


*test delete file function
dataa.delete('test','newFile', (err)=>{
    console.log(err);
});

*/

// configuration

server.config ={
    port: environment.port,
    envName: environment.envName,
};

//create server
server.createServer= ()=>{
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(server.config.port, ()=>{
        
        console.log(`listening to port ${server.config.port}`);
        console.log(`Environment Variable: ${server.config.envName}`);
    });
};


// handle request and responce
server.handleReqRes = handleReqRes;

//start the server
server.init= ()=>{
    server.createServer();
};



module.exports = server;