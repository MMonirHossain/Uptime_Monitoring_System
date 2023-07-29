/*
*token Handlers
*
*/

//dependencies
const dataa = require('../../lib/data.js');
const {hash,parseJSON,createRandomString}= require('../../controller/utilities.js');

 
//module scaffolding

const handler ={};

handler.tokenHandler = (requestProperties,callback)=>{
        const acceptedMethod = ['get','post','put','delete'];

        if(acceptedMethod.indexOf(requestProperties.method) > -1){
            handler._token[requestProperties.method](requestProperties,callback);
        }else{
            callback(405);
        }

        
};

handler._token={};

handler._token.post = (requestProperties, callback)=>{
    const password = typeof(requestProperties.body.password)=== 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
    const phone = typeof(requestProperties.body.phone)=== 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;
    
    

    if(phone && password){
        dataa.read('users',phone,(err1,userData)=>{
            let hashedPassword =  hash(password); 
            if(hashedPassword===parseJSON(userData).password){
                let tokenId = createRandomString(20);
                let expires = Date.now() + 7*24*60*60*1000;// 7days
                let tokenObject = {
                    'phone': phone,
                    'id': tokenId,
                    'expires': expires,
                };

                dataa.create('tokens',tokenId,tokenObject,(err2)=>{
                    if(!err2){
                        callback(200,tokenObject);
                    }else{
                        callback(500,{'error': 'There was a server side error'});
                    }
                });
            }else{
                callback(400,{
                    'error': 'Password doesn\' match',
                });
            }       
        });
    }else{
        callback(400,{
            'error': 'You have a problem in your request',
        });
    }
};

handler._token.get = (requestProperties, callback)=>{
    const id = typeof(requestProperties.quaryStringObject.id)=== 'string' && requestProperties.quaryStringObject.id.trim().length === 20 ? requestProperties.quaryStringObject.id : false;
    if(id){
        dataa.read('tokens',id,(err1,tokenData)=>{
            if(!err1 && tokenData){
                const token = {...parseJSON(tokenData)};

                callback(200,token);
            }else{
                callback(404,{'error': 'requested token not found',});
            }
        });
    }else{
        callback(404,{'error': 'requested token not found',});
    }

};

handler._token.put = (requestProperties, callback)=>{
    const id = typeof(requestProperties.body.id)=== 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;
    const extend = typeof(requestProperties.body.extend)=='boolean' && requestProperties.body.extend === true ? true: false;

    if(id && extend){
        dataa.read('tokens',id,(err1,tokenData)=>{
            let tokenObject = parseJSON(tokenData);
            if(tokenObject.expires > Date.now()){
                tokenObject.expires= Date.now() + 60*60*1000;
                //store this token now
                dataa.update('tokens',id,tokenObject,(err2)=>{
                    if(!err2){
                        callback(200,{'message': 'Token extended successfully',});
                    }else{
                        callback(400,{'error': 'Server Side Error.',});
                    }
                });

            }else{
                callback(400,{'error': 'Token Already Expired.',});
            }
        });
    }else{
        callback(400,{'error': 'There was a problem in your request.',});

    }
};

handler._token.delete = (requestProperties, callback)=>{
    const id = typeof(requestProperties.quaryStringObject.id)=== 'string' && requestProperties.quaryStringObject.id.trim().length === 20 ? requestProperties.quaryStringObject.id : false;
    if(id){
        dataa.read('tokens',id,(err1,tokenData)=>{
            if(!err1 && tokenData){
                dataa.delete('tokens',id,(err2)=>{
                    if(!err2){
                        callback(200,{'message':'Token Deleted Successfully'});
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
        callback(400,{'error':'There was a problem in your request.'});
    }
};

handler._token.verify = ( id, phone, callback)=>{
    dataa.read('tokens',id,(err1,tokenData)=>{
        if(!err1 && tokenData){
            
            
            if(parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()){
                callback(true);
            }else{
                callback(false);
            }
            
        }else{
            callback(false);
        }
    });
};

module.exports = handler;