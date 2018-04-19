'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB;

exports.getItemById = function(event, context, callback) {
    var params = {
			// AttributesToGet: [
			//   "_id","Name"
			// ],
			TableName: process.env.TABLE_NAME,
			Key : { 
				"_id" : {
				"S" : event.id
				}
			}
	  } 
       
    dynamodb.getItem(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });
}

   