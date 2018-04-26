'use strict';

var AWS = require('aws-sdk'),
	uuid = require('uuid'),
	documentClient = new AWS.DynamoDB.DocumentClient(); 

exports.createPermission = function(event, context, callback){
    var object = event;
    object['_id'] = uuid.v1();
    object['Date'] = Date.now;
	var params = {
		Item : object,
		TableName : process.env.TABLE_NAME
	};
	documentClient.put(params, function(err, data){
		callback(err, data);
	});
}
