/*
*sample Handlers
*
*/


//module scaffolding

const handler ={};

handler.sampleHandler = (requestProperties,callback)=>{

        console.log(requestProperties);

        callback(200,{
            message : 'This is a responce from sample url',
        });
};


module.exports = handler;