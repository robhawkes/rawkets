<?php
define("TWITTER_CONSUMER_KEY", "UR9lK0nq3KX6Wb2qgO4z5w");
define("TWITTER_CONSUMER_SECRET", "e8jJbu2cj7LxtfS9xnIGLaE4BkuLmvkSUmoBXEOyO4c");
define("TWITTER_OAUTH_HOST", "https://api.twitter.com");
define("TWITTER_REQUEST_TOKEN_URL", TWITTER_OAUTH_HOST."/oauth/request_token");
define("TWITTER_AUTHENTICATE_URL", TWITTER_OAUTH_HOST."/oauth/authenticate");
define("TWITTER_ACCESS_TOKEN_URL", TWITTER_OAUTH_HOST."/oauth/access_token");

try {
	$oauth = new OAuth(TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, OAUTH_SIG_METHOD_HMACSHA1, OAUTH_AUTH_TYPE_URI);
	$request_token_info = $oauth->getRequestToken(TWITTER_REQUEST_TOKEN_URL);
	echo TWITTER_AUTHENTICATE_URL."?oauth_token=".$request_token_info["oauth_token"];
	echo '<br>'.$request_token_info["oauth_token_secret"];
	$oauth->setToken($request_token_info["oauth_token"], $request_token_info["oauth_token_secret"]);
	$access_token_info = $oauth->getAccessToken(TWITTER_ACCESS_TOKEN_URL);

    printf("Access token: %s\n",$access_token_info["oauth_token"]);
    printf("Access token secret: %s\n",$access_token_info["oauth_token_secret"]);

	//http://www.snipe.net/2009/07/writing-your-first-twitter-application-with-oauth/
	//http://www.lornajane.net/posts/2010/Authenticating-with-OAuth-from-PHP
} catch(OAuthException $e) {
	print_r($e);
}
?>