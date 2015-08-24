angular.module('app', [])
	.controller('mainCtrl', function ($scope, getAncestors, didYouKnow) {

		$scope.userInputs = {};
		$scope.userInputs.generations = '';
		$scope.nextStep = "authenticate";

		$scope.login = function () {
			return getAncestors.login()
				.then(function (currentUser) {

					$scope.loggedIn = true;

					$scope.activeUser = currentUser.getUser();

					$scope.basePersonID = $scope.activeUser.personId;

					getAncestors.getSpouses($scope.activeUser.personId)
						.then(function (spouses) {

							$scope.basePersons = [];
							$scope.basePersons.push({
								name: $scope.activeUser.displayName,
								id: $scope.activeUser.personId
							})

							for (var i = 0; i < spouses.persons.length; i++) {
								$scope.basePersons.push({
									name: spouses.persons[i].display.name,
									id: spouses.persons[i].id,
									aNum: spouses.persons[i].ascendancyNumber
								})
							}

							$scope.activeUser.spouses = spouses;
							console.log($scope.basePersons);
						})

					$scope.nextStep = 'getAncestors';

					return;
				});
		};

		$scope.checkLogin = function () {
			if (getAncestors.checkAccess()) {
				$scope.login();
			}
		}();

		$scope.logout = function () {
			getAncestors.logout();
			$scope.nextStep = "authenticate";
		}

		$scope.setBase = function (basePersonID) {
			$scope.basePersonID = basePersonID;
			console.log($scope.basePersonID);
		}

		$scope.getAncestors = function () {

			$scope.nextStep = 'retrieving';

			getAncestors.getAncestors($scope.basePersonID, $scope.userInputs.generations)
				.then(function (ancestors) {

					$scope.nextStep = 'rockNRoll';

					$scope.persons = ancestors;

					// Check for any didYouKnow birthday matches
					// using the didYouKnow service
					$scope.dyk = {};

					var dykOptions = {
						birthDate: $scope.activeUser.birthDate,
						oldYoung: true
					}

					$scope.dyk = didYouKnow.bdMatch(ancestors, dykOptions);

				})
		}

		$scope.test = getAncestors.test;

		// Did you knows are fun trivia tidbits like shared
		// birthdays or your oldest ancestor on record.
		$scope.dyk = getAncestors.dyk;

		$scope.activeUser = getAncestors.activeUser;

		$scope.persons = getAncestors.persons;

	})
	.config(function ($interpolateProvider) {
		$interpolateProvider.startSymbol('{[{');
		$interpolateProvider.endSymbol('}]}');
	});
