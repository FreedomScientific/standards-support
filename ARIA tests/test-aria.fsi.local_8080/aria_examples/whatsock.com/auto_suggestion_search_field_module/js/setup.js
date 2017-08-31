/*!
Auto Suggestion Search Field Module
All statements beginning with "$A" refer to AccDC API methods.
Bryan Garaventa, WhatSock
*/
(function(){

// Enable AccDC API debugging
$A.fn.debug = true;

$A.bind(window, 'load', function(ev){

// Pass the initial AccDC Object declaration array
$A([

// Declare the Auto Suggestion AccDC Object
{
id: 'autoSug',
role: 'Suggested Items',
// Prevent auto return focus when the object closes
returnFocus: false,
allowReopen: true,
showHiddenClose: false,
// Automatically set positioning below the triggering object
autoPosition: 5,
// Set additional offset
offsetTop: 10,
// Set inline styles
cssObj: {
position: 'absolute',
zIndex: 1
},
// Class name for the AccDC Object
className: 'auto',
// Create a custom namespace holder
tmp: {
setFocus: function(){
$A.query('div.sugItem[aria-selected=true]', function(){
setAttr(this, {
'aria-selected': 'false',
tabindex: -1
});
});
setAttr(autoSug.containerDiv.childNodes[autoSug.tmp.index], 'tabindex', '0').focus();
}
},
// Run script once before the AccDC Object opens
runOnceBefore: function(dc){
dc.triggerObj = getEl('q');
},
// Run script before the AccDC Object opens, every time
runBefore: function(dc){
dc.tmp.index = 0;
dc.offsetLeft = dc.triggerObj.offsetWidth * 0.75;
},
// Run script after the AccDC Object opens, every time
runAfter: function(dc){
// Announce the closest match for screen reader users and suppress repeats
$A.announce(dc.tmp.results[0], true);
$A.bind(dc.containerDiv.childNodes, {
click: function(ev){
var q = dc.triggerObj;
q.value = this.innerText || this.textContent;
q.focus();
dc.close();
},
keypress: function(ev){
var k = ev.which || ev.keyCode;
if (k == 27 || k == 13){
if (k == 13) dc.triggerObj.value = this.innerText || this.textContent;
dc.triggerObj.focus();
dc.close();
ev.preventDefault();
}
},
keyup: function(ev){
var k = ev.which || ev.keyCode;
if (k == 38){
if (ev.altKey){
dc.triggerObj.value = this.innerText || this.textContent;
dc.triggerObj.focus();
dc.close();
ev.preventDefault();
} else if (dc.tmp.index > 0){
dc.tmp.index--;
dc.tmp.setFocus();
ev.preventDefault();
}
} else if (k == 40){
if (dc.tmp.index < (dc.tmp.results.length - 1)){
dc.tmp.index++;
dc.tmp.setFocus();
ev.preventDefault();
}
}
},
focus: function(ev){
setAttr(this, 'aria-selected', 'true');
}
});
setAttr(dc.containerDiv, 'role', 'listbox');
setAttr(dc.accDCObj, 'role', 'dialog');
setAttr(dc.triggerObj, 'aria-owns', dc.containerDivId);
},
// Run script before the AccDC Object closes, every time
runBeforeClose: function(dc){
setAttr(dc.triggerObj, 'aria-owns', '');
}
}

]);

// Set supporting variables
var trackChanges = '',
query = null,
// Get a reference to the Auto Suggestion AccDC Object
autoSug = $A.reg.autoSug;

// Configure a callback function, which accepts one array argument
window.configureSuggestions = function(results){
// Cancel if no results are found
if (!results || !results.length) return autoSug.close();
// Save the array in the tmp namespace for the autoSug object
autoSug.tmp.results = results;
// Set the source code to be rendered within the autoSug object
autoSug.source = '<div role="option" tabindex="0" class="sugItem">' + results.join('</div><div role="option" tabindex="-1" class="sugItem">') + '</div>';
// Render the autoSug object
autoSug.open();
};

// Setup keyboard support
$A.bind('#q', 'keyup', function(ev){
var k = ev.which || ev.keyCode;
if (autoSug.loaded && (k == 40 && ev.altKey)){
autoSug.tmp.index = 0;
autoSug.tmp.setFocus();
ev.preventDefault();
} else if ((k >= 65 && k <= 90) || (k >= 48 && k <= 57) || k == 46 || k == 8 || k == 32){
if (query) clearTimeout(query);
autoSug.tmp.index = 0;
var e = this;
query = setTimeout(function(){
if (e.value == trackChanges) return true;
trackChanges = e.value;
if (!e.value || (autoSug.tmp.results && (!autoSug.tmp.results.length || e.value == autoSug.tmp.results[0])))
autoSug.close();
else
// Perform query and specify the callback function to be executed
$A.getScript('http://whatsock.com/modules/auto_suggestion_search_field_module/search/query.js?max=5&callback=configureSuggestions&q=' + encodeURIComponent(e.value));
}, 300);
}
});

});

// Supporting functions
var getEl = function(e){
if (document.getElementById) return document.getElementById(e);
else if (document.all) return document.all[e];
else return null;
},

setAttr = function(obj, name, value){
if (!obj) return null;
if (typeof name === 'string'){
var a = createAttr(name);
a.nodeValue = value;
obj.setAttributeNode(a);
} else if (typeof name === 'object'){
for (n in name){
var a = createAttr(n);
a.nodeValue = name[n];
obj.setAttributeNode(a);
}
}
return obj;
},

createAttr = function(a){
return document.createAttribute(a);
};

})();