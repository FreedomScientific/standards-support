/**
 * @fileOverview
 * @name Tree.js
 * @Author Hans Hillen hhillen@paciellogroup.com
 * @version 0.6
 * 
 * Copyright (c) 2008 The Paciello Group, Inc
 * Licensed under a Creative Commons Attribution-Noncommercial-Share Alike 3.0
 * http://creativecommons.org/licenses/by-nc-sa/3.0/us/
 */

/*global TPG */
var TPG;
if (!TPG) {
	TPG = {};
}	
if (!TPG.Control) {
	TPG.Control = {};
}

(function() {
/**
 * Script configuration
 */
 
 var imgPath = "http://www.paciellogroup.com/blog/misc/samples/aria/slider/images/";
	
function T(id, rootNode, cfg) {
	// init code
	var that = this;
	if (!rootNode) {
		//TPG.log("Specified element not found, couldn't apply tree markup");
		return false;
	}
	if (!rootNode.id)
		rootNode.id = id;
	that.id = id; 
	var _sourceElem = rootNode;   
	var _listeners = [];
	var _multiSelectable = TPG.hasClassName(_sourceElem, "multiSelectable");

	//set config vars
	if (!cfg) { 
		cfg = TPG.getVarsFromClass(rootNode, "tpg_");
	}
	if (!cfg) {
		//at the moment there are no config vars for this tree
		cfg= {};	
	}  
	
	//public methods
	
	that.addHandlers = function(tree) {
		var tree = _sourceElem;
		tree.onkeydown = _handleKeyDown;
		tree.onmousedown = _handleMouseDown;
		if (document.addEventListener) {
			tree.addEventListener('focus', _handleFocus, true);
			tree.addEventListener('blur', _handleBlur, true);   
		}
		tree.onfocusin = _handleFocus;
		tree.onfocusout = _handleBlur;
	};

	that.addListener = function(listener) {
		var objStrings = {}, i, obj, callback;
		if (typeof listener == "string") {
			
			objStrings = listener.split('.');
			if (objStrings.length <= 1) {
				callback = window[listener];
			}
			else {
				obj = window;
				for(i=0; i<objStrings.length; i++) {
					if (typeof obj[objStrings[i]] != "undefined") {
						obj = obj[objStrings[i]];
					}   
				}
				callback = obj;
				obj = null;
			}
		}
		else {
			callback = listener;
		}   
		if (typeof callback == "function") {
			_listeners.push(callback);
		}
		
	};
	
	that.removeHandlers = function() {
		var tree = _sourceElem;
		tree.onkeydown = null;
		tree.onmousedown = null;
		if (document.addEventListener) {
			tree.removeEventListener('focus', _handleFocus, true);
			tree.removeEventListener('blur', -handleBlur, true);   
		}
		tree.onfocusin = null;
		tree.onfocusout = null;
	};
	
	that.getSelectedNodes = function() {
		return _selectedNodes;
	};
	
	that.getSelectedLabels = function() {
		var labels = [], node;
		for (var i = 0; i < _selectedNodes.length; i++) {
			node = _selectedNodes[i];
			labels[i] = node.innerText ? node.innerText : node.textContent;
		}
		return labels;
	};
	
	that.getSelectedIds = function() {
		var ids = [];
		for (var i = 0; i < _selectedNodes.length; i++) {
			ids[i] = _selectedNodes[i].id;
		}
		return ids;
	};
	
	
	that.selectNodes = function(nodes) {
		if (!nodes)
			return false;
		if (!(nodes instanceof Array))
			nodes = [nodes];
		
		for (var i = 0; i < nodes.length; i++) {
			that.select(nodes[i]);		
		}
	};
	
	that.select = function(node) {
		if (!node || TPG.hasClassName(node, "selected"))
			return;
		TPG.addClassName(node, 'selected');
		node.setAttribute("aria-selected", "true");
		_selectedNodes.push(node);			
	};
	
	that.deselectIndex = function(index) {
		TPG.removeClassName(_selectedNodes[index], 'selected');
		_selectedNodes[index].setAttribute("aria-selected", "false");
		_selectedNodes.splice(index, 1);
	};
	
	that.deselect = function(node) {
		if (!node || !TPG.hasClassName(node, "selected"))
			return;
		var index = TPG.getArrayIndex(_selectedNodes, node);	
		TPG.removeClassName(node, 'selected');
		node.setAttribute("aria-selected", "false");
		_selectedNodes.splice(index, 1);
	};

	
	/* private vars */
	
	var _focusNode;
	var _anchorNode; //node where the selection starts 
	var _selectedNodes = []; 
	/* Tree check functions */ 

	function _isTree(elem) {
		return elem && elem.getAttribute('role') == "tree";
	}
	
	function _isTreeItem(elem) {
		return elem && elem.getAttribute('role') == "treeitem";
	}
	
	function _isGroup(elem) {
		return elem && (elem.getAttribute('role') == "group" || elem.getAttribute('role') == "tree");
	}
	
	function _isCollapsed(elem) {
		return elem.getAttribute('aria-expanded') == "false";
	}
	
	function _isExpandable(elem) {
		return elem.getAttribute('aria-expanded') !== null;
	}
	
	function _isLabel(node) {
		return _isTreeItem(node) ? node : null; 
	}
	
	function _isCheckBox(node) {
		//this check will need to be modified if custom aria checkboxes are used.
		return node.nodeName.toLowerCase() == 'input' && node.getAttribute('type') == 'checkbox' ? node : null;
	}
	
	function _isTwisty(node) {
		return node.nodeName.toLowerCase() == "img" && TPG.hasClassName(node, 'twisty')
	}
	
	/* Tree behavior functions */
	
	function _create() {
		
		var i;
		that.addHandlers();
		_sourceElem.setAttribute("role", "tree");
		if (_multiSelectable)
			_sourceElem.setAttribute("aria-multiselectable", "true");
		var twisties = TPG.getElementsByClassName(_sourceElem, 'twisty', 'img');
		for (var i = 0; i < twisties.length; i++) {
			twisties[i].onclick = function() {
				return _toggleBranch(TPG.Dom.findSpecialSibling(this, _isLabel, true)); 
			}
		}
		var labels = TPG.getElementsByClassName(_sourceElem, 'treeItem');
		for (i = 0; i < labels.length; i++) {
			labels[i].setAttribute("role", "treeitem");
			if (TPG.hasClassName(labels[i], "branchLabel"))
				labels[i].setAttribute("aria-expanded", !TPG.hasClassName(labels[i], "collapsed") + "");
			TPG.Focus.makeFocusable(labels[i], i == 0);
			
			if (_multiSelectable)
				labels[i].setAttribute("aria-selected", "false");
		}
		
		var listItems = _sourceElem.getElementsByTagName("li");
		for (i = 0; i < listItems.length; i++) {
			listItems[i].setAttribute("role", "presentation");
		}
		var groups = _sourceElem.getElementsByTagName("ul");
		for (i = 0; i < groups.length; i++) {
			groups[i].setAttribute("role", "group");
		}
		
		var firstNode = _findFirstBranchChild(_sourceElem);
		_focusNode = _anchorNode = firstNode;
	}
	 
	function _handleKeyDown(event) {
		event = event || window.event;
		var t = event.target || event.srcElement;
		var c = event.keyCode || event.charCode;
		var treeItem;
		//console.info('keydown: %s on %s.%s', c, t.nodeName, t.className);
		if (!_isTreeItem(t)) {
			return false;
		}
		var letItPass = false; 
		switch (c) {
			case 37: // left
				if (!_isExpandable(t) || _isCollapsed(t)) {
					treeItem = _findParentBranch(t);
				}
				else if (!_isCollapsed(t)) {
					_collapseBranch(t);
				}
			break;
			case 38: // up
				//console.warn('going up');
				treeItem = _findPreviousTreeNode(t, false);
			break;  
			case 39: // right
				if (_isExpandable(t)) {
					if (_isCollapsed(t)) {
						_expandBranch(t);
					}
					else {
						treeItem = _findFirstBranchChild(t);
					}
				}
			break;
			case 40: // down
				treeItem = _findNextTreeItem(t, true);
			break;
			default:
				letItPass = true;
			break;
			case 32: // space
				if (_multiSelectable && event.ctrlKey && _isTreeItem(t)) {
					_toggleSelectedNode(t);
					
					//_toggleBranchCheck(TPG.Dom.findSpecialSibling(t, _isCheckBox, false),true);
				}
				
			break;
			case 33: // pgup
			break;
			case 34: // pgdn
			break;  
			case 35: // end
			break;  
			case 36: // home
			break;  
		}
		if (treeItem)
			_focusTreeItem(treeItem, event.ctrlKey, event.shiftKey);
		if (!letItPass) {
			return false;
		}
	}
	
	
	function _destroySelection() {
		////TPG.log('destroying selection');
		for (var i = 0; i < _selectedNodes.length; i++) {
			TPG.removeClassName(_selectedNodes[i], 'selected'); 
			_selectedNodes[i].setAttribute("aria-selected", "false");
		}
		_selectedNodes = [];
	}
	
	function _addNodeToSelection(node) {
		////TPG.log('added node:');
		////TPG.log(node);
		that.select(node);
	}
	
	function _toggleSelectedNode(node) {
		////TPG.log("toggling selected node:", node.textContent);
		if (TPG.hasClassName(node, 'selected')) {   
			for (var i = 0; i < _selectedNodes.length; i++) {
				if (_selectedNodes[i] == node) {	
					that.deselect(node);
					break;  
				}
			}
		}
		else {
			_addNodeToSelection(node);
		}
	}
	
	function _handleMouseDown(event) {
		event = event || window.event;
		//alert("hey" + event.button);
		if (event.button == 2)
			return;
		
		var t= event.target || event.srcElement;
		//console.info('mousedown: on %s.%s', t.nodeName, t.className);
		////TPG.log(t);
		var treeItem;
		var isCheckbox = false;
		if (TPG.hasClassName(t.parentNode, "treeItem")) {
			treeItem = t.parentNode;
		}
		else if (TPG.hasClassName(t, "treeItem")) {
			treeItem = t;
			isCheckbox = true;
		}
		else
			return; 
		////TPG.log(isCheckbox + t.className)	
		_focusTreeItem(treeItem, isCheckbox || event.ctrlKey, !isCheckbox && event.shiftKey && !event.ctrlKey);
		if ((isCheckbox || event.ctrlKey) && _multiSelectable)
			_toggleSelectedNode(treeItem);		
		return TPG.Event.cancelEvent(event);
	}
	
	function _handleBlur(event) {
		event = event || window.event;
		var t= event.target || event.srcElement;
		////TPG.log('blur: on %s.%s', t.nodeName, t.className);
		TPG.removeClassName(t, 'focused');
	}
	
	function _handleFocus(event) {
		event = event || window.event;
		var t= event.target || event.srcElement;
		TPG.addClassName(t, 'focused');
		////TPG.log('focus: on %s.%s', t.nodeName, t.className);
		return false;
	}
	
	function _findTreeItemInElement(elem, backwards) {
		var type;
		if (!elem || !elem.hasChildNodes()) {
			return null;
		}
		var treeItem = null;
		var func = backwards ? TPG.Dom.previousElement : TPG.Dom.nextElement;
	
		var child = elem[backwards ? 'lastChild' : 'firstChild'];
		////TPG.log("checking children (backwards = %s) for :", backwards);
		////TPG.log(elem);
		do {
			if (!TPG.Dom.isElementNode(child)) {
				continue;
			}
		////TPG.log('looking at child node:');
		////TPG.log(child);
			if (_isTreeItem(child)) {
				////TPG.log('It is a tree item'); 
				return child;
			}
			type = child.nodeName.toLowerCase();
			if ((type=="ul" || type=="li") && child.hasChildNodes()) {
				////TPG.log('It not a tree item but it might contain one. Look deeper');  
				treeItem = _findTreeItemInElement(child);
				if (treeItem) {
					return treeItem;
				}
			}
			else {
				////TPG.log('It\'s not a (potential) tree item. Moving to sibling');  
			}
		}
		while (child = func(child));
		////TPG.log('no treeitem found');
	}
	
	function _findPreviousTreeNode(elem, includeSelf, noDeferring) {	
		//console.info('Select previous ('+(includeSelf ? 'including self': 'not including self' ) + ' ), noDeferring = '+noDeferring+', starting node is:');
		////TPG.log(elem);
		if (!elem || _isTree(elem)) {
			////TPG.log('Tree root reached or no valid element given.  Giving up.');
			return false;   
		}
		var tmpElem = elem;
		var treeItem;
		if (!includeSelf) {
			tmpElem = TPG.Dom.previousElement(tmpElem);
		}
		if (!tmpElem) {
			if (elem.parentNode) {
				////TPG.log('No siblings left, going to parent');
				return _findPreviousTreeNode(elem.parentNode, false, true);
			}
			else {
				return false; 
			}
		}
		do {	
			////TPG.log('checking candidate:');   
			////TPG.log(tmpElem)
			if (_isTreeItem(tmpElem)) {
				treeItem = tmpElem;
				////TPG.log('Found a treeitem, stop looping');
				break;
			}
			else if (_isGroup(tmpElem)) {
				if (noDeferring) {
					////TPG.log('found group, trying to find the last last item');
					treeItem = _findTreeItemInElement(tmpElem, true);   
					noDeferring = false;
				}
				else {
					////TPG.log('found group, attempting to find expanded branch item');
					treeItem = TPG.Dom.findSpecialSibling(tmpElem, _isLabel, false);
				}
				break;
			}
			else {
				////TPG.log("it wasn't a leaf, branch, or group item, look deeper");
				treeItem = _findTreeItemInElement(tmpElem);	 
				if (treeItem) {
					return _findPreviousTreeNode(treeItem, true);
				}
			}
		}
		while (tmpElem = TPG.Dom.previousElement(tmpElem)); 
		
		if (!treeItem){ 
			////TPG.log('no suitable items found. go to previous sibling of parent node');
			return _findPreviousTreeNode(elem.parentNode, false);   
		}
		else {
			if (_isExpandable(treeItem) && !_isCollapsed(treeItem) && !noDeferring) {
				////TPG.log('found expanded branch item, moving to group...');
				return _findPreviousTreeNode(TPG.Dom.findSpecialSibling(treeItem, _isGroup, true), true, true);
			}		   
			////TPG.log('Found item to select: ') ;
			////TPG.log(treeItem);
			return treeItem;		
		}
	}
	
	function _findNextTreeItem(elem, includeSelf) {
		var treeItem;
		var tmpElem = elem;
		var skipSiblings = false;
		////TPG.log('Starting select next with %s self %s included', tmpElem.nodeName, includeSelf ? " " : " not ");
		if (includeSelf) {
			if (!_isCollapsed(tmpElem)) {
		////TPG.log('element was not collapsed: %s', tmpElem.getAttribute('role'));
				treeItem = _findTreeItemInElement(tmpElem)
			}
			else {
				skipSiblings = true;
			}
		}
		if (!skipSiblings){
			while (tmpElem = TPG.Dom.nextElement(tmpElem)) {
		////TPG.log('found sibling!');
		////TPG.log(tmpElem);
				if (_isTreeItem(tmpElem)) {
					treeItem = tmpElem;
					break;
				}
				treeItem = _findTreeItemInElement(tmpElem)
				if (treeItem) {
					break;
				}
			}
		}
		if (!treeItem) {
			tmpElem = elem.parentNode;
			if (tmpElem && tmpElem.getAttribute('role') != 'tree') {
		////TPG.log('treeitem not found, going to parent: %s (%s)', tmpElem.nodeName, tmpElem.textContent);
				return _findNextTreeItem(tmpElem, false);   
			}
		}
		else {  
			return treeItem;
		}
	}
	
	function _focusTreeItem(treeItem, noSelection, contiguousSelection ) { 
		if (treeItem && _isTreeItem(treeItem)) {
			if (TPG.Dom.isElementNode(_focusNode))
				TPG.Focus.makeFocusable(_focusNode, false);
			TPG.Focus.makeFocusable(treeItem, true);
			_focusNode = treeItem;
			
			if (_multiSelectable) {
				//TPG.log("focusNode: " + _focusNode.textContent + ", anchorNode: " + _anchorNode.textContent);
				if (contiguousSelection && !noSelection) {//shift is down, add to selection
					
					_createSelectionRange();
					
				}
				else if (!noSelection) { // normal tree nav, e.g. neither ctrl or shift is used
					//recreate selection, using current node as only item
					_destroySelection();
					_addNodeToSelection(treeItem);
					_anchorNode = treeItem;					
				}
	
			}
			

			treeItem.focus(); // focus the node, regardless of whether it was selected or not
			
			
		}
	}
	
	function _createSelectionRange() {
		if (!_focusNode || !_anchorNode)
			return;
		var treeItems = TPG.getElementsByClassName(_sourceElem, "treeItem");
		var inSelection = false;
		var treeItem;
		var selectionStarted = false;
		for (var i = 0; i < treeItems.length; i++) {
			treeItem = treeItems[i];
			if (!inSelection && (treeItem === _focusNode || treeItem === _anchorNode)) {
				if (_focusNode !== _anchorNode)
					selectionStarted = true;
				//TPG.log("SWITCH");
				inSelection = true;			
			}
			//TPG.log("checking node for selection range: " + treeItem.textContent  + ". inselection? " + inSelection);
			if (inSelection)
				that.select(treeItem);
			else
				that.deselect(treeItem);
			
			if (inSelection && !selectionStarted && (treeItem === _focusNode || treeItem === _anchorNode)) {
				//TPG.log("SWITCH");
				inSelection = false;
			}
			else if (selectionStarted)
				selectionStarted = false;
		}
			
	}
	
	function _toggleBranch(t) {
		if (_isTreeItem(t) || _isExpandable(t)) {
			if (_isCollapsed(t)) {
				_expandBranch(t);
			}
			else {
				_collapseBranch(t);
			}
		}
	}
	
	function _expandBranch(t) {
		var group = TPG.Dom.findSpecialSibling(t, _isGroup, true);
		if (!group) {
			return;
		}
		t.className = t.className.replace(/collapsed/, 'expanded' )
		t.parentNode.className = t.parentNode.className.replace(/collapsed/, 'expanded' )
		group.className = group.className.replace(/collapsed/, 'expanded' )
		t.setAttribute('aria-expanded', 'true');
		group.setAttribute('aria-hidden', 'false'); 
		var twisty = TPG.Dom.findSpecialSibling(t, _isTwisty, false);
		if (twisty) {
			twisty.src = twisty.src.replace(/collapsed/, 'expanded' )
			twisty.alt = twisty.alt.replace(/collapse/, 'expand' )
		}	   
	}
	
	function _collapseBranch(t) {
		var group = TPG.Dom.findSpecialSibling(t, _isGroup, true);
		if (!group) {
			return;
		} 
		t.className = t.className.replace(/expanded/, 'collapsed' )
		t.parentNode.className = t.parentNode.className.replace(/expanded/, 'collapsed' );
		group.className = group.className.replace(/expanded/, 'collapsed' );
		t.setAttribute('aria-expanded', 'false');
		group.setAttribute('aria-hidden', 'true');
		var twisty = TPG.Dom.findSpecialSibling(t, _isTwisty, false);
		if (twisty) {
			twisty.src = twisty.src.replace(/expanded/, 'collapsed' );
			twisty.alt = twisty.alt.replace(/expand/, 'collapse' );
		}
	}
	
	function _findFirstBranchChild(t) {
		return _findTreeItemInElement(TPG.Dom.getFirstChild(TPG.Dom.findSpecialSibling(t, _isGroup, true)));
	}
	
	function _findLastBranchChild(t) {
		return _findTreeItemInElement(getLastChild(TPG.Dom.findSpecialSibling(t, _isGroup, true)));
	}
	
	function _findParentBranch(t) { 
		_focusTreeItem(_getParent(t));
	}
	
	function _getParent(t) {
		var p = TPG.Dom.previousElement(t.parentNode.parentNode);
		return _isTreeItem(p) && _isExpandable(p) ? p : null; 
	}
	
	//checkbox handling
	
		
	//checks/unchecks all children checkboxes 
	function _toggleBranchCheck(node, simulateClick) {
		var checkBoxes = TPG.getElementsByClassName(node.parentNode, 'treeCheck', 'input');
		if (simulateClick) {
			node.checked = !node.checked;   
		}
		var checked = false;
		if (node.checked == true) {
			checkAll = true;
			node.title = node.title.replace(/(de)?select/, 'deselect');
		}
		else {
			checkAll = false;
			node.title = node.title.replace(/(de)?select/, 'select');
		}
		for (var i in checkBoxes) {
//			checkBoxes[i].checked = checkAll;
//			checkBoxes[i].title = checkAll ? checkBoxes[i].title.replace(/(de)?select/, 'deselect'): checkBoxes[i].title.replace(/(de)?select/, 'select');
		}
	}
	
	function _updateListeners () {
		var i;
		for (i = 0; i < _listeners.length; i++) {
			if (typeof _listeners[i] == "function") {
				_listeners[i](_selectedNodes, that);
			} 
		}   
	}
	
   _create();
};
/**

 * Handles the creation of trees. Maintains a list of tree objects (manager.sliders) which can be used to 

 * target all existing trees (e.g. for recalibration or removal).

 */

T.manager = {
	add : function(id, cfg) {
		var newTree = new T(id, cfg);
		if (newTree.complete) {
			T.instances.add(newTree);
		}
		return newTree;
	},
	
	createAll : function() {
		var i;
		var idCounter = 0;
		TPG.Aria.checkNameSpacedAria();
		T.instances = new TPG.Instance.list('tree');
		var treeNodes = TPG.getElementsByClassName(document, "tpgTree", "*");
		for (i=treeNodes.length - 1; i >= 0 ; i--) { // loop backwards, as root node may be removed during tree creation
			newTree = new T(treeNodes[i].id ?  treeNodes[i].id : "tpgTree_"+ ++idCounter, treeNodes[i]);
			T.instances.add(newTree, newTree.id);
		}
		T.instances._enumItems.reverse();
		T.loaded = true;
		if ( typeof tpgTreesLoaded == "function")
			tpgTreesLoaded();
	},

	destroyAll : function() {
		if (!T.instances || T.instances.length === 0) {
			return;
		}
		var i;
		for (i = 0; i < T.instances.length; i++) {
			T.instances[i].removeHandlers();
		}
		TPG.Event.removeHandler(window, 'load', T.manager.createAll);
		TPG.Event. removeHandler(window, 'unload', T.manager.destroyAll);
	}
};

TPG.Event.addHandler(window, 'load', T.manager.createAll);
TPG.Event.addHandler(window, 'unload', T.manager.destroyAll);
TPG.Control.Tree = T;   
})();