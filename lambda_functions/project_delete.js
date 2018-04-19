'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB;

exports.deleteDataset = function(id, context, callback){
    var params = {
		Key : {
		    "_id":{
		        S: id
		    }
		},
		TableName : process.env.TABLE_NAME
	};
	dynamodb.deleteItem(params, function(err, data){
		callback(err, data);
	});
}
