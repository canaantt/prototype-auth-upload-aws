'use strict';

var AWS = require('aws-sdk'),
	uuid = require('uuid'),
    documentClient = new AWS.DynamoDB.DocumentClient(); 
    
/*
    const dataset_schema = {
        permissionProjectId: string,
        permissionUserId: string,
        permissionType: string
    };
*/

exports.updateItemById = function(event, context, callback){
    console.log('context: ', context);
	if('identity' in context && 'cognitoIdentityId' in context['identity']) {
		console.log('printing out context',  context['identity']['cognitoIdentityId']);
        var received_data = JSON.parse(event.body);
        console.log('received_data =>', received_data);
        console.log('received_data._id =>', received_data['_id']);
        var keys = Object.keys(received_data);
        keys.splice(keys.indexOf('_id'), 1);
        console.log('after splice, keys: ', keys);
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
                            console.log('ATTRIBUTE TYPE: ', Object.keys(received_data[k][sk]));
                            console.log('is this a real value? : ', received_data[k][sk][Object.keys(received_data[k][sk])[0]]);
                            attributeUpdatesObj[k + "." + sk] = {
                                Action: "PUT", 
                                Value: received_data[k][sk][Object.keys(received_data[k][sk])[0]]
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
                "_id": received_data['_id']
            },
            AttributeUpdates: attributeUpdatesObj,
            TableName: process.env.TABLE_NAME,
            ReturnValues: 'ALL_NEW'
        };
        documentClient.update(params, function(err, data) {
            var response = {
                'statusCode': 200,
                'headers': { 
                    'Access-Control-Allow-Origin' : '*',
                    'Content-Type': 'application/json' 
                },
                'body': JSON.stringify(data)
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

