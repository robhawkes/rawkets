// Only using jQuery for website UI, not core game logic
$("#tabs a").css({textIndent: 0}).each(function() {
	var span = $(this).find("span");
	var spanWidth = span.outerWidth();
	var tabWidth = $(this).outerWidth();
	var tabEdge = $(this).offset().left+tabWidth;
	var overEdge = (tabEdge+(spanWidth/2) < window.innerWidth) ? false : true;
	var offset = (!overEdge) ? Math.floor((tabWidth/2)-(spanWidth/2)) : 10;
	span.css({right: offset});
	
	var anchor = $("<span class='anchor'></span>");
	var anchorClass = (overEdge) ? "right" : "";
	anchor.addClass(anchorClass);
	span.append(anchor);
}).mouseover(function() {
	var span = $(this).find("span");
	//var offset = span.
	span.toggle();
}).mouseout(function() {
	var span = $(this).find("span");
	span.toggle();
});

$("#play").submit(function(e) {
	e.preventDefault();
	var username = $("#username").val();
	//console.log(username, username.match(/^[\d\w]*$/));
	if (username != "" && username.match(/^[\d\w]*$/)) {
		if (username.length > 15) {
			$("#usernameError").html("Please keep your username 15 characters or less");
			return;
		}
		checkUsername(username);
	} else {
		$("#usernameError").html("Please only use letters and numbers in your username");
	};
});

$("#tabGame").click(function(e) {
	e.preventDefault();
	$("#overlay").stop().animate({backgroundColor: "rgba(0, 0, 0, 0)"});
	$("#settings, #about").hide();
	if(!localPlayer) {
		$("#overlay").stop().animate({backgroundColor: "rgba(0, 0, 0, 0.5)"});
		$("#intro").fadeIn();
	};
	$("#tabSettings, #tabAbout").removeClass("active");
	$(this).addClass("active");
});

$("#tabSettings").click(function(e) {
	e.preventDefault();
	$("#overlay").stop().animate({backgroundColor: "rgba(0, 0, 0, 0.5)"});
	$("#intro, #about").hide();
	$("#tabSettings, #tabGame").removeClass("active");
	$(this).addClass("active");
	$("#settings").fadeIn();
});

$("#tabAbout").click(function(e) {
	e.preventDefault();
	$("#overlay").stop().animate({backgroundColor: "rgba(0, 0, 0, 0.5)"});
	$("#intro, #settings").hide();
	$("#tabGame, #tabSettings").removeClass("active");
	$(this).addClass("active");
	$("#about").fadeIn();
});