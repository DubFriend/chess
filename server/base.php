<?php
abstract class Controller {
    const OK = "200";
    const UNAUTHORIZED = "401";
    const NOT_FOUND = "404";
    const ERROR = "500";

    protected $get, $post;

    function __construct(array $fig = array()) {
        $this->get = tryArray($fig, 'get');
        $this->post = tryArray($fig, 'post');
    }

    function respond($method) {
        switch ($method) {
            case 'GET':
                $response = $this->get();
                break;
            case 'PUT':
                $response = $this->put();
                break;
            case 'POST':
                $response = $this->post();
                break;
            case 'DELETE':
                $response = $this->delete();
                break;
            case 'HEAD':
                $response = $this->head();
                break;
            case 'OPTIONS':
                $response = $this->options();
                break;
            default:
                $response = $this->error($method);
                break;
        }
        return $response;
    }

    protected function get() { return $this->defaultResponse("get"); }
    protected function put() { return $this->defaultResponse("put"); }
    protected function post() { return $this->defaultResponse("post"); }
    protected function delete() { return $this->defaultResponse("delete"); }
    protected function head() { return $this->defaultResponse("head"); }
    protected function options() { return $this->defaultResponse("options"); }

    private function error($method) {
        return array(
            "status" => self::ERROR,
            "body" => "bad request type : $method"
        );
    }

    private function defaultResponse($method) {
        return array(
            "status" => self::NOT_FOUND,
            "body" => "$method requests are not implemented on this url"
        );
    }
}


abstract class View {
    protected $Templator;

    function __construct($Templator) {
        $this->Templator = $Templator;
    }

    function render(array $data = array()) {
        return $this->Templator->render($this->template(), $data);
    }

    abstract protected function template();
}


class Index_View extends View {
    protected function template() {
        return '' .
        '<!DOCTYPE html>' .
        '<html lang="en">' .
        '<head>' .
            '<meta charset="utf-8">' .
            '<title>{{title}}</title>' .
            '{{#css}}' .
                '<link href="{{.}}" rel="stylesheet">' .
            '{{/css}}' .
        '</head>' .
        '<body>' .
            '<h1>Hello</h1>' .
            '<div id="board"></div>' .
            '{{#js}}' .
                '<script src="{{.}}"></script>' .
            '{{/js}}' .
        '</body>' .
        '</html>';
    }
}


class Index_Controller extends Controller {
    private $View;

    function __construct(array $fig = array()) {
        $this->View = $fig['view'];
    }

    protected function get() {
        return array(
            "status" => self::OK,
            "body" => $this->View->render($this->pageData())
        );
    }

    private function pageData() {
        $path = "js/";
        $libPath = $path . "lib/";
        return array(
            "title" => "Chess",
            "css" => array("css/style.css"),
            "js" => array(
                $libPath . "jquery-2.0.3.js",
                $libPath . "underscore.js",
                $libPath . "mustache.js",
                $libPath . "jsmessage.js",
                $libPath . "log.js",
                $libPath . "draw.js",
                $path . "execute.js"
            )
        );
    }
}
?>
