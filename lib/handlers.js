/*
  Request Handlers
*/
const _data = require('./data');
const helpers = require('./helpers')

const handlers = {
  users: (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method) > -1) {
      handlers._users[data.method](data, callback);
    } else {
      callback(405);
    }
  },

  // Generate the Tokens
  tokens: (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if (acceptableMethods.indexOf(data.method) > -1) {
      handlers._tokens[data.method](data, callback);
    } else {
      callback(405);
    }
  },

  _tokens: {
    // Tokens post
    // Required data : phone password
    // optional Data None
    post: (data, callback) => {
      let phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
      let password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
      if (phone && password) {
        // LookUp The User Who Matches That Phone Number
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            // hash the sent password and compare it to the password stored in the userObject
            let hashedPassword = helpers.hash(password);
            if (hashedPassword == userData.hashedPassword) {
              // create the newToken with a random Name , Set expiration date 1hr in the future;
              let tokenId = helpers.createRandomString(20);
              let expires = Date.now() + 1000 * 60 * 60;

              let tokenObject = {
                phone,
                id: tokenId,
                expires
              };

              // Store the token
              _data.create('tokens', tokenId, tokenObject, (err) => {
                if (!err) {
                  callback(200, tokenObject);
                } else {
                  callback(500, {
                    "Error": "Couldn't create the token for the specified user"
                  });
                }
              })
            } else {
              callback(400, {
                "Error": "Invalid credentials"
              });
            }
          } else {
            callback(400, {
              "Error": "Couldn't find the specified user"
            });
          }
        })
      } else {
        console.warn(phone);
        console.warn(password);
        console.warn(data.payload);
        callback(400, {
          "Error": "Missing Required Fields"
        });
      }
    },

    // Tokens get
    // Required Data id
    // Optional data: None
    get: (data, callback) => {
      // Check the id is valid
      // get the id from the queryStringObject
      let id = typeof (data.queryStringObj.id) == 'string' && data.queryStringObj.id.trim().length == 20 ? data.queryStringObj.id.trim() : false;
      if (id) {
        _data.read('tokens', id, (err, tokenData) => {
          if (!err && tokenData) {
            callback(200, tokenData);
          } else {
            callback(404, {
              "Error": "Couldn't find the token"
            });
          }
        });
      } else {
        callback(400, {
          "Error": "Missing Required fields"
        });
      }
    },

    // Tokens put
    // Required fields id and extend(boolean)
    // Optional Data is None
    put: (data, callback) => {
      let id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
      let extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend ? true : false;
      if (extend && id) {
        // extend the expiry date of token
        _data.read("tokens", id, (err, tokenData) => {
          if (!err && tokenData) {
            // Make sure isn't already expired;
            if (tokenData.expires > Date.now()) {
              let expiration = Date.now() * 1000 * 60 * 60;
              tokenData.expires = expiration;
              _data.update('tokens', id, tokenData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  callback(500, {
                    "Error": "Couldn't update the expiry date of the token"
                  });
                }
              });
            } else {
              callback(400, {
                "Error": "Token is already expired and can't extend"
              });
            }
          } else {
            callback(400, {
              "Error": "Couldn't find the specific token"
            });
          }
        })
      } else {
        callback(400, {
          "Error": "Missing Required fields or fields are invalid"
        });
      }
    },
    // Tokens delete
    // Required Data is id 
    // Optional Data is None
    delete: (data, callback) => {
      // check the phone number is valid
      let id = typeof (data.queryStringObj.id) == 'string' && data.queryStringObj.id.trim().length == 20 ? data.queryStringObj.id.trim() : false;
      if (id) {
        //LookUp the user
        _data.read('tokens', id, function (err, data) {
          if (!err && data) {
            _data.delete('tokens', id, function (err) {
              if (!err) {
                callback(200);
              } else {
                callback(500, {
                  "Error": "Could't not delete the specified token"
                });
              }
            })
          } else {
            callback(400, {
              "Error": "Could't find the specified the token"
            });
          }
        })
      } else {
        callback(400, {
          "Error": "Missing Id"
        });
      }
    },

    verifyToken: (id, phone, callback) => {
      //LookUp the token
      _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
          // Check that the token is for the given user and is not expired;
          if (tokenData.phone == phone && tokenData.expires > Date.now()) {
            callback(true);
          } else {
            callback(false);
          }
        } else {
          callback(false);
        }
      })
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
        // let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the token is valid for the phone NUmber
        // handlers._tokens.verifyToken(token, phone, (isValid) => {
          // if (isValid) {
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
          // } else {
            // callback(403, {
              // "Error": "Missing required token in the header or the token is expired"
            // });
          // }
        // });

      } else {
        callback(400, {
          "Error": "Missing Required Fields"
        });
      }
    },
    //Required data phone
    //Optional data None
    get: (data, callback) => {
      // check phone number is valid
      let phone = typeof (data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
      if (phone) {
        // Get the token from the headers
        let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the token is valid for the phone NUmber
        handlers._tokens.verifyToken(token, phone, (isValid) => {
          if (isValid) {
            //LookUp the user
            _data.read('users', phone, function (err, data) {
              if (!err && data) {
                // Remove the hash password from the user object before it passes to the request
                delete data.hashedPassword;
                callback(200, data);
              } else {
                callback(404);
              }
            })
          } else {
            callback(403, {
              "Error": "Missing required token in the header or the token is expired"
            });
          }
        })
      } else {
        callback(400, {
          "Error": "Missing Phone Number"
        });
      }
    },

    // Required data is phone
    // Optional data is everything else
    put: (data, callback) => {
      // check for the required field
      let phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
      //check for the optional fields
      let firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
      let lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
      let password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

      // Error if the phone is invalid
      if (phone) {
        let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the token is valid for the phone NUmber
        handlers._tokens.verifyToken(token, phone, (isValid) => {
          if (isValid) {
            //Error if nothing is sent to update
            if (firstName || lastName || password) {
              //Lookup the user to update
              _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                  // update the fields which are neccessary
                  if (firstName) {
                    userData.firstName = firstName;
                  }
                  if (lastName) {
                    userData.lastName = lastName;
                  }
                  if (password) {
                    userData.hashedPassword = helpers.hash(password);
                  }
                  // Store the new updates persist them to disk
                  _data.update('users', phone, userData, function (err) {
                    if (!err) {
                      callback(200);
                    } else {
                      console.warn(err);
                      callback(500, {
                        "Error": "Could't update the user"
                      });
                    }
                  });

                } else {
                  callback(400, {
                    "Error": "Specified user doesn't exist"
                  });
                }
              })
            } else {
              callback(400, {
                "Error": "Missing Fields To Update"
              });
            }
          } else {
            callback(403, {
              "Error": "the token is not present in the headers or the token is expired"
            });
          }
        });

      } else {
        callback(400, {
          "Error": "Missing required field [phone] "
        });
      }

    },

    // Required field phone
    // @TODO only let authenticated user only delete their object
    // @TODO  cleanUp any data file associated with that phone number
    delete: (data, callback) => {
      // check the phone number is valid
      let phone = typeof (data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 10 ? data.queryStringObj.phone.trim() : false;
      if (phone) {
        let token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the token is valid for the phone NUmber
        handlers._tokens.verifyToken(token, phone, (isValid) => {
          if (isValid) {
            //LookUp the user
            _data.read('users', phone, function (err, data) {
              if (!err && data) {
                _data.delete('users', phone, function (err) {
                  if (!err) {
                    callback(200);
                  } else {
                    callback(500, {
                      "Error": "Could't not delete the specified user"
                    });
                  }
                })
              } else {
                callback(400, {
                  "Error": "Could't find the specified the user"
                });
              }
            })
          } else {
            callback(403, {
              "Error": "the token is not present in the headers or the token is expired"
            });
          }
        });

      } else {
        callback(400, {
          "Error": "Missing Phone Number"
        });
      }
    }
  },
  // Verify that the given tokenId is valid for the given user
  ping: (data, callback) => {
    callback(200);
  },
  notFound: (data, callback) => {
    callback(404);
  }
};

module.exports = handlers;