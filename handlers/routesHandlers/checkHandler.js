/*
*Check Handlers
*
*/

//dependencies
const dataa = require('../../lib/data.js');
const {hash,parseJSON}= require('../../controller/utilities.js');
const  tokenHandler = require('./tokenHandler.js');
 
//module scaffolding

const handler ={};

handler.checkHandler = (requestProperties,callback)=>{
        const acceptedMethod = ['get','post','put','delete'];

        if(acceptedMethod.indexOf(requestProperties.method) > -1){
            handler._check[requestProperties.method](requestProperties,callback);
        }else{
            callback(405);
        }
     
};

handler._check={};

handler._check.post = (requestProperties, callback)=>{

};

handler._check.get = (requestProperties, callback)=>{

};

handler._check.put = (requestProperties, callback)=>{

};

handler._check.delete = (requestProperties, callback)=>{

};
module.exports = handler;