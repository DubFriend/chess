<?php
class Factory {
    private $get,
            $post,
            $Sql;

    function __construct(array $fig = array()) {
        $this->get = $fig['get'];
        $this->post = $fig['post'];
        $this->Sql = $fig['database'];
    }

    public function index($opt = null) {
        return new Index_Controller(array(
            "view" => new Index_View(new Mustache_Engine())
        ));
    }
}
?>
