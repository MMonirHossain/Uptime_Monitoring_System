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
                                        url,
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
    const checkId = typeof(requestProperties.quaryStringObject.id)=== 'string' && requestProperties.quaryStringObject.id.trim().length === 20 ? requestProperties.quaryStringObject.id : false;
    if(checkId){
        dataa.read('checks',checkId,(err1,checkData)=>{
            if(!err1 && checkData){
                let token = typeof(requestProperties.headerObject.token)==='string' ? requestProperties.headerObject.token : false;

                tokenHandler._token.verify(token,parseJSON(checkData).phone,(isValid)=>{
                    if(isValid){
                        callback(200, parseJSON(checkData));
                    }else{
                        callback(403,{'error':'Authenticaiton Failure'});
                    }

                });



            }else{
                callback(500,{'error':'Server side error',});
            }
        });
    }else{
        callback(400,{'error':'You have a problem in your request',});
    }
};

handler._check.put = (requestProperties, callback)=>{
    let checkId = typeof(requestProperties.body.checkId)==='string' && requestProperties.body.checkId.trim().length ===20  ? requestProperties.body.checkId : false;
    //let phone = typeof(requestProperties.body.phone)==='string' && requestProperties.body.phone.trim().length === 11  ? requestProperties.body.phone : false;
    
    let protocol = typeof(requestProperties.body.protocol)==='string' && ['http','https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;
    let url = typeof(requestProperties.body.url)==='string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
    let method = typeof(requestProperties.body.method)==='string' && ['GET','POST','PUT','DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;
    let successCodes = typeof(requestProperties.body.successCodes)==='object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes:false;
    let timeoutSecond = typeof(requestProperties.body.timeoutSecond)==='number' && requestProperties.body.timeoutSecond % 1 ===0 && requestProperties.body.timeoutSecond >= 1 && requestProperties.body.timeoutSecond <=5 ? requestProperties.body.timeoutSecond : false;

    if(checkId && (protocol || url || method || successCodes || timeoutSecond)){
        dataa.read('checks',checkId,(err1,checkData)=>{
            if(!err1 && checkData){
                let checkObject = parseJSON(checkData);

                let token = typeof(requestProperties.headerObject.token)==='string' ? requestProperties.headerObject.token : false;

                
                tokenHandler._token.verify(token,checkObject.phone,(isValid)=>{
                    
                    if(isValid){
                        if(protocol){checkObject.protocol=protocol;}
                        if(url){checkObject.url=url;}
                        if(method){checkObject.method=method;}
                        if(successCodes){checkObject.successCodes=successCodes;}
                        if(timeoutSecond){checkObject.timeoutSecond=timeoutSecond;}
                        
                        dataa.update('checks',checkId,checkObject,(err2)=>{
                            if(!err2){
                                callback(200,checkObject);
                            }else{
                                 callback(500,{'error':'Server side error'});
                            }

                        });
                    }else{
                        callback(403,{'error':'Authenticaiton Failure'});
                    }

                });
            }else{
                callback(500,{'error':'Server side error'});
            }
        });
    }else{
        callback(400,{'error':'Problem on the request'});
    }
};

handler._check.delete = (requestProperties, callback)=>{
    const checkId = typeof(requestProperties.quaryStringObject.id)=== 'string' && requestProperties.quaryStringObject.id.trim().length === 20 ? requestProperties.quaryStringObject.id : false;
    if(checkId){
        dataa.read('checks',checkId,(err1,checkData)=>{
            if(!err1 && checkData){
                let token = typeof(requestProperties.headerObject.token)==='string' ? requestProperties.headerObject.token : false;

                tokenHandler._token.verify(token,parseJSON(checkData).phone,(isValid)=>{
                    if(isValid){
                        dataa.delete('checks',checkId,(err2)=>{
                            if(!err2){
                                dataa.read('users',parseJSON(checkData).phone,(err3,userData)=>{
                                    if(!err3 && userData){
                                        let userObject= parseJSON(userData);
                                        let userChecks= typeof(userObject.checks) === "object" && userObject.checks instanceof Array ? userObject.checks : [];
                                        //remove the deleted checks id from the user checks
                                        let checkPosition = userChecks.indexOf(checkId);
                                        if(checkPosition > -1){
                                            userChecks.splice(checkPosition,1);
                                            userObject.checks = userChecks;
                                            dataa.update('users',userObject.phone,userObject,(err4)=>{
                                                if(!err4){
                                                    callback(200,{'message':'Checks Deleted Successfully'});
                                                }else{
                                                    callback(500,{'error':'Server side error'});
                                                }
                                            });
                                        }else{
                                            callback(500,{'error':'Check Id not found'});
                                        }

                                    }else{
                                        callback(500,{'error':'Server side error'});
                                    }
                                });
                            }else{
                                callback(500,{'error':'Server side error'});
                            }
                        });
                    }else{
                        callback(403,{'error':'Authenticaiton Failure'});
                    }

                });



            }else{
                callback(500,{'error':'Server side error',});
            }
        });
    }else{
        callback(400,{'error':'You have a problem in your request',});
    }
};
module.exports = handler;