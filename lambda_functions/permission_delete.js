'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB;

exports.deletePermission = function(event, context, callback){
    var params = {
		Key : {
		    "_id":{
		        S: event['queryStringParameters']['id']
		    }
		},
		TableName : process.env.TABLE_NAME
	};
	dynamodb.deleteItem(params, function(err, data){
		callback(err, data);
	});
}
