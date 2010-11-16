<?php
session_start();

require_once("lib/spyc.php");
$config = Spyc::YAMLLoad("../config.yml");

define("TWITTER_CONSUMER_KEY", $config["TWITTER_CONSUMER_KEY"]);
define("TWITTER_CONSUMER_SECRET", $config["TWITTER_CONSUMER_SECRET"]);
define("TWITTER_OAUTH_HOST", "https://api.twitter.com");
define("TWITTER_REQUEST_TOKEN_URL", TWITTER_OAUTH_HOST."/oauth/request_token");
define("TWITTER_AUTHENTICATE_URL", TWITTER_OAUTH_HOST."/oauth/authenticate");
define("TWITTER_ACCESS_TOKEN_URL", TWITTER_OAUTH_HOST."/oauth/access_token");

function checkAuth($oauth, $cookies = false) {
	$oauth_access_token = "";
	$oauth_access_token_secret = "";
	
	if ($cookies) {
		$oauth_access_token = $_COOKIE["oauth_access_token"];
		$oauth_access_token_secret = $_COOKIE["oauth_access_token_secret"];
		
		$_SESSION["oauth_access_token"] = $oauth_access_token;
		$_SESSION["oauth_access_token_secret"] = $oauth_access_token_secret;
	} else {
		$oauth_access_token = $_SESSION["oauth_access_token"];
		$oauth_access_token_secret = $_SESSION["oauth_access_token_secret"];
	}
	
	// Perform quick authentication check
	try {
		$oauth->setToken($oauth_access_token, $oauth_access_token_secret);
		$data = $oauth->fetch("http://api.twitter.com/1/account/verify_credentials.json");
		$response_info = $oauth->getLastResponse();
		
		//echo "<pre>";
		//print_r(json_decode($response_info));
		//echo "</pre>";
	
		return true;
	} catch (OAuthException $e) {
		return false;
	}	
}

function generateRequestToken($oauth) {
	try {
		$request_token_info = $oauth->getRequestToken(TWITTER_REQUEST_TOKEN_URL, "http://".$_SERVER["SERVER_NAME"]);
		
		$_SESSION["oauth_request_token"] = $request_token_info["oauth_token"];
		$_SESSION["oauth_request_token_secret"] = $request_token_info["oauth_token_secret"];
	
		return true;
	} catch (OAuthException $e) {
		return false;
	}
}

try {
	$oauth = new OAuth(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, OAUTH_SIG_METHOD_HMACSHA1, OAUTH_AUTH_TYPE_AUTHORIZATION);
	
	if (!isset($_SESSION["oauth_access_token"]) || $_SESSION["oauth_access_token"] == "") {
		
		if (!isset($_COOKIE["oauth_access_token"]) || $_COOKIE["oauth_access_token"] == "") {
			if ((isset($_SESSION["oauth_request_token"])) && ($_SESSION["oauth_request_token"]) != "") {
				$oauth->setToken($_SESSION["oauth_request_token"], $_SESSION["oauth_request_token_secret"]);
		
				try {
					$access_token_info = $oauth->getAccessToken(TWITTER_ACCESS_TOKEN_URL);
					$_SESSION["oauth_access_token"] = $access_token_info["oauth_token"];
					$_SESSION["oauth_access_token_secret"] = $access_token_info["oauth_token_secret"];
				
					$expire = time()+60*60*24*30; // One month
					setcookie("oauth_access_token", $access_token_info["oauth_token"], $expire);
					setcookie("oauth_access_token_secret", $access_token_info["oauth_token_secret"], $expire);

					$_SESSION["oauth_request_token"] = "";
					$_SESSION["oauth_request_token_secret"] = "";

					checkAuth($oauth);
				} catch (OAuthException $e) {
					// Generate a new request token
					generateRequestToken($oauth);
				}
			}
		
			if ((!isset($_SESSION["oauth_access_token"])) || ($_SESSION["oauth_access_token"]) == "") {
				// Generate a new request token
				generateRequestToken($oauth);
			}
		// Cookies detected
		} else {
			checkAuth($oauth, true);
		}
	} else {
		checkAuth($oauth);
	}
} catch(OAuthException $e) {
	//print_r($e);
}
?>
<!DOCTYPE html>

<html lang="en">

	<head>
		<title>Rawkets | A massively multiplayer game built using HTML5 canvas and WebSockets</title>
		<meta charset="utf-8">
		<meta name="description" content="Rawkets is a massively multiplayer game in which you can shoot and interact with other players, in real-time, in space! It uses the latest Web technologies, including HTML5 canvas and WebSockets.">
			
		<link rel="stylesheet" href="style/reset.css">
		<link rel="stylesheet" href="style/main.css?<?=time()?>">
	</head>
	
	<body>
		<canvas id="canvas" width="400" height="400"></canvas>
		
		<p id="ping"></p>
		
		<div id="mask"></div>
		
		<section id="welcome">
			<header>
				<h1>Rawkets</h1>
			</header>
			
			<p>A massively multiplayer game in which you can shoot and interact with other players, in real-time, in space! It uses the latest Web technologies, including HTML5 canvas and WebSockets.</p>
			
			<p>Released early, updated often. <a href="http://rawkes.com/blog/2010/10/23/rawkets-development-update-1">Find out more about the game</a>.</p>
		</section>
		
		<p id="attribution">By Rob Hawkes – <a href="http://twitter.com/rawkets">Twitter</a> – <a href="http://rawkes.com/blog/2010/11/16/rawkets-development-update-2">About</a> - <a href="http://github.com/robhawkes/rawkets">Source Code</a> - <a href="http://twitter.com/share" class="twitter-share-button" data-url="http://rawkets.com" data-counturl="http://rawkets.com" data-text="Check out Rawkets, a massively multiplayer game made by @robhawkes using HTML5 canvas and WebSockets" data-count="horizontal" data-via="rawkets" data-related="robhawkes:The guy behind Rawkets">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script> - <script src="http://www.stumbleupon.com/hostedbadge.php?s=2&r=http://rawkets.com"></script> - <iframe src="http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Frawkets.com&amp;layout=button_count&amp;show_faces=false&amp;width=90&amp;action=like&amp;colorscheme=light&amp;height=21" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:90px; height:21px;" allowTransparency="true" class="fb-button"></iframe></p>
		
		<section id="offline">
			<h1>Sorry, Rawkets is offline at the moment.</h1>
			<p>Please try again in 5 minutes.</p>
		</section>
		<section id="support">
			<h1>Sorry, your browser doesn't support WebSockets.</h1>
			<p>Supported browsers are Safari, Chrome and Firefox 4 beta.</p>
		</section>
		<section id="authenticate">
			<h1>Sorry, Twitter authentication failed.</h1>
			<p>Unfortunately this is a new feature and isn't perfect just yet.</p>
		</section>
		<section id="playerExists">
			<h1>Sorry, you seem to have a twin.</h1>
			<p>Only one rawket is allowed per Twitter account.</p>
		</section>
		
		<div id="soundContainer"></div>
		
		<!--<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>-->		
		<script type="text/javascript" src="js/jquery/jquery-dev.js"></script>
		
		<script type="text/javascript">
			$(function() {
				// Admittedly probably a stupid way to pass these variables into the game code, but it works.
				<?php if (isset($_SESSION["oauth_access_token"])) : ?>
				window.TWITTER_ACCESS_TOKEN = "<?=$_SESSION["oauth_access_token"]?>";
				window.TWITTER_ACCESS_TOKEN_SECRET = "<?=$_SESSION["oauth_access_token_secret"]?>";
				<?php else : ?>
				window.TWITTER_AUTHENTICATE_URL = "<?=TWITTER_AUTHENTICATE_URL.'?oauth_token='.$_SESSION["oauth_request_token"].'&oauth_callback='.urlencode("http://".$_SERVER["SERVER_NAME"])?>";
				<?php endif; ?>
			});
		</script>
		
		<script type="text/javascript" src="js/swfobject/swfobject.js"></script>
		
		<!-- Timestamps prevent cached scripts screwing with testing - REMOVE WHEN GAME IS COMPLETE -->
		<script type="text/javascript" src="js/bison.js?<?=time()?>"></script>
		<script type="text/javascript" src="js/Sound.js?<?=time()?>"></script>
		<script type="text/javascript" src="js/Socket.js?<?=time()?>"></script>
		<script type="text/javascript" src="js/Vector.js?<?=time()?>"></script>
		<script type="text/javascript" src="js/Rocket.js?<?=time()?>"></script>
		<script type="text/javascript" src="js/Bullet.js?<?=time()?>"></script>
		<script type="text/javascript" src="js/Player.js?<?=time()?>"></script>
		<script type="text/javascript" src="js/Viewport.js?<?=time()?>"></script>
		<script type="text/javascript" src="js/Star.js?<?=time()?>"></script>
		<script type="text/javascript" src="js/Game.js?<?=time()?>"></script>
		<script type="text/javascript" src="js/main.js?<?=time()?>"></script>
		
		<!-- Observer App -->
		<script type="text/javascript" src="http://www.observerapp.com/record.js"></script>
		<script type="text/javascript">
		try { Observerapp.record("4cc2aa5ba7b560500a05879c"); } catch(e) {};
		</script>
		
		<!-- Google Analytics -->
		<script type="text/javascript">
		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-19570160-1']);
		_gaq.push(['_trackPageview']);

		(function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		})();
		</script>
	</body>

</html>