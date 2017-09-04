axs.debug=1;

var test={
	//Initialize things after the page is fully loaded
	init:function(){
		axs.keyreg("left",test.Prev,{args:[""],des:"Move to previous button"});
		axs.keyreg("right",test.Next,{args:[""],des:"Move to next button"});
		axs.keyreg("space",test.Execute,{args:[""],des:"Invoke current focused button"});
		axs.keyreg("enter",test.Execute,{args:[""],des:"Invoke current focused button"});
	},
	//Ajax in the new content
	Prev:function(){
			var tb = document.getElementById('customToolbar');
		  buttonid = getPrevButtonID();  // This is an author defined function
		  tb.setAttribute("aria-activedescendant", buttonid); 	
	},
	Next:function(){
		var tb = document.getElementById('customToolbar');
		buttonid = getNextButtonID();   // This is an author defined function
		tb.setAttribute("aria-activedescendant", buttonid); 
	},
	Execute:function(){
		ExecuteButtonAction(getCurrentButtonID());
	}
}
//When the window fires an onload event, call the function init()
axs.ae(window,'load',test.init);