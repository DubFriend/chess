<?php
require ROOT . "library.php";
require ROOT . "sequel.php";
require ROOT . "base.php";
require ROOT . "game.php";

session_start();

$get = sanitizeArray($_GET);
$post = sanitizeArray($_POST);
$server = sanitizeArray($_SERVER);

$_GET = $_POST = $_SERVER = null;//force use of sanitized versions

$pieces = explode("/", $server['PATH_INFO']);

$gameId = null;
if(count($pieces) > 1) {
    $gameId = end($pieces);
}

$sql = new Sequel(new PDO(
    'mysql:host=' . DATABASE_HOST . ';dbname=' . DATABASE_NAME,
    DATABASE_USER,
    DATABASE_PASS
));

$Controller = new Game_Controller(array(
    'gameModel' => new Game(array(
        'sql' => $sql,
        'board' => tryArray($post, 'board'),
        'side' => tryArray($post, 'side')
    )),
    'gameId' => $gameId
));

echo $Controller->respond($server['REQUEST_METHOD'])['body'];
?>
