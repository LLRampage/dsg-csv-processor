//==============================================================//
// Author 		: Ryan Ramage									//
// Date Created	: Jan 02 2018 									//
// Version		: 0.1.2 										//
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
// 4.) DRY the code out.
// 5.) automate change from csv to JSON
// 6.) error handling
// 7.) programatically check headers of csv file for params in sig. 
	// 7a.) Find a better implementation for additional fields.
// 8.) Branch and parse CSV file.


var fs = require('fs'),
	list = require('../json/DSO-GPS-Calendar.json'),
	createJSONObj = '', // make object
	currentDate = new Date(),
	// containerObj = {'records': []},
	containerObj = [],
	dataArray = [],
	getYear = '',
	getMonth = currentDate.getMonth()+1,
	getDay = currentDate.getDate();

module.exports = function() {

	function turnCSVIntoJSON() {

	}

	for(var i = 0; i <= list.length; i++) {

		console.log(i);

		var lineItemEmail = list[i].email,
			lineItemPracticeName = list[i]['practicename'],
			// lineItemDocId = list[i]['Doctor ID'],
			emailStepOne,
			regExSpace = new RegExp('(\\s+)',["i"]);

			// Split spaces.
			emailStepOne = lineItemEmail;

			// split on semi colon if it exists
			// TODO DRY Redundant condition
			if(emailStepOne.indexOf(';') !== -1 || emailStepOne.indexOf(',') !== -1 || emailStepOne.indexOf(' ') !== -1) {

				if(emailStepOne.indexOf(';') !== -1) {
					emailStepOne = emailStepOne.split(';');
					
					for(var x = 0; x < emailStepOne.length; x++) {	

						// strip spaces in string left over from split
						emailStepOne[x] = emailStepOne[x].replace(' ','');

						if(emailStepOne[x] === '') {
							console.log('skip space ');
						} else {
							buildCurrentPlacement(emailStepOne[x],lineItemPracticeName/*,lineItemDocId*/);
						}
					}
				}
				if(emailStepOne.indexOf(',') !== -1) {
					emailStepOne = emailStepOne.split(',');

					for(var y = 0; y < emailStepOne.length; y++) {					
						// strip spaces in string left over from split
						emailStepOne[y] = emailStepOne[y].replace(' ','');
						
						buildCurrentPlacement(emailStepOne[y],lineItemPracticeName/*,lineItemDocId*/);
					}
				}
				if(emailStepOne.indexOf(' ') !== -1) {

					// split on any space
					emailStepOne = emailStepOne.split(regExSpace);

					for(var j = 0; j < emailStepOne.length; j++) {	

						// strip spaces in string left over from Split
						emailStepOne[j] = emailStepOne[j].replace(' ','');

						if(emailStepOne[j] === '') {
							console.log('skip space ');
						} else {
							buildCurrentPlacement(emailStepOne[j],lineItemPracticeName/*,lineItemDocId*/);
						}
					}					
				}
			} 
			else {
				buildCurrentPlacement(lineItemEmail,lineItemPracticeName/*,lineItemDocId*/);
			}

			function buildCurrentPlacement(emailAddress,practicename,docid) {

				if(emailAddress.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) !== null) {
					createJSONObj += JSON.stringify({'email':emailAddress,'practicename':practicename });
					createJSONObj = createJSONObj + ',';
				}
			};

			if(i >= list.length-1) {
				createJSONObj = createJSONObj.slice(0,-1);
				break;
			}
	}

	function writeJSONFile(data) {

		if(getDay < 10) {
			getDay = '0' + getDay;
			getDay.toString();
		}
		if (getMonth < 10) {
			getMonth = '0' + getMonth;
			getMonth.toString();
		}

		currentDate = getYear + getMonth + getDay;

		// Node will strip brackets from array when writing to new file so...
		data = '[' + data + ']';		

		fs.writeFile('../json/DSG-Cleaned-List-' + currentDate + '.json', data, function(err) {
			// console.log(data);
			if(err) {
				console.log('write to file failed');
			}

			console.log('file saved!');
		});
	};
	writeJSONFile(createJSONObj); // TODO remove when finshed testing
}();