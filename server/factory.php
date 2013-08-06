<?php
class Factory {
    private $get, $post, $sql;

    function __construct(array $fig = array()) {
        $this->get = $fig['get'];
        $this->post = $fig['post'];
        $this->sql = $fig['database'];
    }

    function index() {
        return new Index_Controller(array(
            "view" => new Index_View(new Mustache_Engine())
        ));
    }

    function game($gameId = null) {
        return new Game_Controller(array(
            'gameModel' => new Game(array(
                'sql' => $this->sql,
                'board' => tryArray($this->post, 'board'),
                'side' => tryArray($this->post, 'side')
            )),
            'gameId' => $gameId
        ));
    }
}
?>
