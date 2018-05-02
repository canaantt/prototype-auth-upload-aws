'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB;

exports.deleteDataset = function(event, context, callback){
	console.log(event['pathParameter']);
    var params = {
		Key : {
		    "_id":{
		        S: event['pathParameter']['projectId']
		    }
		},
		TableName : process.env.TABLE_NAME
	};
	dynamodb.deleteItem(params, function(err, data){
		var response = {
        		'statusCode': 200,
        		'headers': { 
        			'Access-Control-Allow-Origin' : '*', 
    				'Access-Control-Allow-Credentials' : true,
    				'Content-Type': 'application/json' 
        		},
        		'body': JSON.stringify(data)
    		};
    	callback(err, response);
	});
}
