angular.module('app')
	.service('getAncestors', function ($location, $http, $q, $timeout, ahnentafel, didYouKnow) {

		var fsClient = new FamilySearch({
			client_id: 'a02j0000007rShWAAU',
			environment: 'beta',
			redirect_uri: location.href,
			http_function: $http,
			deferred_function: $q.defer,
			timeout_function: $timeout,
			save_access_token: true,
			auto_expire: true,
			auto_signin: true
		});

        this.checkAccess = function(){
            return fsClient.hasAccessToken();
        }

		this.login = function () {
			return fsClient.getCurrentUser()
		}

        this.logout = function(){
            fsClient.invalidateAccessToken()

            location.href = location.href;
        }

        this.getSpouses = function(userID){
            return fsClient.getSpouses(userID);
        }

		this.getAncestors = function (userID, generations) {

			return fsClient.getAncestry(userID, {
				generations: generations,
				personDetails: true,
				marriageDetails: false
			}).then(function (response) {

				var personsArray = [];
				var persons = response.getPersons();

				for (var i = 0; i < persons.length; i++) {

					var newPerson = {};

					var thisPerson = persons[i].display;

					for (var property in thisPerson) {
						if (thisPerson.hasOwnProperty(property)) {

							if (property === 'ascendancyNumber') {
								newPerson[property] = Number(thisPerson[property]);

								var relations = ahnentafel.getRelationship(Number(thisPerson[property]));

								newPerson.relationship = relations.relation;
								newPerson.shortRelation = relations.shortRelation;

								// Determine the number of generations back
								var genCount = 0;
								while (Math.pow(2, genCount) <= thisPerson.ascendancyNumber) {
									genCount++;
								}
								newPerson.genNum = genCount - 1;

							} else if (property === 'name') {
								newPerson[property] = thisPerson[property].toLowerCase();

							} else if (property === 'birthDate') {

								// Get the length of the array
								var bdLength = thisPerson.birthDate.split(' ').length;

								if (bdLength === 3) {
									var birthDate = thisPerson.birthDate.split(' ');
									var birthDate = new Date(birthDate[2], new Date(Date.parse(birthDate[1] + " 1, 2015")).getMonth(), birthDate[0]);
									newPerson.bDate = birthDate;

								} else if (bdLength === 2) {
									var birthDate = thisPerson.birthDate.split(' ');
									var birthDate = new Date(birthDate[1], new Date(Date.parse(birthDate[0] + " 1, 2015")).getMonth());
									newPerson.bDate = birthDate;

								} else if (bdLength === 1) {
									var birthDate = new Date(thisPerson.birthDate);
									newPerson.bDate = birthDate;
								}

								newPerson.birthDate = thisPerson.birthDate;

								// Calculate the lifespane of the person
								if (thisPerson.deathDate && thisPerson.deathDate.toUpperCase() != 'UNKNOWN') {

									var bdFormat = thisPerson.birthDate.match(/ /g);

									if (bdFormat === null) {
										var birthMoment = moment(thisPerson.birthDate, 'YYYY');
									} else if (bdFormat.length === 2) {
										var birthMoment = moment(thisPerson.birthDate, 'D MMM YYYY');
									} else {
										var birthMoment = moment(thisPerson.birthDate, 'MMM YYYY');
									}

									var ddFormat = thisPerson.deathDate.match(/ /g);

									if (ddFormat === null) {
										var deathMoment = moment(thisPerson.deathDate, 'YYYY');
									} else if (ddFormat.length === 2) {
										var deathMoment = moment(thisPerson.deathDate, 'D MMM YYYY');
									} else {
										var deathMoment = moment(thisPerson.deathDate, 'MMM YYYY');
									}

									// Get the difference in years
									newPerson.yearsOfLife = deathMoment.diff(birthMoment, 'years');
								}
							} else if (property === 'deathDate') {

								// Get the length of the array
								var bdLength = thisPerson.deathDate.split(' ').length;

								if (bdLength === 3) {
									var deathDate = thisPerson.deathDate.split(' ');
									var deathDate = new Date(deathDate[2], new Date(Date.parse(deathDate[1] + " 1, 2015")).getMonth(), deathDate[0]);
									newPerson.dDate = deathDate;

								} else if (bdLength === 2) {
									var deathDate = thisPerson.deathDate.split(' ');
									var deathDate = new Date(deathDate[1], new Date(Date.parse(deathDate[0] + " 1, 2015")).getMonth());
									newPerson.dDate = deathDate;

								} else if (bdLength === 1) {
									var deathDate = new Date(thisPerson.deathDate);
									newPerson.dDate = deathDate;
								}

								newPerson.deathDate = thisPerson.deathDate;

							} else {
								newPerson[property] = thisPerson[property];
							}
						}
					}

					newPerson.id = persons[i].id;

					personsArray.push(newPerson);
				}

				// Load the timeline for the ancestors
				loadTimeline(personsArray);

				// console.log(JSON.stringify(personsArray, null, 4));

				// *****Hard end to function*******

				return personsArray;

				response.getPersons().forEach(function (elem, index, array) {
					fsClient.getPersonPortraitUrl(elem.id)
						.then(function (url) {
							elem.portraitUrl = url;
						})
				});
			});
		};
	});
