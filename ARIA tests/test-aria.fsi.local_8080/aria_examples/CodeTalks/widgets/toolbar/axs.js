// Copyright (c) 2007 AOL LLC. All rights reserved.
// This library is licensed under the terms of the AXS Library License, available at
// http://dev.aol.com/axs
// Version 1.1.7
// October 19 2007
// C. Blouch

var axs={
	//Boolean platform detection for Mac systems used to change alt to option and css rules
	onmac:navigator.platform.toLowerCase().indexOf("mac")>-1,
	l10n:{
		keycap_summary:"This table describes the shortcut keys implemented on this page",
		keycap_caption:"Key combinations and the actions they invoke.",
		keycap_combo:"Key Combination",
		keycap_act:"Action",
		keycap_keyshow:"Show or hide the keyboard shortcut help",
		keycap_linkshow:"Click this link to show or hide the keyboard shortcut table",
		keycap_key:"control+alt+h",
		keycap_help:"",
		css_keyhidem:"height:0px;width:0px;overflow:hidden;display:block;",
		css_keyhide:"height:1px;width:1px;overflow:hidden;position:absolute;top:-99px;",
		css_keyshow:"height:auto;width:auto;overflow:visible;"
	},
	//Move focus to any item in the DOM passed in.
	// obj-DOM node to focus on
	// tv-tabindex value to set on the object. Default is -1.
	focus:function(obj,tv){
		//These items don't need tabindex added. It first checks to make sure we don't need to bother modifying attributes
		var focus_exceptions={A:1,AREA:1,BUTTON:1,INPUT:1,OBJECT:1,SELECT:1,TEXTAREA:1};
		//Four checks here
		//1. If we are passed in a tab value then go right ahead and set the tabindex
		//2. If we are not given a tabindex then we need to make sure the object even needs one at all
		//by verifying that it's not on the focus_exceptions list otherwise go on and check for an existing tabindex
		//so we don't clobber one that is already assigned.
		//3. Firefox check
		//getAttribute("tabIndex") returns a null when there is no tabIndex, so go ahead and add it
		//If it isn't null then there is a an existing tabIndex so leave things alone.
		//Doing a getAttributeNode().specified in FF on a null node breaks, but why would somebody move focus to nothing?
		//4. IE check
		//In IE getAttribute("tabIndex") returns a 0 even when there is no tabIndex so we don't know if tabIndex DNE or 
		//if it was previously set to 0. So getAttribute should fail in IE because 0!=null. The getAttributeNode checks whether the
		//tabIndex value was specified or is just a default value. We first have to check if the getAttributeNode method exists
		//because IE5.5 and below lack this. If the method exists we use it to check if tabIndex is not specified.
		//If true we go ahead and add a tabIndex.
		//Also note that "tabIndex" must have the capital I to work in IE, even though the html is specified as "tabindex"
		if(
			tv ||
			!focus_exceptions[obj.nodeName] &&
			(obj.getAttribute("tabIndex")==null ||
			(obj.getAttributeNode && !obj.getAttributeNode("tabIndex").specified))
		)
		{
			//If we aren't passed in a value to set tabindex to then default to -1
			if(!tv)tv=-1;
			obj.setAttribute("tabIndex",tv);
		}
		//We check that the .focus method is available before invoking it to protect older browser from JS errors
		if(obj.focus)obj.focus();
	},
	//Register a key to function
	//key - "[control]+[alt]+[shift]+char"
	//fun - function or method to invoke when key is pressed
	//p - an optional hash map of parameters
	//p.des - Description of what the function does. Leave out to not make additional table entries
	//p.args - array of arguments to call the function with
	//p.node - the object to attach the keyboard combo to. Defaults to "document" if not specified
	//p.bub - boolean whether to bubble events or not. Defaults to false.
	//p.obj - Override This returned to your funtion to point to some other object instead of the node
	//EXAMPLE
	//axs.keyreg("alt-shift-p",doWork,{args:["c1.html",123,x]},bub:true,node:axs.id("box1"),"Make the update");
	//Bug: On Firefox 2.0 Mac any key in the number row will not work with shift or alt modifiers ie shift+7, alt+=
	//FF keycode gets reported as 0 instead of correct value. Known bug to be fixed in FF 3.0 which is scheduled
	//for release late winter 2007. See https://bugzilla.mozilla.org/show_bug.cgi?id=44259
	keyreg:function(key,fun,p){
		if(!p)var p={};
		var tl,i,k,c,cc,ts,tc,ta,s="";
		//Check special case where + is the key they want
		if(key.indexOf("++")!=-1)cc=61;
		//Break the key string into list of tokens
		tl=key.split("+");
		k=tl.length;
		//Walk through all the tokens
		for(i=0;i<k;i++){
			c=tl[i];
			//If the token is longer than 0 characters
			if(c){
				//Check for shift key
				if(c=="shift")ts=1;
				//Check for control key
				else if(c=="control")tc=1;
				//Check for alt key
				else if(c=="alt")ta=1;
				//Check for special, shifted or regular keycode
				else if(!cc){
					cc=axs._keyspecial[c]||axs._keyshift[c]||c.toUpperCase().charCodeAt(0);
					//If on the shift list then signal shift key needed even if the user did not
					//include it in the key combination registration
					if(axs._keyshift[c])ts=1;
				}
			}
		}
		//Build a string to represent the key combination to register
		//Use "Option" if on a Mac instead of Alt
		if(ts)s="shift+";
		if(tc)s+="control+";
		if(ta)s+="alt+";
		s+=cc;
		//If we've been given a description with key combo then add it to the registration
		//If we're on a Mac, replace reference to "alt" with "option" since that's what their keyboards call it
		if(p.des)axs._keymap[axs._keymap.length]={"des":p.des,"key":axs.onmac?s.replace("alt","option"):s};
		if(!p.args)p.args=[];
		//Create keyboard handler for this key combination
		var f=function(event){
			//In IE look in window.event on FF look in passed-in var
			var e=event||window.event,kb=e.keyCode||e.which,kk="";
			//Check and adjust for IE giving winky values for semicolon/colon, equals/plus
			//Should be keycode 59 and 61 but IE gives 186 and 187
			if(kb=="186")kb="59";
			if(kb=="187")kb="61";
			//build a string representing the current key combination
			if(e.shiftKey)kk="shift+";
			if(e.ctrlKey)kk+="control+";
			if(e.altKey)kk+="alt+";
			kk+=kb;
			//If the key they hit is the one we are looking for
			if(s==kk){
				//Call the appropriate function
				//If we are passed an object, return that to the registered function.
				//Otherwise give the DOM node that this function was attached to (this)
				fun.apply(p.obj||this,p.args);
				//Since we processed the keystroke, check if we should stop bubbling
				if(!p.bub==true){
					//Stop propogation the IE way
					e.cancelBubble=true;
					e.returnValue=false;
					//Stop propogation the standards way
					if(e.stopPropagation){
						e.stopPropagation();
						e.preventDefault();
					}
					return false;
				}else{return true}
			}
			return true;
		}
		//Attach the keyboard handler to the node
		//If no node is specified then attach to the overall document
		axs.ae(p.node||document,"keydown",f);
	},
	//Go through all the keymappings and make a table to let folks know what the keys do
	keychart:function(){
		var s,t,i,b,x,e,f,u,c,d=document,l;
		//Is this the first time keychart is being executed?
		if(!axs.id("axs_kt")){
			//Doctor up the css hide/show if on a mac
			if(axs.onmac)axs.l10n.css_keyhide=axs.l10n.css_keyhidem;
			//Register control+alt+h (default) as the hide/show keychart shortcut
			axs.keyreg(axs.l10n.keycap_key,axs._keyshow,{des:axs.l10n.keycap_keyshow});
			//Create the container for the table and the hide/show link at the top of the page if it DNE
			e=d.createElement("div");
			e.style.display="none";
			e.id="axs_kt";
			d.body.insertBefore(e,d.body.firstChild);
			//Create link
			f=d.createElement("a");
			f.style.cssText=axs.l10n.css_keyhide;
			f.href="#";
			f.innerHTML=axs.l10n.keycap_linkshow;
			f.onclick=axs._keyshow;
			f.onfocus=axs._keyls;
			f.onblur=axs._keylh;
			f.id="axs_kl";
			d.body.insertBefore(f,d.body.firstChild);
		}
		//Create table head with localized text
		c="<table summary='"+axs.l10n.keycap_summary+"'><caption>"+axs.l10n.keycap_caption+"</caption><tr><th>"+axs.l10n.keycap_combo+"</th><th>"+axs.l10n.keycap_act+"</th></tr>";
		//Walk through all the known keymaps
		l=axs._keymap.length;
		for(i=0;i<l;i++){
			var k=0;
			u=axs._keymap[i].key;
			//Make a copy of the registered key combination
			t=u.split("+");
			//Get the key code off the end of the registered key combination
			b=t.length>1?t[t.length-1]:t;
			//Is the key special? Check the list for a token.
			for(x in axs._keyspecial)if(axs._keyspecial[x]==b)k=x;
			//Replace keycode with the token if it exists, otherwise use the actual letter
			c+="<tr><td>"+u.replace(b,k?k:String.fromCharCode(b))+"</td><td>"+axs._keymap[i].des+"</td></tr>";
		}
		c+="</table>";
		//If there is help text, add that at the end
		c+=axs.l10n.keycap_help;
		//Inject the table the div
		axs.r(axs.id("axs_kt"),c);
	},
	//Hide or show the keyboard shortcuts link
	_keyls:function(){axs.ids("axs_kl").cssText=axs.l10n.css_keyshow;},
	_keylh:function(){axs.ids("axs_kl").cssText=axs.l10n.css_keyhide;},
	//Hide or show the keyboard shortcuts table
	_keyshow:function(){
		var o=axs.ids("axs_kt");
		o.display=o.display!="none"?"none":"block";
		return false;
	},
	_keymap:[],
	_keyshift:{"~":192,"!":49,"@":50,"#":51,"$":52,"%":53,"^":54,"&":55,"*":56,"(":57,")":48,"_":109,"+":61,"{":219,"}":221,"|":220,":":59,'"':222,"<":188,">":190,"?":191},
	_keyspecial:{"backspace":8,"enter":13,"escape":27,"pageup":33,"pagedown":34,"end":35,"home":36,"left":37,"up":38,"right":39,"down":40,"insert":45,"delete":46,"f1":112,"f2":113,"f3":114,"f4":115,"f5":116,"f6":117,"f7":118,"f8":119,"f9":120,"f10":121,"f11":122,"f12":123,"tab":124,"space":32,
	//These are not really tokens but are here to workaround the goofy keycodes not matching
	//the ascii values for these 7 characters.
	",":188,"-":109,".":190,"/":191,"`":192,"\\":220,"'":222},
	//Ajax document fetcher
	// u		URL to make request to
	// a		attribute map
	// a.cb		callback function
	// a.meth	Method to use on ajax request such as get, post, put
	// a.head	Content type header to add to transaction
	// a.data	put data here if you want to switch from GET to POST
	// a.p		Package of elements to pass on to callback function
	gdoc:function(u,a){
		var f,r,m;
		//If we are not passed in a, make it an empty array
		if(!a)a={};
		//When Ajax state goes to 4, either callback the custom callback or the default one.
		//Handle case where callback might be an object method or a function
		f=function(){if(r.readyState>3)typeof(a.cb)=="function"?a.cb.call(null,r,a.p):window[a.cb](r,a.p)}
		//If we are not passed a method default to get unless there is post data
		if(!a.meth){
			m="GET";
			a.data?m='POST':a.data="";
		}else{
			m=a.meth;
			if(!a.data)a.data="";
		}
		//Create request objec in either the standards or Microsoft way
		r= window.XMLHttpRequest?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");
		//Setup callback for when Ajax completes
		r.onreadystatechange=f;
		//Make the Ajax request
		r.open(m,u,1);
		//Set Header to work around Safari weirdness if not passed in
		a.head?r.setRequestHeader('content-type',a.head):r.setRequestHeader('content-type','text/xml');
		//Make it so
		r.send(a.data);
	},
	//document.getElementById() wrapped to be id()
	id:function(id){return document.getElementById(id)},
	//document.getElementById().style wrapped to be ids()
	ids:function(id){return axs.id(id).style},
	//Replace contents in object O with text T
	r:function(o,t){o.innerHTML=t},
	//Add function, method or anonymous function f to be called when object o fires event e
	//Handles both the standard addEventListner and IE attachEvent ways to do this.
	//Works around a pile of IE bugs/quirks with attachEvent
	//Using m for the method works around a Safari quirk
	//Using global ae_ct for the array index works around IE bug with anonymous functions
	//We preface the count with "h" for hack since in IE the object reference can't start with a number
	//o - object to attach event to
	//e - name of event to register
	//f - function or method to trigger
	ae_ct:0,
	ae:function(o,e,f){
		var m="addEventListener",a;
		if(o[m])o[m](e,f,false);
		else if((a=o.attachEvent)){
			var t="h"+axs.ae_ct++;
			o['s'+t]=f;
			o[t]=function(){o['s'+t](window.event)}
			a('on'+e,o[t]);
		}
	},
	// Error Logging
	// Text T is appended to the log with a millisecond level timestamp
	// _log is the current log string and _makelog creates the DIV.
	// User should only use the errlog method although they could inspect anything they want
	log:function(t){
		if(axs.debug){
			if(!axs.id("_axslog"))axs._makelog();
			var d=new Date();
			axs._log="<b>"+d.getMinutes()+"m"+d.getSeconds()+"s"+d.getMilliseconds()+"ms:</b> "+t+"<br>"+axs._log;
			axs.r(axs.id("_axslog"),axs._log);
		}
	},
	_log:"",
	_makelog:function(){
		var d=document,e=d.createElement("div");
		e.setAttribute("id","_axslog");
		d.body.appendChild(e);
		e.style.cssText='background-color:#ccf;height:10em;width:30em;overflow:auto;font-size:11px;position:absolute;top:525px;text-align:left;';
	}
}