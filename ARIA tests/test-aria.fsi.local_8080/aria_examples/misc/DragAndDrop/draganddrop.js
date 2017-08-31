function keyCodes () {
  // Define values for keycodes
  this.tab        = 9;
  this.enter      = 13;
  this.esc        = 27;
  this.space      = 32;

  this.left       = 37;
  this.up         = 38;
  this.right      = 39;
  this.down       = 40;
} 
/////////////////////////////////// Begin droppable widget definition ///////////////////////////////////////
//

//
// Function droppable() is the constructor for an ARIA drop-target widget. The widget is responsible
// for processing drop events over a target. It listens for and processes custom events from draggable
// widgets on the page. Events listened for are: grab, drag, and drop.
//
// A droppable widget will trigger targetEnter and targetLeave events when a draggable is moved within
// the tolerance zone of the droppable and then moved out of it again.
//
// @param (id string) id is the html id of the element to make into a drop target
//
// @param (maxItems integer) maxItems is the maximum number of items the drop target should accept
//
// @param (dropType string) dropType is the dropeffect type of the droppable (e.g. move, copy, none)
//
// @param (available boolean) available is the initial availability for the target. False if not accepting
// draggables.
//
// @return N/A
//
function droppable(id, maxItems, dropType, available) {

	// define widget properties
	this.$id = $('#' + id);
	
	this.position = {
		x: this.$id.offset().left,
		y: this.$id.offset().top
	};

	this.size = {
		width: this.$id.width(),
		height: this.$id.height()
	};

	this.keys = new keyCodes();


	this.dropType = dropType;


	this.maxItems = maxItems; // the maximum number of draggables widget can hold
	this.$items = null; // an array of jQuery objects for the draggables contained by the target
   this.full = false; // set to true if the droppable has the maximum number of allowed objects

	this.activeDraggable = null; // activeDraggable is the currently grabbed draggable

	this.over = false; // true if a draggable is over the droppable. Set by targetEnter and targetLeave.

   // set the initial dropeffect state
	if (available == false) {
      this.setAvailable(false); // do not accept draggables
	}
	else {
      this.setAvailable(true); // accept draggables
	}
	// bind event handlers
	this.bindHandlers();

} // end droppable() constructor

//
// Function reset() is a member function to reset the state of the droppable
//
// @return N/A
//
droppable.prototype.reset = function(available) {
   
   // reset the item list
   this.$items = null;

   // reset the full flag
   this.full = false;

} // end reset()

//
// Function setAvailable() is a member function to set the availability state of the droppable.
//
// @param (available boolean) available is true if droppable should accept draggables; false if not
//
// @return N/A
//
droppable.prototype.setAvailable = function(available) {

	if (available == true && this.full == false) {
		// restore the dropeffect type
		this.$id.attr('aria-dropeffect', this.dropType);

		// add the available styling
		this.$id.addClass('target-available');
	}
	else {
		// set the dropeffect type to 'none' (i.e. do not accept draggables)
		this.$id.attr('aria-dropeffect', 'none');

		// remove the available styling
	   this.$id.removeClass('target-available');
	}

   // store the new available state
	this.available = available;
}

//
// Function makeCopy() is a member function to create a copy of the dragged object. This
// function will return the original dragged object to its starting position if the
// boolean parameter is true.
//
// @return N/A
//
droppable.prototype.makeCopy = function() {

	var $copy = this.activeDraggable.$id.clone(); // copy the draggable

	// remove the grabbed class
	$copy.removeClass('grabbed');

	// undefine aria-grabbed property
	$copy.removeAttr('aria-grabbed');

	// insert the copy into the DOM.
	this.$id.append($copy);

	// make the positioning relative and undefine the positioning
	$copy.css('position', 'relative');
	$copy.css({'left': '', 'top': ''});

	// modify the target's label (if it is defined) to indicate
	// target is occupied
	$('#' + this.$id.attr('aria-labelledby')).text('blerf');

	if (this.$items) {
		this.$items.add(this.activeDraggable.$id);
	}
	else {
		this.$items = this.activeDraggable.$id;
	}

	if (this.$items.length == this.maxItems) {
		// target is full
		this.full = true;

		// modify the aria-dropeffect to be 'none'
	   this.setAvailable(false);
	}

} // end makeCopy()

//
// Function bindHandlers() is a member function to bind event handlers for a droppable.
//
// @return N/A
//
droppable.prototype.bindHandlers = function() {

	var thisObj = this;

	// bind handler for a grab event
	this.$id.bind('grab', function(e, draggable) {
		return thisObj.handleGrab(e, draggable);
	});

	// bind handler for a drag event
	this.$id.bind('drag', function(e, draggable) {
		return thisObj.handleDrag(e, draggable);
	});

	// bind handler for a drop event
	this.$id.bind('drop', function(e, draggable) {
		return thisObj.handleDrop(e, draggable);
	});

} // end bindHandlers()

//
// Function handleGrab() is a member function to process grab events triggered by a draggable
//
// @param (e object) e is the event object;
//
// @param (draggable object) draggable is the draggable widget that triggered the event
//
// @return (boolean) Returns true;
//
droppable.prototype.handleGrab = function(e, draggable) {

	this.activeDraggable = draggable;

	if (this.full == false) {
      this.setAvailable(true);
	}

	return true;

} // end handleGrab()

//
// Function handleDrag() is a member function to process drag events triggered by a draggable
//
// @param (e object) e is the event object;
//
// @param (draggable object) draggable is the draggable widget that triggered the event
//
// @return (boolean) Returns true;
//
droppable.prototype.handleDrag = function(e, draggable) {

	var thisObj = this;

	if (this.available == false) {
		// do nothing
		return true;
	}

	var draggablePos = {
		x: draggable.curPos.x + draggable.center.x,
		y: draggable.curPos.y + draggable.center.y
	};

	if ((draggablePos.x > this.position.x) && (draggablePos.x < this.position.x + this.size.width)
		&& (draggablePos.y > this.position.y) && (draggablePos.y < this.position.y + this.size.height)) {

		if (this.over == false) {

			this.over = true;

			// draggable is withing target bounds: trigger targetEnter event.
			//
			// Note: timeout is used to handle a race condition when dragging via keyboard where
			// targetLeave would sometimes be triggered after targetEnter.
			//
			window.setTimeout(function() {
				$.event.trigger('targetEnter', thisObj);
			}, 10);

			// add hover styling
			this.$id.addClass('target-hover', this);
		}
	}
	else {
		if (this.over == true) {

			this.over = false;

			// draggable was within target bounds but has left:
			// trigger targetLeave event
			$.event.trigger('targetLeave', this);

			// remove hover styling
			this.$id.removeClass('target-hover', this);

		}
	}

	return true;

} // end handleDrag()

//
// Function handleDrop() is a member function to process drop events triggered by a draggable
//
// @param (e object) e is the event object;
//
// @param (draggable object) draggable is the draggable widget that triggered the event
//
// @return (boolean) Returns true;
//
droppable.prototype.handleDrop = function(e, draggable, blerf) {

	if (this.over == true && draggable.validDrop == true) {
		switch (this.dropType) {
			case 'copy': {
				this.makeCopy();
				break;
			}
			case 'move': {
				break;
			}
		}
	}

   this.setAvailable(false);

	// remove hover and available styling
	this.$id.removeClass('target-hover');

	this.activeDraggable = null;
	this.over = false;

	return true;

} // end handleDrop()

//
/////////////////////////////////// End droppable widget definition ///////////////////////////////////////

/////////////////////////////////// Begin draggable widget definition ///////////////////////////////////////

// Function draggable() is the constructor for an ARIA drag-and-drop widget.
//
// The draggable class listens for and processes custom events from droppable widgets (representing drop
// targets). Events listened for are: targetEnter and targetLeave.  If drop targets are registered with (i.e.
// passed to) the draggable, a valid drop may not be performed until a targetEnter event is received.
//
// If grabbing is done via the keyboard, it must be dragged and dropped with the keyboard.  Keyboard dragging
// will jump to the first registered drop target with tabindex=0 -- giving it focus.
//
// draggable() requires:
//
// 	- The html ID of a draggable object
//
// 	- A jQuery collection of objects pointing to drop targets
// 	  (pass null if not defining drop targets)
//
// 	- Values specifying the X and Y drag tolerance (i.e. amount mouse must move
// 	  before drag event begins. Pass 0 for no tolerance.
//
// 	- A boolean specifying if a drag helper should be shown.
//
// @param (id string) id is the HTML id of the object to make draggable
//
// @param ($targets object) $targets is a jQuery collection pointing to elements to use
//	as drop targets. This parameter may be null.
//
// @param (useActive boolean) true if target is determined by aria-activedescendent; false
// 	if determined by taborder.
// @param (dragTol_x integer) dragTol_x is the horizontal pixel distance mouse must move
// 	to trigger a drag event.
//
// @param (dragTol_y integer) dragTol_y is the vertical pixel distance mouse must move
// 	to trigger a drag event.
//
// @param (useHelper boolean) useHelper is true if a helper object should be used.
//
// @param (enabled boolean) enabled is true if the draggable should be enabled initially
//
// @return N/A
//
function draggable(id, $targets, useActive, dragTol_x, dragTol_y, useHelper, enabled) {

	// define widget properties
	this.$id = $('#' + id);
	this.keys = new keyCodes();

	this.dragTol = {
		x: dragTol_x,
		y: dragTol_y
	};

	this.helper = undefined; // used to store drag helper jQuery object
	this.useHelper = useHelper;

	this.enabled = enabled;
	if (enabled == true) {
		this.enable();
	}
	else {
		this.disable();
	}

	// get the object's margins
	this.margins = {
		top: (parseInt(this.$id.css("marginTop"),10) || 0),
		left: (parseInt(this.$id.css("marginLeft"),10) || 0)
	};

	// get the starting location of the object (adjusted for margins). This will
	// be used to return the draggable to its starting position if drop targets
	// have been specified and the user drops it elsewhere.
	//
	this.startPos = {
		x: this.$id.offset().left - this.margins.left,
		y: this.$id.offset().top - this.margins.top
	}

	// get the offset to the object's center point
	this.center = {
		x: (this.$id.outerWidth() / 2),
		y: (this.$id.outerHeight() / 2)
	};
 

	////////////////////////////////////////
	//
	// The following three properties (clickPos, curPos, and prevPos) will be updated
	// as the draggable object is dragged around the screen. If useHelper is true,
	// these values will pertain to the position of the drag helper, as the original
	// object will not be moved. If useHelper is false, the values will pertain to the
	// draggable object itself.
	//

	// clickPos is the position within the object where a click occured.
	// This position is set in the mousedown handler.
	this.clickPos = {x: -1, y: -1};

	// copy the starting position into a variable to give the current position. This
	// position will be updated as the object is dropped in other locations.
	this.curPos = {
		x: this.startPos.x,
		y: this.startPos.y
	};

	// prevPos is the location of the object after the last mousemove event.
	this.prevPos = { x: -1, y: -1};

	// store any passed drop targets
	this.$targets = $targets;
	this.useActive = useActive; // changes how the drag is handled for keyboard dragging

	
	this.activeTarget = undefined; // if target specified, points to one under draggable
	this.validDrop = true; // false if there are drop targets and draggable is not over one.

	// set widget flags
	this.grabbed = false;  // true if object has been grabbed
	this.clicked = false;  // true if object grabbed by a mouse click
	this.dragging = false;  // true if object drag is occuring

	// bind event handlers
	this.bindHandlers();

} // end draggable() constructor

//
// Function bindHandlers() is a member function to bind event handlers to the draggable object
//
// @return N/A
//
draggable.prototype.bindHandlers = function() {

	var thisObj = this;

	this.$id.mousedown(function(e) {
		return thisObj.handleMouseDown(e);
	});

	this.$id.keydown(function(e) {
		return thisObj.handleKeyDown(e);
	});

	this.$id.keypress(function(e) {
		return thisObj.handleKeyPress(e);
	});

	// bind event handlers to listen to droppables
	this.$id.bind('targetEnter', function(e, droppable) {
		return thisObj.handleTargetEnter(e, droppable);
	});

	this.$id.bind('targetLeave', function(e, droppable) {
		return thisObj.handleTargetLeave(e, droppable);
	});

} // end bindHandlers()

//
// Function enable() is a member function to set the draggable to an enabled state (i.e. able to be grabbed
// and dragged).
//
// @return N/A
//
draggable.prototype.enable = function() {

	this.enabled = true;
	this.$id.attr('aria-grabbed', 'false');
} // end enable()

//
// Function disable() is a member function to set the draggable to a disabled state.
//
// @return N/A
//
draggable.prototype.disable = function() {

	this.enabled = false;
	this.$id.removeAttr('aria-grabbed'); 
} // end disable()

//
// Function createHelper() is a member function to create a clone of the draggable for use as a helper.
// The function creates the clone, modifies the appropriate parameters, appends the clone to the
// document, and binds necessary event handlers,
//
// @return N/A
//
draggable.prototype.createHelper = function() {

	var thisObj = this;

	this.$helper = this.$id.clone();

	this.$helper.attr('id', this.$id.attr('id') + '_helper').attr('role', 'presentation');
	this.$helper.addClass('helper');

	this.$helper.appendTo(this.$id.parent());
	this.$helper.css('position', 'absolute');
	this.$helper.css('top', this.startPos.y - 1);
	this.$helper.css('left', this.startPos.x - 1);

	// bind mouse handlers if grabbed with the mouse, key handlers if via keyboard
	if (this.clicked == true) {
		// bind event handlers
		this.$helper.mousemove(function(e) {
			return thisObj.handleMouseMove(e);
		});

		this.$helper.mouseup(function(e) {
			return thisObj.handleMouseUp(e);
		});
	}
	else {
		this.$helper.keydown(function(e) {
			return thisObj.handleKeyDown(e);
		});

		this.$helper.keypress(function(e) {
			return thisObj.handleKeyPress(e);
		});
	}

} // end createHelper()

//
// Function destroyHelper() is a member function to remove the drag helper from the DOM.
//
// @return N/A
//
draggable.prototype.destroyHelper = function() {

	this.$helper.remove();
	this.$helper = undefined;

} // end destroyHelper

//
// function doGrab() is a member function to process a grab event. It adds grabbed styling to the
// grabbable object, creates a helper (if useHelper is true), and binds event handlers needed to move
// either the object or the helper.
//
// @return N/A
//
draggable.prototype.doGrab = function() {

	var thisObj = this;

	// Only process if the object is enabled and has not already been grabbed
	if (this.enabled == true && this.grabbed == false) {

		// add the grabbed class
		this.$id.addClass('grabbed');

		// Initialize prevPos to be the start position of the object
		if (this.clicked == true) {
			this.prevPos = {
				x: this.clickPos.x,
				y: this.clickPos.y
			};
		}
		else {
			this.prevPos = {
				x: this.startPos.x,
				y: this.startPos.y
			};
		}

		// if using a helper, create it; else, bind event handlers to the
		// grabbable object
		//
		if (this.useHelper == true) {
			this.createHelper();

			// set focus on the helper
			this.$helper.focus();
		}
		else if (this.clicked == true) { // only bind mouse handlers if grabbing via mouse
			// bind a mouseup handler
			this.$id.mouseup(function(e) {
				return thisObj.handleMouseUp(e);
			});

			// bind a mousemove handler
			this.$id.mousemove(function(e) {
				return thisObj.handleMouseMove(e);
			});
		}

		// if there are targets, set validDrop to false.
		if (this.$targets) {
			this.validDrop = false;
		}

		// set the grabbed flag
		this.grabbed = true;

		// set the aria-grabbed property
		this.$id.attr('aria-grabbed', 'true');

		// trigger a grab event to notify droppables
		$.event.trigger('grab', this);
	}

} // end doGrab()

//
// Function doDrag() is a member function to process a drag event. The function checks to see
// if the object is in the dragging state (this will always be the case if doDrag() is called
// following a key event). If not dragging, the function checks that the drag tolerance has been
// exceeded and enters the dragging state if this is so. If dragging, the function updates the
// pixel position of the object and moves it.
//
// @param (xPos float) xPos is the horizontal pixel position of the object being dragged
//
// @param (yPos float) yPos is the vertical pixel position of the object being dragged
//
// @return N/A
//
draggable.prototype.doDrag = function(xPos, yPos) {

	var $id = this.$id; // initially set $id to point to the draggable

	if (this.useHelper == true) {
		$id = this.$helper; // set $id to point to the helper
	}

	// if not dragging, check to see if mouse has moved beyond drag tolerance
	if (this.dragging == false) {
		// if the mouse has been moved beyond the drag tolerance, begin a drag event
		if (Math.abs(xPos - this.clickPos.x) > this.dragTol.x
			|| Math.abs(yPos - this.clickPos.y) > this.dragTol.y) {

			// set the dragging flag
			this.dragging = true;

			// change the position of the draggable to absolute
			$id.css('position', 'absolute');

			// set the initial position
			$id.css('left', this.curPos.x);
			$id.css('top', this.curPos.y);

		}
	}
	else { ////// dragging ///////

		// update the horizontal position
		this.curPos.x += xPos - this.prevPos.x;

		// update the vertical position
		this.curPos.y += yPos - this.prevPos.y;

		// change the position of the draggable to absolute
		$id.css('position', 'absolute');

		// move the draggable
		$id.css('left', this.curPos.x);
		$id.css('top', this.curPos.y);

		// update prevPos to be the current mouse location
		this.prevPos = {
			x: xPos,
			y: yPos
		};
	}

	// trigger the drag event to notify droppables
	$.event.trigger('drag', this);

} // end doDrag()

//
// Function doDrop() is a member function to process a drop event for the draggable object. The function
//
// @return N/A
//
draggable.prototype.doDrop = function() {

	// unbind the mouse event handlers
	if (this.useHelper == true) {
		this.$helper.unbind('mousemove');
		this.$helper.unbind('mouseup');
	}
	else {
		this.$id.unbind('mousemove');
		this.$id.unbind('mouseup');
	}

	if (this.dragging == true) {

		// if this is an invalid drop, return the draggable to its starting position
		if (this.validDrop == false) {
			if (this.useHelper == true) {
				this.$helper.animate({
					left: this.startPos.x,
					top: this.startPos.y
				}, 'fast');
			}	       
			else {
				// return draggable object (or it's drag helper) to the starting position
				this.$id.animate({
					left: this.startPos.x,
					top: this.startPos.y
				}, 'fast');
			}

			// return focus to the draggable object
			this.$id.focus();

			// reset curPos
			this.curPos = {
				x: this.startPos.x,
				y: this.startPos.y
			}
		}
		else {
			switch (this.activeTarget.$id.attr('aria-dropeffect')) {
				case "copy": {
					if (this.useHelper == false) {

						// return the draggable to it's starting position
						this.$id.animate({
							left: this.startPos.x,
							top: this.startPos.y
						}, 0);

					}

					// reset curPos to startPos
					this.curPos = {
						x: this.startPos.x,
						y: this.startPos.y
					};

					break;
				}
				case "move": {
					if (this.useHelper == true) {

						// make certain the draggable has absolute positioning.
						this.$id.css('position', 'absolute');

						// move the draggable
						this.$id.animate({
							left: this.curPos.x,
							top: this.curPos.y
						}, 'fast', function() {
							// reset the position to relative and remove
							// top and left specification.
							$(this).css('top', '').css('left', '').css('position', 'relative');
						});
	
						// update startPos to be the current position
						this.startPos = {
							x: this.curPos.x,
							y: this.curPos.y
						};
					}
					else {
	
						// draggable is already where we want it
	
						// reset the draggable CSS positioning
						this.$id.css('position', 'relative');
						this.$id.css('top', '');
						this.$id.css('left', '');
					}
					break;
				}
			} // end switch
		}

		// reset the click position
		this.clickPos = { x: -1, y: -1 };

		// reset the flags
		this.dragging = false;
	}

	if (this.useHelper == true) {

		// destroy the helper
		this.destroyHelper();
	}

	// remove the grabbed class from the draggable object
	this.$id.removeClass('grabbed');

	// set aria-grabbed property to false
	this.$id.attr('aria-grabbed', 'false');

	// trigger the drop event to notify droppables
	$.event.trigger('drop', this);

	// reset the flags
	this.grabbed = false;
	this.clicked = false;
	this.validDrop = false;

} // end doDrop()

//
// function abandoneDrag() is a member function called by the application to abandon the
// current drag and drop operation.
//
// @return N/A
//
draggable.prototype.abandonDrag = function() {

	this.validDrop = false;
	this.doDrop();

} // end abandonDrag()


// Function handleMouseDown() is a member function to processmousedown events for the draggable object.
// This function stores where the original click occured within the object and binds a mousemove handler.
//
// @param (e object) e is the event object
//
// @return (boolean) returns false
//
draggable.prototype.handleMouseDown = function(e) {

	var thisObj = this;

	// set the clicked flag
	this.clicked = true;

	// store the click position
	this.clickPos = {
		x: e.pageX,
		y: e.pageY
	};

	// do grab processing
	this.doGrab();

	e.stopPropagation();
	return false;

} // end handleMouseDown()

// Function handleMouseUp() is a member function to process mouseup events for the draggable object.
// This function performs the drop operation for the object. If the draggable is not dropped on a drop
// target, it is returned to it's starting position. After the drop, the mousemove handler is unbound.
//
// @param (e object) e is the event object
//
// @return (boolean) returns false
//
draggable.prototype.handleMouseUp = function(e) {


	// perform the drop processing
	this.doDrop();

	e.stopPropagation();
	return false;

} // end handleMouseUp()

//
// Function handleMouseMove() is a member function to process mouse move events. This function
// will set the dragging flag and perform the drag if the mouse is moved beyond the drag tolerance.
//
// @param (e object) e is the event object
//
// @return (boolean) returns false
//
draggable.prototype.handleMouseMove = function(e) {

	// perform drag processing
	this.doDrag(e.pageX, e.pageY);

	e.stopPropagation();
	return false;

} // end handleMouseMove()

// 
// Function handleKeyDown() is a member function to process keydown events. This function
// will handle all key events for the object, including placing it in grabbed mode, drag mode,
// and dropped mode.
//
// Dragging with the keyboard will move focus to the first drop target with a tabindex=0.
// 
// @param (e object) e is the event object
//
// @return (boolean) Returns true if propagating; false if not.
//
draggable.prototype.handleKeyDown = function(e) {

	var target = null;

	if (e.altKey || e.ctrlKey
		|| (e.shiftKey && e.keyCode != this.keys.tab)) {
		// do nothing
		return true;
	}

	switch (e.keyCode) {
		case this.keys.tab: {

			if (this.grabbed == false) {
				// do nothing;
				return true;
			}

			if (!this.$targets) {
				// adandon the drag
				this.abandonDrag();
			}
			else {
				if (this.useActive == true) {
					// get target from aria-activedescendant attribute
					$target = $('#' + this.$targets.attr('aria-activedescendant'));

					// give the passed element focus
					this.$targets.focus();
				}
				else {
					// get target from tab order
					$target = this.$targets.filter('[tabindex=0]');

					// give the target focus
					$target.focus();
				}

				// set the dragging flag to true
				this.dragging = true;

				// Drag the draggable to the drop target
				this.doDrag($target.offset().left, $target.offset().top);

				$target = null;

				e.stopPropagation();
				return false;
			}

			return true;
		}
		case this.keys.esc: {
			if (this.grabbed == true) {
				// adandon the drag
				this.abandonDrag();

				// if useHelper is true, return
				// focus to the draggable
				if (this.useHelper == true) {
					this.$id.focus();
				}
			}
			e.stopPropagation();
			return false;
		}
		case this.keys.enter:
		case this.keys.space: {

			if (this.grabbed == false) {

				// set the clicked flag
				this.clicked = false;

				// grab the object
				this.doGrab();
			}
			else { // dropping object
				this.doDrop();

				// if useHelper is true, return
				// focus to the draggable
				if (this.useHelper == true) {
					this.$id.focus();
				}

				// reset the clicked flag
				this.clicked = false;
			}

			e.stopPropagation();
			return false;
		}
		case this.keys.left:
		case this.keys.up:
		case this.keys.right:
		case this.keys.down: {
			e.stopPropagation();
			return false;
		}
	} // end switch

	return true;

} // end handleKeyDown()

//
// Function handleKeyPress() is a member function to consum keypress events. This function
// is necessary to prevent some browsers (such as Opera) from performing window manipulation
// on keypress events.
//
// @param (e object) e is the event object
//
// @return (boolean) Returns true if propagating; false if not.
//
draggable.prototype.handleKeyPress = function(e) {

	if (e.altKey || e.ctrlKey || e.shiftKey) {
		// do nothing
		return true;
	}

	switch (e.keyCode) {
		case this.keys.esc:
		case this.keys.enter:
		case this.keys.space:
		case this.keys.left:
		case this.keys.up:
		case this.keys.right:
		case this.keys.down: {
			e.stopPropagation();
			return false;
		}
	} // end switch

	return true;

} // end handleKeyPress()

//
// Function handleTargetEnter() is a member function to process targetEnter events triggered by droppables
//
// @param (e object) e is the event object
//
// @param (droppable object) droppable is the droppable triggering the event
//
// @return (boolean) Returns true
//
draggable.prototype.handleTargetEnter = function(e, droppable) {

	if (this.grabbed == true) {
		this.activeTarget = droppable;
		this.validDrop = true;
	}
	
	return true;
}

//
// Function handleTargetLeave() is a member function to process targetLeave events triggered by droppables
//
// @param (e object) e is the event object
//
// @param (droppable object) droppable is the droppable triggering the event
//
// @return (boolean) Returns true
//
draggable.prototype.handleTargetLeave = function(e, droppable) {

	if (this.grabbed == true) {
		this.activeTarget = null;
		this.validDrop = false;
	}
	
	return true;
}
