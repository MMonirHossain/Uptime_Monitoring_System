/*
*Notification feature for user
*
*/

//dependencies

const https = require('https');
const {twilio} = require('./environment.js');
const queryString = require('querystring');

//module scaffolding

const notification = {};


//send sms to user using twilio api
notification.sentTwilioSms = (phone, msg , callback )=>{
    //input validation
    const userPhone = typeof(phone) === 'string' && phone.trim().length === 11 ? phone : false;
    const userMsg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg : false;

    
    if(userPhone && userMsg){
        //configure the request payload
        const payload ={
            From: twilio.fromPhone,
            To: `+88${userPhone}`,
            Body : userMsg,
        };

        
        //stringify the payload (to send must be strigify, not a valid javascript)
        const stringifyPayload = queryString.stringify(payload);
        
        //configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            auth:`${twilio.accountSid}:${twilio.authToken}`,
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
            }
        };

        

        //instantiate the request object
        const req = https.request(requestDetails,(res)=>{
            //get the status of the sent request
            const status = res.statusCode;

            //callback successfully if the request went through

            if(status ===200 || status === 201){
                callback(false);
            }else{
                callback(`Status code returned was ${status}`);
            }
        });

        req.on('error',(e)=>{
            callback(e);
        });

        req.write(stringifyPayload);
        
        req.end();

    }else{
        callback('Given parameter is invalid');
    }
};

module.exports = notification;
