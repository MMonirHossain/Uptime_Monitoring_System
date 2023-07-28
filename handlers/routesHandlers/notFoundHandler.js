/*
*Not found Handlers
*
*/


//module scaffolding

const handler ={};

handler.notFoundHandler = (requestProperties,callback)=>{
        callback(404,{
            message: 'URL not found',
        });
};


module.exports = handler;