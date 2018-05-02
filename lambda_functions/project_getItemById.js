'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB;


exports.getItems = function(event, context, callback) {
	var result;
	console.log("====> ", event);
	if ( event['queryStringParameters'] !== null && event['queryStringParameters']['projectId'] !== null) {
		var params = {
			TableName: process.env.TABLE_NAME,
			Key : { 
				"_id" : {
					"S" : event['queryStringParameters']['projectId']
				}
			}
	    }
		dynamodb.getItem(params, function(err, data) {
			if (err) console.log(err, err.stack);
			else     {
				console.log(data);
				result = data;
				var response = {
					'statusCode': 200,
					'headers': { 'Content-Type': 'application/json' },
					'body': JSON.stringify(data)
				};
				callback(null, response);
			}
		});
	} else if ( event['queryStringParameters'] !== null && event['queryStringParameters']['userId'] !== null) {
		var params = {
			TableName: process.env.TABLE_NAME,
			Key : { 
				"datasetOwnerId" : {
					"S" : event['queryStringParameters']['userId']
				}
			}
	    }
		dynamodb.getItem(params, function(err, data) {
			if (err) console.log(err, err.stack);
			else     {
				console.log(data);
				result = data;
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

   