<?php
session_start();
$_SESSION = array();
session_destroy();

setcookie("oauth_access_token", "", time()-3600);
setcookie("oauth_access_token_secret", "", time()-3600);
?>