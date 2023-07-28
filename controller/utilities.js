/*
* All the utilities funtion are degined here
*
*
*/

//
const crpto= require('crypto');
const environment= require('./environment.js');

const utilities = {};

//parse json string to objects
utilities.parseJSON = (jsonString)=>{
    let output = {};

    try{
        output= JSON.parse(jsonString);
    }catch{
        output = {};
    }
    return output;
}

//making hash function
utilities.hash = (str)=>{
    if(typeof(str)=== 'string' && str.length>0){
        const hashStr= crpto
        .createHmac('sha256', environment.secretkey)
        .update(str)
        .digest('hex');

        return hashStr;
    }else{
        return false;
    }
}

//create random string

utilities.createRandomString = (strLength)=>{
    let length = strLength;
    length= typeof(strLength)==='number' && strLength>0? strLength:false;
    if(length){
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz123456789';
        let output='';
        for(let i=1;i<=length;i++){
            let randomChar = possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length));
            output+=randomChar;
        }
        return output;
    }else{
        return false;
    }
}

module.exports = utilities;