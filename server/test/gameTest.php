<?php
require 'sequel.php';
require 'base.php';
require 'game.php';


class Mock_Game_Model {
    public $isThrowOnSave = false,
           $isThrowOnLoad = false,
           $isLoadResults = true;

    function save() {
        if(!$this->isThrowOnSave) {
            return 'saveId';
        }
        else {
            throw new Game_Exception('mock game exception');
        }
    }

    function load($gameId) {
        if(!$this->isThrowOnLoad) {
            if($this->isLoadResults) {
                return 'id:' . $gameId;
            }
            else {
                return false;
            }
        }
        else {
            throw new Game_Exception('mock game exception');
        }
    }
}


class Game_Controller_Test extends PHPUnit_Framework_TestCase {

    private function buildController(array $fig = array()) {
        $model = new Mock_Game_Model();
        $model->isThrowOnLoad = tryArray($fig, 'throwOnLoad', false);
        $model->isThrowOnSave = tryArray($fig, 'throwOnSave', false);
        $model->isLoadResults = tryArray($fig, 'loadResults', true);
        return new Game_Controller(array(
            'gameModel' => $model,
            'gameId' => tryArray($fig, 'gameId', 'abcde')
        ));
    }

    function test_get_ok() {
        $ctl = $this->buildController();
        $this->assertEquals(
            array('status'=>Game_Controller::OK, 'body'=>json_encode('id:abcde')),
            $ctl->respond('GET')
        );
    }

    function test_get_exception_on_load() {
        $ctl = $this->buildController(array('throwOnLoad' => true));
        $this->assertEquals(
            array('status'=>Game_Controller::ERROR, 'body'=>json_encode('mock game exception')),
            $ctl->respond("GET")
        );
    }

    function test_get_not_found() {
        $ctl = $this->buildController(array('loadResults' => false));
        $this->assertEquals(
            array('status'=>Game_Controller::NOT_FOUND, 'body'=>json_encode(false)),
            $ctl->respond('GET')
        );
    }

    function test_post_ok() {
        $ctl = $this->buildController();
        $this->assertEquals(
            array('status'=>Game_Controller::OK, 'body'=>json_encode('saveId')),
            $ctl->respond('POST')
        );
    }

    function test_post_exception_on_save() {
        $ctl = $this->buildController(array('throwOnSave' => true));
        $this->assertEquals(
            array('status'=>Game_Controller::ERROR, 'body'=>json_encode('mock game exception')),
            $ctl->respond('POST')
        );
    }
}


class New_Conversation_Model_Test extends PHPUnit_Framework_TestCase {
    private $sql, $defaultRow, $model;

    function setUp() {
        $database = new PDO("sqlite::memory:");
        $database->exec(
            'CREATE TABLE IF NOT EXISTS Chess_Game (
                id CHAR(5) PRIMARY KEY,
                board VARCHAR(1000),
                side CHAR(1),
                time_stamp DATETIME
            )'
        );
        $this->sql = new Sequel($database);
        $this->timeStamp = date('Y-m-d H:i:s');
        $this->defaultRow = array(
            'id' => 'abcde',
            'board' => 'defaultBoard',
            'side' => 'a',
            'time_stamp' => $this->timeStamp
        );
        $this->sql->insert('Chess_Game', $this->defaultRow);
        $this->model = $this->buildModel();
    }

    private function buildModel(array $fig = array()) {
        return new Game(array(
            'sql' => $this->sql,
            'board' => tryArray($fig, 'board', 'boardData'),
            'side' => tryArray($fig, 'side', 'b')
        ));
    }

    function test_load() {
        $this->assertEquals($this->defaultRow, $this->model->load('abcde'));
    }

    function test_load_no_results() {
        $this->assertEquals(false, $this->model->load('wrong'));
    }

    /**
     * @expectedException Game_Exception
     */
    function test_load_no_id() {
        $this->model->load(null);
    }

    function test_save_returns_insert_id() {
        $returnId = $this->model->save();
        $id = $this->sql->selectOne('Chess_Game', array('side' => 'b'))['id'];
        $this->assertEquals($id, $returnId);
    }

    function test_save_validate_id() {
        $this->assertEquals(1, preg_match('/^[a-zA-Z0-9]{5}$/', $this->model->save()));
    }

    function test_save_generates_unique_id() {
        $this->assertTrue($this->model->save() != $this->model->save());
    }

    function test_save_inserts_data() {
        $id = $this->model->save();
        $row = $this->sql->selectOne('Chess_Game', array('side' => 'b'));
        $this->assertEquals(
            array(
                'id' => $id,
                'board' => 'boardData',
                'side' => 'b',
                'time_stamp' => date('Y-m-d H:i:s')
            ),
            $row
        );
    }

    /**
     * @expectedException Game_Exception
     */
    function test_save_no_board() {
        $model = $this->buildModel(array('board' => null));
        $model->save();
    }

    /**
     * @expectedException Game_Exception
     */
    function test_save_no_side() {
        $model = $this->buildModel(array('side' => null));
        $model->save();
    }
}




?>