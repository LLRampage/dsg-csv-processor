//==============================================================//
// Author 		: Ryan Ramage									//
// Date Created	: Jan 02 2018 									//
// Version		: 0.1.1 										//
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



var fs = require('fs'),
	list = require('../json/DSO-Email-1_DONE-MMDDYYYY.json'),
	createJSONObj = '',
	currentDate = new Date(),
	// containerObj = {'records': []},
	containerObj = [],
	dataArray = [],
	getYear = '',
	getMonth = currentDate.getMonth()+1,
	getDay = currentDate.getDate();

module.exports = function() {

	for(var i = 0; i <= 100; i++) {

		var lineItemEmail = list[i].Email,
			lineItemPracticeName = list[i]['Practice Name'],
			lineItemDocId = list[i]['Doctor ID'],
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
							buildCurrentPlacement(emailStepOne[x],lineItemPracticeName,lineItemDocId);
						}
					}
				}
				if(emailStepOne.indexOf(',') !== -1) {
					emailStepOne = emailStepOne.split(',');

					for(var y = 0; y < emailStepOne.length; y++) {					
						// strip spaces in string left over from split
						emailStepOne[y] = emailStepOne[y].replace(' ','');
						
						buildCurrentPlacement(emailStepOne[y],lineItemPracticeName,lineItemDocId);
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
							buildCurrentPlacement(emailStepOne[j],lineItemPracticeName,lineItemDocId);
						}
					}					
				}
			} 
			else {
				buildCurrentPlacement(lineItemEmail,lineItemPracticeName,lineItemDocId);
			}

			function buildCurrentPlacement(emailAddress,practicename,docid) {

				createJSONObj += JSON.stringify({'Email':emailAddress,'Practice Name':practicename,'Doctor ID':docid });
				createJSONObj = createJSONObj + ',';			
			};
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

		fs.writeFile('../json/DSG-Cleaned-List-' + 'currentDate' + '.json', data, function(err) {
			// console.log(data);
			if(err) {
				console.log('write to file failed');
			}

			console.log('file saved!');
		});
	};
	writeJSONFile(createJSONObj); // TODO remove when finshed testing
}();