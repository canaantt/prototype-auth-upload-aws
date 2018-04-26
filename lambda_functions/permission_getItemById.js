'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB;

exports.getItemById = function(event, context, callback) {
	var result;
	console.log("====> ", event);
	if ( event['queryStringParameters'] !== null ) {
		var params = {
			// AttributesToGet: [
			//   "_id","Name"
			// ],
			TableName: process.env.TABLE_NAME,
			Key : { 
				"_id" : {
				"S" : event['queryStringParameters']['id']
				}
			}
	  }
	  dynamodb.getItem(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     {
        	console.log(data);           // successful response
        	result = data;
        	var response = {
        		'statusCode': 200,
        		'headers': { 'Content-Type': 'application/json' },
        		'body': JSON.stringify(data)
    		};
    		callback(null, response);
        }
      });
	} else {
		var params = {
			TableName: process.env.TABLE_NAME
		}
		dynamodb.scan(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     {
        	console.log(data);           // successful response
        	var response = {
        		'statusCode': 200,
        		'headers': { 'Content-Type': 'application/json' },
        		'body': JSON.stringify(data)
    		};
    		callback(null, response);
        }
      });
	}
}

   