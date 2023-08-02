/*
* Title:Workers library
* Author: Monir Hossain
*
*/

//dependencies 
const dataa = require('./data.js');
const {parseJSON}= require('../controller/utilities.js');
const url = require('url');
const http = require('http');
const https = require('https');
const {sentTwilioSms} = require('../controller/notifications.js');

//worker object - module scaffolding
const worker = {};

//send notification sms to the user if state change occure
worker.alertUserToStatusChange=(newCheckData)=>{
    let msg= `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
    sentTwilioSms(newCheckData.phone, msg,(err1)=>{
        if(!err1){
            console.log('User was alerted to a status change via sms : '+msg);
        }else{
            console.log('There was a problem sending sms to one of the user.');
        }
    });
};

worker.processCheckOutcome = (checkData, checkOutcome)=>{
    //check if checkoutcome is up or down
    let state = !checkOutcome.error && checkOutcome.responseCode && checkData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';

    //decide whether we should alert the user or not

    let alertWanted = checkData.lastChecked && checkData.state != state ? true : false;

    //update the check data

    let newCheckData = checkData;
    newCheckData.state=state;
    newCheckData.lastChecked= Date.now();

    //update the check to the disk
    dataa.update('checks',newCheckData.checkId,newCheckData,(err1)=>{
        if(!err1){
            //send the check data to the next process
            if(alertWanted){
                worker.alertUserToStatusChange(newCheckData);
            }else{
                console.log('Alert not needed as there is no state change!');
            }
            
        }else{
            console.log('Error: trying to save check data one of the checks');
        }
    });

};

//perform the main check
worker.performCheck= (checkData)=>{
    //prepare the initial check outcome
    let checkOutcome = {
        'error' : false,
        'responseCode' : false,
    };

    //mark the outcome data has not been send yet
    let  outcomeSend = false;

    //parse the hostname and full url form orignal data
    const parseUrl = url.parse(checkData.protocol + ':/' + checkData.url, true);

    const hostname = parseUrl.hostname;
    const path = parseUrl.path; //.path return with query but .pathname return only website name

    //construct the request
    const requestDetails = {
        'protocol' : checkData.protocol + ':',
        'hostname' : hostname,
        'method' : checkData.method.toUpperCase(),
        'path' : path,
        'timeout' : checkData.timeoutSecond *1000, //timeout expect miliseconds
    };

    const protocolToUse = checkData.protocol === 'http' ? http : https;

    let req= protocolToUse.request(requestDetails,(res)=>{
        //grab the status code of the responce

        const status = res.statusCode;

        //update the check outcome and pass to the next process 
        checkOutcome.responseCode=status;
        if(!outcomeSend){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSend = true;
        }
    });

    req.on('error',(e)=>{
        checkOutcome = {
            error: true,
            value: e,
        };

        if(!outcomeSend){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSend = true;
        }
    });

    req.on('timeout',(e)=>{
        checkOutcome = {
            error: true,
            value: 'Timeout',
        };


        if(!outcomeSend){
            worker.processCheckOutcome(checkData, checkOutcome);
            outcomeSend = true;
        }
    });

    req.end();    
};

//validate check data
//checkId,phone,protocol,url,method,successCodes,timeoutSecond,
worker.validateCheckData = (originalCheckData)=>{
    if(originalCheckData && originalCheckData.checkId){
        let checkData=originalCheckData;
        checkData.state = typeof(checkData.state)==='string' && ['up','down'].indexOf(checkData.state) > -1 ? checkData.state : 'down';
        checkData.lastChecked = typeof(checkData.lastChecked)==='number' && checkData.lastChecked > 0 ? checkData.lastChecked : false;
        //pass to the next process

        worker.performCheck(checkData);

    }else{
        console.log('Error: Check was invalid or not properly formated!');
    }
};
//lookup all the check from the database
worker.gatherAllChecks = ()=>{
    dataa.list('checks',(err1,checks)=>{
        if(!err1 && checks && checks.length  > 0){
            checks.forEach((check) => {
                //read the check data
                dataa.read('checks',check,(err2,checkData)=>{
                    if(!err2 && checkData){
                        //pass the data to the next process:check validator
                        
                        worker.validateCheckData(parseJSON(checkData));
                    }else{
                        console.log('Error reading one of the checks data');
                    }
                });
            });
        }else{
            console.log('Error: Cound not found any checks to process');
        }
    });
};

//timer to execute the worker process once per minute
worker.loop = ()=>{
    setInterval(()=>{
        worker.gatherAllChecks();
    },1000*60);
};

worker.init =()=>{
    //executes all the checks
    worker.gatherAllChecks();

    //call the loop so that checks continue
    worker.loop();
};

module.exports = worker;