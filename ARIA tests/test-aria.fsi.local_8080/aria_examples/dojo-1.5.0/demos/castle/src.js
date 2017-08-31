dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojox.layout.ScrollPane");
dojo.require("dojox.widget.FisheyeLite");
dojo.require("dojo.NodeList-fx");
dojo.require("dojo.fx");
dojo.require("dojo.fx.easing");
dojo.require("dojox.analytics.Urchin");

;(function(){
	
	window.show = function(id){
		var contents = dojo.byId(id).innerHTML;
		dojo.query("#content").style("opacity", 0).forEach(function(n){ n.innerHTML = contents; }).anim({ opacity:1 });
	}

	var init = function(){
			// turn li's in this page into fisheye items, presumtiously:  
		dojo.query("#hidden ul > li").forEach(function(n){
			new dojox.widget.FisheyeLite({
				properties:{
				  fontSize:1.5
				},
				easeIn: dojo.fx.easing.linear,
				durationIn: 100,
				easeOut: dojo.fx.easing.linear,
				durationOut: 100
			}, n);
		});
 
	  	//accordion widget
	  	accordion = new dijit.layout.AccordionContainer({}, "accordionPanel");

		// children are scrollpanes, add titles (and id for css styles)
		var dates = ["25.07.2008", "26.07.2008", "27.07.2008"];
		dojo.forEach(["day1","day2","day3"], function(id,i){
			new dojox.layout.ScrollPane({ 
				id: "pane" + (i+1), 
				style: "width:450px;height:170px", 
				title: dates[i] 
			}, id).placeAt(accordion);
		});

		// we do this because despite accordion passing correct sizes, scrollpane uses 
		// it's scrollheight/etc for sizing
		dojo.subscribe("accordionPanel-selectChild", function(child){
			setTimeout(dojo.hitch(child, "resize"), accordion.duration + 50);
		});

		// start the accordion:
		accordion.startup();

		dojo.query('.dijitAccordionText').style('opacity', 0.01);

		// demo usage tracking: 
		new dojox.analytics.Urchin({ 
			acct: "UA-3572741-1", 
			GAonLoad: function(){
				this.trackPageView("/demos/castle");
			}
		});	
		
	}

	dojo.addOnLoad(init);

})();