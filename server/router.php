<?php
//selects controller based on url path.
class Router {
    private $Factory, $path;

    function __construct(array $fig = array()) {
        $this->Factory = $fig['factory'];
        $this->path = strtolower(substr(removeTrailing($fig['path'], '/'), 1));
    }

    function route() {
        $pieces = explode("/", $this->path);
        if(empty($pieces) || !$pieces[0]) {
            return $this->Factory->index();
        }
        else if($pieces[0] == "game") {
            $gameId = null;
            if(count($pieces) > 1) {
                $gameId = $pieces[1];
            }
            return $this->Factory->game($gameId);
        }
    }
}
?>
