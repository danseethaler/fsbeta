// Main javascript came from :
// http://www.billiter.com/oldjoe/ahnentaf.htm

angular.module('app')
	.service('ahnentafel', function () {

		this.getRelationship = function (aNum) {

            if (aNum === 1) {
                return {};
            }

			var GenCount,
				Gender,
				OrdSuffix,
				relation,
				relationships,
				GreatCount;

			// Generate a random number for the Ahnentafel number
			// var aNum = Math.floor(Math.random() * 100);

			// --------------- Compute relation:
			switch (aNum) {

				// 2 through 7 are hard-coded relationships

			case 2:
				relation = "father";
				break;
			case 3:
				relation = "mother";
				break;
			case 4:
				relation = "paternal grandfather";
				break;
			case 5:
				relation = "paternal grandmother";
				break;
			case 6:
				relation = "maternal grandfather";
				break;
			case 7:
				relation = "maternal grandmother";
				break;

			default: // count generations:

				if ((aNum % 2) == 1) {
					Gender = "grandmother";
				} else {
					Gender = "grandfather";
				}
				GenCount = 0;
				while (Math.pow(2, GenCount) <= aNum) {
					GenCount++;
				}
				relation = "";
				for (j = 1; j <= (GenCount - 3); j++) {
					relation += "great-";
				}
				relation += Gender;
				GreatCount = GenCount - 3;
				switch (GreatCount) {
				case 1:
					OrdSuffix = "st";
					break;
				case 2:
					OrdSuffix = "nd";
					break;
				case 3:
					OrdSuffix = "rd";
					break;
				default:
					OrdSuffix = "th";
				}
			}


            var returnObj = {relation: relation}

            if (aNum > 7) {
                var shortRelation = "[" + GreatCount.toString() + OrdSuffix + " great-" + Gender + "]";
                returnObj.shortRelation = shortRelation;
            }

			return returnObj;
		}

		this.getParentage = function (aNum) {

			var j,
				Parentage,
				tStr;
			// --------------- Compute Parentage:
			j = aNum;
			if ((j % 2) == 1) {
				Parentage = "mother";
				j = j - 1;
			} else {
				Parentage = "father"
			}
			j = j / 2;
			while (j > 1) {
				tStr = Parentage;
				if ((j % 2) == 1) {
					Parentage = "mother's " + tStr;
					j = j - 1;
				} else {
					Parentage = "father's " + tStr;
				}
				j = j / 2;
			}

            return Parentage;
		}
	})
