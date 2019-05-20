// Helper file for various tasks

// Dependencies
const crypto = require('crypto');
const config = require('../config');
// Container for all the helpers
const helpers = {};

helpers.hash = (str) =>{
    //Create as SHA256 hash
    if(typeof(str) === 'string' && str.length > 0){
        return crypto.createHmac('sha256',config.hashingSecret).update(str).digest("hex");
    }
    return false;
}

helpers.parseJsonToObject = (json) =>{
    try{
        let obj = JSON.parse(json);
        return obj;
    }catch(err){
        return {};
    }
}

// create a string of random alphaNumeric 
helpers.createRandomString = (strLength) =>{
    strLength = typeof(strLength) == 'number' ? strLength :false;
    if(strLength){
        // Define all the possible characters that go into the string 
        let possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
        let str = '';
        for(let i=1;i<=strLength;i++){
            // Get a random character from the possible characters
            let randomChar = possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length));
            // Append this to {str};
            str += randomChar;
        }
        return str;
    }else{
        return false;
    }
}

module.exports = helpers;