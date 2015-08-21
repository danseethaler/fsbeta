angular.module('app', [])
	.controller('mainCtrl', function ($scope, $location, $http, $q, $timeout, ahnentafel, didYouKnow) {

		// Did you knows are fun trivia tidbits like shared
		// birthdays or your oldest ancestor on record.
		$scope.dyk = {};

		$scope.activeUser = {};

		$scope.run = function () {

			var fsClient = new FamilySearch({
				client_id: 'a02j0000007rShWAAU',
				environment: 'beta',
				redirect_uri: 'http://localhost:8888/',
				http_function: $http,
				deferred_function: $q.defer,
				timeout_function: $timeout,
				save_access_token: true,
				auto_expire: true,
				auto_signin: true
			});

			function output(label, data) {
				$('#output').append(label ? '<h3>' + label + '<h3>' : '<hr>');
				$('#output').append(data ? prettyPrint(data) : '');
			}

			return fsClient.getCurrentUser().then(function (response) {

				$scope.loggedIn = true;
				$scope.activeUser.displayName = response.users[0].displayName;

				fsClient.getAncestry(response.getUser().personId, {
					generations: 3,
					personDetails: true,
					marriageDetails: false
				}).then(function (response) {

					$scope.persons = [];
					var persons = response.getPersons();

					// Initialize active user
					for (var i = 0; i < persons.length; i++) {
						if (persons[i].display.ascendancyNumber == 1) {
							$scope.activeUser.birthDate = persons[i].display.birthDate;

							console.log($scope.activeUser.birthDate);

							break;
						}
					}

					// Check for any didYouKnow birthday matches
					// using the didYouKnow service
					$scope.dyk.bdMatch = didYouKnow.bdMatch(persons, $scope.activeUser.birthDate);

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

								} else if (property === 'name') {
									newPerson[property] = thisPerson[property].toLowerCase();

								} else if (property === 'birthDate') {

									newPerson.birthDate = thisPerson.birthDate

									// Wrap the persons birth and death dates in the moment library
									if (thisPerson.deathDate != undefined) {

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

								} else {
									newPerson[property] = thisPerson[property];
								}
							}
						}

						newPerson.id = persons[i].id;

						$scope.persons.push(newPerson);
					}

					// *****Hard end to function*******

					// console.log(JSON.stringify($scope.persons, null, 4));

					return;
					response.getPersons().forEach(function (elem, index, array) {
						fsClient.getPersonPortraitUrl(elem.id)
							.then(function (url) {
								elem.portraitUrl = url;
								console.log(elem);
							})
					});

					var persons = response.getPersons(),
						person;
					for (var i = 0, len = persons.length; i < len; i++) {
						person = persons[i];
						output('Person', {
							'Position': ahnentafel[person.$getAscendancyNumber()],
							'Id': person.id,
							'Name': person.$getDisplayName(),
							'Life Span': person.$getDisplayLifeSpan(),
							'Living': person.living,
							'Display': person.display
						});
					}
					output();
					output('Another approach - get by ascendancy number');
					for (i = 1, len = ahnentafel.length; i < len; i++) {
						if (response.exists(i)) {
							person = response.getPerson(i);
							output('Person', {
								'Position': ahnentafel[i],
								'Id': person.id,
								'Name': person.$getDisplayName(),
								'Life Span': person.$getDisplayLifeSpan(),
								'Living': person.living,
								'Display': person.display
							});
						}
					}
					output('Raw json response with convenience functions', response);
					console.log(response);
				});
			});

		};
	})
	.config(function ($interpolateProvider) {
		$interpolateProvider.startSymbol('{[{');
		$interpolateProvider.endSymbol('}]}');
	});
