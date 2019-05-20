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

module.exports = helpers;