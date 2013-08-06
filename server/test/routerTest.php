<?php
require 'library.php';
require 'router.php';

class Mock_Factory {
    function index() {
        return "index";
    }

    function game($gameId = null) {
        return "game:" . $gameId;
    }
}



class Router_Test extends PHPUnit_Framework_TestCase {

    function buildRouter($path) {
        return new Router(array(
            'factory' => new Mock_Factory(),
            'path' => $path
        ));
    }

    function test_index_filename() {
        $router = $this->buildRouter("");
        $this->assertEquals("index", $router->route());
    }

    function test_game_no_id() {
        $router = $this->buildRouter("/game");
        $this->assertEquals("game:", $router->route());
    }

    function test_game_with_id() {
        $router = $this->buildRouter("/game/123");
        $this->assertEquals("game:123", $router->route());
    }

}
?>