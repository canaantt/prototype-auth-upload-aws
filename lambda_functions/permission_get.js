'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB;


exports.getItem = function(event, context, callback) {
	console.log('identity' in context);
	if( 'identity' in context && 'cognitoIdentityId' in context['identity']) {
        console.log('context.identity.cognitoIdentityId: ', context.identity.cognitoIdentityId);
        var result;
        console.log("====> ", event);
        
            var params = {
                TableName: process.env.TABLE_NAME
            }
            dynamodb.scan(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     {
                    console.log(data);           // successful response
                    var response = {
                        'statusCode': 200,
                        'headers': { 
                            'Access-Control-Allow-Origin' : '*',
                            'Content-Type': 'application/json' 
                        },
                        'body': JSON.stringify(data)
                    };
                    callback(null, response);
                }
            });

	} else {
		callback(null, {
			'statusCode': 400,
        	'headers': { 
        			'Access-Control-Allow-Origin' : '*',
    				// 'Access-Control-Allow-Credentials' : true,
    				'Content-Type': 'application/json' 
        		},
        		'body': JSON.stringify('No Identity was passed from API Gateway')
		});
	}
}

   