angular.module('app', [])
	.controller('mainCtrl', function ($scope, $location, $http, $q, $timeout) {

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

			var ahnentafel = ['',
				'primary',
				'father',
				'mother',
				'paternal grandfather',
				'paternal grandmother',
				'maternal grandfather',
				'maternal grandmother'
			];

			return fsClient.getCurrentUser().then(function (response) {
				console.log(response.getUser().personId);
				fsClient.getAncestry(response.getUser().personId, {
					generations: 2,
					personDetails: true,
					marriageDetails: true
				}).then(function (response) {
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
