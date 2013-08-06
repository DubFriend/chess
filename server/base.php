<?php
abstract class Controller {
    const OK = "200";
    const UNAUTHORIZED = "401";
    const NOT_FOUND = "404";
    const ERROR = "500";

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


class Index_View {
    private $Templator;

    function __construct($Templator) {
        $this->Templator = $Templator;
    }

    function render(array $data = array()) {
        return $this->Templator->render($this->template(), $data);
    }

    protected function template() {
        return '
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>{{title}}</title>
            <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
            <link rel="icon" href="favicon.ico" type="image/x-icon">
            {{#css}}
                <link href="{{.}}" rel="stylesheet">
            {{/css}}
        </head>

        <body>

            <div class="modal fade" id="select-piece-black">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">Promote Pawn</h4>
                        </div>
                        <div class="modal-body">
                            {{#black-pieces}}
                                <a id="{{id}}" href="#">
                                    <img src="{{src}}" class="img-thumbnail">
                                </a>
                            {{/black-pieces}}
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="select-piece-white">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">Promote Pawn</h4>
                        </div>
                        <div class="modal-body">
                            {{#white-pieces}}
                                <img id="{{id}}" src="{{src}}">
                            {{/white-pieces}}
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="display-winner">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title"></h2>
                        </div>
                    </div>
                </div>
            </div>

            <div id="board"></div>

            <div id="controls">

                <div class="well">
                    <div class="row">
                        <div id="status-indicator" class="col-12">New Game</div>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <button id="undo" class="btn btn-default btn-block">
                                Undo Move
                            </button>
                        </div>
                        <div class="col-6">
                            <button id="redo" class="btn btn-default btn-block">
                                Redo Move
                            </button>
                        </div>
                    </div>
                </div>

                <div class="well">

                    <div class="row">
                        <div class="col-4">
                            <button id="new-game" class="btn btn-primary btn-block">
                                New Game
                            </button>
                        </div>
                        <div class="col-4">
                            <button id="save-game" class="btn btn-default btn-block" data-loading-text="Saving...">
                                Save Game
                            </button>
                        </div>
                        <div class="col-4">
                            <p><b>id:</b><span id="game-id"></span></p>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-6">
                            <input id="game-load-id" type="text" class="form-control"
                                   placeholder="Game Id">
                        </div>
                        <div class="col-6">
                            <button id="load-game" class="btn btn-default" data-loading-text="Loading...">
                                Load Game
                            </button>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-12">
                            <div class="checkbox">
                                <label>
                                    <input
                                        id="is-change-orientation"
                                        type="checkbox" value="" checked>
                                    Change Orientation On Move?
                                </label>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
            {{#js}}
                <script src="{{.}}"></script>
            {{/js}}
        </body>
        </html>';
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

    private function getJs() {
        $path = "js/";
        $libPath = $path . "lib/";
        $chess = "chessboard-0.1.0";
        if(DEPLOYMENT === "development") {
            return array(
                $libPath . "jquery-2.0.3.js",
                $libPath . "underscore.js",
                $libPath . "bootstrap.js",
                $libPath . "mustache.js",
                $libPath . "jsmessage.js",
                $path . $chess . ".js",
                $path . "global.js",
                $path . "controller.js",
                $path . "board.js",
                $path . "piece.js",
                $path . "execute.js"
            );
        }
        else {
            return array(
                $libPath . "jquery-2.0.3.js",
                $libPath . "underscore.js",
                $libPath . "mustache.js",
                "chess.min.js"
            );
        }
    }

    private function pageData() {
        $path = "js/";
        $libPath = $path . "lib/";
        $chess = "chessboard-0.1.0";
        $imgPath = "img/chesspieces/wikipedia/";
        return array(
            "title" => "Chess",
            "css" => array(
                "css/style.css",
                "css/" . $chess . ".css",
                "css/bootstrap.css"
            ),
            "js" => $this->getJs(),
            "black-pieces" => array(
                array("src" => $imgPath . "bQ.png", "id" => "bQ"),
                array("src" => $imgPath . "bN.png", "id" => "bN")
            ),
            "white-pieces" => array(
                array("src" => $imgPath . "wQ.png", "id" => "wQ"),
                array("src" => $imgPath . "wN.png", "id" => "wN")
            )
        );
    }
}
?>
