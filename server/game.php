<?php
class Game_Controller extends Controller {
    private $gameId, $gameModel;

    function __construct(array $fig = array()) {
        $this->gameId = tryArray($fig, 'gameId');
        $this->gameModel = $fig['gameModel'];

    }

    protected function get() {
        try {
            $body = $this->gameModel->load($this->gameId);
            $status = $body ? self::OK : self::NOT_FOUND;
        }
        catch(Game_Exception $e) {
            $body = $e->getMessage();
            $status = self::ERROR;
        }
        return array("status" => $status, "body" => json_encode($body, true));
    }

    protected function post() {
        try {
            $body = $this->gameModel->save();
            $status = self::OK;
        }
        catch(Game_Exception $e) {
            $body = $e->getMessage();
            $status = self::ERROR;
        }
        return array("status" => $status, "body" => json_encode($body));
    }
}

class Game_Exception extends Exception {}

class Game {
    private $sql, $board, $side;

    function __construct(array $fig = array()) {
        $this->sql = $fig['sql'];
        $this->board = tryArray($fig, 'board');
        $this->side = tryArray($fig, 'side');
    }

    function load($gameId) {
        if($gameId) {
            return $this->sql->selectOne('Chess_Game', array('id' => $gameId));
        }
        else {
            throw new Game_Exception('missing data');
        }
    }

    function save() {
        if($this->board && $this->side) {
            $id = uniqueId(5);
            $this->sql->insert('Chess_Game', array(
                'id' => $id,
                'board' => $this->board,
                'side' => $this->side,
                'time_stamp' => date('Y-m-d H:i:s')
            ));
            return $id;
        }
        else {
            throw new Game_Exception('missing data');
        }
    }
}
?>