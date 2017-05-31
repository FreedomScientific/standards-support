/* DISPLAY WHETHER ELEMENT HAS BASIC BROWSER SUPPORT
 *
 * The variable isSupported must be defined in a script
 * on the test page preceding the inclusion of this
 * script file.
 */
var displaySupportResults = function(test) {

	// This ID must be on the criteria list
	var criteriaList = document.getElementById("criteria-list"),
		badge = null,
		successBadge = '<span class="badge-success">Supported</span>',
		failureBadge = '<span class="badge-failure">Not supported</span>',
		manualBadge = '<span class="badge-manual">(Manually test)</span>';

	// Look through criteria list items to get appropriate badges
	if (criteriaList && criteriaList.hasChildNodes) {
		var criteriaItems = criteriaList.childNodes;
		for (var i = 0; i < criteriaItems.length; i++) {
			if (criteriaItems[i].nodeName === "LI") {
						
				for (var j = 0; j < test.length; j++) {
					
					// Browser support criteria check
					if (criteriaItems[i].id === test[j].id) {
						criteriaItems[i].className += " has-badge";
						if (test[j].pass === true) {
							badge = successBadge;
						} else {
							badge = failureBadge;
						}
						break;
					// Manually tested items
					} else {
						badge = manualBadge;
					}
				}

				// Add the appropriate badge to the list item
				criteriaItems[i].innerHTML = "<span>" + criteriaItems[i].innerHTML + "</span> " + badge;

			}
		}
	}

};