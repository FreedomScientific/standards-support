// Function to get elements by class name for DOM fragment and tag name
function getElementsByClassName(objElement, strTagName, strClassName)
{
	var objCollection = objElement.getElementsByTagName(strTagName);
	var arReturn = [];
	var strClass, arClass, iClass, iCounter;

	for(iCounter=0; iCounter<objCollection.length; iCounter++)
	{
		strClass = objCollection[iCounter].className;
		if (strClass)
		{
			arClass = strClass.split(' ');
			for (iClass=0; iClass<arClass.length; iClass++)
			{
				if (arClass[iClass] == strClassName)
				{
					arReturn.push(objCollection[iCounter]);
					break;
				}
			}
		}
	}

	objCollection = null;
	return (arReturn);
}

var drag = {
	objCurrent : null,

	arTargets : ['Fav', 'Tol', 'Rej'],

	initialise : function(objNode)
	{
		// Add event handlers
		objNode.onmousedown = drag.start;
		objNode.onclick = function() {this.focus();};
		objNode.onkeydown = drag.keyboardDragDrop;
		document.body.onclick = drag.removePopup;
	},

	keyboardDragDrop : function(objEvent)
	{
		objEvent = objEvent || window.event;
		drag.objCurrent = this;
		var arChoices = ['Favourite artists', 'Tolerable artists', 'Rejected artists'];
		var iKey = objEvent.keyCode;
		var objItem = drag.objCurrent;

			var strExisting = objItem.parentNode.getAttribute('id');
			var objMenu, objChoice, iCounter;

			if (iKey == 32)
			{
				document.onkeydown = function(){return objEvent.keyCode==38 || objEvent.keyCode==40 ? false : true;};
				// Set ARIA properties
				drag.objCurrent.setAttribute('aria-grabbed', 'true');
				drag.objCurrent.setAttribute('aria-owns', 'popup');
				// Build context menu
				objMenu = document.createElement('ul');
				objMenu.setAttribute('id', 'popup');
				objMenu.setAttribute('role', 'menu');
				for (iCounter=0; iCounter<arChoices.length; iCounter++)
				{
					if (drag.arTargets[iCounter] != strExisting)
					{
						objChoice = document.createElement('li');
						objChoice.appendChild(document.createTextNode(arChoices[iCounter]));
						objChoice.tabIndex = -1;
						objChoice.setAttribute('role', 'menuitem');
						objChoice.onmousedown = function() {drag.dropObject(this.firstChild.data.substr(0, 3));};
						objChoice.onkeydown = drag.handleContext;
						objChoice.onmouseover = function() {if (this.className.indexOf('hover') < 0) {this.className += ' hover';} };
						objChoice.onmouseout = function() {this.className = this.className.replace(/\s*hover/, ''); };
						objMenu.appendChild(objChoice);
					}
				}
				objItem.appendChild(objMenu);
				objMenu.firstChild.focus();
				objMenu.firstChild.className = 'focus';
				drag.identifyTargets(true);
			}
	},

	removePopup : function()
	{
		document.onkeydown = null;

		var objContext = document.getElementById('popup');

		if (objContext)
		{
			objContext.parentNode.removeChild(objContext);
		}
	},

	handleContext : function(objEvent)
	{
		objEvent = objEvent || window.event;
		var objItem = objEvent.target || objEvent.srcElement;
		var iKey = objEvent.keyCode;
		var objFocus, objList, strTarget, iCounter;

		// Cancel default behaviour
		if (objEvent.stopPropagation)
		{
			objEvent.stopPropagation();
		}
		else if (objEvent.cancelBubble)
		{
			objEvent.cancelBubble = true;
		}
		if (objEvent.preventDefault)
		{
			objEvent.preventDefault();
		}
		else if (objEvent.returnValue)
		{
			objEvent.returnValue = false;
		}

		switch (iKey)
		{
			case 38 : // Down arrow
				objFocus = objItem.nextSibling;
				if (!objFocus)
				{
					objFocus = objItem.previousSibling;
				}
				objItem.className = '';
				objFocus.focus();
				objFocus.className = 'focus';
				break;
			case 40 : // Up arrow
				objFocus = objItem.previousSibling;
				if (!objFocus)
				{
					objFocus = objItem.nextSibling;
				}
				objItem.className = '';
				objFocus.focus();
				objFocus.className = 'focus';
				break;
			case 13 : // Enter
				strTarget = objItem.firstChild.data.substr(0, 3);
				drag.dropObject(strTarget);
				break;
			case 27 : // Escape
			case 9  : // Tab
				drag.objCurrent.removeAttribute('aria-owns');
				drag.objCurrent.removeChild(objItem.parentNode);
				drag.objCurrent.focus();
				for (iCounter=0; iCounter<drag.arTargets.length; iCounter++)
				{
					objList = document.getElementById(drag.arTargets[iCounter]);
					drag.objCurrent.setAttribute('aria-grabbed', 'false');
					objList.removeAttribute('aria-dropeffect');
					objList.className = '';
				}
				break;
		}
	},

	start : function(objEvent)
	{
		objEvent = objEvent || window.event;
		drag.removePopup();
		// Initialise properties
		drag.objCurrent = this;

		drag.objCurrent.lastX = objEvent.clientX;
		drag.objCurrent.lastY = objEvent.clientY;
		drag.objCurrent.style.zIndex = '2';
		drag.objCurrent.setAttribute('aria-grabbed', 'true');

		document.onmousemove = drag.drag;
		document.onmouseup = drag.end;
		drag.identifyTargets(true);

		return false;
	},

	drag : function(objEvent)
	{
		objEvent = objEvent || window.event;

		// Calculate new position
		var iCurrentY = objEvent.clientY;
		var iCurrentX = objEvent.clientX;
		var iYPos = parseInt(drag.objCurrent.style.top, 10);
		var iXPos = parseInt(drag.objCurrent.style.left, 10);
		var iNewX, iNewY;

		iNewX = iXPos + iCurrentX - drag.objCurrent.lastX;
		iNewY = iYPos + iCurrentY - drag.objCurrent.lastY;

		drag.objCurrent.style.left = iNewX + 'px';
		drag.objCurrent.style.top = iNewY + 'px';
		drag.objCurrent.lastX = iCurrentX;
		drag.objCurrent.lastY = iCurrentY;

		return false;
	},

	calculatePosition : function (objElement, strOffset)
	{
		var iOffset = 0;

		// Get offset position in relation to parent nodes
		if (objElement.offsetParent)
		{
			do 
			{
				iOffset += objElement[strOffset];
				objElement = objElement.offsetParent;
			} while (objElement);
		}

		return iOffset;
	},

	identifyTargets : function (bHighlight)
	{
		var strExisting = drag.objCurrent.parentNode.getAttribute('id');
		var objList, iCounter;

		// Highlight the targets for the current drag item
		for (iCounter=0; iCounter<drag.arTargets.length; iCounter++)
		{
			objList = document.getElementById(drag.arTargets[iCounter]);
			if (bHighlight && drag.arTargets[iCounter] != strExisting)
			{
				objList.className = 'highlight';
				objList.setAttribute('aria-dropeffect', 'move');
			}
			else
			{
				objList.className = '';
				objList.removeAttribute('aria-dropeffect');
			}
		}
	},

	getTarget : function()
	{
		var strExisting = drag.objCurrent.parentNode.getAttribute('id');
		var iCurrentLeft = drag.calculatePosition(drag.objCurrent, 'offsetLeft');
		var iCurrentTop = drag.calculatePosition(drag.objCurrent, 'offsetTop');
		var iTolerance = 40;
		var objList, iLeft, iRight, iTop, iBottom, iCounter;

		for (iCounter=0; iCounter<drag.arTargets.length; iCounter++)
		{
			if (drag.arTargets[iCounter] != strExisting)
			{
				// Get position of the list
				objList = document.getElementById(drag.arTargets[iCounter]);
				iLeft = drag.calculatePosition(objList, 'offsetLeft') - iTolerance;
				iRight = iLeft + objList.offsetWidth + iTolerance;
				iTop = drag.calculatePosition(objList, 'offsetTop') - iTolerance;
				iBottom = iTop + objList.offsetHeight + iTolerance;

				// Determine if current object is over the target
				if (iCurrentLeft > iLeft && iCurrentLeft < iRight && iCurrentTop > iTop && iCurrentTop < iBottom)
				{
					return drag.arTargets[iCounter];
				}
			}
		}

		// Current object is not over a target
		return '';
	},

	dropObject : function(strTarget)
	{
		var objClone, objOriginal, objTarget, objEmpty, objBands, objItem;

		drag.removePopup();

		if (strTarget.length > 0)
		{
			// Copy node to new target
			objOriginal = drag.objCurrent.parentNode;
			objClone = drag.objCurrent.cloneNode(true);

			// Remove previous attributes
			objClone.removeAttribute('style');
			objClone.className = objClone.className.replace(/\s*focused/, '');
			objClone.className = objClone.className.replace(/\s*hover/, '');

			// Add focus indicators
			objClone.onfocus = function() {this.className += ' focused'; };
			objClone.onblur = function() {this.className = this.className.replace(/\s*focused/, '');};
			objClone.onmouseover = function() {if (this.className.indexOf('hover') < 0) {this.className += ' hover';} };
			objClone.onmouseout = function() {this.className = this.className.replace(/\s*hover/, ''); };

			objTarget = document.getElementById(strTarget);
			objOriginal.removeChild(drag.objCurrent);
			objTarget.appendChild(objClone);
			drag.objCurrent = objClone;
			drag.initialise(objClone);

			// Remove empty node if there are artists in list
			objEmpty = getElementsByClassName(objTarget, 'li', 'empty');
			if (objEmpty[0])
			{
				objTarget.removeChild(objEmpty[0]);
			}

			// Add an empty node if there are no artists in list
			objBands = objOriginal.getElementsByTagName('li');
			if (objBands.length === 0)
			{
				objItem = document.createElement('li');
				objItem.appendChild(document.createTextNode('None'));
				objItem.className = 'empty';
				objOriginal.appendChild(objItem);
			}
		}
				// Reset properties
		drag.objCurrent.style.left = '0px';
		drag.objCurrent.style.top = '0px';

		drag.objCurrent.style.zIndex = 'auto';
		drag.objCurrent.setAttribute('aria-grabbed', 'false');
		drag.objCurrent.removeAttribute('aria-owns');

		drag.identifyTargets(false);
	},

	end : function()
	{
		var strTarget = drag.getTarget();

		drag.dropObject(strTarget);

		document.onmousemove = null;
		document.onmouseup   = null;
		drag.objCurrent = null;
	}
};

function init ()
{
	var objItems = getElementsByClassName(document, 'li', 'draggable');
	var objItem, iCounter;

	for (iCounter=0; iCounter<objItems.length; iCounter++)
	{
		// Set initial values so can be moved
		objItems[iCounter].style.top = '0px';
		objItems[iCounter].style.left = '0px';

		// Put the list items into the keyboard tab order
		objItems[iCounter].tabIndex = 0;

		// Set ARIA attributes for artists
		objItems[iCounter].setAttribute('aria-grabbed', 'false');
		objItems[iCounter].setAttribute('aria-haspopup', 'true');
		objItems[iCounter].setAttribute('role', 'listitem');

		// Provide a focus indicator
		objItems[iCounter].onfocus = function() {this.className += ' focused'; };
		objItems[iCounter].onblur = function() {this.className = this.className.replace(/\s*focused/, '');};
		objItems[iCounter].onmouseover = function() {if (this.className.indexOf('hover') < 0) {this.className += ' hover';} };
		objItems[iCounter].onmouseout = function() {this.className = this.className.replace(/\s*hover/, ''); };

		drag.initialise(objItems[iCounter]);
	}

	// Set ARIA properties on the drag and drop list, and set role of this region to application
	for (iCounter=0; iCounter<drag.arTargets.length; iCounter++)
	{
		objItem = document.getElementById(drag.arTargets[iCounter]);
		objItem.setAttribute('aria-labelledby', drag.arTargets[iCounter] + 'h');
		objItem.setAttribute('role', 'list');
	}

	objItem = document.getElementById('dragdrop');
	objItem.setAttribute('role', 'application');
	

	objItems = null;
}

window.onload = init;