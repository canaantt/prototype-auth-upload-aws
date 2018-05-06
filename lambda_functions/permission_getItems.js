'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB;


exports.getItem = function(event, context, callback) {
	console.log('identity' in context);
	if( 'identity' in context && 'cognitoIdentityId' in context['identity']) {
        console.log('context.identity.cognitoIdentityId: ', context.identity.cognitoIdentityId);
        var result;
        console.log("====> ", event);
        if ( 'permissionId' in event['queryStringParameters']) {
            var params = {
                TableName: process.env.TABLE_NAME,
                Key : { 
                    "_id" : {
                        "S" : event['queryStringParameters']['permissionId']
                    }
                }
            }
            dynamodb.getItem(params, function(err, data) {
                if (err) console.log(err, err.stack);
                else {
                    console.log('==>', data);
                    result = data;
                    var response = {
                        'statusCode': 200,
                        'headers': { 
                            'Access-Control-Allow-Origin' : '*',
                            'Content-Type': 'application/json' 
                        },
                        'body': JSON.stringify(result)
                    };
                    callback(null, response);
                }
            });
        } else {
            var response = {
                'statusCode': 404,
                'headers': { 
                    'Access-Control-Allow-Origin' : '*',
                    'Content-Type': 'application/json' 
                },
                'body': JSON.stringify('event error')
                };
            callback(null, response);
        }	
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

   