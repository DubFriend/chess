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
?>
