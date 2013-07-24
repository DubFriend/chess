<?php
define("ROOT", "server/");
require ROOT . "define.php";

switch(DEPLOYMENT) {
    case "development":
        ini_set('display_errors', 1);
        error_reporting(E_STRICT|E_ALL);
        break;
    case "production":
        ini_set('display_errors', 0);
        error_reporting(0);
        break;
    default:
        throw new Exception("Invalid DEPLOYMENT value");
}

require ROOT . "index.php";
?>
