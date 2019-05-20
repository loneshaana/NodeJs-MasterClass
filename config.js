/*
create and export configuration
*/
var environments = {};
// Staging (default) object

environments.staging ={
  'httpPort':3000,
  'httpsPort':3001,
  'envName':'staging',
  'hashingSecret':"This is a secret"
};

//Production Object
environments.production ={
  'httpPort':5000,
  'httpsPort':5001,
  'envName':'productioin',
  'hashingSecret':"This is a secret"
};

let currentEnv = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

let environemntToExport = typeof(environments[currentEnv]) === 'object' ? environments[currentEnv] : environments.staging;
module.exports = environemntToExport;
