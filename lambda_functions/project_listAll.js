'use strict';

var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB;

exports.queryDataset = function(event, context, callback) {
    var params = {
        // ExpressionAttributeNames: {
        //  "AT": "AlbumTitle", 
        //  "ST": "SongTitle"
        // }, 
        // ExpressionAttributeValues: {
        //  ":_id": {
        //    S: ""
        //   }
        // }, 
        // FilterExpression: "_id = :_id", 
        // ProjectionExpression: "#ST, #AT", 
        TableName: process.env.TABLE_NAME
       };
    
    dynamodb.scan(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });
}

   