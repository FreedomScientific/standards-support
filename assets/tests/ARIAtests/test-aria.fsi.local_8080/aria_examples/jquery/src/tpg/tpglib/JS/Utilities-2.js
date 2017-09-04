/*
 * @fileOverview
 * @name Utilities.js
 * @Author Hans Hillen hhillen@paciellogroup.com
 * 
 * This is still a work in progress, and needs a lot of clean up. Also, we should move parts of this to use a more complete third prty library such as JQuery
 *  
 * Copyright (c) 2008 The Paciello Group, Inc
 * Licensed under GPL (http://www.opensource.org/licenses/gpl-license.php)
 * 
 */

/**
 * 
 * Shorthand function for document.getElementById()
 * @param id {string} id value of element to be returned
 */
 
function $(id) {
    return document.getElementById(id);
}
 
 /**
  * Format string (call as method on string). Takes any number of parameters, but if only one array parameter is sent it will use its values 
  * as individual parameters (reason, to avoid having to resort to using eval() in the TPG.log() function. Probably needs some improvements).   
  * Each occurance of %s will be replaced with a parameter
  */
String.prototype.printf = function() {
    var i, j;
    var args = arguments.length == 1 && typeof arguments[0] == "object" && arguments[0].length ? arguments[0] : arguments;
    //is it worth to also accept uppercase?
    var tokens = this.split('%s');
    var result = [];
        for (i = 0; i < tokens.length; i++) {
            result.push(tokens[i]);
            if (i < tokens.length - 1) {
                result.push(i < args.length ? args[i] : "undefined");
            }
        }
    // arguments that aren't specified are simply appended 
    for (j = i--; j < args.length; j++) {
        result.push(", " + args[j]);
    }
    
    return result.join('');
};

///*
//Use com.paciellogroup as namespace
var com;
if (!com) {
    com = {};
}
if (!com.pacielloGroup) {
    com.pacielloGroup = {};
}

//use closure to allow easy renaming of the TPG namespace
(function() {
//*/


/**
 * @namespace Groups all TPGlib methods, classes and constants
 */
var TPG = {};

//Config parameters

/**
 * Bool which toggles actual output by TPG.log() calls
 */
TPG.DEBUG = true;

/**
 * Determines whether aria will be applied using namespaces or not
 */
TPG.USENAMESPACEDARIA = false;


/**
 * Browser sniffing
 * @namespace
 */
TPG.Browser = {};
TPG.Browser.isIE = window.ActiveXObject ? true : false; 


/**
 * OBJECT HANDLING
 */
TPG.cloneObject = function(obj) {
    var newObj = {};
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            newObj[i] = obj[i];
        }
    }
    return newObj;
};

/**
 * Adds or replaces all obj2's properties to obj1
 * 
 * @param obj1
 * @param obj2
 */
TPG.overrideObject = function(obj1, obj2) {
    for (var i in obj2) {
        if (obj2.hasOwnProperty(i)) {
            obj1[i] = obj2[i];
        }
    }
    return obj1;
};

/**
 * ARRAY HANDLING
 */


/**
 * Checks array for value 
 * 
 * @param a Array object
 * @param v Any value that can be stored in an array
 * @return true if value is found, otherwise false
 */
TPG.inArray = function(a, v) {
    for (var i =0; i < a.length; i++) {
        if (a[i] == v) {
            return true;
        }   
    }
    return false;
};

TPG.getArrayIndex = function(a, v) {
	for (var i =0; i < a.length; i++) {
        if (a[i] == v) {
            return i;
        }   
    }
    return -1;
}

/*
 * CLASSNAME HANDLING
 */


/**
 * Returns elements matching a given className value
 * 
 * @param root {element} node to treat as root container
 * @param clsName {string} className value to match 
 * @param tag {string} Optional nodeName used to filter the returned nodelist by
 * @return nodelist of matched elements, if any 
 */
TPG.getElementsByClassName = function(root,clsName,tag){ 
	if (root.getElementsByClassName) {
        //Opera, Safari and FF now support this, but they don't support the tag parameter. Maybe just leave that out all together?
        return root.getElementsByClassName(clsName);
    }
    var nodeArray = [], elem; 
    if (!tag)
		tag = "*";
	var elems = root.getElementsByTagName(tag);
    for ( var i = 0; i < elems.length; i++ ) {
        if ( TPG.hasClassName(elems[i], clsName)){
            nodeArray.push(elems[i]);
        }
    }
	//alert("tag: " + tag + ", class: " + clsName + ", " + nodeArray.length);
    return nodeArray;
};

/**
 * Checks element for className
 * 
 * @param e element 
 * @param c classname  
 * @return bool
 */
TPG.hasClassName = function(e,c) {
    if (!e) {
        return false;
    }
    var classes = e.className;
    if (!classes) { 
        return false;
    }
    if (classes == c) {
        return true;
    }
    return e.className.search("\\b" + c + "\\b") != -1;
};


/**
 * Adds className value to element 
 * @param e element 
 * @param c classname  
 */
TPG.addClassName = function(e,c) {
    if (TPG.hasClassName(e, c)) {
        return;
    }
    if (e.className !== undefined) {    
        e.className = e.className + " " + c;
    }
};

/**
 * Removes className value from element 
 * @param e element 
 * @param c classname  
 */
TPG.removeClassName = function(e,c) {
    if (!e)
		return;
	if (typeof e == "string") {
        e = $(e);
    }
    e.className = e.className.replace(new RegExp("\\b" + c + "\\b\\s*", "g"), "");
};

/**
 *looks for name-value pairs in classnames, useful for unobtrusive scripting.
 * 
 * @param node element to check classes on
 * @param delimeter optional string used to recognize name-value pairs. Defaults to dash (-)
 */
TPG.getVarsFromClass = function(elemOrClass, prefix, delimeter) {
    if (!delimeter) {
        delimeter = "-";
    }
    var classNames = typeof elemOrClass == "string" ? elemOrClass.split(' ') : elemOrClass.className.split(' ');
    var vars = [];
    var tokens = [];    
    for (var i = 0; i < classNames.length; i++) {
        if (classNames[i].indexOf(prefix) == -1) {
            continue;
        }
        tokens = classNames[i].split(delimeter);
        if (tokens.length > 1) {
            vars[tokens[0].substr(prefix.length)] = tokens.length > 2 ? tokens.splice(1, tokens.length -1) : tokens[1]; // either store a single value ore multiple values as an array
        }
        else if (tokens.length == 1) {
            vars[tokens[0].substr(prefix.length)] = 'true';
        }
    }
    return vars;
};


/**
 * Checks if given variable is a valid string
 * @param variable {string} variable to check
 * @param defaultValue {string} value to return when the variable is not valid (e.g. is not a string or not part of the allowed set. 
 * @param allowedSet {array} (optional) set of possible string values the variable must have to be valid
 * @return the same variable, if valid, or the defaultValue otherwise  
 */
TPG.checkStringVar = function (variable, defaultValue, allowedSet) {
    var isValid = true;
    if (typeof variable != "string") {
        isValid = false;
    }
    else if (typeof allowedSet !== "undefined") {
        if (typeof allowedSet == "string"){
            allowedSet = [allowedSet];
        }
        if (typeof allowedSet == "object"&& allowedSet.length) {
            isValid = TPG.inArray(allowedSet, variable);
        }   
    }
    return isValid ? variable : defaultValue; 
};

/**
 * Checks if given variable is a (string equivalent of a) valid number
 * @param variable {number} variable to check
 * @param defaultValue {number} value to return when the variable is not valid (e.g. is not a number or not between min and max. 
 * @param min {number} (optional) lower limit of the accepted range
 * @param max {number} (optional) upper limit of the accepted range
 * @return the same variable, if valid, or the defaultValue otherwise  
 */
TPG.checkNumberVar = function (variable, defaultValue, min, max) {
    var isValid = true;
    if (typeof variable == "string" && !isNaN(variable)) {
        variable = parseInt(variable, 10);
    }
    if (typeof variable != "number") {
        isValid = false;
    }
    else if (min !== undefined && variable < min ) {
        isValid = false;    
    }
    else if (max !== undefined && variable > max) {
        isValid = false;
    }
    return isValid ? variable : defaultValue; 
};

TPG.checkArrayVar = function (variable, defaultValue, arrayLength) {
    var isValid = true;
    if (!(variable instanceof Array)) {
        isValid = false;
    }
    else if (typeof variable.length == "undefined" || (typeof arrayLength != "undefined" && arrayLength != variable.length)) {
        isValid = false;
    }   
    return isValid ? variable : defaultValue;
};


TPG.checkObjVar = function (variable, defaultValue, objConstructor) {
    var isValid = true;
    if (!(typeof variable == "object")) {
        isValid = false;
    }
    else if (objConstructor&& !(variable instanceof objConstructor)) {
        isValid = false;
    }   
    return isValid ? variable : defaultValue;
};

/**
 * Checks if given variable is a (string equivalent of a) boolean value 
 * @param variable {bool} variable to check
 * @param defaultValue {bool} value to return when the variable is not valid (e.g. not a boolean). 
 * @return the same variable, if valid, or the defaultValue otherwise  
 */
TPG.checkBoolVar = function (variable, defaultValue) {
    var isValid = true;
    if (typeof variable == "string") {
        if (variable.toLowerCase() == "false" || variable.toLowerCase() == "true") {
            variable = variable.toLowerCase() == "false" ? false : true;    
        }
    }
    if (typeof variable != "boolean") {
        isValid = false;
    }
    return isValid ? variable : defaultValue; 
};

TPG.addStylesheet = function(href) {
	if(document.createStyleSheet) {
		document.createStyleSheet(href);
	}
	else {
		var styles = "@import url('" + href + "');";	
		var newSS=document.createElement('link');
		newSS.rel='stylesheet';
		newSS.href='data:text/css,'+escape(styles);
		document.getElementsByTagName("head")[0].appendChild(newSS);
	}
};


/**
 * FOCUS HANDLING
 * @namespace
 */ 
 TPG.Focus = {};
 
 
/**
 * Attempts to move focus to node
 * 
 * @param node element to move focus to  
 */ 
TPG.Focus.setFocusTo = function(elem) {
    if (!elem) {
        return;
    }
    elem.focus();
};

/**
 * Determines whether the element is capable of receiving focus. This is done 
 * either checking whether 
 * 1. the element is natively capable of receiving focus.
 * 2. checking whether the element has a tabindex value of -1 or higher 
 * 
 * @param elem the element node to check for focusability
 */
TPG.Focus.isFocusable = function(elem) {
    var focusableElements = ['a', 'input', 'textarea', 'select', 'button', 'body', 'frame', 'iframe', 'object', 'applet'];
    if (!elem || elem.nodeType !== 1) {
        return false;
    }
    for (var i = 0; i < focusableElements; i++) {
        if (elem.nodeName.toLowerCase() == focusableElements[i]) {
            return true;
        }
    }
    var attr = elem.getAttributeNode("tabindex");
    return (attr ? attr.specified : false) && elem.style.display != "none";
    
//  if (elem.getAttribute('tabindex') !== undefined && parseInt(elem.getAttribute('tabindex'), 10) >= -1 && elem.style.display != "none") {
//      return true;
//  }
};

/**
 * Programatically makes the element focusable by setting the tabindex
 * 
 * @param elem
 * @param useTaborder {bool} determines whether make the element part of the taborder or not 
 */
TPG.Focus.makeFocusable = function( elem, makeTabbable ) {
    var tabIndexValue = makeTabbable ? "0" : "-1";
    //if ( elem.getAttribute( "tabindex" ) === null ) {
        elem.setAttribute( TPG.Browser.isIE ? "tabIndex" : "tabindex", tabIndexValue );
    //}
};

/**
 * Removes an element's tabindex property, making it unfocusable.
 * 
 * @param elem 
 */
TPG.Focus.makeUnfocusable = function( elem) {
    if (!elem || elem.getAttribute('tabindex') === undefined ) {
        return;
    }
    elem.removeAttribute('tabindex');
};


/**
 * Returns the adjacent focusable node, if any. 
 * 
 * @param elem Element to find focusable siblings for
 * @param backwards {bool} whether to search backwards
 * @param stopAtBorders {bool} If false the function will wrap to the first or last element if a border element is reached 
 */
TPG.Focus.getAdjacentFocusNode = function(elem, backwards, stopAtBorders) {
    if (!elem || !elem.parentNode) {
        return false;
    }
    var siblingCount = elem.parentNode.childNodes.length;
    var startElem = elem;
    if (siblingCount <= 0){
         return false;
    }
    for (var i = 0; i < siblingCount; i++) {
        try {
            elem = !backwards ? elem.nextSibling : elem.previousSibling;
        }
        catch(e) { //happens when border element was used (first or last)
            if (!elem && !stopAtBorders) {
                elem = !backwards ? startElem.parentNode.firstChild : startElem.parentNode.lastChild;
            }
        }
        if (TPG.Focus.isFocusable(elem)) {
            return elem;
        }
    }
    return false ;
};

/**
 * Visually draws a fadeout effect
 * 
 * This probably needs to to be placed somewhere else, as part of a larger set of visual effects
 * 
 * @param elem
 * @param iColour
 */

TPG.Focus.drawAttention = function(elem, iColour) {
    if (typeof elem == "string") {
        elem = $(elem);
    }
    if (!elem) {
        return;
    }
    elem.style.backgroundColor = 'rgb(255, 255, ' + iColour + ')';
    if (iColour < 256) {
        iColour += 16;
        setTimeout('TPG.Focus.drawAttention("' + elem.id + '", ' + iColour + ')', 50);
    }
};


/**
 * EVENT HANDLING 
 * @namespace
 */
TPG.Event = {}; 


/*
 * Attaches event handler
 * 
 * @param elem 
 * @type {string} event type, e.g. 'click' or 'keydown'
 * @handler function to handle the event
 * @capture {bool} whether catch the event during capturing phase
 */
TPG.Event.addHandler = function(elem, type, handler, capture) {
    if (document.addEventListener) {    
        elem.addEventListener(type, handler, capture);
    }
    else if (document.attachEvent){
        elem.attachEvent('on' + type, handler);
    }
    else {
        if (elem['on' + type]) { // don't overwrite an already existing handler
            var oldHandler = elem['on' + type]; 
            elem['on' + type] = function() {
                oldHandler();
                handler();
            };
        }
        else {  
            elem['on' + type] = handler;
        }
    }
};

/*
 * Removes event handler
 * 
 * @param elem 
 * @type {string} event type, e.g. 'click' or 'keydown'
 * @handler function to handle the event
 * @capture {bool} whether catch the event during capturing phase
 */
TPG.Event.removeHandler = function(elem, type, handler, capture ) {
    if (document.removeEventListener) {
        elem.removeEventListener(type, handler, capture);
    }
    else if (document.detachEvent) {
        elem.detachEvent('on' + type, handler);
    }
    else {
        elem['on' + type] = null;
    }
};

/**
 * attempts to create an Xbrowser consistent event object, by adding custom properties
 * 
 * @param event 
 */ 
TPG.Event.getEvent  = function(event) {
    var e = event || window.event;
    e.myTarget = e.target || e.srcElement;
    e.myKeyCode = e.keyCode || e.charCode;
    return e;
};

/**
 * Stops the event from propagating, and prevents the default action
 * 
 * @param event
 */
TPG.Event.cancelEvent = function(event) {
    if (event.stopPropagation) {
        event.stopPropagation();
    }
    else if (typeof event.cancelBubble != "undefined") {
        event.cancelBubble = true;  
    }
    
    if (event.preventDefault) {
        event.preventDefault();
    }
    
    return false;
};

/**
 * Assigns event handlers to a nodelist by combining TPG.getElementByclassName and TPG.Event.addHandler 
 * 
 * @param rootNode 
 * @param classname
 * @param eventType
 * @param handler
 * @param useCapture
 */ 
TPG.addEventToNodes = function(rootNode, className, nodeName, eventType, handler, useCapture ) {
    var nodes = TPG.getElementsByClassName(rootNode, className, nodeName);
    for (var i = 0; i < nodes.length; i++) {
        TPG.Event.addHandler(nodes[i], eventType, handler, useCapture);
    }
    nodes = undefined;
};


/**
 * Dom Handling
 * @namespace
 */

TPG.Dom = {};

/**
 * Updates the node's text content
 * @param elem
 * @param text The text to place in the node
 */
TPG.Dom.innerText = function(elem, text) {
    if (!elem) {
        return;
    }
    if (elem.hasChildNodes()) {
        TPG.Dom.makeNodeEmpty(elem);        
    }
    elem.appendChild(document.createTextNode(text));
};

/**
 * Remove all childnodes
 * 
 * @param elem 
 */
TPG.Dom.makeNodeEmpty = function(elem) {
    if (!elem) {
        return;
    }
    while (elem.hasChildNodes()) {
        elem.removeChild(elem.firstChild);
    }
};

TPG.Dom.previousElement = function(node) {
    if (!node) {
        return null;
    }
    while (node = node.previousSibling) {
        if (node.nodeType == 1) {
            return node;
        }
    }
    return null;
};

TPG.Dom.nextElement = function(node) {
    if (!node) {
        return null;
    }
    while (node = node.nextSibling) {
        if (node.nodeType == 1) {
            return node;
        }
    }
    return null;
};

TPG.Dom.isElementNode = function(node) {
    return node && node.nodeType == 1;
};

TPG.Dom.getFirstChild = function(node)  {
    var child;
    if (!node || !node.hasChildNodes()) {
        return false;
    }
    child = node.firstChild;
    return TPG.Dom.isElementNode(child) ? child : TPG.Dom.nextElement(child);  
};

TPG.Dom.getLastChild = function(node)  {
    var child;
    if (!node || !node.hasChildNodes()) {
        return false;
    }
    child = node.lastChild;
    return TPG.Dom.isElementNode(child) ? child : TPG.Dom.previousElement(child);  
};

TPG.Dom.findSpecialSibling = function(node, func, next) {
    if (!TPG.Dom.isElementNode(node)) {
        return false;
    }
    while (node) {
        if (func(node)) {
            break;  
        }
        node = next ? TPG.Dom.nextElement(node) : TPG.Dom.previousElement(node);
    }
    return node;
};


/**
 *  KEY HANDLING
 * @namespace 
 */
TPG.Key = {};

//keycode constants 
TPG.Key.K_ARROWLEFT = 37;
TPG.Key.K_ARROWRIGHT = 39;
TPG.Key.K_ARROWUP = 38;
TPG.Key.K_ARROWDOWN = 40;
TPG.Key.K_PAGEUP = 33;
TPG.Key.K_PAGEDOWN = 34;
TPG.Key.K_HOME = 36;
TPG.Key.K_END = 35;
TPG.Key.K_ESCAPE = 27;

/*Determines whether keycode is one of the 4 arrow keys
 * 
 * @param code
 */
TPG.Key.isArrowKey = function(code) {
    return TPG.Key.isVerticalArrowKey(code) || TPG.Key.isHorizontalArrowKey(code);
};

/**
 * Returns true if keycode belongs to up or down arrow key
 * 
 * @param code
 */
TPG.Key.isVerticalArrowKey= function(code) {
    return code == TPG.Key.K_ARROWUP || code == TPG.Key.K_ARROWDOWN;
};


/**
 * Returns true if keycode belongs to left or right arrow key
 * 
 * @param code
 */
TPG.Key.isHorizontalArrowKey = function(code) {
    return code == TPG.Key.K_ARROWLEFT || code == TPG.Key.K_ARROWRIGHT;
};

/*
 * DEBUGGING
 */

/**
 * Toggles the functioning of the TPG logger
 * @param enable {bool} Whether to enable the logger
 */
TPG.enableLogger = function(enable) {
    if (TPG.DEBUG && !enable) {
        TPG.DEBUG = false;
        if ($("TPGLogPane")) {
            $("TPGLogPane").parentNode.removeChild($("TPGLogPane"));
        }
    }
    else if (!TPG.DEBUG && enable) {
        TPG.DEBUG = true;
        TPG.log("TPG.logger enabled");
    }
        
};
/* 
 * Outputs log message. Uses Firebug console if installed (also works for Safari console), otherwise creates a logger div.
 * Can be called with following parameters:
 * 1 string param:  type param is not used (type will default to 'log'), instead it's treated as the omitted msg param
 * 1 non-string param: value is treated as object, all properties are listed
 * 2 string params: first param is type, which can be 'log', 'warn' or 'info' (add more if needed), which are accepted 
 * by firebug. If there's no firebug, a classname will be added to the log message (styles still have to be added).
 * 3 or more params: For first to see above, all remaining params are used for String.printf feature
 * 
 * Log messages will be ignored if TPG.DEBUG is set to false
*/
TPG.log = function(typeOrValue, msg) {
    if (!TPG.DEBUG) {
        return;
    }
    var now = new Date();
    var startCountAt = 2, logMsg = msg, i;
    var matchVars = [];
    var logType = typeOrValue;
    
    if (typeOrValue != "log" && typeOrValue != "warn" && typeOrValue != "info") {
        logMsg = typeOrValue;
        logType = 'log';
        startCountAt = 1;
    }
    logMsg += ""; // make sure we'll call printf() on a string
    if (arguments.length > startCountAt) {
       for (i = startCountAt; i < arguments.length; i++) {
           matchVars.push(arguments[i]);
       }
    }
    logMsg = matchVars.length > 0 ? logMsg.printf(matchVars) : logMsg.printf();
    logMsg = now.toLocaleTimeString() + ": " + logMsg;//.replace(/'/, "\\'");
    
    if (typeof console == "undefined") {
        if (!$('TPGLogPane')) {
            var logger = document.createElement('div');
            logger.id = "TPGLogPane";
            logger.style.position = "fixed";
            logger.style.bottom = "15px";
            logger.style.right = "15px";                
            logger.style.padding = "10px";          
            logger.style.width = "500px";
            logger.style.height = "150px";
            logger.style.overflow = "scroll";               
            logger.style.border = "1px solid black";
            logger.style.background = "white";              
            logger.style.font = "10px Arial";
            logger.style.color = "#333333";
            logger.style.zIndex = "999999";
            document.body.appendChild(logger);
        }
        var logPane = $('TPGLogPane');
        var logList = logPane.getElementsByTagName('ol')[0];
        if (!logList) {
            logList = document.createElement('ol');
            logList.style.padding = "0px";
            logList.style.margin = "0px";
            logList.style.listStyle = "none";
            logPane.appendChild(logList);
        }
        var logItem = document.createElement('li');
        logItem.appendChild(document.createTextNode(logMsg));
        logItem.className = logType;
        //logList.appendChild(logItem);
        // temp fix for browsers having problems with scrollintoview (current this seems to be Opera and IE8)
        // use this instead of the appendChild line above to make the log messages be added to the befinning of the list, making it go upwards can be confusing!)
        logList.insertBefore(logItem, logList.firstChild); 
        
        
        logItem.scrollIntoView();
    }
    else {
        console[logType](logMsg);
    }
};

/***** Form Handling *****/
TPG.getCheckedValue = function(radioObj) {
    if(!radioObj) {
        return "";
    }
    var radioLength = radioObj.length;
    if(radioLength === undefined) {
        if(radioObj.checked) {
            return radioObj.value;
        }
        else {
            return "";
        }
    }
    for(var i = 0; i < radioLength; i++) {
        if(radioObj[i].checked) {
            return radioObj[i].value;
        }
    }
    return "";
};

/**
 * Set the radiobutton which has the correspondig value
 * 
 * @param radioObj
 * @param value
 */
TPG.setCheckedValue = function(radioObj, value) {
    if(!radioObj) {
        return false;
    }
    var valueFound = false;
    var radioLength = radioObj.length;
    for(var i = 0; i < radioLength; i++) {
        if(radioObj[i].value == value + "") { //convert value to string if needed
            radioObj[i].checked = true;
            valueFound = true;
        }
    }
    if (!valueFound) {
        radioObj[0].checked = true;
    }
    return false;
};

/*
 * toggles the element's 'disable' status
 * @param element
 */
TPG.toggleDisabled = function(element) {
    element.disabled =  !element.disabled;
};

/** 
 * Set the elements disabled status 
 * @param element
 * @param makeDisabled {bool}
 */
TPG.setDisabled = function(element, makeDisabled) {
    element.disabled =  makeDisabled;
};

/**
 * For all fields with in the the root element, set the disabled status. Also sets a classname to the root element for visual styles.
 * @rootElement
 * @disable {bool}
 */
TPG.setDisabledFormSegment = function (rootElement, disable) {
    var elements = [];
    var i, j;
    if (typeof rootElement == "string") {
        rootElement = $(rootElement);
    }
    if (!rootElement) {
        return;
    }
    if (disable) {
        TPG.addClassName(rootElement, "disabled");
    }
    else {
        TPG.removeClassName(rootElement, "disabled");
    }
    elements = elements.concat(rootElement.getElementsByTagName('INPUT'));
    elements = elements.concat(rootElement.getElementsByTagName('TEXTAREA'));
    elements = elements.concat(rootElement.getElementsByTagName('SELECT'));
    for (i = 0; i < elements.length; i++) {
        for (j = 0; j < elements[i].length; j++) {
            elements[i][j].disabled = disable;
        }
    }
};

/***** Math Handling *****/
/*
 * Return a random number
 * @param min {number}
 * @param max {max}
 */
TPG.getRnd = function(min, max) {
    return min + Math.ceil(Math.random() * max);
};

/***** Misc *****/

/*
Adds or replaces a part of the title. This considers the title to be a string split up into tokens based on a delimeter .
'levels' specifies how many tokens (starting from the right) should be replaced / removed. The 'newSuffix' parameter .
* 
* @param newSuffix A single or array of strings to add to the title
* @param levels {number }How many tokens (based on the given delimeter) to replace (counting from the end of the title string.
* @param delimeter {string} used to split up the title into tokens (defaults to ' - ')
*/
TPG.changeTitleSuffix = function(newSuffix, levels, delimeter) {
    levels = levels > 0 ? levels : 0;
    delimeter = !delimeter ? ' - ' : delimeter;
    if (!(newSuffix instanceof Array )) {
        newSuffix = [newSuffix];
    }
    var title = document.title;
    var tokens = title.split(delimeter);
    var indicesToKeep = levels <= tokens.length ? tokens.length - levels: tokens.length;
    document.title = (tokens.splice(0, indicesToKeep).concat(newSuffix)).join(delimeter);
    return document.title;
};

/* SCALING & RESIZING 
 * @namespace
 */

TPG.Scaling = {};
TPG.Scaling.lastSize = 0;
TPG.Scaling.indicatorElem = undefined;
TPG.Scaling.onTextResize = undefined;
TPG.Scaling.ontextresizeTimer = undefined;

TPG.Scaling.create1EmDiv = function() {
    var testDiv = document.createElement("div");
    testDiv.id="tpg_scaleElement";
    
    // TODO: this is supposed to be absolute, but this throws IE8 beta 1 's perception of offsetLeft and offsetTop values out of whack. Hopefully this will be fixed soon, change back to absolute then
    //testDiv.style.position = "absolute";
    testDiv.style.position = "relative"; 
    testDiv.style.height = "1em";
    testDiv.style.width = "1em";
    testDiv.style.top = "-1000em";
    testDiv.style.left = "-1000em";
    TPG.Scaling.indicatorElem = document.body.appendChild(testDiv);
    return  testDiv;
};

TPG.Scaling.initOntextresizeListener = function (callback) {
    TPG.Scaling.create1EmDiv();
    TPG.Scaling.lastSize = TPG.Scaling.indicatorElem.offsetWidth;
    TPG.Scaling.ontextresizeTimer = setInterval(TPG.Scaling.checkScale,100);
    
};

TPG.Scaling.stopListening = function() {
    clearTimeout(TPG.Scaling.ontextresizeTimer);
};

 
TPG.Scaling.checkScale = function() {
    if (TPG.Scaling.lastSize != TPG.Scaling.indicatorElem.offsetWidth) {
        TPG.log('resize detected');
        TPG.Scaling.lastSize = TPG.Scaling.indicatorElem.offsetWidth;
    }
};

TPG.Scaling.px2em = function(pxSize, roundOneDecimal) {
    return roundOneDecimal ? Math.round((pxSize / TPG.Scaling.indicatorElem.clientWidth) * 10) / 10 : pxSize / TPG.Scaling.indicatorElem.clientWidth;
};

TPG.Scaling.em2px = function(emSize, roundOneDecimal) {
    return roundOneDecimal ? Math.round((emSize * TPG.Scaling.indicatorElem.clientWidth) * 10) / 10 : emSize * TPG.Scaling.indicatorElem.clientWidth;
};

TPG.Scaling.getLengthFromCSSString = function(valueString) {
    if (typeof valueString == "string") {
        var matches = valueString.match(/(\d*\.?\d+)(em|px|%)/);
        if (matches[0]) {
            matches[1] = parseFloat(matches[1]);
        }
        return matches  
    }
    else return false;
};

/*Rich Control Handling
 *@namespace 
 */

TPG.Instance = {};



/**
 * Creates a new list object. This object can be used to keep track on a collection of objects, which has to be 
 * populated by the developer. For example, a instance list object could be used to keep track on all available widgets
 * of a particular type in a document. This would make it easy to target all widgets in case they need to be updated, 
 * removed or notified
 *  
 * @constructor
 * @param type {string} Optional string stating the type of the objects stored in this list. when used, the list 
 * will only allow objects which have a 'type' property set to this value. 
 */ 
TPG.Instance.list= function(type) {
    /**
     * stores reference to actual object, allows reference by id
     */
    this._items = {};
    /**
     *stores id only, allow reference by index
     */
    this._enumItems = [];
    this.type = type;
};


/**
 * Adds an item to the list
 * @param obj The actual object to store
 * @param id The object's id. If left out, an attempt will be made to check for the HTML element representing this object.
 */
TPG.Instance.list.prototype.add = function(obj, id) {
    if (!id) { 
        //No id was given, check if there is an 'id' property in the object, otherwise set default incremented ID value
        id = obj&& obj.id ? obj.id : "item" + this._enumItems.length;
    }
    //object can't already have _instanceIndex property, used for cross referencing
    obj._instanceIndex = this._enumItems.length; 
    this._items[id] = obj;
    this._enumItems.push(id);
    return id;
};


/**
 * Removes item from the list
 * @param id id of object to remove
 */
TPG.Instance.list.prototype.remove = function(id) {
    delete this._enumList[this._items[id].instanceIndex];
    delete this._items[id]._instanceIndex; //remove the object property added by the list manager 
    delete this._items[id];
};

/**
 * Returns object from the list, eitehr by index or by id
 * @param idOrIndex can eitehr be a number corresponding the index of the object or a string of its id value 
 */
TPG.Instance.list.prototype.get = function(idOrIndex) {
    if (typeof idOrIndex == "string") {
        //console.dir(this._items[idOrIndex]);
        return this._items[idOrIndex];
    }
    else if (typeof idOrIndex == "number") {
        return this._items[this._enumItems[idOrIndex]];
    }
    return false;
};

/**
 * returns an enumerated array of all objects in the list
 */
TPG.Instance.list.prototype.getIndexList = function() {
    return this._enumItems;
};


/***** Cookie Handling *****/


/**
 * Code for the following cookie handler functions was created by David Flanagan: http://www.davidflanagan.com/javascript5/display.php?n=19-2&f=19/Cookie.js
 * We should eventually replace this with something of our own
 * 
 * This is the Cookie() constructor function.
 *
 * This constructor looks for a cookie with the specified name for the
 * current document.  If one exists, it parses its value into a set of
 * name/value pairs and stores those values as properties of the newly created
 * object.
 *
 * To store new data in the cookie, simply set properties of the Cookie
 * object.  Avoid properties named "store" and "remove" since these are 
 * reserved as method names.
 * 
 * To save cookie data in the web browser's local store, call store().
 * To remove cookie data from the browser's store, call remove().
 *
 * The static method Cookie.enabled() returns true if cookies are
 * enabled and returns false otherwise.
 * @namespace
 */
TPG.Cookie = function(name) {
    var i;
    this.$name = name;  // Remember the name of this cookie 
    var allcookies = document.cookie;
    if (allcookies === "") {
        return;
    }

    var cookies = allcookies.split(';');
    var cookie = null;
    for(i = 0; i < cookies.length; i++) {
        // Does this cookie string begin with the name we want?
        if (cookies[i].substring(0, name.length+1) == (name + "=")) {
            cookie = cookies[i];
            break;
        }
    }

    // If we didn't find a matching cookie, quit now
    if (cookie === null) {
        return;
    }

    // The cookie value is the part after the equals sign
    var cookieval = cookie.substring(name.length+1);
    var a = cookieval.split('&'); // Break it into an array of name/value pairs
    for(i = 0; i < a.length; i++) { // Break each pair into an array
        a[i] = a[i].split(':');
    }
    for( i = 0; i < a.length; i++) {
        this[a[i][0]] = decodeURIComponent(a[i][1]);
    }
};

/**
Quick function that fetches a cookie value without having to store a separate cookie object first.
**/
TPG.Cookie.getCookieParam = function(cookieName, paramName, defaultValue, set) {
    var cookie = new TPG.Cookie(cookieName);
    var tempValue;
    var partOfSet = false;
    if (cookie[paramName]) {
        switch (typeof defaultValue) {
            case "string":
                tempValue = cookie[paramName];
                if (set && !TPG.inArray(set, tempValue)) {
                    tempValue = undefined;
                }
                return typeof tempValue != "undefined" ? tempValue : (typeof defaultValue != "undefined" ? defaultValue : ""); 
            case "number":
                tempValue = parseInt(cookie[paramName], 10);
                if (set && !TPG.inArray(set, tempValue)) {
                    tempValue = undefined;
                }
                return !isNaN(tempValue)? tempValue : (defaultValue !== undefined ? defaultValue : 0);  
            case "boolean":
                return cookie[paramName] == "true" ? true : (defaultValue !== undefined ? defaultValue : false);
            default://most likely case: "undefined"
                return cookie[paramName];
        }
    }
    else {
        return defaultValue !== undefined ? defaultValue : false;
    } 
};

/**
 * This function is the store() method of the Cookie object.
 *
 * Arguments:
 *
 *   daysToLive: the lifetime of the cookie, in days. If you set this
 *     to zero, the cookie will be deleted.  If you set it to null, or 
 *     omit this argument, the cookie will be a session cookie and will
 *     not be retained when the browser exits.  This argument is used to
 *     set the max-age attribute of the cookie.
 *   path: the value of the path attribute of the cookie
 *   domain: the value of the domain attribute of the cookie
 *   secure: if true, the secure attribute of the cookie will be set
 */
TPG.Cookie.prototype.store = function(daysToLive, path, domain, secure) {
    var cookieval = "";
    for(var prop in this) {
        // Ignore properties with names that begin with '$' and also methods
        if (this.hasOwnProperty(prop)) {
            if ((prop.charAt(0) == '$') || ((typeof this[prop]) == 'function')) { 
                continue;
            }
            if (cookieval !== "") {
                cookieval += '&';
            }
            cookieval += prop + ':' + encodeURIComponent(this[prop]);
        }
    }
    var cookie = this.$name + '=' + cookieval;
    if (daysToLive || daysToLive === 0) { 
        cookie += "; max-age=" + (daysToLive*24*60*60);
    }
    if (path) {
        cookie += "; path=" + path;
    }
    if (domain) {
        cookie += "; domain=" + domain;
    }
    if (secure) {
        cookie += "; secure";
    }

    // Now store the cookie by setting the magic Document.cookie property
    document.cookie = cookie;
};

/**
 * This function is the remove() method of the Cookie object; it deletes the
 * properties of the object and removes the cookie from the browser's 
 * local store.
 * 
 * The arguments to this function are all optional, but to remove a cookie
 * you must pass the same values you passed to store().
 */
TPG.Cookie.prototype.remove = function(path, domain, secure) {
    // Delete the properties of the cookie
    for(var prop in this) {
        if (prop.charAt(0) != '$' && typeof this[prop] != 'function') { 
            delete this[prop];
        }
    }

    // Then, store the cookie with a lifetime of 0
    this.store(0, path, domain, secure);
};

/**
 * This static method attempts to determine whether cookies are enabled.
 * It returns true if they appear to be enabled and false otherwise.
 * A return value of true does not guarantee that cookies actually persist.
 * Nonpersistent session cookies may still work even if this method 
 * returns false.
 */
TPG.Cookie.enabled = function() {
    // Use navigator.cookieEnabled if this browser defines it
    if (typeof navigator.cookieEnabled != "undefined") {
        return navigator.cookieEnabled;
    }

    // If we've already cached a value, use that value
    if (TPG.Cookie & TPG.Cookie.enabled.cache !== undefined) {
        return TPG.Cookie.enabled.cache;
    }

    // Otherwise, create a test cookie with a lifetime
    document.cookie = "testcookie=test; max-age=10000";  // Set cookie

    // Now see if that cookie was saved
    var cookies = document.cookie;
    if (cookies.indexOf("testcookie=test") == -1) {
        // The cookie was not saved
        TPG.Cookie.enabled.cache = false;
        return false;
    }
    else {
        // Cookie was saved, so we've got to delete it before returning
        document.cookie = "testcookie=test; max-age=0";  // Delete cookie
        TPG.Cookie.enabled.cache = true;
        return true;
    }
};

/*ARIA Handling
 * @namespace
 * */

TPG.Aria = {};


/**
 * Mapping of classnames to aria values
 */
TPG.Aria.roleMap = {
    //widget roles
    "ariaAlert"      : "alert",
    "ariaAlertDialog": "alertdialog",
    "ariaButton"     : "button",
    "ariaCheckbox"   : "checbox",
    "ariaDialog"     : "dialog",
    "ariaMenuItemcheckbox" : "menuitemcheckbox",
    "ariaMenuItemRadio" : "menuitemradio",
    "ariaProgressbar": "progressbar",
    "ariaSeparator"  : "separator",
    "ariaTree"       : "tree",
    "ariaTreeitem"   : "treeitem",
    "ariaStatus"     : "status",
    // structural roles
    "ariaApplication": "application",
    "ariaDescription": "description",
    "ariaDocument"   : "document",
    "ariaGroup"      : "group",
    "ariaLog"        : "log",
    "ariaMenu"       : "menu",
    "ariaMenubar"    : "menubar",
    "ariaMenuItem"   : "menuItem",
    "ariaPresentation" : "presentation",
    "ariaTablist"    : "tablist",
    "ariaTab"        : "tab",
    "ariaTabpanel"   : "tabpanel",
    "ariaTooltip"    : "tooltip",
    //landmark roles
    "ariaBanner"     : "banner",
    "ariaMain"       : "main",
    "ariaNavigation" : "navigation",
    "ariaSearch"     : "search",
    "ariaSecondary"  : "secondary"
};

/**
 * mapping of classnames to ARIA states and properties
 */
TPG.Aria.stateMap = {
    "ariaAtomic": {
        "atomic": true
    },
    "ariaBusy" : {
        "busy" : "true"
    },
    "ariaBusyError" : {
        "busy" : "error"
    },
    "ariaNotChecked" : {
        "checked" : false
    },
    "ariaChecked": {
        "checked" : true
    },
    "ariaDisabled": {
        "disabled": true
    },
    "ariaNotExpanded": {
        "expanded": false
    },
    "ariaExpanded": {
        "expanded": true
    },
    "ariaHasPopup": {
        "haspopup": true
    },
    "ariaInvalid": {
        "invalid": true
    },
    "ariaLiveAssertive": {
        "live": "assertive"
    },
    "ariaLivePolite": {
        "live": "polite"
    },
    "ariaLiveRude": {
        "live": "rude"
    },
    "ariaMultiSelectable": {
        "multiselectable": true
    },
    "ariaNotPressed": {
        "pressed": false
    },
    "ariaPressed": {
        "pressed": true
    },
    "ariaReadOnly": {
        "readonly": true
    },
    "ariaRelevanceAdditions" : {
        "relevance" : "additions"
    },
    "ariaRelevanceremovals" : {
        "relevant" : "removals"
    },
    "ariaRelevantText" : {
        "relevant" : "text"
    },
    "ariaRelevantAll" : {
        "relevant" : "all"
    },

    "ariaRequired": {
        "required": true
    },
    "ariaNotSelected": {
        "selectable": false
    },
    "ariaSelected": {
        "selected": true
    },
    "ariaSortAscending" : {
        "sort" : "ascending"
    },
    "ariaSortDecending" : {
        "sort" : "descending"
    },
    //the values for the following have to be extracted from the classname using a delimiter and cannot be predefined:
    "ariaLevel"    : "level",
    "ariaValueMin" : "valuemin",
    "ariaValueMax" : "valuemax",
    "ariaValueNow" : "valuenow",
    "ariaPosInset" : "posinset",
    "ariaSetSize"  : "setsize",
    "ariaFlowTo"   : "flowto",
    "ariaDescribedBy" : "describedby",
    "ariaLabeledBy": "labeledby",
    "ariaControls" : "controls",
    "ariaOwns"     : "owns",
    "ariaActiveDescendant": "activedescendant"
};  

    
TPG.Aria.checkNameSpacedAria = function() {
    var appString = navigator.userAgent.toLowerCase();
    var isMozilla = ( appString.indexOf ( 'mozilla') != -1 ) && ( appString.indexOf ( 'rv:' ) != -1 ) && 
        ( appString.indexOf ( 'compatible' ) == -1 );
    if (!isMozilla) {
        return false;
    }
    else {
        var version;
        var start = appString.indexOf('rv:') + 3;
        var match = appString.substring( start ).match ( /([0-9])+.([0-9])+(.[0-9]){0,1}/ );
        try {
            version = parseFloat( match[1] + "." + match[2] );
        } catch (e) {
            version = parseFloat( appString.substring( start, start + 4 ) ); // Note we break when rv: goes to 100...
        }
        TPG.USENAMESPACEDARIA = version < 1.9 ? true : false;
    } 
    return false;
};  
    
TPG.Aria.setRolesAndStates = function(rootElem, skipRoles, maxLevels, skipFocus) {
    if (!rootElem) {
        return;
    }
    var elems, i, len;
    var roleMap = !skipRoles ? TPG.Aria.roleMap : null;
    var stateMap = TPG.Aria.stateMap;
    if ( !maxLevels ) {
        maxLevels = 1;
    }
    TPG.Aria.setRolesAndStatesForElem( rootElem, roleMap, stateMap, skipFocus );
    
    while( --maxLevels > 0) {
        elems = rootElem.childNodes;
        len = elems.length;
        if (!len) {
            return;
        }
        for ( i=0; i < len; i++ ) {
            if (elems[i].nodeType == 1) {
                TPG.Aria.setRolesAndStates( elems[i], skipRoles, maxLevels, skipFocus);
            }
        }
    }
};

TPG.Aria.setRolesAndStatesForElem = function(elem, roleMap, stateMap, skipFocus) {
    var className = elem.className;
    if ( !className ) {
        return;
    }
    var classes = className.split( " " );
    var roleIsSet = false;
    var setStates = {};
    var classFragments, thisClass, roleName, stateName, stateValue, matchedState ;
    if (!skipFocus) {
        skipFocus = true;
    }
    for ( var j= 0; j < classes.length; j++ ) {
        thisClass = classes[j];
        if (!skipFocus) {
            if (thisClass == "ariaTabindex_-1") {
                TPG.Focus.makeFocusable(elem, false);
            }
            else if (thisClass == "ariaTabindex_0") {
                TPG.Focus.makeFocusable(elem, true);
            }
        }
        if ( roleMap && !roleIsSet ) {
            roleName = roleMap[thisClass];
            if ( roleName ) {
                TPG.Aria.setRole( elem, roleName);
                roleIsSet = true; // We already have a role, stop looking
            }
        }
        if ( stateMap ) {
            matchedState = stateMap[ thisClass ];
            if ( matchedState ) {//state is an object containing  a name/value pair (values are predefined, e.g. a boolean or a fixed set of possible strings)
                for ( stateName in matchedState ) {
                    if ( matchedState.hasOwnProperty(stateName) && !setStates[ stateName ] ) {
                        stateValue = matchedState[stateName].toString();
                    }
                }
            }
            else if (thisClass.indexOf('_') !== -1) { //unpredicatble value might be embedded as part of classname (with - as delimiter), extract it and use it
                classFragments = thisClass.split('_');
                stateName = stateMap[classFragments[0]]; //state is defined as string. Use this as name and the extracted string as value
                stateValue = classFragments[1];
            }
            if (stateName && stateValue){
                TPG.Aria.setProperty( elem, stateName, stateValue );
                setStates[ stateName ] = true; // don't set this state again for this elem
            }
        }
    }
};

TPG.Aria.setRole = function(elem, role) {
    if (TPG.USENAMESPACEDARIA && elem.setAttributeNS) {
        elem.setAttributeNS('http://www.w3.org/1999/xhtml', 'role', 'wairole:' + role);
    }
    else { 
        elem.setAttribute('role', role);
    }
};

TPG.Aria.setProperty = function(elem, property, value) {
    if (TPG.USENAMESPACEDARIA && elem.setAttributeNS) {
        elem.setAttributeNS('http://www.w3.org/2005/07/aaa', property, value);
    }
    else {
        elem.setAttribute('aria-' + property, value);
    }
};

///*
    com.pacielloGroup = TPG;

})();

// define shorthand object, rename if needed
var TPG = com.pacielloGroup;
//*/