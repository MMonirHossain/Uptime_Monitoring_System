/*
* Handler of Request and Response
*
*
*/

// dependencies
const url = require('url');
const {StringDecoder} = require('string_decoder');
const { buffer } = require('stream/consumers');
const routes = require('../routes.js');
const {notFoundHandler} = require('../handlers/routesHandlers/notFoundHandler.js');
const {parseJSON} = require('../controller/utilities.js');

//module scaffold

const handler = {};


handler.handleReqRes = (req, res)=>{
    //request handling
    const urlParsed = url.parse(req.url,true);
    const path = urlParsed.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');
    const method = req.method.toLowerCase();
    const quaryStringObject = urlParsed.query;
    const headerObject = req.headers;
    
   

    const requestProperties = {
        urlParsed,
        path,
        trimmedPath,
        method,
        quaryStringObject,
        headerObject,
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

    


    
    req.on('data',(buffer)=>{
        realData += decoder.write(buffer);
    });

    req.on('end',()=>{
        realData += decoder.end();

        requestProperties.body = parseJSON(realData);

        chosenHandler(requestProperties,(statusCode,payload)=>{
            statusCode = typeof(statusCode) === 'number'? statusCode : 500 ;
            payload = typeof(payload)==='object' ? payload : {};
    
            const payloadString = JSON.stringify(payload);
    
            //return the final response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
    
        });
        
        //res.end('hello World');
    });

    

    //console.log(headerObject);
    //responce handling
    //res.end('hello World');
};



module.exports = handler;