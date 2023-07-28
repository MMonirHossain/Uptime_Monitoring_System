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
};

environments.production ={
    port : 4000,
    envName: 'production',
    secretkey: 'monir',
};



//determine which environment was passed

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : 'stagging';


//export corresponding environment object

const environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment]: environments.stagging; 

module.exports = environmentToExport;