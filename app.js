var request = require('request');
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');
var mongoose = require("mongoose");
var fs = require('fs');
var UserDataModel = require('./models/userDataModel');
var configObj = JSON.parse(fs.readFileSync('config/configuration.json', 'utf8'));

var db = mongoose.connect(configObj.db_query, function(err, msg) {
	if(err) {
		console.log("Error connecting database "+err.message);
	}
	else {
		console.log("Connected to database");
		getDataFromTPLINK();
	}
});


var row = [];
var finalData = [];
var current_stats, row;
var is_router_reset = false;
var mailBody = "";
var currMailBody = "";
var localMsg = "";
var recordProcessed = 0;
var finalSanitizedData = {};

var options = {
  url: 'http://tplinklogin.net/userRpm/SystemStatisticRpm.htm?interval=10&autoRefresh=2&sortType=3&Num_per_page=20&Goto_page=1',
  headers: {
    'User-Agent': 'request',
    'Authorization' : 'Basic YWRtaW46YWRtaW4=',
    'Referer' : "http://tplinklogin.net/userRpm/MenuRpm.htm",
    'Accept-Encoding' : 'gzip, deflate'
  }
};

function getDataFromTPLINK() {
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// console.log(body);
			$ = cheerio.load(body);
			var data = $('SCRIPT')[0].children[0].data.split("=")
			var valuesData = eval(data[1]);
			for (var i = 0; i < valuesData.length; i++) {
				if ( i%13 == 0 && i !== 0) {
					finalData.push(row);
					row = [valuesData[i]];
				}
				else {
					row.push(valuesData[i]);
				}
				
			}
			// Since multiple IP address to same mac, so sanitize data
			sanitizeData();
			console.log(finalSanitizedData)
			getData();
		}
	});
}

function sanitizeData() {
	for (var i = 0; i < finalData.length; i++) {
		if (finalSanitizedData[finalData[i][2]]) {
		finalSanitizedData[finalData[i][2]] = finalSanitizedData[finalData[i][2]] + finalData[i][4];
		} else {
			finalSanitizedData[finalData[i][2]] = finalData[i][4] || 0;
		}
	}

}

function getData() {
// Max of data should be here
	try {
		UserDataModel.aggregate()
		.group({ _id: "$device", created:{$max : "$created"}, data: { $last: "$data" }})
		.exec(function (err, data) {
			current_stats = data;
			console.log("Line 64");
			console.log(current_stats);
			pushData();
		});
	}
	catch(err) {
		console.log("Can not retrieve data pushing data");
		pushData();
	}

}

var num_of_rows_added = 0;
function pushData() {
	var mac_address, dataUsed, mailID, device, obj, current_data;
	for (var key in finalSanitizedData) {
		if (finalSanitizedData.hasOwnProperty(key)) {
			mac_address = key;
			console.log(mac_address);
			dataUsed = bytes_to_mb(finalSanitizedData[key]);
			if (configObj.mac_to_name_mail[mac_address]) {
				recordProcessed = recordProcessed + 1;
				mailID = configObj.mac_to_name_mail[mac_address][1];
				device = configObj.mac_to_name_mail[mac_address][0];

				if (current_stats.length > 0) {
				  	obj = current_stats.filter(function(x) { return x._id === device; });
				  	if(obj.length > 0) {
				  		current_data = parseFloat(obj[0].data)
				  	}
				} else {
					current_data = 0;
				}
			  	console.log(dataUsed,current_data);
			  	console.log(dataUsed >= current_data);
			  	if (dataUsed >= current_data) {
			  		console.log("Router is not reset");
			  		row = new UserDataModel({
					'email': mailID,
					'data' : dataUsed,
					'device' : device
					});
					currMailBody = currMailBody + " " + device + ":" + (dataUsed - current_data).toFixed(2) + " MB\n";
			  	} else {
			  		is_router_reset = true;
			  		row = new UserDataModel({
					'email': mailID,
					'data' : current_data + dataUsed,
					'device' : device
					});
					currMailBody = currMailBody + " " + device + ":" + dataUsed.toFixed(2) + " MB\n";
			  	}
				
				row.save(function(err) {
					if (err) {
						console.log("Error Row not added, error:"+err.message)
					} else {
						console.log("Row added");
						num_of_rows_added = num_of_rows_added + 1
						if (num_of_rows_added === recordProcessed) {
							console.log("Last Row added");
							console.log(currMailBody);
							createMail();
						} 
					}
				});
			}
		}

	}
}

function createMail () {
// Max of data should be here	
  UserDataModel.aggregate()
		.group({ _id: "$device", created:{$max : "$created"}, data: { $last: "$data" }})
  .exec(function (err, data) {
	if(err) {
		console.log("Can not retrieve data");
	} else {
		console.log("Line 129 :");
		console.log(data);
	  	for (var i = 0; i < data.length; i++) {
			localMsg = localMsg + data[i]["_id"] + ":" + data[i]["data"].toFixed(2) + " MB\n";
  		}

  		if (is_router_reset == true) {
  			mailBody = mailBody + "Someone has reset the router, current data might be inacurrate" +"\n";
  		}
		mailBody = mailBody + "Total data used in MB's =" + localMsg + "\n";
		mailBody = mailBody + "Data used in this session(from last mail) in MB's = " + currMailBody;
		sendMail();
	}  	

  });
	
}
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: configObj.auth
});




function bytes_to_mb (bytes) {
	return parseFloat(bytes/(1024*1024));
}

function sendMail() {
	var mailOptions = {
    from: configObj.host_address,
    to: configObj.recipients,
    subject: 'Data Usage',
    text: mailBody
	};
	transporter.sendMail(mailOptions, function(err,msg) {
	if (err) {
		console.log(err.message);
		process.exit();
	} else {
		console.log(msg);
		process.exit();
	}
});

}





