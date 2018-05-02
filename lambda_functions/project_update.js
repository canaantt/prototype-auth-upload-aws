'use strict';

var AWS = require('aws-sdk'),
	uuid = require('uuid'),
    documentClient = new AWS.DynamoDB.DocumentClient(); 
    
/*
    const dataset_schema = {
        "DatasetName": S,
        "DatasetDescription": S,
        "PrivateStatus": B,
        "DatasetSource": S,
        "DatasetAuthor": S,
        "PHI": B,
        "DatasetFile_filename": S,
        "DatasetFile_size": S,
        "DatasetFile_timestamp": S,
        "DataCompliance_ProtocolNumber": S,
        "DataCompliance_Protocol": S,
        "DataCompliance_HumanStudy": S,
        }
    };
*/

exports.updateItemById = function(event, context, callback){
    // console.log('What is the event  => ', event);
    var received_data = JSON.parse(event.body);
    // console.log('received_data ====>', received_data);
    var keys = Object.keys(received_data);
    var attributeUpdatesObj = {};
    keys.forEach(k =>{
        if (received_data[k] == "" || received_data[k] == null) {
            attributeUpdatesObj[k] = {
                Action: "DELETE"
            };
        } else {
            console.log(Object.keys(received_data[k]));
            if(Object.keys(received_data[k]) > 1){
                var subkeys = Object.keys(received_data[k]);
                var obj = {};
                subkeys.forEach(sk => {
                    if (received_data[k][sk] == "" || received_data[k][sk] == null) {
                        attributeUpdatesObj[k + "." + sk] = {
                            Action: "DELETE"
                        };  
                    } else {
                        attributeUpdatesObj[k + "." + sk] = {
                            Action: "PUT", 
                            Value: received_data[k][sk]
                        }
                    };
                });
            } else {
                attributeUpdatesObj[k] = {
                    Action: "PUT", 
                    Value: received_data[k]
                }
            }
        }
    });

    console.log("========>");
    console.log(attributeUpdatesObj);

    var params = {
        TableName:process.env.TABLE_NAME,
        Key:{
            "_id": event['queryStringParameters']['projectId']
        },
        AttributeUpdates: attributeUpdatesObj,
        TableName: process.env.TABLE_NAME,
        ReturnValues: 'ALL_NEW'
    };
	documentClient.update(params, function(err, data) {
        if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
        }
	});
}

