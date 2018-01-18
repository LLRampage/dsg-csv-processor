//==============================================================//
// Author 		: Ryan Ramage									//
// Date Created	: Jan 02 2018 									//
// Version		: 0.9.0 										//
// Name 		: DSD List Cleaner 								//
// Descr 		: This app is designed to 						//
// 				  look for specific characters inside of 		//
// 				  the email fields from DSG's CRM. It 			//
// 				  looks to separate multiple emails and 		//
// 				  create and new record for the dupe.			//
// 				  It also cleans the records for any 			//
// 				  chracters that were separating the			//
// 				  emails from one another. i.e.					//
//				  email@email.com; email2@email.com				//
//																//
//==============================================================//

// TODOs
// 1.) automate formatting of the JSON file
// 2.) automate turning the JSON file into a CSV.
// 3.) account for the // (since the dsg sales team has the ability to do ANYTHING, we may have to account for more edge cases in the future.)
// 4.) DRY the code out. ==DONE==
// 5.) automate change from csv to JSON ==DONE==
// 6.) error handling
// 7.) programatically check headers of csv file for params in sig. ==DONE==
	// 7a.) Find a better implementation for additional fields. ==DONE==
// 8.) Branch and parse CSV file. ==DONE==


var fs = require('fs'),
	stringify = require('json-stringify-safe'),
	csvToJson = require('convert-csv-to-json'),
	// jsonToCsv = require('json2csv'),
	list = require('../json/DSG-SmileBrand.json'),
	csvData = '../csv/DSG-CSV-List.csv',
	createJSONObj = '',
	currentDate = new Date(),
	regExSpace = new RegExp('(\\s+)',["i"]),
	getYear = '',
	getMonth = currentDate.getMonth()+1,
	getDay = currentDate.getDate();


module.exports = function () {

	var json = csvToJson.getJsonFromCsv(csvData);
	// console.log(json);
	cleanData(json);

}();

function cleanData(jsonObj) {

	// console.log(Object.keys(jsonObj[1]).length);

	var keyArray = Object.keys(jsonObj[0]);

	keyArray = keyArray.filter(x => x != '');

	// console.log(keyArray);

	for(var i = 0; i <= jsonObj.length; i++) {

		console.log(i);

		var lineItemEmail = jsonObj[i]['email'],
			lineItemPracticeName = jsonObj[i]['practicename'],
			lineItemDocId = jsonObj[i]['doctorid'],
			lineItemFirstName = jsonObj[i]['First Name'],
			emailStepOne;

		// console.log(dataMapping);

		emailStepOne = lineItemEmail;

		if(emailStepOne.indexOf(';') !== -1) {
			// check record for semi-colon
			emailStepOne = emailStepOne.split(';');

			stringInterpolationOnRecord(emailStepOne);
		}
		
		if(emailStepOne.indexOf(',') !== -1) {
			emailStepOne = emailStepOne.split(',');

			stringInterpolationOnRecord(emailStepOne);
		}
		
		if(emailStepOne.indexOf(' ') !== -1) {
			// split on any space
			emailStepOne = emailStepOne.split(regExSpace);

			stringInterpolationOnRecord(emailStepOne);			
		}

		// check for record that needs no interpolation
		if(emailStepOne.indexOf(';') == -1 || emailStepOne.indexOf(',') == -1 || emailStepOne.indexOf(' ') == -1) {
			buildCurrentPlacement(lineItemEmail,lineItemPracticeName,lineItemDocId);
		}

		function stringInterpolationOnRecord() {
			for(var x = 0; x < emailStepOne.length; x++) {	

				// console.log(emailStepOne[x],lineItemPracticeName,lineItemDocId)
				// strip spaces in string left over from split
				emailStepOne[x] = emailStepOne[x].replace(' ','');

				if(emailStepOne[x] === '') {
					// console.log('skip space ');
				} else {
					buildCurrentPlacement(emailStepOne[x],lineItemPracticeName,lineItemDocId);
				}
			}
		}
	

		// check record for valid email and build JSON object
		function buildCurrentPlacement() {

			if(arguments[0].match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null) {
				var params = 0;
					createJSONObj += JSON.stringify(
						{'email':arguments[0],'practicename':arguments[1],'doctorId':arguments[2]}, 
						null,
						4
					);
					createJSONObj = createJSONObj + ',';
				return params += arguments[i];
			}
		};


		if(i >= jsonObj.length-1) {
			createJSONObj = createJSONObj.slice(0,-1);
			break;
		}

	}

	function writeJSONFile(data) {

		// console.log(data);
		if(getDay < 10) {
			getDay = '0' + getDay;
			getDay.toString();
		}
		if (getMonth < 10) {
			getMonth = '0' + getMonth;
			getMonth.toString();
		}

		currentDate = getYear + getMonth + getDay;


		// TODO Convert JSON Object back to CSV and spit out file.
		// TODO archive DSG-CSV-List with this naming convention DSG-CSV-List-yyyymmdd-ARVCHIVED and move to another folder. 

		// Node will strip brackets from array when writing to new file so...
		// data = '[' + data + ']';



		fs.writeFile('../json/DSG-Cleaned-List-' + currentDate + '.json', data, function(err) {
			if(err) {
				console.log('write to file failed');
			}
			console.log('file saved!');
		});
	};
	writeJSONFile(createJSONObj); // TODO remove when finshed testing
}