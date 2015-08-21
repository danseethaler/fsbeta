angular.module('app')
	.service('didYouKnow', function () {

		// This function takes an array of persons and a specific
		// birthDate in a 'D MMM YYYY' format. It returns either
		// undefined for no matches or an array of objects that match.
		this.bdMatch = function (persons, birthDate) {

            // Get just the day and month of the activeUser birthDate
			birthDay = birthDate.split(/ /g).splice(0, 2).join();

			matchPers = {};

			for (var i = 0; i < persons.length; i++) {

                var thisPerson = persons[i].display;

				// Skip the active user and make sure the person has a birthDate
				if (thisPerson.ascendancyNumber != 1 && thisPerson.birthDate != undefined) {

					// Check to see if the persons birthdate is a match to the birthDate param.
					if (persons[i].display.birthDate.split(/ /g).splice(0, 2).join() === birthDay) {

						var userBd = moment(birthDate, 'D MMM YYYY');
                        var personBd = moment(persons[i].display.birthDate, 'D MMM YYYY');

						var yearsBefore = userBd.diff(personBd, 'years');

						var thisPersonName = persons[i].display.name;

                        matchPers[thisPersonName] = yearsBefore

						console.log(matchPers);
					}
				}
			}

			if (Object.getOwnPropertyNames(matchPers).length > 0) {
				return matchPers;
			}
		}
	});
