angular.module('app')
	.service('didYouKnow', function () {

		// This function takes an array of persons and a specific
		// birthDate in a 'D MMM YYYY' format. It returns either
		// undefined for no matches or an array of objects that match.
		this.bdMatch = function (persons, options) {

			if (options.birthDate) {
				// Get just the day and month of the activeUser birthDate
				birthDay = options.birthDate.split(/ /g).splice(0, 2).join();
			}

			if (options.oldYoung) {
                var oldestA = {name: '', age: 0};
                var youngestA = {name: '', age: 500};
			}

			matchPers = {};

			for (var i = 0; i < persons.length; i++) {

				var thisPerson = persons[i];

				// Test to check birthday match
				// if (thisPerson.name === 'felicia raynor') {
				// debugger;
				// }

				// Skip the active user and make sure the person has a birthDate
				if (thisPerson.ascendancyNumber != 1) {

                    // Running the birthday checker code
					if (options.birthDate && thisPerson.birthDate) {
						// console.log(thisPerson.birthDate);
						if (thisPerson.birthDate.split(/ /g)[0].length === 1) {
							thisPerson.birthDate = '0' + thisPerson.birthDate;
						}

						// Check to see if the persons birthdate is a match to the birthDate param.
						if (thisPerson.birthDate.split(/ /g).splice(0, 2).join() === birthDay) {

							var userBd = moment(options.birthDate, 'D MMM YYYY');
							var personBd = moment(thisPerson.birthDate, 'D MMM YYYY');

							var yearsBefore = userBd.diff(personBd, 'years');

							var thisPersonName = thisPerson.name;

							matchPers[thisPersonName] = yearsBefore

							console.log(matchPers);
						}
					}

                    // Running the old/young evaluator
                    if (options.oldYoung) {
                        if (thisPerson.yearsOfLife > oldestA.age) {
                            oldestA.name = thisPerson.name;
                            oldestA.age = thisPerson.yearsOfLife;
                        }
                        if (thisPerson.yearsOfLife < youngestA.age) {
                            youngestA.name = thisPerson.name;
                            youngestA.age = thisPerson.yearsOfLife;
                        }
                    }
				}
			}

            var returnInfo = {};

            if (options.oldYoung) {
                returnInfo.oldestA = oldestA;
                returnInfo.youngestA = youngestA;
            }

            if (options.birthDate) {
    			if (Object.getOwnPropertyNames(matchPers).length > 0) {
    				returnInfo.matchPers = matchPers;
    			}
            }

            if (Object.getOwnPropertyNames(returnInfo).length > 0) {
                console.log(returnInfo);
                return returnInfo;
            }

		}

	});
