/*
*Routes
*/

//dependencies
const {sampleHandler} = require('./handlers/routesHandlers/sampleHandlers.js');
const {userHandler} = require('./handlers/routesHandlers/userHandler.js');
const {tokenHandler} = require('./handlers/routesHandlers/tokenHandler.js');
const {checkHandler} = require('./handlers/routesHandlers/checkHandler.js');


const routes={
    sample : sampleHandler,
    user : userHandler,
    token : tokenHandler,
    check : checkHandler,
};

module.exports = routes;