/*
*user Handlers
*
*/

//dependencies
const dataa = require('../../lib/data.js');
const {hash,parseJSON}= require('../../controller/utilities.js');
const  tokenHandler = require('./tokenHandler.js');
 
//module scaffolding

const handler ={};

handler.userHandler = (requestProperties,callback)=>{
        const acceptedMethod = ['get','post','put','delete'];

        if(acceptedMethod.indexOf(requestProperties.method) > -1){
            handler._users[requestProperties.method](requestProperties,callback);
        }else{
            callback(405);
        }

        
};

handler._users={};

handler._users.post = (requestProperties, callback)=>{
    const firstName = typeof(requestProperties.body.firstName)=== 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;
    const lastName = typeof(requestProperties.body.lastName)=== 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;
    const password = typeof(requestProperties.body.password)=== 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
    const phone = typeof(requestProperties.body.phone)=== 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;
    const tosAggrement = typeof(requestProperties.body.tosAggrement)=== 'boolean' && requestProperties.body.tosAggrement ? requestProperties.body.tosAggrement : false;

    if(firstName && lastName && password && phone && tosAggrement){
        //Make sure this user already doesn't exist
        dataa.read('users',phone,(err1)=>{
            if(err1){
                let userObject={
                    firstName,
                    lastName,
                    password:hash(password),
                    phone,
                    tosAggrement,
                }
                
                //store the user to the db
                dataa.create('users',phone,userObject,(err2)=>{
                    if(!err2){
                        callback(200,{'message':'User Created Successfully.'});
                    }else{
                        callback(500,{'error':'could not create user'});
                    }
                });
            }else{
                callback(500,{
                    'error':'There was a problem in the server side'
                });
            }
        });
    }else{
        callback(400,{
            'error': 'You have a problem in your request',
        });
    }
};

handler._users.get = (requestProperties, callback)=>{
    //check the phone number is valid
    const phone = typeof(requestProperties.quaryStringObject.phone)=== 'string' && requestProperties.quaryStringObject.phone.trim().length === 11 ? requestProperties.quaryStringObject.phone : false;
    if(phone){
        //verify token
        let tokenId = typeof(requestProperties.headerObject.token)==='string' ? requestProperties.headerObject.token : false;

        tokenHandler._token.verify(tokenId,phone,(isValid)=>{
            if(isValid){
                //lookup the user
                dataa.read('users',phone,(err1,u)=>{
                    if(!err1 && u){
                        const user = {...parseJSON(u)};
                        delete user.password;
                        callback(200,user);
                    }else{
                        callback(404,{'error': 'requested user not found',});
                    }            
                });
            }else{
                callback(403,{'error': 'User Authentication failed'});
            }
        });

        
    }else{
        callback(404,{'error': 'requested user not found',});
    }
};

handler._users.put = (requestProperties, callback)=>{
    const firstName = typeof(requestProperties.body.firstName)=== 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;
    const lastName = typeof(requestProperties.body.lastName)=== 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;
    const password = typeof(requestProperties.body.password)=== 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
    const phone = typeof(requestProperties.body.phone)=== 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    if(phone){
        let tokenId = typeof(requestProperties.headerObject.token)==='string' ? requestProperties.headerObject.token : false;

        tokenHandler._token.verify(tokenId,phone,(isValid)=>{
            if(isValid){
                //lookup the user
                if(firstName || lastName || password){
                    //lookup the user
                    dataa.read('users',phone,(err1,uData)=>{
                        if(!err1 && uData){
                            const userData= {...parseJSON(uData)};
                            if(firstName)userData.firstName= firstName;
                            if(lastName)userData.lastName= lastName;
                            if(password)userData.password= hash(password);
        
                            dataa.update('users',phone,userData,(err2)=>{
                                if(!err2){
                                    callback(200,{'message':'User was updated successfully'});
                                }else{
                                    callback(500,{'error':'There was a problem in the serverside'});
                                }
                            });
                        }else{
                            callback(400, {'error':'you have a problem in your request'});
                        }
                    });
                }else{
                callback(400, {'error':'You have a problem in your request'});
        
                }
            }else{
                callback(403,{'error': 'User Authentication failed'});
            }
        });

    }else{
        callback(400, {'error':'Invalid Phone Number. Please try with another phone number'});
    }
};

handler._users.delete = (requestProperties, callback)=>{
    const phone = typeof(requestProperties.quaryStringObject.phone)=== 'string' && requestProperties.quaryStringObject.phone.trim().length === 11 ? requestProperties.quaryStringObject.phone : false;
    if(phone){
        
        let tokenId = typeof(requestProperties.headerObject.token)==='string' ? requestProperties.headerObject.token : false;

        tokenHandler._token.verify(tokenId,phone,(isValid)=>{
            if(isValid){
                //lookup the user
                dataa.read('users',phone,(err1,data)=>{
                    if(!err1 && data){
                        dataa.delete('users',phone,(err2)=>{
                            if(!err2){
                                callback(200,{'message':'Deleted Successfully'});
                            }else{
                                callback(500,{
                                    'error':'There was a server side error',
                                });
                            }
                        });
                    }else{
                        callback(500,{
                            'error':'There was a server side error',
                        });
                    }
                });
            }else{
                callback(403,{'error': 'User Authentication failed'});
            }
        });
    }else{
        callback(400,{'error':'There was a problem in your request.'});
    }
};
module.exports = handler;