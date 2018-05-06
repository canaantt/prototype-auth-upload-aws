'use strict';

var AWS = require('aws-sdk'),
	uuid = require('uuid'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 

exports.createDataset = function(event, context, callback){
	console.log('context: ', context);
	if('identity' in context && 'cognitoIdentityId' in context['identity']) {
		console.log('printing out context',  context['identity']['cognitoIdentityId']);
		var object = JSON.parse(event.body);
    	console.log('==>', JSON.parse(event.body));
    	object['_id'] = uuid.v1();
    	object['Date'] = Date.now;
		var params = {
			Item : object,
			TableName : process.env.TABLE_NAME
		};
		documentClient.put(params, function(err, data){
			var response = {
        			'statusCode': 200,
        			'headers': { 
        				'Access-Control-Allow-Origin' : '*',
    					'Content-Type': 'application/json' 
        			},
        			'body': JSON.stringify(object['_id'])
    			};
    		callback(err, response);
		});
	} else {
		callback(null, {
			'statusCode': 400,
        	'headers': { 
        			'Access-Control-Allow-Origin' : '*',
    				'Content-Type': 'application/json' 
        		},
        		'body': JSON.stringify('No Identity was passed from API Gateway')
		});
	}
}
