const XLSX =require("xlsx");
const _ = require('lodash');
const zlib = require('zlib');
const awsCli = require('aws-cli-js');
const Options = awsCli.Options;
const AWSCLI = awsCli.Aws;
const awscli = new AWSCLI();

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sqs = new AWS.SQS();
AWS.config.region = 'us-west-2';

var genemap = require('./data_uploading_modules/DatasetGenemap.json');
var requirements = require('./data_uploading_modules/DatasetRequirements.json');
var validate = require('./data_uploading_modules/DatasetValidate.js');
var serialize = require('./data_uploading_modules/DatasetSerialize.js');
var save = require('./data_uploading_modules/DatasetSave.js');
var load = require('./data_uploading_modules/DatasetLoad.js');
var helper = require('./data_uploading_modules/DatasetHelping.js');
const json2S3 = (msg) => {
    console.log('%%%%%%%%%received file');
    console.log('projectID is: ', msg);
    console.log('%%%%%%%%%XLSX.readFile');
    console.time("Reading XLSX file");

    var filePath = msg.filePath;
    var projectID = msg.projectID;

    var errors = {};

    // Load Excel (Specific)
    var sheets = load.xlsx(filePath, XLSX); // Array of sheets [ {name:'xxx', data:data}, {name:'xxx', data:data} ]

    // Validate Sheets (Generic)
    errors['sheet_level'] = sheets.map(sheet => validate.validateSheet(sheet, requirements, _, helper));
    
    // Validate Workbook (Generic)
    errors['sheets_existence'] = validate.validateWorkbookExistence(sheets, requirements, genemap, _, helper);
    errors['patientID_overlapping'] = validate.validateWorkbookPatientIDOverlapping(sheets, requirements, genemap, _, helper);
    errors['sampleID_overlapping'] = validate.validateWorkbookSampleIDOverlapping(sheets, requirements, genemap, _, helper);
    errors['geneID_overlapping'] = validate.validateWorkbookGeneIDsOverlapping(sheets, requirements, genemap, _, helper);
    
    console.log('====== Error Message =======');
    console.log(errors);

    // #region Serialize Sheets (Generic)
    sheetsSerialized = [];
    var events = [];
    sheets.forEach(sheet=>{
        var obj = serialize.sheet(sheet, _, XLSX);
        if (obj.type !== 'EVENT') {
            sheetsSerialized = sheetsSerialized.concat(obj);
        } else {
            events = events.concat(obj);
        }
    });
    var obj = {};
    obj.type = 'EVENT';
    obj.name = 'EVENT';
    var ob = {};
    var m = {};
    var v = [];
    events.forEach(e=> {
        m[e.res.map.type] = e.res.map.category;
        v = v.concat(e.res.value);
    });
    var type_keys = Object.keys(m);
    v.forEach(elem => elem[1] = type_keys.indexOf(elem[1]));
    ob.map = m;
    ob.value = v;
    obj.res = ob;
    sheetsSerialized = sheetsSerialized.concat(obj); 
    // #endregion

    // Upload Sheets To S3 (Specific)
    var s3UploadConfig = {
        region: 'us-west-2',
        params: {Bucket:'oncoscape-users-data/' + projectID}
    }
    uploadResults = sheetsSerialized.map(sheet => save.server(sheet, projectID, s3UploadConfig, AWS, s3, zlib));
   
    // Serialize Manifest (Generic)
    manifestSerialized = serialize.manifest(sheetsSerialized, uploadResults);

    // Upload Manifest To S3 (Specific)
    manifestURL = save.toS3(manifestSerialized, projectID, s3UploadConfig, AWS, s3, zlib);
    
     
    return manifestURL;
}
AWS.config.update({
    region: 'us-west-2'
});
const dynamoDB = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();
const project_table = 'Account_Projects';
const Consumer = require('sqs-consumer');

// sqs message delete
// const app = Consumer.create({
//     queueUrl: 'https://sqs.us-west-2.amazonaws.com/179462354929/upload2s3',
//     handleMessage: (message, done) => {
//         console.log('deleting...');
//     },
//     sqs: new AWS.SQS()
//   });
//
var getScan = function(filename) {
    // AWS.config.update({
    //     region: 'us-west-2'
    // });
    var params = {
        TableName: project_table,
        FilterExpression: 'datasetFileName = :fn',
        ExpressionAttributeValues: {
            ':fn': filename
            }
        };
    return new Promise((resolve, reject) => {
        docClient.scan(params, function(err, data) {
            if (err) {
                console.error('Unable to query. Error:', JSON.stringify(err, null, 2));
                reject(error);
            } else {
                console.log('Query succeeded. Result is: ', data.Items[0]);
                resolve(data);
            }});
     });
  };

var updateProject = function(project, url) {
    var params = {
        ExpressionAttributeNames : {
            "#attrName" : "datasetManifestURL"
        },
        ExpressionAttributeValues : {
            ":attrValue" : {
                S : url
            }
        },
        Key:{
            "_id": {
                S: project['_id']
            }
        },
        ReturnValues: "ALL_NEW",
        TableName:project_table,
        UpdateExpression : "SET #attrName =:attrValue",
    };
    return new Promise((resolve, reject) => {
        dynamoDB.updateItem(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

const app = Consumer.create({
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/179462354929/upload2s3',
  handleMessage: (message, done) => {
    var filename = JSON.parse(message.Body).Records[0].s3.object.key;
    console.log('==> the message is', filename);
    var params = {Bucket:"user-data-oncoscape",
                  Key: filename};
    
    awscli.command('s3 cp s3://user-data-oncoscape/' + filename + ' /usr/src/app/uploads/' + filename, function (err, data) {
        if(err){
            console.log(err);
        } else {
            console.log('success');
            getScan(filename).then(res => {
                var project = res.Items[0];
                var project_id = project['_id'];
                var msg = {};
                msg.filePath = '/usr/src/app/uploads/' + filename;
                msg.projectID = project_id; 
                var signedURL = json2S3(msg);
                // var obj = {'S': signedURL};
                project['datasetManifestURL'] = signedURL;
                updateProject(project, signedURL).then(res=>{
                    console.log(signedURL);
                    done();
                });
            });
        }
    });
  },
  sqs: new AWS.SQS()
});

app.on('error', (err) => {
  console.log(err.message);
});

app.start();






  
