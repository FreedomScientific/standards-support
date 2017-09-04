/**
 * @fileOverview
 * @name Slider.js
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
 
 var sourcePath = "../../../tpglib/JS/Controls/Slider/";
	
/**
 * Creates a slider widget
 * @constructor
 * @param unique {string} unique value used to construct the slider's ID
 * @param input Basic element to be interacted with if JS is disabled. The slider's config parameters are taken from this element's class name.
 * @param cfg An object containing the config name-value pairs. If omitted, these must be specified in the input's classname
 * 
 * Each classname parameter must begin with 'tpg_' and name-value pairs must be separated using the '-' delimeter.
 *  
 * The following config parameters are used:
 * REQUIRED 
 *  range:						The minimum and maximum value of the S. (e.g. 'tpg_range-0-100')
 * 	stepSize {number=1}: 		Number of units to increment by in a single step. (e.g. 'tpg_stepSize-10')
 * 	chunkStepSize {number}:		Used for pgup/pgdn increments and slider tics. If omitted it will be calculated. Can be 1 if slider only has a few options.
 *  label {IDREF}:		 		ID of element that labels the slider (used for both ARIA as title text). (e.g 'tpg_label-volumeLbl') 
 * 	length {string}: 			The width or height of the slider, depending on its orientation. Can be any style.width value. (e.g. "tpg_length-20em") 
 *  thickness {string}:			How thick the slider should be. Can be any style.width value. (e.g. "tpg_thickness-1em")
 *  orientation {string="ltr"}: Can be horizontal or vertical. (e.g. 'tpg_ori-horizontal')
 *  
 * OPTIONAL
 *  callback {string=""}:		Callback function to be called when value changes. Can also be an object method. Will be passed the slider's current value and ID 
 *  scriptedCSS {bool=false}:	When true, the developer will manually have to specify sizing and positioning information. Not recommended.
 *  thumbFocus {bool=false}:	Whether the the slider's thumb will in the tab order, otherwise this will be the slider rail. (e.g. 'tpg_thumbFocus-true')
 * 	describedBy {IDREF}: 		ID of element that describes the slider in more detail. (e.g 'tpg_labelledby-sliderInstructions')
 *  defaultValue {number}: 		Value to set when the slider loads. Defaults to 0. (e.g. 'tpg_defaultValue-30') 
 *  customClass {string}:		Any classNames the developer wants to add to the S. (e.g. tpg_customClass-blueSlider)
 *  valueText {string=""}: 		Word(s) describing unit type (e.g. 'percent' or 'dollar'). (e.g. 'tpg_text-MegaBytes')
 *  dynamicLabel{bool=false}:	Whether to show value adjacent the slider thumb
 *  afterInput {bool=true}:		Whether to place the slider after the original input (or before when false).(e.g. 'tpg_afterInput-false')
 *  removeInput {bool=false}: 	Whether to hide the original input when the slider is created. Not recommended (e.g. 'tpg_removeInput-true')
 *  stickyFocus {bool=true}:	Whether focus stays at the slider when clicking on it with a mouse. (e.g. 'tpg_stickyFocus-false')
 *  showScale {bool=false} :	Whether to show scale marks adjacent to the slider (the marks are spread out according to the chunkStepSize parameter
 * 
 * Used byDoubleSlider class:
 *  minLimit {number} minimum allowed slider (NB: does not have to the same as the slider's minimum). (e.g. 'tpg_minLimit-20')
 *  maxLimit {number} maximum allowed slider (NB: does not have to the same as the slider's maximum). (e.g. 'tpg_maxLimit-80')
 * 	 
 */	
function S(unique, input, cfg) {
	var that 		= this; 
	var _current 	= 0;
	var _dragging 	= false;
	var _dragOffset	= 0;
	var _input 		= input;
	var _focusElem;
	var _sMarks		= {};
	_sMarks.values 	= [];  
	_sMarks.labels 	= [];
	var _isOrdinal 	= false;
	var _chunksTotal= 0;	
	
	that.id = unique;
	//perform some guard checks
	if ($("tpgSlider_" + that.id)) {
		//Note: Every slider must have an ID, because it may need to be refereced later (e.g. in ARIA properties)
		TPG.log('Warning, you must specify a unique ID for the slider thumb, %s is already taken', that.id);
		return;
	}
	if (!_input || !_input.nodeType || _input.nodeType != 1 || (_input.nodeName.toLowerCase() !== "select" && _input.nodeName.toLowerCase() !== "input")) {
		TPG.log('no valid input or select element found for Slider %s' , unique);
	}
	
	//set config vars
	if (!cfg) { 
		cfg = TPG.getVarsFromClass(input, "tpg_");
	}
	if (!cfg) {
		TPG.log('no valid configuration found for slider ' + that.id);
		return;
	}
	var _debug			= TPG.checkBoolVar(cfg.debug , false);
	
	var _labelledBy		= TPG.checkStringVar(cfg.labelledby, "");
	var _label			= _labelledBy && $(_labelledBy)? $(_labelledBy) : null;
	var _labelText 		= _label ? _label.innerText || _label.textContent : "";
	if (!_label || !_labelText) {
		TPG.log("Could not find a valid label for slider %s, make sure a label element exists, contains text, and has an ID value references by the labelledby parameter.", that.id);
		return;
	}
	var _inDouble 		= TPG.checkBoolVar(cfg.inDouble, false);
	var _isSecond		= TPG.checkBoolVar(cfg.isSecond , false);
	var _scriptedCSS	= TPG.checkBoolVar(cfg.scriptedCSS, true);
	var range 			= TPG.checkArrayVar(cfg.range, [false, false], 2);
	var _min 			= TPG.checkNumberVar(range[0], 0);
	var _max 			= TPG.checkNumberVar(range[1], 100, _min);
	var _minLimit 		= TPG.checkNumberVar(cfg.minLimit, _min, _min, _max) - _min;
	var _maxLimit 		= TPG.checkNumberVar(cfg.maxLimit, _max, _min, _max ) - _min;
	var _defaultValue   = TPG.checkNumberVar(cfg.deafultVaue, _isSecond ? _maxLimit : _minLimit, _minLimit, _maxLimit );
	var _default	 	= TPG.checkNumberVar(cfg.defaultValue, !_isSecond ? _min : _max , _min, _max);		
	var _stepSize 		= TPG.checkNumberVar(cfg.stepSize, 1 , 1);
	var _chunkStepSize 	= TPG.checkNumberVar(cfg.chunkStepSize, -1);
	var _valueText 		= TPG.checkStringVar(cfg.valueText, "");
	var _describedBy	= TPG.checkStringVar(cfg.describedBy, "");
	var _thumbFocus 	= TPG.checkBoolVar(cfg.thumbFocus, true);
	var _fireOn			= TPG.checkStringVar(cfg.fireOn, 'change', ['change', 'blur'])
	var _useDynLabel 	= TPG.checkBoolVar(cfg.dynamicLabel, false);
	var _ori 			= TPG.checkStringVar(cfg.orientation, 'ltr', ['horizontal', 'vertical', 'ltr', 'ttb']);
	var _afterInput 	= TPG.checkBoolVar(cfg.afterInput, true);
	var _removeInput 	= TPG.checkBoolVar(cfg.removeInput, false);
	var _stickyFocus 	= TPG.checkBoolVar(cfg.sticky, true);
	var _thickness 		= TPG.checkStringVar(cfg.thickness , "1em");
	var _lengthStyle   	= TPG.checkStringVar(cfg.railLength , "200px");
	var _rt 			= _thickness.search(/(em|\%)$/) !== -1; //whether the slider's thickness should be a fixed or relative size
	var _rl 			= _lengthStyle.search(/(em|\%)$/) !== -1; //whether or not the slider length should be specified with relative units
	var _customClass	= TPG.checkStringVar(cfg.useClass , "");
	var _showScale		= TPG.checkBoolVar(cfg.showScale, true);
	var _rail			= TPG.checkObjVar(cfg.rail, null);
	var _dynLabel;
	var _thumb;
	var _container;
	var _thumbWidth		= 0;	
	var _thumbHeight	= 0;
	var _thumbDim		= 0;
	var _thumbDimOp		= 0;
	var _thumbAdjust 	= 0;
	var _stepsTotal		= 1;
	var _isH 			= _ori == "horizontal" || _ori == "ltr";
	var _dim 			= _isH ? "Width" : "Height";
	var _axi 			= _isH ? "X" : "Y";
	var _off 			= _isH ? "Left" : "Top";
	var _callback		= TPG.checkStringVar(cfg.callback, "");
	var _listeners		= [];
	var _length;
	var _ratio;
	var _scaleElem;
	// Public methods
	
	that.calibrate = function() {
		_thumbWidth = _thumb.clientWidth;
		_thumbHeight = _thumb.clientHeight;
		_thumbDim	= this.isH ? _thumbWidth : _thumbHeight;
		_thumbDimOp	= !this.isH ? _thumbWidth : _thumbHeight;  
		_thumbAdjust = _isSecond? _thumbDim : 0;
		_railOffset = _rail['offset' + _off]; 

		var node = _rail;
		while(node.offsetParent) {
			node = node.offsetParent;
			if (node.nodeName.toLowerCase() != "html") {//TODO: IE8 beta 1 seems to screw this up, and assign the HTML node an offset (which is scroll offset?) must fix	
				_railOffset += node['offset' + _off];
			}
		}
		var thumbLengthSpace = _inDouble ? _thumbDim * 2 : _thumbDim;
		// make the actual width a thumb width shorter, so that the thumb doesn't overflow from the rail
		_length = _rail['client' + _dim] - thumbLengthSpace;  
		_ratio = _length / (_isOrdinal ? _max : _stepsTotal);
		S.setScrollOffset(_isH);
	};
	
	that.decrement = function(byChunk) {	
		that.changeValue(_current - (byChunk ? _chunkStepSize * _stepSize : _stepSize));
	};
	
	that.increment = function(byChunk) {
		//TPG.log("incrementing, current = %s", _current);
		that.changeValue(_current + (byChunk ? _chunkStepSize * _stepSize : _stepSize));
	};
	
	that.changeValue = function(newValue, noInputUpdate) {
		//TPG.log('changing value %s vs %s' , newValue, _current);
		//TPG.log("?current: %s, default: %s minlimit: %s, min: %s, maxlimit: %s, Max: %s", _current, _default, _minLimit, _min, _maxLimit, _max);
		
		var oldValue = _current;
		if (newValue !== undefined) {
			_current = Math.min(Math.max(newValue, _minLimit), _maxLimit);
			_current = Math.floor(_current / _stepSize) * _stepSize; // make the value snap to the chosen increment
		}	
		//TPG.log('changed to ' + _current);
		_adjustThumb();
		if (!noInputUpdate) {
			_updateInput();
		}
		if (newValue != oldValue) {
			_updateListeners();
		}
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
	
	that.setHandlers = function() {
		TPG.Event.addHandler(_focusElem, 'keydown', _handleKeyDown, false); 
		TPG.Event.addHandler(_thumb, 'mousedown', _handleMouseDown, false);
		TPG.Event.addHandler(_focusElem, 'focus', _handleFocus, false);
		TPG.Event.addHandler(_focusElem, 'blur', _handleBlur, false);
		TPG.Event.addHandler(_focusElem, 'click', function(event) {return TPG.Event.cancelEvent(event);}, false);
		if (!_inDouble || !_thumbFocus) {
			TPG.Event.addHandler(_rail, 'mousedown', _handleRailMouseDown, false);
		}
		if (_input) {
			TPG.Event.addHandler(_input, _fireOn, _handleInputUpdate, false);
		}
		if (_callback) {
			that.addListener(_callback);
		}
		
	};
	
	that.removeHandlers = function() {
		TPG.Event.removeHandler(_focusElem, 'keydown', _handleKeyDown, false); 
		TPG.Event.removeHandler(_thumb, 'mousedown', _handleMouseDown, false);
		TPG.Event.removeHandler(_focusElem, 'focus', _handleFocus, false);
		TPG.Event.removeHandler(_focusElem, 'blur', _handleBlur, false);
		if (!_inDouble || !_thumbFocus) {
			TPG.Event.removeHandler(_rail, 'mousedown', _handleRailMouseDown, false);
		}
		if (_input) {
			TPG.Event.removeHandler(_input, _fireOn, _handleInputUpdate, false);
		}	
	};
				
	that.mapPositionToValue = function(pos) {
		return Math.round(pos / _ratio) * _stepSize;
	};
	
	that.changeLowerLimit = function(newValue, useHumanValue) {
		if (newValue === undefined) {
			newValue = _minLimit;
		}
		_minLimit = newValue <= _max ? newValue : _maxLimit - _stepSize;
		TPG.Aria.setProperty(_focusElem, 'valuemin', _isOrdinal ? _minLimit + _min + 1 : _minLimit + _min);
	};
	
	that.changeUpperLimit = function(newValue) {
		if (newValue === undefined) {
			newValue = _maxLimit;
		} 
		_maxLimit = newValue >= 0 ? newValue : _minLimit + _stepSize;
		TPG.Aria.setProperty(_focusElem, 'valuemax', _isOrdinal ? _maxLimit + _min + 1 : _maxLimit + _min);
		
	};
	
	//getters

	that.getThumb = function () {
		return _thumb;
	};	
	
	that.getInput = function () {
		return _input;
	};
	
	that.getRail = function () {
		return _rail;
	};
	
	that.getThumbDim = function() {
		return _thumbDim;	
	};
	
	that.getThumbDimOp = function() {
		return _thumbDimOp;	
	};
	
	that.getValue = function() {
		return _current;	
	};
	
	that.getMax = function() {
		return _max;
	};
	
	that.getMin = function() {
		return _max;
	};	
	
	that.getMaxLimit = function() {
		return _maxLimit;
	};
	
	that.getMinLimit = function() {
		return _minLimit;
	};	
	
	that.getContainer = function() {
		return _container;
	};	
	
	that.reset = function() {
		_stepsTotal = Math.floor((_max - _min) / _stepSize);
		_chunkStepSize = _stepsTotal > 4 ?  Math.round(_stepsTotal / 4) : _stepSize * 2;
	};
	
	that.changeStepSize = function(newValue) {	
		if (!isNaN(TPG.checkNumberVar(newValue))) {
			_stepSize = newValue;
			that.reset();
			if (_showScale) {
				//_buildScale();
			}
		}
		
	};

	
	//private methods
	
	function _handleInputType () {
		var i;
		if (_input.nodeName.toLowerCase() == "select" ) {
			_isOrdinal = true;
			var options;
			//for now we're not considering optgroups
			options = _input.getElementsByTagName('option');
			_min = 0;
			_max = options.length - 1; 
			_minLimit = 0;
			_maxLimit = _max;
			_stepsTotal = options.length;
			_stepSize = 1;  
			_default = undefined;
			for(i=0; i< options.length; i++) {//stepsTotal
				_sMarks.values.push(options[i].getAttribute('value'));
				_sMarks.labels.push(options[i].text);
				if (options[i].getAttribute('selected') == "selected") {
					_default = i;
				}
			}	
			if (_default === undefined) {
				_default = !_isSecond ? _min : _max;
			}
		}
		else {
			if (_fireOn == 'change') {
				_fireOn = "keyup";
			}
			_stepsTotal = Math.floor((_max - _min) / _stepSize);
			_default = (_default  - _min);
		}
		TPG.addClassName(_input, 'tpgSliderInput');
		
		_current = _default; //initialize current value
		if (_chunkStepSize == -1) {
			_chunkStepSize = _stepsTotal > 4 ?  Math.round(_stepsTotal / 4) : _stepSize * 2;
		}
	}
	
	function _buildContainer () {
		//create a container that wraps both the slider and fallback elements
		var container;
		if (_rail) {	
			container = _rail.parentNode;
		}
		else {
			container = document.createElement('div');
			container.className = 'tpg' + (_isH ? 'Horizontal' : 'Vertical') + 'Slider clearfix';
			TPG.addClassName(container, _customClass);
			
		}
		return container;
	}
	
	function _buildRail () {
		var rail;
		//create the actual rail element
		rail = document.createElement('div');
		TPG.addClassName(rail, "tpgSliderRail");
		rail.style[_dim.toLowerCase()] = _lengthStyle; // set the slider length
		return rail;
	}
	
	function _buildThumb () {
		//create the actual thumb 
		// This needs a lot of work: (values (e.g. img source) should not be hardcoded but configurable. 	
		var thumb;
		//thumb = document.createElement('div');
		//thumbbackgroundColor = "black";
		thumb = document.createElement('input');
		thumb.setAttribute('type', 'image');
		thumb.alt = _labelText;
		var fileNamePart;
		if (_inDouble) {
			fileNamePart = _isSecond ? (_isH ? "left" : "up") : (_isH ? "right" : "down");
		}
		else {
			fileNamePart = _isH ? "down" : "right";
		} 
		thumb.setAttribute('src', sourcePath + 'images/thumb_' + fileNamePart + '.png'); 
		thumb.className = 'tpgSliderThumb';
		if (_scriptedCSS) {
			//size the thumb to the specified parameters
			//TODO: it should be possible to use an individual height and width for the thumb (as opposed to the thumb always being a square shape).
			//currently this IS possible, but only by measuring the image button which may not have finished loading at this time. So for now just use square thumbs 
			thumb.style[_dim.toLowerCase()] = _thickness;
			thumb.style[S.opUnit(_dim).toLowerCase()] = _thickness;
		} 
		thumb.style[S.opUnit(_off).toLowerCase()] = "0px"; //_rail.style[_off.toLowerCase()]; // align the thumb with the rail 
		return thumb;
	}
	
	function _buildInnerRail () {
		var innerRail = document.createElement('div');
		innerRail.className = "tpgSliderInnerRail";
		if (_scriptedCSS) {
			var innerRailThickness = (_thumbDimOp / 10);
			var innerRailThicknessOffset = (_thumbDimOp / 2) - (innerRailThickness / 2);
			var innerRailLength = _rail['client' + _dim] - _thumbDim;
			var innerRailLengthOffset = _thumbDim / 2;
			innerRailThickness = S.makeThickness(innerRailThickness, _rt);
			innerRailThicknessOffset = S.makeThickness(innerRailThicknessOffset, _rt);
			innerRailLength = S.makeLength(innerRailLength, _rl);
			innerRailLengthOffset = S.makeLength(innerRailLengthOffset, _rl);
			innerRail.style[_dim.toLowerCase()] = innerRailLength;
			innerRail.style[S.opUnit(_dim).toLowerCase()] = innerRailThickness; 
			innerRail.style[_off.toLowerCase()] = innerRailLengthOffset;
			innerRail.style[S.opUnit(_off).toLowerCase()] = innerRailThicknessOffset;
		}
		return innerRail;
	}
	
	function _buildScale () {			
		if (_scaleElem ) {
			_scaleElem.parentNode.removeChild(_scaleElem);
			return;
		}
		var i;
		var scaleElem = document.createElement('div');
		scaleElem.className = "tpgSliderScale" + (_isH ? 'H' : 'V');
		TPG.addClassName(_container, "tpgHas"+ (_isH ? "H" : "V") +"Scale");
		var adjustForDouble = _inDouble ? _thumbDim * 2 : _thumbDim;
		_chunksTotal = (_stepsTotal + _chunkStepSize -1) / _chunkStepSize; 
		var remainder = _chunksTotal - Math.floor(_chunksTotal);
		_chunksTotal = Math.floor(_chunksTotal);
		var innerRailLen = _rail['client' + _dim] - adjustForDouble; 
		if (_isOrdinal) {
			remainder = (remainder * _chunkStepSize) / (_stepsTotal - 1);
			innerRailLen -= remainder * innerRailLen;
		}
		var sMarkElem = document.createElement('span');
		var sMarkLen = _chunksTotal <= 1 ? innerRailLen : innerRailLen / (_chunksTotal - (_isOrdinal ? 1 : 0));
		var sMarkLenTmp, sMarkLenTmpStyle;
		var sValueList = _rail.appendChild(document.createElement('dl'));
		var listDesc = document.createElement('dt');
		listDesc.appendChild(document.createTextNode('Value scale for slider \'' + _labelText + '\''));
		TPG.addClassName(listDesc, 'tpgHidden');
		sValueList.appendChild(listDesc);
		
		var sValueListItem = document.createElement('dd');
		sValueListItem.style[_isH ? 'top' : 'left'] = S.makeThickness(_thumbDim + (_isH ? 0 : 10), _rt);
		TPG.addClassName(sValueList, "tpgScaleValues");
		sValueListItem.appendChild(document.createElement('span')); 
		var tmpNode;
		if (!_isOrdinal) { 
		    _chunksTotal++;	
		}
		var chunkValue = "";
		var offsetForDouble = _inDouble ?_thumbDim : _thumbDim / 2;
		for (i = 0; i < _chunksTotal; i ++) {
			//create scale tic mark
			tmpNode = sMarkElem.cloneNode(false);
			scaleElem.appendChild(tmpNode);
			sMarkLenTmp = (sMarkLen * i) + offsetForDouble; 
			sMarkLenTmpStyle = S.makeLength(sMarkLenTmp, _rl); 
			tmpNode.style[_off.toLowerCase()] = sMarkLenTmpStyle; 
			
			//create list item
			tmpNode = sValueListItem.cloneNode(true);
			chunkValue = _isOrdinal ? _sMarks.labels[Math.min(i * _chunkStepSize, _stepsTotal)]  : Math.min((i * _chunkStepSize * _stepSize) + _min, _max);
			TPG.Dom.innerText(tmpNode.firstChild, chunkValue);
			sValueList.appendChild(tmpNode);
			sMarkLenTmp -= (tmpNode['client' + _dim] / 2);
			sMarkLenTmpStyle = S.makeLength(sMarkLenTmp, _rl); 
			tmpNode.style[_off.toLowerCase()] = sMarkLenTmpStyle;
		}
		return scaleElem;
	}
	
	function _buildDynamicLabel () {
		var dynElem = document.createElement('div');
		dynElem.className = 'tpgDynLabel';
		dynElem.appendChild(document.createElement('span'));
		if (_scriptedCSS) { 
			if(!_isSecond) {
				TPG.addClassName(_container, "tpgHas" + _axi + "Label" ); //allows changes to be made for sliders with a dynamic label  
			}
			if (_rt) {
				//dynElem.firstChild.style.fontSize = S.makeThickness(_thumbDim, _rt);
			}	
		}
		if (!_isH) {
			//TODO: find better solution for that. We need to position the dynamic label above or to the right of the thumb (depending on the slider orienation)
			var tmpStyle = _isH ? "top" : "right";
			dynElem.style[tmpStyle] = S.makeThickness(_thumbWidth + 5, _rt);
		}
		dynElem.firstChild.appendChild(document.createTextNode(" ")); // the node we will use to change the label text in
		return dynElem;
	}
	
	/**
	 * Handles the creation of all elements that  up the slider
	 */
	function _buildDom () {
		_handleInputType();
		_container = _buildContainer();
		if (!_rail) {
			_rail = _buildRail();
			_input.parentNode.insertBefore(_container, _input);
		}
		_input = _container.appendChild(_input);
		if (_label) {
			if (_removeInput) {
				_label.setAttribute ('for', "tpgSlider_" + that.id);
			}
			_container.insertBefore(_label, !_afterInput ? _input.nextSibling : _input);
		}
		_container.insertBefore(_rail, _afterInput ? _input.nextSibling : _input);
		if (_removeInput) {
			//TPG.addClassName(_input, "tpgHidden");
			_input.parentNode.removeChild(_input);
			_input = null;
		}
		_thumb = _buildThumb();
		_rail.appendChild(_thumb);
		//determine which part of the slider is part of the tab order: thumb or rail
		_focusElem = _thumbFocus ? _thumb : _rail;  
		TPG.Focus.makeFocusable(_focusElem, true);
		//Note if the rail is the tab element, we still have to adjust the thumb's tabindex to take it OUT of the tab order (if it's natively tabbable)		
		if (!_thumbFocus) {
			TPG.Focus.makeFocusable(_thumb, false);
		}
		_focusElem.id = "tpgSlider_" + that.id;
		that.calibrate(); // from this point on we'll need specific values, which are set by the calibrate() method. So don't move this call
		// Get the slider thickness, either in pixels or ems. We need this to position elements in the middle of the slider (e.g. the rail)
		//TODO: add extra code which allows the slider rail to be thicker than the thumb (e.g. have more padding). Currently they always have the same thickness
	 	var railThickness = S.makeThickness(_thumbDim, _rt);
	 	if (_scriptedCSS) {
	 		if (!_isSecond) {
				_rail.style[S.opUnit(_dim).toLowerCase()] = railThickness; 
			}
			if (_input && !_isOrdinal && _isH && _rt) {
				//For horizontal sliders, align the input's height with the slider rail (purely to make it look nice, so this can be removed if needed)
				// instead of setting the height we set the fontsize, and then set the height to 1em. Otherwise the input won't scale aligned with the S.
				_input.style[S.opUnit(_dim).toLowerCase()] = "1em"; 
				_input.style.fontSize = railThickness ;
			}
	 	}
		if (!_isSecond) { //create slider inner rail (this is purely decorative, but we need this code for automated sizing and positioning)
			var innerRail = _buildInnerRail();
			_rail.appendChild(innerRail);
			//create the slider scale marks and values
			if (_showScale) {
				_scaleElem = _buildScale();
				_rail.appendChild(_scaleElem);
			}		
		}
		if (_useDynLabel) {
			_dynLabel = _rail.appendChild(_buildDynamicLabel());
		}
		//set Aria
		TPG.Aria.setRole(_focusElem, 'slider');
		if (!_thumbFocus) {
			TPG.Aria.setRole(_thumb, 'presentation');
		}
		if (_label) {
			TPG.Aria.setProperty(_focusElem, 'labelledby', _labelledBy);
		}
		if (_describedBy) {
			TPG.Aria.setProperty(_focusElem, 'describedby', _describedBy);
		}
		
		//get the slider started by setting the default values
		that.changeLowerLimit();
		that.changeUpperLimit();
		that.changeValue(_defaultValue);
		
		that.setHandlers();
		that.complete = true;	
	}
	
	//event handlers
	function _handleInputUpdate(event) {
		var newValue; 
		event = TPG.Event.getEvent(event);
		if (event.myTarget) {
			newValue = event.myTarget[_isOrdinal ? 'selectedIndex' : 'value'];
			newValue = (newValue) - _min;
			if (newValue !== _current) {
				that.changeValue(newValue, true);
			}	
		}		
	}
	
	function _handleKeyDown (event) {
		//_maybeCalibrate();
		that.calibrate();
		event = TPG.Event.getEvent(event);
		var letItPass = false;
		
		switch (event.myKeyCode) {
			case TPG.Key.K_ARROWLEFT:
			case _isH ? TPG.Key.K_ARROWDOWN : TPG.Key.K_ARROWUP:
				that.decrement(false);
			break;
			case TPG.Key.K_ARROWRIGHT:
			case _isH ? TPG.Key.K_ARROWUP : TPG.Key.K_ARROWDOWN:
				that.increment(false);
			break;
			case TPG.Key.K_PAGEUP:
				that.increment(true);
			break;
			case TPG.Key.K_PAGEDOWN:
				that.decrement(true);
			break;
			case TPG.Key.K_HOME:
				that.changeValue(_minLimit);
			break;		
			case TPG.Key.K_END:
				that.changeValue(_maxLimit);
			break;		
			case TPG.Key.K_ESCAPE:
				_focusElem.blur();
			break;
			default:
				letItPass = true;
				
			break;
		}	
		if (!letItPass) {
			return TPG.Event.cancelEvent(event);	
		}
	}
	function _handleMouseDown (event) {
		that.calibrate();
		event = TPG.Event.getEvent(event);
		_dragging = true;
		_dragOffset = event['client' + _axi] - _railOffset - event.myTarget['offset' + _off] + S.scrollOffset + _thumbAdjust;
		TPG.Event.addHandler(document, 'mousemove', _handleDrag, false);
		TPG.Event.addHandler(document, 'mouseup', _stopDrag, false);
		TPG.Event.addHandler(window, 'mouseout', _handleDocMouseOut, false);
		if (_stickyFocus) {
			TPG.Focus.setFocusTo(_thumbFocus ? _thumb : _rail);
		}
		return TPG.Event.cancelEvent(event); // prevents event from reaching rail. Also prevents Safari from dragging the image out of the image button
	}
	
	function _handleDrag (event) {
		if (!_dragging) {
			return;
		}
		else {
			event = TPG.Event.getEvent(event);
			var newPos = event['client' + _axi] - _railOffset + S.scrollOffset - _dragOffset;
			that.changeValue(that.mapPositionToValue(newPos));
		}
	}
	
	function _handleDocMouseOut(event) {
		event = TPG.Event.getEvent(event);
		if (event.myTarget.nodeName == 'HTML') {
			_stopDrag (event);
		}
	}
	
	function _stopDrag (event) {
		_dragging = false;
		_dragOffset = 0;
		
		TPG.Event.removeHandler(document, 'mousemove', _handleDrag, false);
		TPG.Event.removeHandler(document, 'mouseup', _stopDrag, false);
		TPG.Event.removeHandler(window, 'mouseout', _handleDocMouseOut, false);
	}
	
	function _handleRailMouseDown (event) {
		that.calibrate();
		event = TPG.Event.getEvent(event);
		if (!_thumbFocus && !_stickyFocus){
			TPG.Focus.setFocusTo(_rail);
		}
		var newPos = event['client' + _axi] - _railOffset + S.scrollOffset - (_thumbDim / 2);
		that.changeValue(that.mapPositionToValue(newPos));
	}
		
	function _handleFocus (event) {
		event = TPG.Event.getEvent(event);
		TPG.addClassName(event.myTarget, "focused");
	}
	
	function _handleBlur (event) {
		event = TPG.Event.getEvent(event);
		TPG.removeClassName(event.myTarget, "focused");
	}
	
	//value changing
	
	function _adjustThumb () {
		var newPos = (Math.round((_current / _stepSize) * _ratio) + _thumbAdjust) ;
		var _currentReal = _current + _min;
		_thumb.style[_off.toLowerCase()] = S.makeLength(newPos, _rl);
		if (_dynLabel) {
			_dynLabel.firstChild.firstChild.nodeValue = _isOrdinal ? _sMarks.labels[_current] : _currentReal + " " + _valueText;
			var dynOffset = !_isSecond && _isH ? _dynLabel.clientWidth - _thumbDim: 0;
			dynOffset = (_thumb['offset' + _off] - dynOffset);
			_dynLabel.style[_off.toLowerCase()] = S.makeLength(dynOffset, _rl);
		}
		TPG.Aria.setProperty(_focusElem, 'valuenow', _isOrdinal ? _current + 1 : _currentReal);
		if (_isOrdinal) {
			;//_thumb.title = _labelText + ":  " + _sMarks.labels[_current] + " (" + (_current + 1) + " of " + (_max + 1) + ")";	
		}
		else {
			;//_thumb.title = _labelText + " (" + _currentReal + " of " + _max + " " + _valueText + ")";
		}
	
		if (_valueText || _isOrdinal) {
			TPG.Aria.setProperty(_focusElem, 'valuenow', _isOrdinal ? (_current + 1 ) : _currentReal);
			TPG.Aria.setProperty(_focusElem, 'valuetext', _isOrdinal ? _sMarks.labels[_current] : _currentReal  + " " + _valueText);
		}
	}
	
	function _updateInput() {
		if (_input) {
			_input[_isOrdinal ? 'selectedIndex' : 'value']= _min + _current;
		}	
	}
	
	function _updateListeners () {
		var i;
		for (i = 0; i < _listeners.length; i++) {
			if (typeof _listeners[i] == "function") {
				_listeners[i](_current, "tpgSlider_" + that.id);
			} 
		}	
	}
	
	_buildDom();
	that.type = 'slider';	
}
//Static Methods

S.opUnit = function(unit) {
	switch(unit) {
		case 'Left':
			return 'Top';
		case 'Top':
			return 'Left';
		case 'X':
			return 'Y';
		case 'Y':
			return 'X';
		case 'Height':
			return 'Width';
		case 'Width':
			return 'Height';
		default:
			return undefined;
	}
};

S.makeLength = function (pxValue, relative) {
		return relative ? TPG.Scaling.px2em(pxValue) + "em" : pxValue + "px";
};

S.makeThickness = function (pxValue, relative) {
	return relative ? TPG.Scaling.px2em(pxValue) + "em" : pxValue + "px";
};

S.scrollOffset = 0;

S.setScrollOffset = function(H) {
	var scrollOffset;
	var axi = H ? 'X' : 'Y';
	var off = H ? 'Left' : 'Top';
	if (window['page' + axi + 'Offset'] !== undefined) {
		scrollOffset = window['page' + axi + 'Offset'];
	}
	else if (document.documentElement && document.documentElement['scroll' + off] !== undefined) {
		scrollOffset = document.documentElement['scroll' + off];
	} 
	else if (document.body['scroll' + off] !== undefined) {
		scrollOffset = document.body['scroll' + off];
	}
	S.scrollOffset = scrollOffset;
};



/**
 * Creates a double S. A double slider consists of two thumbs which function as individual sliders. but they share the same rail, and influence each 
 * other's parameters
 * 
 * @constructor
 * @param fallbackElem The node containing the cfg parameters in its classname. These need to at least include minElem and maxElem ID references. 
 */
function DoubleSlider(unique, fallbackElem) {	
	var that 			= this;
	that.id 			= fallbackElem.id ? fallbackElem.id : unique;
	var _ids			= [];
	var _cfg 			= TPG.getVarsFromClass(fallbackElem, "tpg_");
	var _debug			= TPG.checkBoolVar(_cfg.debug , false);
	var _thickness 		= TPG.checkStringVar(_cfg.thickness , "1em");
	var _lengthStyle	= TPG.checkStringVar(_cfg.railLength , "200px");
	//_bindThumbs whether the individual thumbs are bounded by each other. When true, they cannot pass eachother, when false, they can.
	var _bindThumbs 	= TPG.checkBoolVar(_cfg.bindThumbs, true);
	var _dynamicLabel	= !_bindThumbs ? false : TPG.checkBoolVar(_cfg.dynamicLabel, false);
	var _rt 			= _thickness.search(/(em|\%)$/) !== -1; 
	var _rl 			= _lengthStyle.search(/(em|\%)$/) !== -1; 
	var _rail;
	var _rangeElem;
	var _minThumb, _maxThumb;
	
	//cfg vars, There's some duplicate code here from the single slider constructor, but both the Slider objects and the DoubleSLider Object need to know these.
	var _range 		= TPG.checkArrayVar(_cfg.range, [false, false], 2);
	var _min 		= TPG.checkNumberVar(_range[0], 0);
	var _max 		= TPG.checkNumberVar(_range[1], 100, _min);
	var _ori 		= TPG.checkStringVar(_cfg.orientation, 'ltr', ['horizontal', 'vertical', 'ltr', 'ttb']);
	var _isH 		= _ori == "horizontal" || _ori == "ltr";
	var _dim 		= _isH ? "Width" : "Height";
	var _axi 		= _isH ? "X" : "Y";
	var _off 		= _isH ? "Left" : "Top";
	var _stepSize 	= TPG.checkNumberVar(_cfg.stepSize, 1 , 1);
	
	//Find elements to convert to sliders
	var _fallbacks 	= fallbackElem.getElementsByTagName('input');
	if (_fallbacks.length != 2) {
		_fallbacks = fallbackElem.getElementsByTagName('select');
	}
	if (_fallbacks.length != 2 || _fallbacks[0].id === undefined || _fallbacks[1].id === undefined) {
		TPG.log('Could not create double slider, need two input or select elements with valid IDs');
		return false;
	}
	_ids = [_fallbacks[0].id,_fallbacks[1].id];
	
	//private methods 
	
	function _handleMinChange (newValue) {
		if (_bindThumbs) {
			_maxThumb.changeLowerLimit(newValue + 1);
		}
		_update();
	}
	
	function _handleMaxChange (newValue) {
		if (_bindThumbs) {
			_minThumb.changeUpperLimit(newValue - 1);
		}
		_update();			
	}
	
	function _create () {
		 TPG.addStylesheet(sourcePath + "css/Slider.css");
		//create the first thumb
		_minThumb = S.manager.add( "tpgDoubleSlider_" + that.id + "_start", $(_ids[0]), _updateThumbCfg($(_ids[0]), true));
		if (!_minThumb.complete) {
			TPG.log("could not create first thumb for double slider %s, aborting", that.id);
			return;
		}
		_minThumb.addListener(_handleMinChange);
		_rail = _minThumb.getRail();
		if (!_rail) {
			TPG.log('Something went wrong, there is no slider rail for slider ' + that.id);
			return;
		}
		//create the second thumb
		_maxThumb = S.manager.add("tpgDoubleSlider_" + that.id + "_end", $(_ids[1]), _updateThumbCfg($(_ids[1]), false));
		if (!_maxThumb.complete) {
			TPG.log("could not create second thumb for double slider %s, aborting", that.id);
			return;
		}
		_maxThumb.addListener(_handleMaxChange);
		
		if (_dynamicLabel) {
			_rangeElem = document.createElement('div');		
			_rangeElem.className = "tpgRangeIndicator";
			var rangeThickness = _minThumb.getThumbDim() / 10 * 3;
			var rangeOffset = (_minThumb.getThumbDim() / 2) - (rangeThickness / 2);
			rangeThickness = S.makeThickness(rangeThickness, _rt);
			rangeOffset = S.makeThickness(rangeOffset, _rt);
			_rangeElem.style[S.opUnit(_dim).toLowerCase()] = rangeThickness;  
			_rangeElem.style[S.opUnit(_off).toLowerCase()] = rangeOffset;		
			_rail.appendChild(_rangeElem);
		}
		TPG.Aria.setProperty(_minThumb.getThumb(), 'controls',  _maxThumb.getThumb().id);
		TPG.Aria.setProperty(_maxThumb.getThumb(), 'controls',  _minThumb.getThumb().id);
		//this will trigger setting the min / max limits
		_minThumb.changeValue();
		_maxThumb.changeValue();
		TPG.Event.addHandler(_rail, 'mousedown', _handleRailMouseDown, false);
		_update();
	}
	
	that.removeHandlers = function() {
		TPG.Event.removeHandler(_rail, 'mousedown', _handleRailMouseDown, false);
	};
	
	that.getMinThumb = function() {
		return _minThumb;
	}
	
	that.getMaxThumb = function() {
		return _maxThumb;
	};
	
	that.changeStepSize = function(newValue) {
		_minThumb.changeStepSize(newValue);
		_maxThumb.changeStepSize(newValue);
	};
		
	function _updateThumbCfg (input, isFirst) {
		var thumbCfg = TPG.getVarsFromClass(input, "tpg_"); // first get any parameters specified for the individual thumb
		thumbCfg = TPG.overrideObject(thumbCfg, TPG.cloneObject(_cfg)); // now we add or replace properties set on the doubleslider element
		thumbCfg.afterInput = isFirst ? true : false;
		thumbCfg.isSecond = !isFirst ? true : false;
		thumbCfg.rail = !isFirst ? _rail : null;
		thumbCfg.inDouble = true;
		if (!isFirst && thumbCfg.defaultValue === undefined) {
			thumbCfg.defaultValue = _max;
		}
		thumbCfg.thumbFocus = true;
		return thumbCfg;
	}

	function _update () {
		if (_dynamicLabel && _rangeElem) {	
			var rangeOffset; 
			var rangeLength; 
			rangeOffset = _minThumb.getThumb()['offset' + _off];
			rangeLength = _maxThumb.getThumb()['offset' + _off] - _minThumb.getThumb()['offset' + _off] + _maxThumb.getThumbDim();
			rangeLength = S.makeLength(rangeLength, _rl);
			rangeOffset = S.makeLength(rangeOffset, _rl);
			_rangeElem.style[_off.toLowerCase()] = rangeOffset; 
			_rangeElem.style[_dim.toLowerCase()]= rangeLength;
		}
	}
	
	function _handleRailMouseDown (event) {
		event = TPG.Event.getEvent(event);
		_minThumb.calibrate();
		_maxThumb.calibrate();
		var newPos = event['client' + _axi] - _rail['offset' + _off] + S.scrollOffset - (_minThumb.getThumbDim() / 2);
		var newValue= _minThumb.mapPositionToValue(newPos); 
		if (newValue < _minThumb.getValue()) {
			_minThumb.changeValue(newValue);
		}
		else if (newValue > _maxThumb.getValue()) {
			//TODO: This needs to be simplified. The problem is that the second slider uses the first slider's rail, but is shifted to the right one thumb length 
			//so that it doesn't get in the first thumb's way. Normally this works fine , except now when the mouse is used to move the second thumb (without dragging).
			//For now, we just subtract the added thumblength and recalculate the matching value.  
			newPos -= _maxThumb.getThumbDim();
			newValue = _minThumb.mapPositionToValue(newPos);
			_maxThumb.changeValue(newValue );
		}
		else {
			_minThumb.increment(event.ctrlKey);
			_maxThumb.decrement(event.ctrlKey);	
		}
	}
	
	
	
	_create();
}



/**
 * Handles the creation of sliders. Maintains a list of slider objects (manager.sliders) which can be used to 
 * target all existing sliders (e.g. for recalibration or removal).
 */
S.manager = {
	add : function(id, input, cfg) {
		var newSlider = new S(id, input, cfg);
		if (newSlider.complete) {
			S.instances.add(newSlider);
		}
		return newSlider;
	},
	
	createAll : function() {
		var i;
		var idCounter = 0;
		TPG.Aria.checkNameSpacedAria();
		TPG.Scaling.create1EmDiv();
		S.instances = new TPG.Instance.list('slider');
		var sliderNodes = TPG.getElementsByClassName(document, "tpgSlider", "*");
		for (i=sliderNodes.length - 1; i >= 0 ; i--) { // loop backwards, as input node may be removed during slider creation
			newSlider = new S( sliderNodes[i].id ?  sliderNodes[i].id : idCounter++, sliderNodes[i]);
			S.instances.add(newSlider, newSlider.id);
		}
		S.instances._enumItems.reverse();
		var doubleSliderNodes = TPG.getElementsByClassName(document, "tpgDoubleSlider", "*");
		DoubleSlider.instances = new TPG.Instance.list('Double Slider');
		for (i=0; i < doubleSliderNodes.length; i++) {
			DoubleSlider.instances.add(
				new DoubleSlider(idCounter++, doubleSliderNodes[i])
			);
		}	
	},
	
	destroyAll : function() {
		if (!S.instances || S.instances.length === 0) {
			return;
		}
		var i;
		for (i = 0; i < S.instances.length; i++) {
			S.instances[i].removeHandlers();
		}
		if (!DoubleSlider.instances || DoubleSlider.instances.length === 0) {
			return;
		}
		for (i = 0; i < DoubleSlider.instances.length; i++) {
			DoubleSlider.instances[i].removeHandlers();
		}
		TPG.Event.removeHandler(window, 'load', S.manager.createAll);
		TPG.Event. removeHandler(window, 'unload', S.manager.destroyAll);
	}
};
TPG.Event.addHandler(window, 'load', S.manager.createAll);
TPG.Event.addHandler(window, 'unload', S.manager.destroyAll);
TPG.Control.Slider = S;
TPG.Control.DoubleSlider = DoubleSlider;	
})();