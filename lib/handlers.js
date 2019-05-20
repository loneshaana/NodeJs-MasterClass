/*
  Request Handlers
*/
const _data = require('./data');
const helpers = require('./helpers')


const handlers = {
  users: (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method) > -1) {
      console.log("Method ", data.method);

      console.log(handlers._users[data.method]);
      handlers._users[data.method](data, callback);
    } else {
      callback(405);
    }
  },
  // Users Post
  // Required feild FirstName,lastName phone password tosAgreement
  // Optional data none;
  _users: {
    // Required fields firstName,lastName,phone,password,(boolean), tosAgreement

    post: (data, callback) => {
      // Check that all the required fileds
      let firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
      let lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
      let phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
      let password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
      let tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement ? true : false;

      if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user is not already present
        _data.read('users', phone, function (err, data) {
          if (err) {
            // Hash The password
            let hashedPassword = helpers.hash(password);
            if (hashedPassword) {
              // Create the user object
              let userObject = {
                firstName,
                lastName,
                phone,
                hashedPassword,
                tosAgreement: tosAgreement
              };
              // store the user
              _data.create('users', phone, userObject, function (err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, {
                    "Error": 'Could not create the new user'
                  });
                }
              });
            } else {
              // User with that phone number already exists ?
              callback(500, {
                "Error": "Could not hash the user"
              });
            }
          } else {
            callback(400, {
              "Error": "User with that phone already exists"
            });
          }
        })
        // Create the user
      } else {
        callback(400, {
          "Error": "Missing Required Fields"
        });
      }
    },
    //Required data phone
    //Optional data None
    // @TODO only let the authenticated user access there object dont't let them access any one elses
    get: (data, callback) => {
      // check phone number is valid
      let phone = typeof(data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
      if(phone){
        //LookUp the user
        _data.read('users',phone,function(err,data){
          if(!err && data){
            // Remove the hash password from the user object before it passes to the request
            delete data.hashedPassword;
            callback(200,data);
          }else{
            callback(404);
          }
        })
      }else{
        callback(400,{"Error":"Missing Phone Number"});
      }
    },

    // Required data is phone
    // Optional data is everything else
    // @TODO only let the authenticated update there object don't let them update the others object
    put: (data, callback) => {
      // check for the required field
      let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
      //check for the optional fields
      let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
      let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
      let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

      // Error if the phone is invalid
      if(phone){
        //Error if nothing is sent to update
        if(firstName || lastName || password){
          //Lookup the user to update
          _data.read('users',phone,function(err,userData){
            if(!err && userData){
              // update the fields which are neccessary
              if(firstName){
                userData.firstName = firstName;
              }
              if(lastName){
                userData.lastName = lastName;
              }
              if(password){
                userData.hashedPassword = helpers.hash(password);
              }
              // Store the new updates persist them to disk
              _data.update('users',phone,userData,function(err){
                  if(!err){
                    callback(200);
                  }else{
                    console.warn(err);
                    callback(500,{"Error":"Could't update the user"});
                  }
              });

            }else{
              callback(400 , {"Error":"Specified user doesn't exist"});
            }
          })
        }else{
          callback(400,{"Error":"Missing Fields To Update"});
        }
      }else{
        callback(400,{"Error":"Missing required field [phone] "});
      }

    },

    // Required field phone
    // @TODO only let authenticated user only delete their object
    // @TODO  cleanUp any data file associated with that phone number
    delete: (data, callback) => {
      // check the phone number is valid
      let phone = typeof(data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
      if(phone){
        //LookUp the user
        _data.read('users',phone,function(err,data){
          if(!err && data){
            _data.delete('users',phone,function(err){
              if(!err){
                callback(200);
              }else{
                callback(500,{"Error":"Could't not delete the specified user"});
              }
            })
          }else{
            callback(400,{"Error":"Could't find the specified the user"});
          }
        })
      }else{
        callback(400,{"Error":"Missing Phone Number"});
      }
    }

  },
  ping: (data, callback) => {
    callback(200);
  },
  notFound: (data, callback) => {
    callback(404);
  }
};

module.exports = handlers;