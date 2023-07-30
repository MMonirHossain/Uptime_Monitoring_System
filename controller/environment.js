/*
*Handle all environment related things
*
*/


//dependencies


//module scaffoling

const environments ={};

environments.stagging ={
    port : 3000,
    envName: 'stagging',
    secretkey: 'Monir',
    maxChecks: 5,
    twilio:{
        fromPhone:'+14705929351',
        accountSid:'AC91e71b75cfef13f0d0ae140769118df6',
        authToken:'f7997d26956810e4377a1c79ebeab611',
    }
};

environments.production ={
    port : 4000,
    envName: 'production',
    secretkey: 'monir',
    maxChecks: 5,
    twilio:{
        fromPhone:'+14705929351',
        accountSid:'AC91e71b75cfef13f0d0ae140769118df6',
        authToken:'f7997d26956810e4377a1c79ebeab611',
    }
};



//determine which environment was passed

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : 'stagging';


//export corresponding environment object

const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment]: environments.stagging; 

module.exports = environmentToExport;