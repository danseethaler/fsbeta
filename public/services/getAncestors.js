angular.module('app')
	.service('getAncestors', function ($location, $http, $q, $timeout, ahnentafel, didYouKnow) {

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

							} else if (property === 'name') {
								newPerson[property] = thisPerson[property].toLowerCase();

							} else if (property === 'birthDate') {

								newPerson.birthDate = thisPerson.birthDate

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

							} else {
								newPerson[property] = thisPerson[property];
							}
						}
					}

					newPerson.id = persons[i].id;

					personsArray.push(newPerson);
				}

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
