/***
  library for storing and editing data
***/

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
// Container for the module

const lib = {};

// base dir
lib.baseDir = path.join(__dirname, '../', '.data/');

lib.create = (dir, fileName, data, callback) => {
  // Open the file for writing

  fs.open(lib.baseDir + dir + '/' + fileName + '.json', 'wx', (err, fileDiscriptor) => {
    if (!err && fileDiscriptor) {
      // Convert data to string ( serialization)
      const stringData = JSON.stringify(data);

      // write to the file and close it
      fs.write(fileDiscriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDiscriptor, (err) => {

            if (!err) {
              callback(false);
            } else {
              callback("Error closing new file")
            }
          })
        } else {
          callback('Error writing to new file')
        }
      });
    } else {
      console.warn(err)
      callback('Could not create file , it may already exist ', err);
    }
  });

}

// Read data from file
lib.read = (dir, fileName, callback) => {
  fs.readFile(lib.baseDir + dir + "/" + fileName + ".json", 'utf8', (err, data) => {
    if(!err && data){
      let parsedData = helpers.parseJsonToObject(data);
      callback(false,parsedData);
    }else{
      callback(err, data);
    }
  });
}

lib.update = (dir, fileName, data, callback) => {
  fs.open(lib.baseDir + dir + "/" + fileName + ".json", "r+", (err, fileDiscriptor) => {
    if (!err && fileDiscriptor) {
      const stringData = JSON.stringify(data);

      // truncate the file
      fs.truncate(fileDiscriptor, (err) => {
        if (!err) {
          // write to the file and close it
          fs.writeFile(fileDiscriptor, stringData, (err) => {
            if (!err) {
              fs.close(fileDiscriptor, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback("Error while closing the file")
                }
              })
            } else {
              callback("Error writing to the existing file")
            }
          })
        } else {
          callback('Error truncating file')
        }
      })
    } else {
      callback('Could not open the file for updating , it may not exist yet');
    }
  })
}

lib.delete = (dir, fileName, callback) => {
  //Unlink the file
  fs.unlink(lib.baseDir + dir + "/" + fileName + ".json", (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Error while deleting the file")
    }
  });
}
module.exports = lib;