//----------------------------- ALWAYS CHECK IF THE REST_APP_URL ENVIRONMENT VARIABLE IS SET ON SERVER OR NOT
var express = require("express"), 
app = express(), 
http = require("http").createServer(app);

var requestObj = require('request');  
var serverDown = '{"error":"503"}';
var internalError = '{"error":"500"}';

/**
  *  Note :- Update the variable named 'resturls' added below to point to appropriate REST server.
  * for Windows use 
  * set REST_APP_URL=http://ipaddress:portnumber/appname/module/
  * e.g. set REST_APP_URL=http://10.1.15.131:8080/rest-medrubik/conversation/
  *
  * to print environment variable use 
  * set REST_APP_URL
  *
  * for Linux use 
  * export REST_APP_URL=http://ipaddress:portnumber/appname/module/
  * e.g. export REST_APP_URL=http://10.1.15.131:8080/rest-medrubik/conversation/
  *
  * to print environment variable use 
  * echo $REST_APP_URL
  *
  *
  * for MAC use 
  * export REST_APP_URL=http://ipaddress:portnumber/appname/module/
  * e.g. export REST_APP_URL=http://10.1.15.131:8080/rest-medrubik/conversation/
  *
  * to print environment variable use 
  * echo $REST_APP_URL
  *
  *
 **/
var resturls = process.env.REST_APP_URL;
if(undefined == process.env.REST_APP_URL)
	console.log("Please configure/set the environment variable 'REST_APP_URL' to appropriate server and then start node application.");
else
	console.log("REST Server URL:- "+process.env.REST_APP_URL);
/**
  *
  *  For cross context application communication following configuration is required if a call is made from jquery ajax.
  *
  *  TODO :- I] Handling of exception and return it to client request with proper JSON structure is completed on Node level. Handling it on respective client as Mobile end and Web end is remaining. 
  *
 **/
app.use(express.bodyParser());
app.use(express.static('public'));
app.use(function(req, res, next) {
	var oneof = false;
	res.type('application/json');
	res.header('Charset', 'utf-8');

	if(req.headers.origin) {
	res.header('Access-Control-Allow-Origin', req.headers.origin);
		oneof = true;
	}
	if(req.headers['access-control-request-method']) {
		res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
		oneof = true;
	}
	if(req.headers['access-control-request-headers']) {
		res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
		oneof = true;
	}
	if(oneof) {
		res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
	}

	// intercept OPTIONS method
	if (oneof && req.method == 'OPTIONS') {
		res.send(200);
	}else {
		next();
	}
});

/**
 * Node application configuration for all REST urls. This code will set the REST urls to node global variable.
 **/
app.post('/config', function(req, res){
	res.send(req.body.urls);
});

function checkInputParam(paramArray, inputArray){
	var validate = true;
	var keys = inputArray;
	for (var key =0 ;key<keys.length;key++) {
		if(paramArray.indexOf(keys[key])==-1){
			validate = false;
			break;
		}
	}
	return validate;
}

/**
 * Get the inbox for selected patient/logged in Patient/Physician.
 **/
app.post('/getInbox', function(req, res){
	var requestJsonKeys= ["cid", "id", "requestno","refreshcount", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
		restCMCall(resturls+"inbox", req, res);
	else
		res.send(internalError);
});

/**
 * Get the unread communication message count.
 **/
app.post('/getUnreadDashboardCount', function(req, res){
	var requestJsonKeys= ["cid", "id", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
		restCMCall(resturls+"getUnreadMessageCountFromTo", req, res);
	else
		res.send(internalError);
});


/**
 * Get the unread communication message count for selected user.
 **/
app.post('/getUnreadCountFromSelectedUser', function(req, res){
	var requestJsonKeys= ["id", "fromUserId", "refreshcount","pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
		restCMCall(resturls+"getUnreadCountFromSelectedUser", req, res);
	else
		res.send(internalError);
});


/**
 * Compose a new communication.
 **/
app.post('/compose', function(req, res){
	var requestJsonKeys= ["msgFrom", "conversationlistid", "alldevices","grouplist", "msgBody", "sendername", "role", "tonames", "msgTo", "attachment", "createdby", "msgSubject", "thread", "forId", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
		restCMCall(resturls+"compose", req, res);
	else
		res.send(internalError);
});

/**
 * Get selected communication.
 **/
app.post('/getSelectedCommunication', function(req, res){
	var requestJsonKeys= ["thread", "recpientid", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
		restCMCall(resturls+"getSelectedMessage", req, res);
	else
		res.send(internalError);
});

/**
 * Get unread communication message.
 **/
app.post('/getUnreadConversation', function(req, res){
	var requestJsonKeys= ["id", "conversationlistid", "commThread", "time", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
		restCMCall(resturls+"getUnreadConversation", req, res);
	else
		res.send(internalError);
});

/**
 * Forward selected communication.
 **/
app.post('/forward', function(req, res){
	var requestJsonKeys= ["msgFrom", "conversationlistid", "msgbody", "sendername", "role", "tonames", "msgTo", "attachment", "thread", "subject", "newThread", "forId", "alldevices", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
		restCMCall(resturls+"forward", req, res);
	else
		res.send(internalError);
});

/**
 * Archive selected communication.
 **/
app.post('/archive', function(req, res){
	var requestJsonKeys= ["archiveBy", "conversationlistid", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
		restCMCall(resturls+"archive", req, res);
	else
		res.send(internalError);
});

/**
 * Get latest communication message.
 **/
app.post('/getLatestCommunication', function(req, res){
	var requestJsonKeys= ["id", "cid", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
		restCMCall(resturls+"getDashboardData", req, res);
	else
		res.send(internalError);
});

/**
 * Get doctor inbox for default view added by Dhiman for mobile application.
 **/
app.post('/getDoctorDashboard', function(req, res){
	var requestJsonKeys= ["docid", "sortType", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
	        restCMCall(resturls+"getPatientByDoctor", req, res);
	else
		res.send(internalError);
});

/**
 * Get latest communication message for mobile application added by Dhiman.
 **/
app.post('/getLatestSelectedCommunication', function(req, res){
	var requestJsonKeys= ["id", "conversationlistid", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
	        restCMCall(resturls+"getUnreadConversationByThread", req, res);
	else
		res.send(internalError);
});

/**
 * Get the unread communication message count added by Dhiman for mobile communication.
 **/
app.post('/getreadUnreadCount', function(req, res){
	var requestJsonKeys= ["id", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
	        restCMCall(resturls+"getUnreadCount", req, res);
	else
		res.send(internalError);
});


/**
 * Get the unread communication message count added by Dhiman for mobile communication.
 **/
app.post('/getPatientByDoctor', function(req, res){
	var requestJsonKeys= ["docid", "sortType", "pubKey"];
	var keys = Object.keys(req.body);
	var validate = checkInputParam(requestJsonKeys,keys);
	if(validate==true)
	        restCMCall(resturls+"getPatientByDoctor", req, res);
	else
		res.send(internalError);
});



/**
 * A generic implementation for all REST calls. This must need a request body and authentication token key.
 **/
function restCMCall(endPoint, req, res){
	var tempapnmsg = "";
	requestObj({
			url : endPoint,
			method : "POST",
			headers : { "Content-Type" : "application/json","pubKey":req.body.pubKey},
			body : JSON.stringify(req.body)
		},
		function (error, resp, body) {
			try{
				var tempbody = JSON.parse(body).message;
				var tempdevices = JSON.parse(body).deviceDetails;
				if(endPoint.indexOf("compose")>0  || endPoint.indexOf("forward")>0 ){
					for (var i = 0; i<=tempdevices.length - 1; i++) {
						if(endPoint.indexOf("forward")>0){
							tempapnmsg = {"body": "Communication from "+req.body.sendername,"thread":req.body.newThread};
						}else{
							tempapnmsg = {"body": "Communication from "+req.body.sendername,"thread":req.body.thread};
						}
						notifyDevices(tempapnmsg, tempdevices[i].devicetoken, tempdevices[i].devicetype, tempdevices[i].appstatus);
					}
					res.send(body);
				}else{
					res.send(body);
				}
			}catch(e){
				res.send(serverDown);
				console.log(endPoint+" failed on "+new Date().toUTCString()+".\n Error : Please contact node administrator. \n Either REST server is down or there is some error in REST response. \n Please check rest logs for more detail.");
			}
		}
	);
}

 /**
  *
  * Push notification code
  *
  **/
//var GCM = require('gcm').GCM;
//var apiKey = 'AIzaSyBjXSsrENe404ICODKEMtCdyYuOsuqLzbU';
//var gcm = new GCM(apiKey);
var m = 0;
var apns = require('apn');
var options = {
    cert: 'PushChatCert.pem',         		/* Certificate file path */
    certData: null,                  		/* String or Buffer containing certificate data, if supplied uses this instead of cert file path */
    key:  'PushChatKey.pem',          		/* Key file path */
    keyData: null,                    		/* String or Buffer containing key data, as certData */
    passphrase: 'medsolischat',       		/* A passphrase for the Key file */
    ca: null,                         		/* String or Buffer of CA data to use for the TLS connection */
    pfx: null,                        		/* File path for private key, certificate and CA certs in PFX or PKCS12 format. If supplied will be used instead of certificate and key above */
    pfxData: null,                    		/* PFX or PKCS12 format data containing the private key, certificate and CA certs. If supplied will be used instead of loading from disk. */
    gateway: 'gateway.sandbox.push.apple.com', // 'gateway.push.apple.com',/* gateway address */
    port: 2195,                       		/* gateway port */
    rejectUnauthorized: true,         		/* Value of rejectUnauthorized property to be passed through to tls.connect() */
    enhanced: true,                   		/* enable enhanced format */
    errorCallback: undefined, 			/* Callback when error occurs function(err,notification) */
    cacheLength: 100,                  		/* Number of notifications to cache for error purposes */
    autoAdjustCache: true,            		/* Whether the cache should grow in response to messages being lost after errors. */
    connectionTimeout: 0              		/* The duration the socket should stay alive with no activity in milliseconds. 0 = Disabled. */
};
var apnsConnection = new apns.Connection(options);

apnsConnection.on('error', function(error) {
	console.log('Error with APN ' + error);
});

apnsConnection.on('transmitted', function(notification) {
	console.log('Notification sent to APN ' + notification.toString());
});

apnsConnection.on('connected', function() {
	console.log('Connected to APN.');
});

apnsConnection.on('disconnected', function() {
	console.log('Disconnected from APN.');
});

apnsConnection.on('transmissionError', function(errorCode, notification) {
	console.log("Transmision error with APN. Error code " + errorCode + " notification: " + notification.toString());
});


var promotionText;

function notifyDevices(textMessage, devicetoken, device, status) {
	var allAndroidTokens = [];
		if (device == "iOS" || device == "iPhone" || device == "iPad") {//take it from database
			var token = device;
			var device = new apns.Device(devicetoken);
			var note = new apns.Notification();
			note.expiry = Math.floor(Date.now() / 1000) + 3600*24; // Expires in 24 hours from now.
			note.badge = 1;
			note.alert = textMessage;
			note.device = device;
                        note.acme1 = "bar";
                        note.acme2 = [ "bang",  "whiz" ];
			apnsConnection.sendNotification(note);
		} else {
			//allAndroidTokens.push(allDevices[i].token);
		}

	/*if (allAndroidTokens.length == 0)
		return;

	var message = {
	    'registration_id' : allAndroidTokens, 
	    'data.message' :  textMessage,
	    'data.msgcnt' : 0,
	};*/

	/*gcm.send(message, function(err, messageId){
	    if (err) {
	        console.log("Something has gone wrong with GCM send!");
	    } else {
	        console.log("Sent with message ID: " + messageId + " on GCM.");
	    }
	});*/
}

/**
 * Node server is listening on a port defined here.
 **/
app.listen(9090);
