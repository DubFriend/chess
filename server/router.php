<?php
//selects controller based on url path.
class Router {
    private $Factory,
            $path;

    function __construct(array $fig = array()) {
        $this->Factory = $fig['factory'];
        $this->path = strtolower(substr(removeTrailing($fig['path'], '/'), 1));
    }

    function route() {
        return $this->Factory->index();
    }
}
?>
