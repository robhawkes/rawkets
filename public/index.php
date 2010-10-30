<?php
session_start();

define("TWITTER_CONSUMER_KEY", "UR9lK0nq3KX6Wb2qgO4z5w");
define("TWITTER_CONSUMER_SECRET", "e8jJbu2cj7LxtfS9xnIGLaE4BkuLmvkSUmoBXEOyO4c");
define("TWITTER_OAUTH_HOST", "https://api.twitter.com");
define("TWITTER_REQUEST_TOKEN_URL", TWITTER_OAUTH_HOST."/oauth/request_token");
define("TWITTER_AUTHENTICATE_URL", TWITTER_OAUTH_HOST."/oauth/authenticate");
define("TWITTER_ACCESS_TOKEN_URL", TWITTER_OAUTH_HOST."/oauth/access_token");

try {
	$oauth = new OAuth(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, OAUTH_SIG_METHOD_HMACSHA1, OAUTH_AUTH_TYPE_URI);
	
	if ((!isset($_SESSION["oauth_access_token"])) || ($_SESSION["oauth_access_token"]) == "") {
		if ((!isset($_SESSION["oauth_request_token"])) || ($_SESSION["oauth_request_token"]) == "") {
			$request_token_info = $oauth->getRequestToken(TWITTER_REQUEST_TOKEN_URL."?oauth_callback=".urlencode("http://".$_SERVER["SERVER_NAME"]));
			//echo TWITTER_AUTHENTICATE_URL.'?oauth_token='.$request_token_info["oauth_token"].'&oauth_callback='.urlencode($_SERVER["SERVER_NAME"]).'<br>';

			$_SESSION["oauth_request_token"] = $request_token_info["oauth_token"];
			$_SESSION["oauth_request_token_secret"] = $request_token_info["oauth_token_secret"];
		} else {
			$oauth->setToken($_SESSION["oauth_request_token"], $_SESSION["oauth_request_token_secret"]);
		
			$access_token_info = $oauth->getAccessToken(TWITTER_ACCESS_TOKEN_URL);

			$_SESSION["oauth_access_token"] = $access_token_info["oauth_token"];
			$_SESSION["oauth_access_token_secret"] = $access_token_info["oauth_token_secret"];
			
			$_SESSION["oauth_request_token"] = "";
			$_SESSION["oauth_request_token_secret"] = "";
		}
	}

	/*
	printf("Request token: %s<br>", $_SESSION["oauth_request_token"]);
	printf("Request token secret: %s<br>", $_SESSION["oauth_request_token_secret"]);	
	printf("Access token: %s<br>", $_SESSION["oauth_access_token"]);
	printf("Access token secret: %s<br>", $_SESSION["oauth_access_token_secret"]);
	*/
	
	/*if (isset($_SESSION["oauth_access_token"])) {
		$oauth->setToken($_SESSION["oauth_access_token"], $_SESSION["oauth_access_token_secret"]);
		$data = $oauth->fetch("http://api.twitter.com/1/account/verify_credentials.json");
		$response_info = $oauth->getLastResponse();
		echo "<pre>";
		print_r(json_decode($response_info));
		echo "</pre>";
	}*/
} catch(OAuthException $e) {
	//print_r($e);
}
?>
<!DOCTYPE html>

<html lang="en">

	<head>
		<title>Rawkets | Rob Hawkes</title>
		<meta charset="utf-8">		
		<link rel="stylesheet" href="style/main.css">
	</head>
	
	<body>
		<canvas id="canvas" width="400" height="400"></canvas>
		
		<p id="attribution">By Rob Hawkes – <a href="http://twitter.com/rawkets">Twitter</a> – <a href="http://rawkes.com/blog/2010/10/23/rawkets-development-update-1">About</a> - <a href="http://github.com/robhawkes/rawkets">Source Code</a> - <a href="http://twitter.com/share" class="twitter-share-button" data-url="http://rawkets.com" data-counturl="http://rawkets.com" data-text="Check out Rawkets, a massively multiplayer game made by @robhawkes using HTML5 WebSockets and canvas" data-count="horizontal" data-via="rawkets" data-related="robhawkes:The guy behind Rawkets">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script> - <iframe src="http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Frawkets.com&amp;layout=button_count&amp;show_faces=false&amp;width=90&amp;action=like&amp;colorscheme=light&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:90px; height:21px;" allowTransparency="true" class="fb-button"></iframe></p>
		
		<p id="ping"></p>
		
		<div id="offline">
			<h1>Sorry, Rawkets is offline at the moment.</h1>
			<p>Please try again in 5 minutes.</p>
		</div>
		<div id="support">
			<h1>Sorry, your browser doesn't support WebSockets.</h1>
			<p>Supported browsers are Safari, Chrome and Firefox 4 beta.</p>
		</div>
		
		<!--<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>-->		
		<script type="text/javascript" src="js/jquery/jquery-dev.js"></script>
		
		<script type="text/javascript">
			$(function() {
				// Admittedly probably a stupid way to pass these variables into the game code, but it works.
				<?php if (isset($_SESSION["oauth_access_token"])) : ?>
				window.TWITTER_ACCESS_TOKEN = "<?=$_SESSION["oauth_access_token"]?>";
				window.TWITTER_ACCESS_TOKEN_SECRET = "<?=$_SESSION["oauth_access_token_secret"]?>";
				<?php else : ?>
				window.TWITTER_AUTHENTICATE_URL = "<?=TWITTER_AUTHENTICATE_URL.'?oauth_token='.$request_token_info["oauth_token"].'&oauth_callback='.urlencode("http://".$_SERVER["SERVER_NAME"])?>";
				<?php endif; ?>
			});
		</script>
		
		<script type="text/javascript" src="js/bison.js"></script>
		<script type="text/javascript" src="js/Socket.js"></script>
		<script type="text/javascript" src="js/Vector.js"></script>
		<script type="text/javascript" src="js/Rocket.js"></script>
		<script type="text/javascript" src="js/Player.js"></script>
		<script type="text/javascript" src="js/Viewport.js"></script>
		<script type="text/javascript" src="js/Star.js"></script>
		<script type="text/javascript" src="js/Game.js"></script>
		<script type="text/javascript" src="js/main.js"></script>
		
		<!-- Observer App -->
		<script type="text/javascript" src="http://www.observerapp.com/record.js"></script>
		<script type="text/javascript">
		try { Observerapp.record("4cc2aa5ba7b560500a05879c"); } catch(e) {};
		</script>
		
		<!-- Woopra Code Start -->
		<script type="text/javascript" src="//static.woopra.com/js/woopra.v2.js"></script>
		<script type="text/javascript">
		woopraTracker.track();
		</script>
		<!-- Woopra Code End -->
	</body>

</html>