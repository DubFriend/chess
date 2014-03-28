<?php
//lightweight session wrapper.
class Session {
    function start() {
        session_start();
    }

    function get($key) {
        return isset($_SESSION[$key]) ? $_SESSION[$key] : null;
    }

    function set($key, $value) {
        $_SESSION[$key] = $value;
    }

    function destroy() {
        if($_SESSION) {
            $_SESSION = array();
            if(session_id() != ""  ||  isset($_COOKIE[session_name()])) {
                setcookie(session_name(), '', time() - 2592000, '/');
            }
            session_unset();
            session_destroy();
        }
    }

    function regenerate() {
        session_regenerate_id();
    }
}

class Clock {
    function time() {
        return time();
    }

    function sleep($microseconds) {
        usleep($microseconds);
    }
}

class Timer {
    private $log = array();

    const START = "START@^%#", //using unusual constants to avoid name collision
          END = "END@^%#";

    //add current time to the log
    //(note that system reserves )START and END as marker names)
    function mark($marker = null) {
        $time = microtime(true);
        $this->log[] = array(
            "time" => $time,
            "marker" => $marker
        );
        return $time;
    }

    function start() {
        return $this->mark(self::START);
    }

    function stop() {
        return $this->mark(self::END);
    }

    //return results of log, running totals, etc.
    function data() {}
    //return formatted string. (html, plain)
    function display($format = "plain") {}
}

function tryArray(array $array, $key, $default = null) {
    return array_key_exists($key, $array) ? $array[$key] : $default;
}

//will return a string with $trail removed, if $trail is on the end of the string
function removeTrailing($string, $trail) {
    if(substr($string, strlen($trail) * -1) === $trail) {
        return substr($string, 0, strlen($string) - strlen($trail));
    }
    else return $string;
}

function arrayByColumn($array, $columnName) {
    $column = array();
    foreach($array as $subArray) {
        $column[] = tryArray($subArray, $columnName);
    }
    return $column;
}

function debug($message) {
    if(IS_DEBUG_MESSAGES_ON) {
        $output = "";
        switch(DEBUG_OUTPUT_TYPE) {
            case "command_line":
                $output = "\n\tDEBUG : $message\n";
                break;
            case "html":
                $output = "<p><b style='color:red;'>DEBUG : </b>$message</p>";
                break;
            default:
                throw new Exception("invalid DEBUG_OUTPUT_TYPE value");
        }
        echo $output;
    }
}

//input:  string
//output: sanitized string, safer to use within the application
//        NOTE: not prepped for database insertion!
function sanitize ($var) {
    $var = strip_tags($var);
    $var = stripcslashes($var);
    return $var;
}

function sanitizeArray ($array) {
    $cleanArray = array();
    if(is_array($array)) {
        foreach($array as $key => $value) {
            if(is_array($value)) {
                $cleanArray[$key] = sanitizeArray($value);
            }
            else {
                $cleanArray[$key] = sanitize($value);
            }
        }
    }
    return $cleanArray;
}

function uniqueId ($len = 8) {
    $hex = md5("sillyputty" . uniqid("", true));
    $pack = pack('H*', $hex);
    $uid = base64_encode($pack);
    $uid = preg_replace("/[^A-Za-z0-9]/", "", $uid);
    while(strlen($uid) < $len) {
        $uid = $uid . gen_uuid(22);
    }
    return substr($uid, 0, $len);
}
?>
