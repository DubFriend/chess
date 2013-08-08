<?php
require ROOT . "library.php";
require ROOT . "sequel.php";
require ROOT . "factory.php";
require ROOT . "router.php";
require ROOT . "base.php";
require ROOT . "game.php";
require ROOT . 'mustache.php/src/Mustache/Autoloader.php';

Mustache_Autoloader::register();

session_start();

$get = sanitizeArray($_GET);
$post = sanitizeArray($_POST);
$server = sanitizeArray($_SERVER);

$_GET = $_POST = $_SERVER = null;//force use of sanitized versions

$Factory = new Factory(array(
    'get' => $get,
    'post' => $post,
    'server' => $server,
    'database' => new Sequel(new PDO(
        'mysql:host=' . DATABASE_HOST . ';dbname=' . DATABASE_NAME,
        DATABASE_USER,
        DATABASE_PASS
    ))
));

$Router = new Router(array(
    'factory' => $Factory,
    'path' => tryArray($server, 'PATH_INFO', '')
));

$Controller = $Router->route();

echo $Controller->respond($server['REQUEST_METHOD'])['body'];
?>
