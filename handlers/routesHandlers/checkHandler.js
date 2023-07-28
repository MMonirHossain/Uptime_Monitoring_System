/*
*Check Handlers
*
*/

//dependencies
const dataa = require('../../lib/data.js');
const {hash,parseJSON, createRandomString}= require('../../controller/utilities.js');
const  tokenHandler = require('./tokenHandler.js');
const {maxChecks}= require('../../controller/environment.js');
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
    let protocol = typeof(requestProperties.body.protocol)==='string' && ['http','https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;
    let url = typeof(requestProperties.body.url)==='string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
    let method = typeof(requestProperties.body.method)==='string' && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;
    let successCodes = typeof(requestProperties.body.successCodes)==='object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes:false;
    let timeoutSecond = typeof(requestProperties.body.timeoutSecond)==='number' && requestProperties.body.timeoutSecond % 1 ===0 && requestProperties.body.timeoutSecond >= 1 && requestProperties.body.timeoutSecond <=5 ? requestProperties.body.timeoutSecond : false;
    
    if(protocol && url && method && successCodes && timeoutSecond){
        let token = typeof(requestProperties.headerObject.token)==='string' ? requestProperties.headerObject.token : false;

        //lookup the user phone by reading the token
        dataa.read('tokens',token,(err1,tokenData)=>{
            if(!err1 && tokenData){
                let phone = parseJSON(tokenData).phone;

                dataa.read('users',phone,(err2,userData)=>{
                    if(!err2 && userData){
                        tokenHandler._token.verify(token,phone,(isValid)=>{
                            if(isValid){
                                let userObject =parseJSON(userData);
                                let userChecks = typeof(userObject.checks)==='object' && userObject.checks instanceof Array ? userObject.checks : [];
                                
                                if(userChecks.length < maxChecks){
                                    let checkId= createRandomString(20);
                                    let checkObject={
                                        checkId,
                                        phone,
                                        protocol,
                                        method,
                                        successCodes,
                                        timeoutSecond,
                                    };
                                    //save the object

                                    dataa.create('checks',checkId,checkObject,(err3)=>{
                                        if(!err3){
                                            //add check id to the users object
                                            userObject.checks= userChecks;
                                            userObject.checks.push(checkId);

                                            //save the new user data
                                            dataa.update('users',phone, userObject,(err4)=>{
                                                if(!err4){
                                                    callback(200,checkObject);
                                                }else{
                                                    callback(500,{
                                                        'error': 'There was a problem in the server side',
                                                    });
                                                }
                                            });
                                        }else{
                                            callback(500,{
                                                'error': 'There was a problem in the server side',
                                            });
                                        }
                                    });
                                }else{
                                    callback(401,{
                                        'error': `Max limit of ${maxChecks} exceed!`,
                                    });
                                }

                            }else{
                                callback(403,{
                                    'error': 'Authentication failure',
                                });
                            }
                        });
                    }else{
                        callback(403,{
                            'error': 'User not found',
                        });
                    }
                });
            }else{
                callback(403,{
                    'error': 'Authentication Problem',
                });
            }
        });

    }else{
        callback(400,{
            'error': 'Invalid Request Received',
        });
    }
};

handler._check.get = (requestProperties, callback)=>{

};

handler._check.put = (requestProperties, callback)=>{

};

handler._check.delete = (requestProperties, callback)=>{

};
module.exports = handler;