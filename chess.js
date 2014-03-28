(function () {

// _____________________________________________________________________________
//
// ---------------------------   jsMessage   -----------------------------------
//
// jsMessage provides mixins for publish/subscribe, and event binding patterns.
//
// Author : Brian Detering | BDeterin@gmail.com | BrianDetering.net
// GitHub : github.com/DubFriend/jsmessage

(function () {
"use strict";

// ----------------- Underscore Subset, renamed to "lib" -----------------------
//     Underscore.js 1.5.1
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

// Establish the object that gets returned to break out of a loop iteration.
var breaker = {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

// Create quick reference variables for speed access to core prototypes.
var push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.
var nativeForEach      = ArrayProto.forEach,
    nativeFilter       = ArrayProto.filter;

var lib = {};

// The cornerstone, an `each` implementation, aka `forEach`.
// Handles objects with the built-in `forEach`, arrays, and raw objects.
// Delegates to **ECMAScript 5**'s native `forEach` if available.
lib.each = function (obj, iterator, context) {
    if (obj == null) {
        return;
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    }
    else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) {
                return;
            }
        }
    }
    else {
        for (var key in obj) {
            if (lib.has(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === breaker) {
                    return;
                }
            }
        }
    }
};

// Return all the elements that pass a truth test.
// Delegates to **ECMAScript 5**'s native `filter` if available.
lib.filter = function (obj, iterator, context) {
    var results = [];
    if (obj == null) {
        return results;
    }
    if (nativeFilter && obj.filter === nativeFilter) {
        return obj.filter(iterator, context);
    }
    lib.each(obj, function(value, index, list) {
        if (iterator.call(context, value, index, list)) {
            results.push(value);
        }
    });
    return results;
};

lib.isFunction = function(obj) {
    return typeof obj === 'function';
};

// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
lib.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
};


//--------------------------- end underscore -----------------------------------



var messaging = {};
//attache to the global object, or to exports (for nodejs)
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = messaging;
    }
    exports.jsMessage = messaging;
}
else {
    if(this.jsMessage === undefined) {
        this.jsMessage = messaging;
    }
    else {
        throw "jsMessage is allready defined";
    }
}


messaging.mixinPubSub = function (object) {
    object = object || {};
    var subscribers = {},
        universalSubscribers = [];

    object.subscribe = function (topic, callback) {
        if(topic) {
            subscribers[topic] = subscribers[topic] || [];
            subscribers[topic].push(callback);
        }
        else {
            universalSubscribers.push(callback);
        }
    };

    object.unsubscribe = function (subscriber, topic) {
        var filter = function (topic) {
            return lib.filter(subscribers[topic], function (callback) {
                return callback !== subscriber;
            });
        };

        if(topic) {
            if(subscribers[topic]) {
                subscribers[topic] = filter(topic);
            }
            else {
                throw "topic not found";
            }
        }
        else {
            lib.each(subscribers, function (values, topic) {
                subscribers[topic] = filter(topic);
            });
            universalSubscribers = lib.filter(universalSubscribers, function (callback) {
                return callback !== subscriber;
            });
        }
    };

    object.publish = function (topic, data) {
        if(topic) {
            lib.each(subscribers[topic], function (callback) {
                callback(data);
            });
        }
        else {
            lib.each(subscribers, function (values, topic) {
                lib.each(values, function (callback) {
                    if(callback) {
                        callback(data);
                    }
                });
            });
        }
        lib.each(universalSubscribers, function (callback) {
            callback(data);
        });
    };

    object.autoPublish = function (topic, publishMap) {
        var data, that = this;
        //if setData provided, then sets data and publishes it.
        //otherwise just gets the data.
        return function (setData) {
            var publishData;
            if(setData === undefined) {
                return data;
            }
            else {
                data = setData;
                publishData = publishMap ? publishMap(setData) : setData;
                that.publish(topic, publishData);
            }
        };
    };

    return object;
};


messaging.mixinEvents = function (object, argumentGenerators) {
    var bindings = {},
        argGen = argumentGenerators || {};

    //wrap each function of the object with its trigger.
    lib.each(object, function (property, name) {
        if(lib.isFunction(property)) {
            object[name] = function () {
                var callbackArg,
                    returnValue = property.apply(object, arguments);

                if(bindings[name]) {
                    if(argGen[name]) {
                        callbackArg = argGen[name].apply(object, [returnValue]);
                    }
                    lib.each(bindings[name], function (callback) {
                        callback(callbackArg);
                    });
                }

                return returnValue;
            };
        }
    });

    object.on = function (event, callback) {
        bindings[event] = bindings[event] || [];
        bindings[event].push(callback);
    };

    object.off = function (event, callback) {
        if(callback) {
            bindings[event] = lib.filter(bindings[event], function (subscriber) {
                return subscriber !== callback;
            });
        }
        else {
            bindings[event] = undefined;
        }
    };

    return object;
};

}).call(this);

/*!
 * ChessBoardJS v0.1.0
 *
 * Copyright 2013 Chris Oakman
 * Released under the MIT license
 * http://chessboardjs.com/license
 *
 * Date: 21 Jul 2013
 */

// start anonymous scope
;(function() {
'use strict';

//------------------------------------------------------------------------------
// Chess Util Functions
//------------------------------------------------------------------------------
var COLUMNS = 'abcdefgh'.split('');

var validMove = function(move) {
  // move should be a string
  if (typeof move !== 'string') return false;

  // move should be in the form of "e2-e4", "f6-d5"
  var tmp = move.split('-');
  if (tmp.length !== 2) return false;

  return (validSquare(tmp[0]) === true && validSquare(tmp[1]) === true);
};

var validSquare = function(square) {
  if (typeof square !== 'string') return false;
  return (square.search(/^[a-h][1-8]$/) !== -1);
};

var validPieceCode = function(code) {
  if (typeof code !== 'string') return false;
  return (code.search(/^[bw][KQRNBP]$/) !== -1);
};

var validFen = function(fen) {
  if (typeof fen !== 'string') return false;

  // FEN should be at least 8 sections separated by slashes
  var chunks = fen.split('/');
  if (chunks.length < 8) return false;

  // check the piece sections
  for (var i = 0; i < 8; i++) {
    if (chunks[i] === '' ||
        chunks[i].length > 8 ||
        chunks[i].search(/[^kqrbnpKQRNBP1-8]/) !== -1) {
      return false;
    }
  }

  return true;
};

var validPositionObject = function(pos) {
  if (typeof pos !== 'object') return false;

  for (var i in pos) {
    if (pos.hasOwnProperty(i) !== true) continue;

    if (validSquare(i) !== true || validPieceCode(pos[i]) !== true) {
      return false;
    }
  }

  return true;
};

// convert FEN piece code to bP, wK, etc
var fenToPieceCode = function(piece) {
  // black piece
  if (piece.toLowerCase() === piece) {
    return 'b' + piece.toUpperCase();
  }

  // white piece
  return 'w' + piece.toUpperCase();
};

// convert bP, wK, etc code to FEN structure
var pieceCodeToFen = function(piece) {
  var tmp = piece.split('');

  // white piece
  if (tmp[0] === 'w') {
    return tmp[1].toUpperCase();
  }

  // black piece
  return tmp[1].toLowerCase();
};

// convert FEN string to position object
// returns false if the FEN string is invalid
var fenToObj = function(fen) {
  if (validFen(fen) !== true) {
    return false;
  }

  var rows = fen.split('/');
  var position = {};

  var currentRow = 8;
  for (var i = 0; i < 8; i++) {
    var row = rows[i].split('');
    var colIndex = 0;

    // loop through each character in the FEN section
    for (var j = 0; j < row.length; j++) {
      // number / empty squares
      if (row[j].search(/[1-8]/) !== -1) {
        var emptySquares = parseInt(row[j], 10);
        colIndex += emptySquares;
      }
      // piece
      else {
        var square = COLUMNS[colIndex] + currentRow;
        position[square] = fenToPieceCode(row[j]);
        colIndex++;
      }
    }

    currentRow--;
  }

  return position;
};

// position object to FEN string
// returns false if the obj is not a valid position object
var objToFen = function(obj) {
  if (validPositionObject(obj) !== true) {
    return false;
  }

  var fen = '';

  var currentRow = 8;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var square = COLUMNS[j] + currentRow;

      // piece exists
      if (obj.hasOwnProperty(square) === true) {
        fen += pieceCodeToFen(obj[square]);
      }

      // empty space
      else {
        fen += '1';
      }
    }

    if (i !== 7) {
      fen += '/';
    }

    currentRow--;
  }

  // squeeze the numbers together
  // haha, I love this solution...
  fen = fen.replace(/11111111/g, '8');
  fen = fen.replace(/1111111/g, '7');
  fen = fen.replace(/111111/g, '6');
  fen = fen.replace(/11111/g, '5');
  fen = fen.replace(/1111/g, '4');
  fen = fen.replace(/111/g, '3');
  fen = fen.replace(/11/g, '2');

  return fen;
};

window['ChessBoard'] = window['ChessBoard'] || function(containerElOrId, cfg) {
'use strict';

cfg = cfg || {};

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

var MINIMUM_JQUERY_VERSION = '1.7.0',
  START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
  START_POSITION = fenToObj(START_FEN);

// use unique class names to prevent clashing with anything else on the page
// and simplify selectors
var CSS = {
  alpha: 'alpha-d2270',
  black: 'black-3c85d',
  board: 'board-b72b1',
  chessboard: 'chessboard-63f37',
  clearfix: 'clearfix-7da63',
  highlight1: 'highlight1-32417',
  highlight2: 'highlight2-9c5d2',
  notation: 'notation-322f9',
  numeric: 'numeric-fc462',
  piece: 'piece-417db',
  row: 'row-5277c',
  sparePieces: 'spare-pieces-7492f',
  sparePiecesBottom: 'spare-pieces-bottom-ae20f',
  sparePiecesTop: 'spare-pieces-top-4028b',
  square: 'square-55d63',
  white: 'white-1e1d7'
};

//------------------------------------------------------------------------------
// Module Scope Variables
//------------------------------------------------------------------------------

// DOM elements
var containerEl,
  boardEl,
  draggedPieceEl,
  sparePiecesTopEl,
  sparePiecesBottomEl;

// constructor return object
var widget = {};

//------------------------------------------------------------------------------
// Stateful
//------------------------------------------------------------------------------

var ANIMATION_HAPPENING = false,
  BOARD_BORDER_SIZE = 2,
  CURRENT_ORIENTATION = 'white',
  CURRENT_POSITION = {},
  SQUARE_SIZE,
  DRAGGED_PIECE,
  DRAGGED_PIECE_LOCATION,
  DRAGGED_PIECE_SOURCE,
  DRAGGING_A_PIECE = false,
  SPARE_PIECE_ELS_IDS = {},
  SQUARE_ELS_IDS = {},
  SQUARE_ELS_OFFSETS;

//------------------------------------------------------------------------------
// JS Util Functions
//------------------------------------------------------------------------------

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
var createId = function() {
  return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function(c) {
    var r = Math.random() * 16 | 0;
    return r.toString(16);
  });
};

var deepCopy = function(thing) {
  return JSON.parse(JSON.stringify(thing));
};

var parseSemVer = function(version) {
  var tmp = version.split('.');
  return {
    major: parseInt(tmp[0], 10),
    minor: parseInt(tmp[1], 10),
    patch: parseInt(tmp[2], 10)
  };
};

// returns true if version is >= minimum
var compareSemVer = function(version, minimum) {
  version = parseSemVer(version);
  minimum = parseSemVer(minimum);

  var versionNum = (version.major * 10000 * 10000) +
    (version.minor * 10000) + version.patch;
  var minimumNum = (minimum.major * 10000 * 10000) +
    (minimum.minor * 10000) + minimum.patch;

  return (versionNum >= minimumNum);
};

//------------------------------------------------------------------------------
// Validation / Errors
//------------------------------------------------------------------------------

var error = function(code, msg, obj) {
  // do nothing if showErrors is not set
  if (cfg.hasOwnProperty('showErrors') !== true ||
      cfg.showErrors === false) {
    return;
  }

  var errorText = 'ChessBoard Error ' + code + ': ' + msg;

  // print to console
  if (cfg.showErrors === 'console' &&
      typeof console === 'object' &&
      typeof console.log === 'function') {
    console.log(errorText);
    if (arguments.length >= 2) {
      console.log(obj);
    }
    return;
  }

  // alert errors
  if (cfg.showErrors === 'alert') {
    if (obj) {
      errorText += '\n\n' + JSON.stringify(obj);
    }
    window.alert(errorText);
    return;
  }

  // custom function
  if (typeof cfg.showErrors === 'function') {
    cfg.showErrors(code, msg, obj);
  }
};

// check dependencies
var checkDeps = function() {
  // if containerId is a string, it must be the ID of a DOM node
  if (typeof containerElOrId === 'string') {
    // cannot be empty
    if (containerElOrId === '') {
      window.alert('ChessBoard Error 1001: ' +
        'The first argument to ChessBoard() cannot be an empty string.' +
        '\n\nExiting...');
      return false;
    }

    // make sure the container element exists in the DOM
    var el = document.getElementById(containerElOrId);
    if (! el) {
      window.alert('ChessBoard Error 1002: Element with id "' +
        containerElOrId + '" does not exist in the DOM.' +
        '\n\nExiting...');
      return false;
    }

    // set the containerEl
    containerEl = $(el);
  }

  // else it must be something that becomes a jQuery collection
  // with size 1
  // ie: a single DOM node or jQuery object
  else {
    containerEl = $(containerElOrId);

    if (containerEl.length !== 1) {
      window.alert('ChessBoard Error 1003: The first argument to ' +
        'ChessBoard() must be an ID or a single DOM node.' +
        '\n\nExiting...');
      return false;
    }
  }

  // JSON must exist
  if (! window.JSON ||
      typeof JSON.stringify !== 'function' ||
      typeof JSON.parse !== 'function') {
    window.alert('ChessBoard Error 1004: JSON does not exist. ' +
      'Please include a JSON polyfill.\n\nExiting...');
    return false;
  }

  // check for a compatible version of jQuery
  if (! (typeof window.$ && $.fn && $.fn.jquery &&
      compareSemVer($.fn.jquery, MINIMUM_JQUERY_VERSION) === true)) {
    window.alert('ChessBoard Error 1005: Unable to find a valid version ' +
      'of jQuery. Please include jQuery ' + MINIMUM_JQUERY_VERSION + ' or ' +
      'higher on the page.\n\nExiting...');
    return false;
  }

  return true;
};

var validAnimationSpeed = function(speed) {
  if (speed === 'fast' || speed === 'slow') {
    return true;
  }

  if ((parseInt(speed, 10) + '') !== (speed + '')) {
    return false;
  }

  return (speed > 0);
};

// validate config / set default options
var expandConfig = function() {
  if (typeof cfg === 'string' || validPositionObject(cfg) === true) {
    cfg = {
      position: cfg
    };
  }

  // default for orientation is white
  if (cfg.orientation !== 'black') {
    cfg.orientation = 'white';
  }
  CURRENT_ORIENTATION = cfg.orientation;

  // default for showNotation is true
  if (cfg.showNotation !== false) {
    cfg.showNotation = true;
  }

  // default for draggable is false
  if (cfg.draggable !== true) {
    cfg.draggable = false;
  }

  // default for dropOffBoard is 'snapback'
  if (cfg.dropOffBoard !== 'trash') {
    cfg.dropOffBoard = 'snapback';
  }

  // default for sparePieces is false
  if (cfg.sparePieces !== true) {
    cfg.sparePieces = false;
  }

  // draggable must be true if sparePieces is enabled
  if (cfg.sparePieces === true) {
    cfg.draggable = true;
  }

  // default piece theme is wikipedia
  if (cfg.hasOwnProperty('pieceTheme') !== true ||
      (typeof cfg.pieceTheme !== 'string' &&
       typeof cfg.pieceTheme !== 'function')) {
    cfg.pieceTheme = 'img/chesspieces/wikipedia/{piece}.png';
  }

  // animation speeds
  if (cfg.hasOwnProperty('moveSpeed') !== true ||
      validAnimationSpeed(cfg.moveSpeed) !== true) {
    cfg.moveSpeed = 200;
  }
  if (cfg.hasOwnProperty('snapbackSpeed') !== true ||
      validAnimationSpeed(cfg.snapbackSpeed) !== true) {
    cfg.snapbackSpeed = 50;
  }
  if (cfg.hasOwnProperty('snapSpeed') !== true ||
      validAnimationSpeed(cfg.snapSpeed) !== true) {
    cfg.snapSpeed = 25;
  }
  if (cfg.hasOwnProperty('trashSpeed') !== true ||
      validAnimationSpeed(cfg.trashSpeed) !== true) {
    cfg.trashSpeed = 100;
  }

  // make sure position is valid
  if (cfg.hasOwnProperty('position') === true) {
    if (cfg.position === 'start') {
      CURRENT_POSITION = deepCopy(START_POSITION);
    }

    else if (validFen(cfg.position) === true) {
      CURRENT_POSITION = fenToObj(cfg.position);
    }

    else if (validPositionObject(cfg.position) === true) {
      CURRENT_POSITION = deepCopy(cfg.position);
    }

    else {
      error(7263, 'Invalid value passed to config.position.', cfg.position);
    }
  }

  return true;
};

//------------------------------------------------------------------------------
// DOM Misc
//------------------------------------------------------------------------------

// calculates square size based on the width of the container
// got a little CSS black magic here, so let me explain:
// get the width of the container element (could be anything), reduce by 1 for
// fudge factor, and then keep reducing until we find an exact mod 8 for
// our square size
var calculateSquareSize = function() {
  var containerWidth = parseInt(containerEl.css('width'), 10);

  // defensive, prevent infinite loop
  if (! containerWidth || containerWidth <= 0) {
    return 0;
  }

  // pad one pixel
  var boardWidth = containerWidth - 1;

  while (boardWidth % 8 !== 0 && boardWidth > 0) {
    boardWidth--;
  }

  return (boardWidth / 8);
};

// create random IDs for elements
var createElIds = function() {
  // squares on the board
  for (var i = 0; i < COLUMNS.length; i++) {
    for (var j = 1; j <= 8; j++) {
      var square = COLUMNS[i] + j;
      SQUARE_ELS_IDS[square] = square + '-' + createId();
    }
  }

  // spare pieces
  var pieces = 'KQRBNP'.split('');
  for (var i = 0; i < pieces.length; i++) {
    var whitePiece = 'w' + pieces[i];
    var blackPiece = 'b' + pieces[i];
    SPARE_PIECE_ELS_IDS[whitePiece] = whitePiece + '-' + createId();
    SPARE_PIECE_ELS_IDS[blackPiece] = blackPiece + '-' + createId();
  }
};

//------------------------------------------------------------------------------
// Markup Building Functions
//------------------------------------------------------------------------------

var buildBoardContainer = function() {
  var html = '<div class="' + CSS.chessboard + '">';

  if (cfg.sparePieces === true) {
    html += '<div class="' + CSS.sparePieces + ' ' +
      CSS.sparePiecesTop + '"></div>';
  }

  html += '<div class="' + CSS.board + '"></div>';

  if (cfg.sparePieces === true) {
    html += '<div class="' + CSS.sparePieces + ' ' +
      CSS.sparePiecesBottom + '"></div>';
  }

  html += '</div>';

  return html;
};

/*
var buildSquare = function(color, size, id) {
  var html = '<div class="' + CSS.square + ' ' + CSS[color] + '" ' +
  'style="width: ' + size + 'px; height: ' + size + 'px" ' +
  'id="' + id + '">';

  if (cfg.showNotation === true) {

  }

  html += '</div>';

  return html;
};
*/

var buildBoard = function(orientation) {
  if (orientation !== 'black') {
    orientation = 'white';
  }

  var html = '';

  // algebraic notation / orientation
  var alpha = deepCopy(COLUMNS);
  var row = 8;
  if (orientation === 'black') {
    alpha.reverse();
    row = 1;
  }

  var squareColor = 'white';
  for (var i = 0; i < 8; i++) {
    html += '<div class="' + CSS.row + '">';
    for (var j = 0; j < 8; j++) {
      var square = alpha[j] + row;

      html += '<div class="' + CSS.square + ' ' + CSS[squareColor] + '" ' +
        'style="width: ' + SQUARE_SIZE + 'px; height: ' + SQUARE_SIZE + 'px" ' +
        'id="' + SQUARE_ELS_IDS[square] + '" ' +
        'data-square="' + square + '">';

      if (cfg.showNotation === true) {
        // alpha notation
        if ((orientation === 'white' && row === 1) ||
            (orientation === 'black' && row === 8)) {
          html += '<div class="' + CSS.notation + ' ' + CSS.alpha + '">' +
            alpha[j] + '</div>';
        }

        // numeric notation
        if (j === 0) {
          html += '<div class="' + CSS.notation + ' ' + CSS.numeric + '">' +
            row + '</div>';
        }
      }

      html += '</div>'; // end .square

      squareColor = (squareColor === 'white' ? 'black' : 'white');
    }
    html += '<div class="' + CSS.clearfix + '"></div></div>';

    squareColor = (squareColor === 'white' ? 'black' : 'white');

    if (orientation === 'white') {
      row--;
    }
    else {
      row++;
    }
  }

  return html;
};

var buildPieceImgSrc = function(piece) {
  if (typeof cfg.pieceTheme === 'function') {
    return cfg.pieceTheme(piece);
  }

  if (typeof cfg.pieceTheme === 'string') {
    return cfg.pieceTheme.replace(/{piece}/g, piece);
  }

  // NOTE: this should never happen
  error(8272, 'Unable to build image source for cfg.pieceTheme.');
};

var buildPiece = function(piece, hidden, id) {
  var html = '<img src="' + buildPieceImgSrc(piece) + '" ';
  if (id && typeof id === 'string') {
    html += 'id="' + id + '" ';
  }
  html += 'alt="" ' +
  'class="' + CSS.piece + '" ' +
  'data-piece="' + piece + '" ' +
  'style="width: ' + SQUARE_SIZE + 'px;' +
  'height: ' + SQUARE_SIZE + 'px;';
  if (hidden === true) {
    html += 'display:none;';
  }
  html += '" />';

  return html;
};

var buildSparePieces = function(color) {
  var pieces = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'];
  if (color === 'black') {
    pieces = ['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];
  }

  var html = '';
  for (var i = 0; i < pieces.length; i++) {
    html += buildPiece(pieces[i], false, SPARE_PIECE_ELS_IDS[pieces[i]]);
  }

  return html;
};

//------------------------------------------------------------------------------
// Animations
//------------------------------------------------------------------------------

var animateSquareToSquare = function(src, dest, piece, completeFn) {
  // get information about the source and destination squares
  var srcSquareEl = $('#' + SQUARE_ELS_IDS[src]);
  var srcSquarePosition = srcSquareEl.offset();
  var destSquareEl = $('#' + SQUARE_ELS_IDS[dest]);
  var destSquarePosition = destSquareEl.offset();

  // create the animated piece and absolutely position it
  // over the source square
  var animatedPieceId = createId();
  $('body').append(buildPiece(piece, true, animatedPieceId));
  var animatedPieceEl = $('#' + animatedPieceId);
  animatedPieceEl.css({
    display: '',
    position: 'absolute',
    top: srcSquarePosition.top,
    left: srcSquarePosition.left
  });

  // remove original piece from source square
  srcSquareEl.find('img.' + CSS.piece).remove();

  // on complete
  var complete = function() {
    // add the "real" piece to the destination square
    destSquareEl.append(buildPiece(piece));

    // remove the animated piece
    animatedPieceEl.remove();

    // run complete function
    if (typeof completeFn === 'function') {
      completeFn();
    }
  };

  // animate the piece to the destination square
  var opts = {
    duration: cfg.moveSpeed,
    complete: complete
  };
  animatedPieceEl.animate(destSquarePosition, opts);
};

var animateSparePieceToSquare = function(piece, dest, completeFn) {
  var srcOffset = $('#' + SPARE_PIECE_ELS_IDS[piece]).offset();
  var destSquareEl = $('#' + SQUARE_ELS_IDS[dest]);
  var destOffset = destSquareEl.offset();

  // create the animate piece
  var pieceId = createId();
  $('body').append(buildPiece(piece, true, pieceId));
  var animatedPieceEl = $('#' + pieceId);
  animatedPieceEl.css({
    display: '',
    position: 'absolute',
    left: srcOffset.left,
    top: srcOffset.top
  });

  // on complete
  var complete = function() {
    // add the "real" piece to the destination square
    destSquareEl.find('img.' + CSS.piece).remove();
    destSquareEl.append(buildPiece(piece));

    // remove the animated piece
    animatedPieceEl.remove();

    // run complete function
    if (typeof completeFn === 'function') {
      completeFn();
    }
  };

  // animate the piece to the destination square
  var opts = {
    duration: cfg.moveSpeed,
    complete: complete
  };
  animatedPieceEl.animate(destOffset, opts);
};

// execute an array of animations
var doAnimations = function(a) {
  ANIMATION_HAPPENING = true;

  var numFinished = 0;
  var onFinish = function() {
    numFinished++;
    if (numFinished === a.length) {
      drawPositionInstant();
      ANIMATION_HAPPENING = false;
    }
  };

  for (var i = 0; i < a.length; i++) {
    // clear a piece
    if (a[i].type === 'clear') {
      $('#' + SQUARE_ELS_IDS[a[i].square] + ' img.' + CSS.piece)
        .fadeOut(cfg.trashSpeed, onFinish);
    }

    // add a piece (no spare pieces)
    // TODO: need to make this speed configurable
    if (a[i].type === 'add' && cfg.sparePieces !== true) {
      $('#' + SQUARE_ELS_IDS[a[i].square])
        .append(buildPiece(a[i].piece, true))
        .find('img.' + CSS.piece)
        .fadeIn('fast', onFinish);
    }

    // add a piece from a spare piece
    if (a[i].type === 'add' && cfg.sparePieces === true) {
      animateSparePieceToSquare(a[i].piece, a[i].square, onFinish);
    }

    // move a piece
    if (a[i].type === 'move') {
      animateSquareToSquare(a[i].source, a[i].destination, a[i].piece,
        onFinish);
    }
  }
};

// returns the distance between two squares
var squareDistance = function(s1, s2) {
  s1 = s1.split('');
  var s1x = COLUMNS.indexOf(s1[0]) + 1;
  var s1y = parseInt(s1[1], 10);

  s2 = s2.split('');
  var s2x = COLUMNS.indexOf(s2[0]) + 1;
  var s2y = parseInt(s2[1], 10);

  var xDelta = Math.abs(s1x - s2x);
  var yDelta = Math.abs(s1y - s2y);

  if (xDelta >= yDelta) return xDelta;
  return yDelta;
};

// returns an array of closest squares from square
var createRadius = function(square) {
  var squares = [];

  // calculate distance of all squares
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      var s = COLUMNS[i] + (j + 1);

      // skip the square we're starting from
      if (square === s) continue;

      squares.push({
        square: s,
        distance: squareDistance(square, s)
      });
    }
  }

  // sort by distance
  squares.sort(function(a, b) {
    return a.distance - b.distance;
  });

  // just return the square code
  var squares2 = [];
  for (var i = 0; i < squares.length; i++) {
    squares2.push(squares[i].square);
  }

  return squares2;
};

// returns the square of the closest instance of piece
// returns false if no instance of piece is found in position
var findClosestPiece = function(position, piece, square) {
  // create array of closest squares from square
  var closestSquares = createRadius(square);

  // search through the position in order of distance for the piece
  for (var i = 0; i < closestSquares.length; i++) {
    var s = closestSquares[i];

    if (position.hasOwnProperty(s) === true && position[s] === piece) {
      return s;
    }
  }

  return false;
};

// calculate an array of animations that need to happen in order to get
// from pos1 to pos2
var calculateAnimations = function(pos1, pos2) {
  // make copies of both
  pos1 = deepCopy(pos1);
  pos2 = deepCopy(pos2);

  var animations = [];
  var squaresMovedTo = {};

  // remove pieces that are the same in both positions
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    if (pos1.hasOwnProperty(i) === true && pos1[i] === pos2[i]) {
      delete pos1[i];
      delete pos2[i];
    }
  }

  // find all the "move" animations
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    var closestPiece = findClosestPiece(pos1, pos2[i], i);
    if (closestPiece !== false) {
      animations.push({
        type: 'move',
        source: closestPiece,
        destination: i,
        piece: pos2[i]
      });

      delete pos1[closestPiece];
      delete pos2[i];
      squaresMovedTo[i] = true;
    }
  }

  // add pieces to pos2
  for (var i in pos2) {
    if (pos2.hasOwnProperty(i) !== true) continue;

    animations.push({
      type: 'add',
      square: i,
      piece: pos2[i]
    })

    delete pos2[i];
  }

  // clear pieces from pos1
  for (var i in pos1) {
    if (pos1.hasOwnProperty(i) !== true) continue;

    // do not clear a piece if it is on a square that is the result
    // of a "move", ie: a piece capture
    if (squaresMovedTo.hasOwnProperty(i) === true) continue;

    animations.push({
      type: 'clear',
      square: i,
      piece: pos1[i]
    });

    delete pos1[i];
  }

  return animations;
};

//------------------------------------------------------------------------------
// Control Flow
//------------------------------------------------------------------------------

var clearBoardFade = function() {
  boardEl.find('img.' + CSS.piece).fadeOut(cfg.trashSpeed, function() {
    $(this).remove();
  });
};

var clearBoardInstant = function() {
  boardEl.find('img.' + CSS.piece).remove();
};

var drawPositionInstant = function() {
  clearBoardInstant();

  for (var i in CURRENT_POSITION) {
    if (CURRENT_POSITION.hasOwnProperty(i) !== true) continue;

    $('#' + SQUARE_ELS_IDS[i]).append(buildPiece(CURRENT_POSITION[i]));
  }
};

var drawBoard = function() {
  boardEl.html(buildBoard(CURRENT_ORIENTATION));
  drawPositionInstant();

  if (cfg.sparePieces === true) {
    if (CURRENT_ORIENTATION === 'white') {
      sparePiecesTopEl.html(buildSparePieces('black'));
      sparePiecesBottomEl.html(buildSparePieces('white'));
    }
    else {
      sparePiecesTopEl.html(buildSparePieces('white'));
      sparePiecesBottomEl.html(buildSparePieces('black'));
    }
  }
};

var animateToPosition = function(pos1, pos2) {
  doAnimations(calculateAnimations(pos1, pos2));
};

// given a position and a set of moves, return a new position
// with the moves executed
var calculatePositionFromMoves = function(position, moves) {
  position = deepCopy(position);

  for (var i in moves) {
    if (moves.hasOwnProperty(i) !== true) continue;

    // skip the move if the position doesn't have a piece on the source square
    if (position.hasOwnProperty(i) !== true) continue;

    var piece = position[i];
    delete position[i];
    position[moves[i]] = piece;
  }

  return position;
};

var setCurrentPosition = function(position) {
  var oldPos = deepCopy(CURRENT_POSITION);
  var newPos = deepCopy(position);
  var oldFen = objToFen(oldPos);
  var newFen = objToFen(newPos);

  // do nothing if no change in position
  if (oldFen === newFen) return;

  // run their onChange function
  if (cfg.hasOwnProperty('onChange') === true &&
    typeof cfg.onChange === 'function') {
    cfg.onChange(oldPos, newPos);
  }

  // update state
  CURRENT_POSITION = position;
};

var isXYOnSquare = function(x, y) {
  for (var i in SQUARE_ELS_OFFSETS) {
    if (SQUARE_ELS_OFFSETS.hasOwnProperty(i) !== true) continue;

    var s = SQUARE_ELS_OFFSETS[i];
    if (x >= s.left && x < s.left + SQUARE_SIZE &&
        y >= s.top && y < s.top + SQUARE_SIZE) {
      return i;
    }
  }

  return 'offboard';
};

// records the XY coords of every square into memory
var captureSquareOffsets = function() {
  SQUARE_ELS_OFFSETS = {};

  for (var i in SQUARE_ELS_IDS) {
    if (SQUARE_ELS_IDS.hasOwnProperty(i) !== true) continue;

    SQUARE_ELS_OFFSETS[i] = $('#' + SQUARE_ELS_IDS[i]).offset();
  }
};

var removeSquareHighlights = function() {
  boardEl.find('div.' + CSS.square)
    .removeClass(CSS.highlight1 + ' ' + CSS.highlight2);
};

var snapbackPiece = function() {
  // there is no "snapback" for spare pieces
  if (DRAGGED_PIECE_SOURCE === 'spare') {
    trashPiece();
    return;
  }

  removeSquareHighlights();

  // animation complete
  var complete = function() {
    drawPositionInstant();
    draggedPieceEl.css('display', 'none');
  };

  // get source square position
  var sourceSquarePosition =
    $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_SOURCE]).offset();

  // animate the piece to the target square
  var opts = {
    duration: cfg.snapbackSpeed,
    complete: complete
  };
  draggedPieceEl.animate(sourceSquarePosition, opts);

  // set state
  DRAGGING_A_PIECE = false;
};

var trashPiece = function() {
  removeSquareHighlights();

  // remove the source piece
  var newPosition = deepCopy(CURRENT_POSITION);
  delete newPosition[DRAGGED_PIECE_SOURCE];
  setCurrentPosition(newPosition);

  // redraw the position
  drawPositionInstant();

  // hide the dragged piece
  draggedPieceEl.fadeOut(cfg.trashSpeed);

  // set state
  DRAGGING_A_PIECE = false;
};

var dropPieceOnSquare = function(square) {
  removeSquareHighlights();

  // update position
  var newPosition = deepCopy(CURRENT_POSITION);
  delete newPosition[DRAGGED_PIECE_SOURCE];
  newPosition[square] = DRAGGED_PIECE;
  setCurrentPosition(newPosition);

  // get target square information
  var targetSquarePosition = $('#' + SQUARE_ELS_IDS[square]).offset();

  // animation complete
  var complete = function() {
    drawPositionInstant();
    draggedPieceEl.css('display', 'none');
  };

  // snap the piece to the target square
  var opts = {
    duration: cfg.snapSpeed,
    complete: complete
  };
  draggedPieceEl.animate(targetSquarePosition, opts);

  // set state
  DRAGGING_A_PIECE = false;
};

var beginDraggingPiece = function(source, piece, x, y) {
  // run their custom onDragStart function
  // their custom onDragStart function can cancel drag start
  if (typeof cfg.onDragStart === 'function' &&
      cfg.onDragStart(source, piece,
        deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION) === false) {
    return;
  }

  // set state
  DRAGGING_A_PIECE = true;
  DRAGGED_PIECE = piece;
  DRAGGED_PIECE_SOURCE = source;

  // if the piece came from spare pieces, location is offboard
  if (source === 'spare') {
    DRAGGED_PIECE_LOCATION = 'offboard';
  }
  else {
    DRAGGED_PIECE_LOCATION = source;
  }

  // capture the x, y coords of all squares in memory
  captureSquareOffsets();

  // create the dragged piece
  draggedPieceEl.attr('src', buildPieceImgSrc(piece))
    .css({
      display: '',
      position: 'absolute',
      left: x - (SQUARE_SIZE / 2),
      top: y - (SQUARE_SIZE / 2)
    });

  if (source !== 'spare') {
    // highlight the source square and hide the piece
    $('#' + SQUARE_ELS_IDS[source]).addClass(CSS.highlight1)
      .find('img.' + CSS.piece).css('display', 'none');
  }
};

var updateDraggedPiece = function(x, y) {
  // put the dragged piece over the mouse cursor
  draggedPieceEl.css({
    left: x - (SQUARE_SIZE / 2),
    top: y - (SQUARE_SIZE / 2)
  });

  // get location
  var location = isXYOnSquare(x, y);

  // do nothing if the location has not changed
  if (location === DRAGGED_PIECE_LOCATION) return;

  // remove highlight from previous square
  if (validSquare(DRAGGED_PIECE_LOCATION) === true) {
    $('#' + SQUARE_ELS_IDS[DRAGGED_PIECE_LOCATION])
      .removeClass(CSS.highlight2);
  }

  // add highlight to new square
  if (validSquare(location) === true) {
    $('#' + SQUARE_ELS_IDS[location]).addClass(CSS.highlight2);
  }

  // run onDragMove
  if (typeof cfg.onDragMove === 'function') {
    cfg.onDragMove(location, DRAGGED_PIECE_LOCATION,
      DRAGGED_PIECE_SOURCE, DRAGGED_PIECE,
      deepCopy(CURRENT_POSITION), CURRENT_ORIENTATION);
  }

  // update state
  DRAGGED_PIECE_LOCATION = location;
};

var stopDraggedPiece = function(location) {
  // determine what the action should be
  var action = 'drop';
  if (location === 'offboard' && cfg.dropOffBoard === 'snapback') {
    action = 'snapback';
  }
  if (location === 'offboard' && cfg.dropOffBoard === 'trash') {
    action = 'trash';
  }

  // run their onDrop function, which can potentially change the drop action
  if (cfg.hasOwnProperty('onDrop') === true &&
    typeof cfg.onDrop === 'function') {
    var newPosition = deepCopy(CURRENT_POSITION);

    // source piece is a spare piece and position is off the board
    if (DRAGGED_PIECE_SOURCE === 'spare' && location === 'offboard') {
      // position has not changed; do nothing
    }

    // source piece is a spare piece and position is on the board
    if (DRAGGED_PIECE_SOURCE === 'spare' && validSquare(location) === true) {
      // add the piece to the board
      newPosition[location] = DRAGGED_PIECE;
    }

    // source piece was on the board and position is off the board
    if (validSquare(DRAGGED_PIECE_SOURCE) === true && location === 'offboard') {
      // remove the piece from the board
      delete newPosition[DRAGGED_PIECE_SOURCE];
    }

    // source piece was on the board and position is on the board
    if (validSquare(DRAGGED_PIECE_SOURCE) === true &&
      validSquare(location) === true) {
      // move the piece
      delete newPosition[DRAGGED_PIECE_SOURCE];
      newPosition[location] = DRAGGED_PIECE;
    }

    var oldPosition = deepCopy(CURRENT_POSITION);

    var result = cfg.onDrop(DRAGGED_PIECE_SOURCE, location, DRAGGED_PIECE,
      newPosition, oldPosition, CURRENT_ORIENTATION);
    if (result === 'snapback' || result === 'trash') {
      action = result;
    }
  }

  // do it!
  if (action === 'snapback') {
    snapbackPiece();
  }
  else if (action === 'trash') {
    trashPiece();
  }
  else if (action === 'drop') {
    dropPieceOnSquare(location);
  }
};

//------------------------------------------------------------------------------
// Public Methods
//------------------------------------------------------------------------------

// clear the board
widget.clear = function(useAnimation) {
  widget.position({}, useAnimation);
};

/*
// get or set config properties
// TODO: write this, GitHub Issue #1
widget.config = function(arg1, arg2) {
  // get the current config
  if (arguments.length === 0) {
    return deepCopy(cfg);
  }
};
*/

// remove the widget from the page
widget.destroy = function() {
  // remove markup
  containerEl.html('');
  draggedPieceEl.remove();

  // remove event handlers
  containerEl.unbind();
};

// shorthand method to get the current FEN
widget.fen = function() {
  return widget.position('fen');
};

// flip orientation
widget.flip = function() {
  widget.orientation('flip');
};

/*
// TODO: write this, GitHub Issue #5
widget.highlight = function() {

};
*/

// move pieces
widget.move = function() {
  // no need to throw an error here; just do nothing
  if (arguments.length === 0) return;

  // collect the moves into an object
  var moves = {};
  for (var i = 0; i < arguments.length; i++) {
    // skip invalid arguments
    if (validMove(arguments[i]) !== true) {
      error(2826, 'Invalid move passed to the move method.', arguments[i]);
      continue;
    }

    var tmp = arguments[i].split('-');
    moves[tmp[0]] = tmp[1];
  }

  // calculate position from moves
  var newPos = calculatePositionFromMoves(CURRENT_POSITION, moves);

  // update the board
  widget.position(newPos);

  // return the new position object
  return newPos;
};

widget.orientation = function(arg) {
  // no arguments, return the current orientation
  if (arguments.length === 0) {
    return CURRENT_ORIENTATION;
  }

  // set to white or black
  if (arg === 'white' || arg === 'black') {
    CURRENT_ORIENTATION = arg;
    drawBoard();
    return;
  }

  // flip orientation
  if (arg === 'flip') {
    CURRENT_ORIENTATION = (CURRENT_ORIENTATION === 'white') ? 'black' : 'white';
    drawBoard();
    return;
  }

  error(5482, 'Invalid value passed to the orientation method.', arg);
};

widget.position = function(position, useAnimation) {
  // no arguments, return the current position
  if (arguments.length === 0) {
    return deepCopy(CURRENT_POSITION);
  }

  // get position as FEN
  if (typeof position === 'string' && position.toLowerCase() === 'fen') {
    return objToFen(CURRENT_POSITION);
  }

  // default for useAnimations is true
  if (useAnimation !== false) {
    useAnimation = true;
  }

  // start position
  if (typeof position === 'string' && position.toLowerCase() === 'start') {
    position = deepCopy(START_POSITION);
  }

  // convert FEN to position object
  if (validFen(position) === true) {
    position = fenToObj(position);
  }

  // validate position object
  if (validPositionObject(position) !== true) {
    error(6482, 'Invalid value passed to the position method.', position);
    return;
  }

  if (useAnimation === true) {
    // start the animation
    animateToPosition(CURRENT_POSITION, position);

    // set the new position
    setCurrentPosition(position);
  }
  // instant update
  else {
    setCurrentPosition(position);
    drawPositionInstant();
  }
};

widget.resize = function() {
  // calulate the new square size
  SQUARE_SIZE = calculateSquareSize();

  // set board width
  boardEl.css('width', (SQUARE_SIZE * 8) + 'px');

  // set drag piece size
  draggedPieceEl.css({
    height: SQUARE_SIZE,
    width: SQUARE_SIZE
  });

  // spare pieces
  if (cfg.sparePieces === true) {
    containerEl.find('div.' + CSS.sparePieces)
      .css('paddingLeft', (SQUARE_SIZE + BOARD_BORDER_SIZE) + 'px');
  }

  // redraw the board
  drawBoard();
};

// set the starting position
widget.start = function(useAnimation) {
  widget.position('start', useAnimation);
};

//------------------------------------------------------------------------------
// Browser Events
//------------------------------------------------------------------------------

var isTouchDevice = function() {
  return ('ontouchstart' in document.documentElement);
};

// reference: http://www.quirksmode.org/js/detect.html
var isMSIE = function() {
  return (navigator && navigator.userAgent &&
      navigator.userAgent.search(/MSIE/) !== -1);
};

var stopDefault = function(e) {
  e.preventDefault();
};

var mousedownSquare = function(e) {

  // do nothing if we're not draggable
  if (cfg.draggable !== true) return;

  var square = $(this).attr('data-square');

  // no piece on this square
  if (validSquare(square) !== true ||
      CURRENT_POSITION.hasOwnProperty(square) !== true) {
    return;
  }

  beginDraggingPiece(square, CURRENT_POSITION[square], e.pageX, e.pageY);
};

var touchstartSquare = function(e) {
  // do nothing if we're not draggable
  if (cfg.draggable !== true) return;

  var square = $(this).attr('data-square');

  // no piece on this square
  if (validSquare(square) !== true ||
      CURRENT_POSITION.hasOwnProperty(square) !== true) {
    return;
  }

  e = e.originalEvent;
  beginDraggingPiece(square, CURRENT_POSITION[square],
    e.changedTouches[0].pageX, e.changedTouches[0].pageY);
};

var mousedownSparePiece = function(e) {
  // do nothing if sparePieces is not enabled
  if (cfg.sparePieces !== true) return;

  var piece = $(this).attr('data-piece');

  beginDraggingPiece('spare', piece, e.pageX, e.pageY);
};

var touchstartSparePiece = function(e) {
  // do nothing if sparePieces is not enabled
  if (cfg.sparePieces !== true) return;

  var piece = $(this).attr('data-piece');

  e = e.originalEvent;
  beginDraggingPiece('spare', piece,
    e.changedTouches[0].pageX, e.changedTouches[0].pageY);
};

var mousemoveWindow = function(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  updateDraggedPiece(e.pageX, e.pageY);
};

var touchmoveWindow = function(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  // prevent screen from scrolling
  e.preventDefault();

  updateDraggedPiece(e.originalEvent.changedTouches[0].pageX,
    e.originalEvent.changedTouches[0].pageY);
};

var mouseupWindow = function(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  // get the location
  var location = isXYOnSquare(e.pageX, e.pageY);

  stopDraggedPiece(location);
};

var touchendWindow = function(e) {
  // do nothing if we are not dragging a piece
  if (DRAGGING_A_PIECE !== true) return;

  // get the location
  var location = isXYOnSquare(e.originalEvent.changedTouches[0].pageX,
    e.originalEvent.changedTouches[0].pageY);

  stopDraggedPiece(location);
};

//------------------------------------------------------------------------------
// Initialization
//------------------------------------------------------------------------------

var addEvents = function() {
  // prevent browser "image drag"
  $('body').on('mousedown mousemove', 'img.' + CSS.piece, stopDefault);

  // mouse drag pieces
  boardEl.on('mousedown', 'div.' + CSS.square, mousedownSquare);
  containerEl.on('mousedown', 'div.' + CSS.sparePieces + ' img.' + CSS.piece,
    mousedownSparePiece);

  // IE doesn't like the events on the window object, but other browsers
  // perform better that way
  if (isMSIE() === true) {
    // IE-specific prevent browser "image drag"
    document.ondragstart = function() { return false; };

    $('body').on('mousemove', mousemoveWindow);
    $('body').on('mouseup', mouseupWindow);
  }
  else {
    $(window).on('mousemove', mousemoveWindow);
    $(window).on('mouseup', mouseupWindow);
  }

  // touch drag pieces
  if (isTouchDevice() === true) {
    boardEl.on('touchstart', 'div.' + CSS.square, touchstartSquare);
    containerEl.on('touchstart', 'div.' + CSS.sparePieces + ' img.' + CSS.piece,
      touchstartSparePiece);
    $(window).on('touchmove', touchmoveWindow);
    $(window).on('touchend', touchendWindow);
  }
};

var initDom = function() {
  // build board and save it in memory
  containerEl.html(buildBoardContainer());
  boardEl = containerEl.find('div.' + CSS.board);

  if (cfg.sparePieces === true) {
    sparePiecesTopEl = containerEl.find('div.' + CSS.sparePiecesTop);
    sparePiecesBottomEl = containerEl.find('div.' + CSS.sparePiecesBottom);
  }

  // create the drag piece
  var draggedPieceId = createId();
  $('body').append(buildPiece('wP', true, draggedPieceId));
  draggedPieceEl = $('#' + draggedPieceId);

  // get the border size
  BOARD_BORDER_SIZE = parseInt(boardEl.css('borderLeftWidth'), 10);

  // set the size and draw the board
  widget.resize();
};

var init = function() {
  if (checkDeps() !== true ||
      expandConfig() !== true) return;

  // create unique IDs for all the elements we will create
  createElIds();

  initDom();
  addEvents();
};

// go time
init();

// return the widget object
return widget;

}; // end window.ChessBoard

// expose util functions
window.ChessBoard.fenToObj = fenToObj;
window.ChessBoard.objToFen = objToFen;

})(); // end anonymous wrapper

//utility functions added into the underscore namespace.
_.mixin({
    pad: function (num, val) {
        return this.map(this.range(num), function () {
            return val;
        });
    }
});

var PIECE = {
        king: "k",
        queen: "q",
        rook: "r",
        knight: "n",
        bishop: "b",
        pawn: "p"
    },

    SIDE = {
        black: "b",
        white: "w"
    };

(function () {
"use strict";
// ----------------------------- Piece Models ----------------------------------
// Piece Models understand how they can move in relation to the board and other
// pieces, but are not aware of board level rules (such as moving into check).
// Piece Models understand that other pieces are black or white, but not which
// type (king, rook, etc.) the other pieces are.

var pieceModel = {};
this.createPieceModel = pieceModel;

var createPieceModelBase = function (type, fig, my) {
    fig = fig || {};
    var that = {};

    that.side = function () {
        return my.side;
    };

    that.type = function () {
        return type;
    };

    // ! my.getMoves must be implemented by subclass.
    that.getMoves = function (coord, board) {
        my.tempBoard = board;
        var results = my.getMoves(coord);
        my.tempBoard = undefined;
        return results;
    };

    //temporarily stores board state, so we dont have to pass the board around
    //should be reset to undefined after every public method call that sets it.
    my.tempBoard = undefined;

    my.side = fig.side;

    my.isOnBoard = function (coord) {
        return coord.x >= 0 && coord.x < 8 && coord.y >= 0 && coord.y < 8;
    };

    var getSquare = function (coord) {
        if(my.isOnBoard(coord)) {
            return my.tempBoard[coord.y][coord.x];
        }
    };

    //returns null | PIECE.white | PIECE.black, depending on whats on the square.
    var sideOnSquare = function (coord) {
        var square = getSquare(coord);
        return square && square.side();
    };

    my.isOpponent = function (coord) {
        var a = sideOnSquare(coord),
            b = that.side();
        return (a === SIDE.white && b === SIDE.black ||
                a === SIDE.black && b === SIDE.white);
    };

    my.isAlly = function (coord) {
        return sideOnSquare(coord) === that.side();
    };

    var line = function (coord, advanceA, advanceB) {
        var a = advanceA(coord),
            b = advanceB(coord),
            isBlockedA = createIsProgressBlocked(),
            isBlockedB = createIsProgressBlocked(),
            moves = [];
        while(my.isOnBoard(a) && !isBlockedA(a)) {
            moves.push(a);
            a = advanceA(a);
        }
        while(my.isOnBoard(b) && !isBlockedB(b)) {
            moves.push(b);
            b = advanceB(b);
        }
        return moves;
    };

    var createIsProgressBlocked = function () {
        var stopProgress = false;
        return function (coord) {
            var isBlocked = false;
            if(stopProgress) {
                isBlocked = true;
            }
            else if(my.isAlly(coord)) {
                isBlocked = true;
            }
            else if(my.isOpponent(coord)) {
                stopProgress = true;
            }
            return isBlocked;
        };
    };

    my.advance = function (dx, dy, coord) {
        return { x: coord.x + dx, y: coord.y + dy };
    };

    var advance = function (dx, dy) {
        return _.partial(my.advance, dx, dy);
    };

    my.horizontal = function (coord) {
        return line(coord, advance(-1, 0), advance(1, 0));
    };

    my.vertical = function (coord) {
        return line(coord, advance(0, 1), advance(0, -1));
    };

    my.rising = function (coord) {
        return line(coord, advance(1, -1), advance(-1, 1));
    };

    my.falling = function (coord) {
        return line(coord, advance(1, 1), advance(-1, -1));
    };

    return that;
};


pieceModel.king = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.king, fig, my);

    that.isMoved = false;

    my.getMoves = function (coord) {
        return _.filter(
            _.map(
                [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,1],[-1,0],[-1,-1]],
                function (move) {
                    return my.advance(move[0], move[1], coord);
                }
            ),
            function (move) {
                return my.isOnBoard(move) && !my.isAlly(move);
            }
        );
    };

    return that;
};


pieceModel.queen = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.queen, fig, my);

    my.getMoves = function (coord) {
        return _.union(
            my.horizontal(coord),
            my.vertical(coord),
            my.rising(coord),
            my.falling(coord)
        );
    };

    return that;
};


pieceModel.rook = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.rook, fig, my);

    that.isMoved = false;

    my.getMoves = function (coord) {
        return _.union(my.horizontal(coord), my.vertical(coord));
    };

    return that;
};


pieceModel.bishop = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.bishop, fig, my);

    my.getMoves = function (coord) {
        return _.union(my.rising(coord), my.falling(coord));
    };

    return that;
};


pieceModel.knight = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.knight, fig, my);

    my.getMoves = function (coord) {
        return _.filter(
            _.map(
                [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
                function (move) {
                    return my.advance(move[0], move[1], coord);
                }
            ),
            function (coord) {
                return my.isOnBoard(coord) && !my.isAlly(coord);
            }
        );
    };

    return that;
};


pieceModel.pawn = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.pawn, fig, my),

        movesRaw = function (coord) {
            var moves = [], forward, homeRow;

            if(that.side() === SIDE.black) {
                forward = 1;
                homeRow = 1;
            }
            else {
                forward = -1;
                homeRow = 6;
            }

            moves.push({ x: coord.x, y: coord.y + forward });
            if(coord.y === homeRow) {
                moves.push({ x: coord.x, y: coord.y + forward * 2 });
            }

            return _.filter(moves, function (coord) {
                return ( my.isOnBoard(coord) &&
                        !my.isOpponent(coord) &&
                        !my.isAlly(coord) );
            });
        },

        attackMoves = function (coord) {
            var forward = that.side() === SIDE.black ? 1 : -1;
            return _.filter(
                [{ x: coord.x + 1, y: coord.y + forward },
                 { x: coord.x - 1, y: coord.y + forward }],
                my.isOpponent
            );
        };

    my.getMoves = function (coord) {
        return _.union(movesRaw(coord), attackMoves(coord));
    };

    that.isEnPassant = false;

    return that;
};

}).call(this);

// ---------------------------- Board Model ------------------------------------
// The board Model takes care of managing the state of the board, and handling,
// board level rules such as castling, moving into check, and en passant.  The
// Board Model should try to remain unaware of the types that each piece is (let
// the Piece Models handle piece specific Logic).
createBoardModel = function (fig) {
    "use strict";
    fig = fig || {};
    var that = jsMessage.mixinPubSub(),

        gameStack = (function () {
            var stack = [], redoStack = [];
            return {
                clear: function () {
                    stack = [];
                    redoStack = [];
                },
                push: function (data) {
                    stack.push(data);
                },
                undo: function () {
                    var current = stack.pop();
                    if(current) {
                        redoStack.push(current);
                        return _.last(stack);
                    }
                },
                redo: function () {
                    var oldState = redoStack.pop();
                    if(oldState) {
                        stack.push(oldState);
                        return _.last(stack);
                    }
                }
            };
        }()),

        extractBoardData = function (board) {
            return _.map(board, function (row) {
                return _.map(row, function (square) {
                    return square && { side: square.side(), type: square.type() };
                });
            });
        },

        buildGameFromData = function (boardData) {
            return _.map(boardData, function (row) {
                return _.map(row, function (square) {
                    if(square) {
                        var type = _.invert(PIECE)[square.type];
                        return createPieceModel[type]({ side: square.side });
                    }
                    else {
                        return null;
                    }
                });
            });
        },

        board = that.autoPublish("board", extractBoardData),

        side = that.autoPublish("side"),

        awaitingPawnPromotion = false,

        setupNewGameBoard = (function () {
            var homeRow = function (side) {
                    return _.map(
                        ['rook', 'knight', 'bishop', 'queen',
                         'king', 'bishop', 'knight', 'rook'],
                        function (type) {
                            return createPieceModel[type]({ side: side });
                        }
                    );
                },

                emptyRow = function () {
                    return _.pad(8, null);
                },

                rowOfPawns = function (side) {
                    return _.map(_.range(8), function () {
                        return createPieceModel.pawn({ side: side });
                    });
                };

            return function () {
                return [
                    homeRow(SIDE.black),
                    rowOfPawns(SIDE.black),
                    emptyRow(), emptyRow(), emptyRow(), emptyRow(),
                    rowOfPawns(SIDE.white),
                    homeRow(SIDE.white)
                ];
            };
        }()),

        cloneBoard = function (board) {
            return _.map(board, function (row) {
                return _.map(row, function (square) {
                    var type;
                    if(square) {
                        type = _.invert(PIECE)[square.type()];
                        return createPieceModel[type]({ side: square.side() });
                    }
                    else {
                        return null;
                    }
                });
            });
        },

        getPiece = function (coord, optBoard) {
            if(optBoard) {
                return optBoard[coord.y][coord.x];
            }
            else {
                return board()[coord.y][coord.x];
            }
        },

        setPiece = function (piece, coord, optBoard) {
            if(optBoard) {
                optBoard[coord.y][coord.x] = piece;
            }
            else {
                var tempBoard = board();
                tempBoard[coord.y][coord.x] = piece;
                board(tempBoard);
            }
        },

        resetEnPassant = function (board) {
            foreachSquare(board, function (piece, coord) {
                if(piece && piece.type() === PIECE.pawn) {
                    piece.isEnPassant = false;
                }
            });
        },

        movePiece = function (start, end, optBoard) {
            var piece = getPiece(start, optBoard);
            resetEnPassant(optBoard || board());
            if(piece) {
                if(piece.type() === PIECE.king || piece.type() === PIECE.rook) {
                    piece.isMoved = true;
                }
                else if(
                    piece.type() === PIECE.pawn &&
                    Math.abs(start.y - end.y) === 2
                ) {
                    piece.isEnPassant = true;
                }
            }
            setPiece(piece, end, optBoard);
            setPiece(null, start, optBoard);
        },

        opponentSide = function (optSide) {
            var testSide = optSide || side();
            return testSide === SIDE.black ? SIDE.white : SIDE.black;
        },

        changeSides = function () {
            side(opponentSide());
            gameStack.push({
                board: extractBoardData(board()),
                side: side()
            });
            if(isGameOver()) {
                that.publish("winner", opponentSide());
            }
        },

        isGameOver = function () {
            var isGameOver = true,
                tempBoard;

            if(isInCheck(board())) {
                foreachSquare(board(), function (piece, coord) {
                    if(piece && piece.side() === side()) {
                        _.each(piece.getMoves(coord, board()), function (moveCoord) {
                            tempBoard = cloneBoard(board());
                            movePiece(coord, moveCoord, tempBoard);
                            if(!isInCheck(tempBoard)) {
                                isGameOver = false;
                            }
                        });
                    }
                });
                return isGameOver;
            }
            else {
                return false;
            }
        },

        isOwnPiece = function (coord) {
            var piece = getPiece(coord);
            return piece && piece.side() === side();
        },

        canPieceMove = function (start, end) {
            return _.find(
                getPiece(start).getMoves(start, board()),
                _.partial(_.isEqual, end)
            ) ? true : false;
        },

        getKingPositions = function (board) {
            var position = {};
            foreachSquare(board, function (piece, coord) {
                if(piece && piece.type() === PIECE.king) {
                    position[piece.side()] = coord;
                }
            });
            return position;
        },

        foreachSquare = function (board, callback) {
            var x, y, row;
            for(y = 0; y < board.length; y += 1) {
                row = board[y];
                for(x = 0; x < row.length; x += 1) {
                    callback(getPiece({ x: x, y: y }, board), { x: x, y: y });
                }
            }
        },

        isInCheck = function (testBoard, optSide) {
            var testSide = optSide || side(),
                kingPosition = getKingPositions(testBoard)[testSide],
                isCheck = false;

            foreachSquare(testBoard, function (piece, coord) {
                if(piece && piece.side() === opponentSide(testSide)) {
                    _.each(piece.getMoves(coord, testBoard), function (move) {
                        if(_.isEqual(move, kingPosition)) {
                            isCheck = true;
                        }
                    });
                }
            });
            return isCheck;
        },

        isCastleMove = function (start, end) {
            return ( start.x === 4 && (start.y === 0 || start.y === 7) &&
                    (end.x === 6 || end.x === 2) && (start.y === end.y) );
        },

        getRookCastleStartCoord = function (end) {
            return end.x === 6 ? { x: 7, y: end.y } : { x: 0, y: end.y };
        },

        getRookCastleEndCoord = function (end) {
            return end.x === 6 ? { x: 5, y: end.y } : { x: 3, y: end.y };
        },

        isRookPresentForCastle = function (end) {
            var rookCoord = getRookCastleStartCoord(end),
                piece = getPiece(rookCoord);

            return piece && piece.side() === side() && piece.type() === PIECE.rook;
        },

        isCastleIntoCheck = function (start, end) {
            var tempBoard = cloneBoard(board());
            movePiece(start, end, tempBoard);
            movePiece(
                getRookCastleStartCoord(end),
                getRookCastleEndCoord(end),
                tempBoard
            );
            return isInCheck(tempBoard);
        },

        isCastleThroughCheck = function (start, end) {
            var tempBoard = cloneBoard(board());
            movePiece(
                start,
                {
                    x: end.x === 2 ? start.x - 1 : start.x + 1,
                    y: end.y
                },
                tempBoard
            );
            return isInCheck(tempBoard);
        },

        isKingsFirstMove = function () {
            var king = getPiece(getKingPositions(board())[side()]);
            return !king.isMoved;
        },

        isRooksFirstMove = function (castlingCoord) {
            var rook = getPiece(getRookCastleStartCoord(castlingCoord));
            return rook && rook.type() === PIECE.rook && !rook.isMoved;
        },

        castle = function (start, end) {
            movePiece(start, end);
            movePiece(getRookCastleStartCoord(end), getRookCastleEndCoord(end));
        },

        isSpaceClearForCastle = function (end) {
            if(end.x === 6) {
                return ( getPiece({ x: 5, y: end.y }) === null &&
                         getPiece({ x: 6, y: end.y }) === null );
            }
            else {
                return ( getPiece({ x: 3, y: end.y }) === null &&
                         getPiece({ x: 2, y: end.y }) === null &&
                         getPiece({ x: 1, y: end.y }) === null );
            }
        },

        isMoveIntoCheck = function (start, end) {
            var tempBoard = cloneBoard(board());
            movePiece(start, end, tempBoard);
            return isInCheck(tempBoard);
        },

        isEnPassantMove = function (start, end) {
            var piece = getPiece(start),
                opponent = getPiece({ x: end.x, y: start.y });
            if(
                piece &&
                piece.type() === PIECE.pawn &&
                Math.abs(start.x - end.x) === 1 &&
                Math.abs(start.y - end.y) === 1 &&
                getPiece(end) === null &&
                opponent.type() === PIECE.pawn &&
                opponent.side() === opponentSide() &&
                opponent.isEnPassant
            ) {
                if(side() === SIDE.white) {
                    return start.y - end.y > 0;
                }
                else {
                    return start.y - end.y < 0;
                }
            }
            else {
                return false;
            }
        },

        isPawnPromotion = function (start, end) {
            var piece = getPiece(start);

            return (
                piece &&
                piece.type() === PIECE.pawn &&
                (
                    (piece.side() === SIDE.white && end.y === 0) ||
                    (piece.side() === SIDE.black && end.y === 7)
                ) &&
                canPieceMove(start, end)
            );
        };

    //optionally initialize board state.
    if(fig.board && fig.side) {
        board(fig.board);
        side(fig.side);
        gameStack.push({
            board: extractBoardData(fig.board),
            side: fig.side
        });
    }
    else if(fig.board || fig.side) {
        throw "must supply board and side or none at all";
    }

    that.undo = function () {
        var newState = gameStack.undo();
        if(newState) {
            side(newState.side);
            board(buildGameFromData(newState.board));
        }
    };

    that.redo = function () {
        var newState = gameStack.redo();
        if(newState) {
            side(newState.side);
            board(buildGameFromData(newState.board));
        }
    };

    that.getGameState = function () {
        return {
            side: side(),
            board: extractBoardData(board())
        };
    };

    that.loadGame = function (boardData, sideData) {
        gameStack.clear();
        board(buildGameFromData(boardData));
        side(sideData);
    };

    that.newGame = function () {
        gameStack.clear();
        board(setupNewGameBoard());
        side(SIDE.white);
        gameStack.push({
            board: extractBoardData(board()),
            side: side()
        });
        that.publish("newGame", {});
    };

    var findPawnToPromoteCoord = function () {
        var row = side() === SIDE.black ? 7 : 0,
            foundCoord;

        foreachSquare(board(), function (piece, coord) {
            if(
                coord.y === row && piece &&
                piece.type() === PIECE.pawn &&
                piece.side() === side()
            ) {
                foundCoord = coord;
            }
        });
        return foundCoord;
    };

    that.promotePawn = function (newType) {
        var coord = findPawnToPromoteCoord(),
            piece = getPiece(coord),
            promoteType = _.invert(PIECE)[newType];

        if(
            piece &&
            piece.type() === PIECE.pawn &&
            (coord.y === 0 || coord.y === 7)
        ) {
            setPiece(createPieceModel[promoteType]({ side: side() }), coord);
            changeSides();
            awaitingPawnPromotion = false;
        }
    };

    that.isOwnPiece = function (coord) {
        return isOwnPiece(coord);
    };

    that.makeMove = function (start, end) {
        var isMoved;
        if(isOwnPiece(start) && !awaitingPawnPromotion) {
            if(isCastleMove(start, end)) {
                if(
                    isRookPresentForCastle(end) &&
                    isKingsFirstMove() &&
                    isRooksFirstMove(end) &&
                    isSpaceClearForCastle(end) &&
                    !isCastleIntoCheck(start, end) &&
                    !isCastleThroughCheck(start, end)
                ) {
                    castle(start, end);
                    changeSides();
                    isMoved = true;
                }
                else {
                    isMoved = false;
                }
            }
            else if(isEnPassantMove(start, end) && !isMoveIntoCheck(start, end)) {
                setPiece(null, { x: end.x, y: start.y });
                movePiece(start, end);
                changeSides();
                isMoved = true;
            }
            else if(isPawnPromotion(start, end) && !isMoveIntoCheck(start,end)) {
                movePiece(start, end);
                awaitingPawnPromotion = true;
                isMoved = true;
                that.publish("pawnPromotion", side());
            }
            else {
                if(canPieceMove(start, end) && !isMoveIntoCheck(start, end)) {
                    movePiece(start, end);
                    changeSides();
                    isMoved = true;
                }
                else {
                    isMoved = false;
                }
            }
        }
        else {
            isMoved = false;
        }
        return isMoved;
    };

    return that;
};

//connects model to the view and handles user actions
var createController = function (fig) {
    "use strict";
    fig = fig || {};

    var URL_ROOT = "respond.php/",

        that = jsMessage.mixinPubSub(),

        boardModel = fig.model || createBoardModel(),
        boardView = fig.view || new ChessBoard('board'),

        selectedSquare = null,

        pieceMap = {
            P: PIECE.pawn,
            R: PIECE.rook,
            N: PIECE.knight,
            B: PIECE.bishop,
            K: PIECE.king,
            Q: PIECE.queen
        },

        sideMap = {
            b: SIDE.black,
            w: SIDE.white
        },

        pieceToModel = function (viewPiece) {
            return {
                type: pieceMap[viewPiece.charAt(1)],
                side: sideMap[viewPiece.charAt(0)]
            };
        },

        pieceToView = function (modelPiece) {
            return (
                _.invert(sideMap)[modelPiece.side] +
                _.invert(pieceMap)[modelPiece.type]
            );
        },

        coordToModel = function (viewCoord) {
            return {
                x: viewCoord.charCodeAt(0) - 97,
                y: 8 - Number(viewCoord.charAt(1))
            };
        },

        coordToView = function (modelCoord) {
            return (
                String.fromCharCode(modelCoord.x + 97) +
                String(8 - modelCoord.y)
            );
        },

        boardToView = function (modelBoard) {
            var viewCoord = {};
            _.each(modelBoard, function (row, rank) {
                return _.each(row, function (piece, file) {
                    if(piece) {
                        var index = coordToView({ x: file, y: rank });
                        viewCoord[index] = pieceToView(piece);
                    }
                });
            });
            return viewCoord;
        };

    that.bindSaveLoad = function () {
        $('#save-game').click(function () {
            that.saveGame();
        });
        $('#load-game').click(function () {
            that.loadGame($('#game-load-id').val());
        });
    };

    that.bindNewGame = function () {
        $('#new-game').click(function () {
            boardModel.newGame();
        });
    };

    that.saveGame = function () {
        var gameState = boardModel.getGameState();
        console.log(gameState);
        $.ajax({
            type: "POST",
            url: URL_ROOT + 'game',
            data: {
                board: JSON.stringify(gameState.board),
                side: gameState.side
            },
            beforeSend: function () {
                $('#save-game').button('loading');
            },
            error: function () {
                console.log(arguments);
            },
            success: function (gameId) {
                $('#game-id').html(gameId);
            },
            complete: function () {
                $('#save-game').button('reset');
            },
            dataType: "json"
        });
    };

    that.loadGame = function (gameId) {
        console.log("id:" + gameId);
        $.ajax({
            type: "GET",
            url: URL_ROOT + 'game/' + gameId,
            beforeSend: function () {
                $('#load-game').button('loading');
            },
            error: function () {
                console.log(arguments);
            },
            success: function (gameData) {
                boardModel.loadGame(JSON.parse(gameData.board), gameData.side);
            },
            complete: function () {
                $('#load-game').button('reset');
            },
            dataType: "json"
        });
    };

    that.newGame = function () {

    };

    that.bindSquareClick = function () {
        $('.square-55d63').click(function () {
            $('.square-55d63').removeClass('selected');
            if(that.clickSquare($(this).attr('data-square'))) {
                $(this).addClass('selected');
            }
        });
    };

    that.bindPawnPromotionSelect = function () {
        $('#bQ').click(function () {
            $('#select-piece-black').modal('hide');
            boardModel.promotePawn(PIECE.queen);
        });
        $('#bN').click(function () {
            $('#select-piece-black').modal('hide');
            boardModel.promotePawn(PIECE.knight);
        });
        $('#wQ').click(function () {
            $('#select-piece-white').modal('hide');
            boardModel.promotePawn(PIECE.queen);
        });
        $('#wN').click(function () {
            $('#select-piece-white').modal('hide');
            boardModel.promotePawn(PIECE.knight);
        });
    };

    that.bindUndoRedo = function () {
        $('#undo').click(_.bind(that.undo, that));
        $('#redo').click(_.bind(that.redo, that));
    };

    that.undo = function () {
        console.log("undo");
        boardModel.undo();
    };

    that.redo = function () {
        console.log("redo");
        boardModel.redo();
    };

    //subscribes to boardModel's "board" topic, and updates the view.
    that.boardUpdate = function (modelBoard) {
        boardView.position(boardToView(modelBoard));
    };

    that.declareWinner = function (side) {
        var sideText = side === SIDE.black ? "Black" : "White";
        $('#display-winner .modal-title').html(sideText + " Wins!");
        $('#display-winner').modal('show');
    };

    that.promotePawn = function (side) {
        var sideText = side === SIDE.black ? "black" : "white";
        $('#select-piece-' + sideText).modal();
    };

    that.sideUpdate = function (data) {
        var fadeTime = 200;
        $('#status-indicator').html(data === SIDE.white ? "White's move." : "Black's move.");
        if($('#is-change-orientation').is(":checked")) {
            setTimeout(function () {
                $('#board img').fadeOut(fadeTime);
                setTimeout(function () {
                    boardView.orientation(data === SIDE.white ? "white" : "black");
                    var $pieces = $('#board img');
                    $pieces.hide();
                    $pieces.fadeIn(fadeTime);
                    that.bindSquareClick();
                }, fadeTime);
            }, fadeTime);
        }
    };

    that.clickSquare = function (viewCoord) {
        var modelCoord = coordToModel(viewCoord);
        if(selectedSquare) {
            if(boardModel.isOwnPiece(modelCoord)) {
                selectedSquare = modelCoord;
            }
            else {
                boardModel.makeMove(selectedSquare, modelCoord);
                selectedSquare = null;
            }
        }
        else if(boardModel.isOwnPiece(modelCoord)) {
            selectedSquare = modelCoord;
        }
        return selectedSquare ? true : false;
    };

    return that;
};

// $(document).ready(function () {
    // 'use strict';

window.createChess = function (fig) {
    'use strict';
    fig = fig || {};

    var view = new ChessBoard('board', {
        showNotation: false,
        pieceTheme: fig.pieceTheme || undefined
        // pieceTheme: 'Chess/img/chesspieces/wikipedia/{piece}.png'
    });

    var model = createBoardModel();
    var controller = createController({
        model: model,
        view: view
    });

    model.subscribe("board", _.bind(controller.boardUpdate, controller));
    model.newGame();
    model.subscribe("side", _.bind(controller.sideUpdate, controller));
    model.subscribe("pawnPromotion", _.bind(controller.promotePawn, controller));
    model.subscribe("winner", _.bind(controller.declareWinner, controller));

    var setLayout = function () {
        var $board = $('#board'),
            $controls = $('#controls'),
            width = $('#chess-container').width(),
            height = $('#chess-container').height();
            // width = $(window).width(),
            // height = $(window).height();

        $board.width(_.min([width, height]) - 2);

        view.resize();

        //$board.width($board.width() + 5);
        //var $innerBoard = $('.chessboard-63f37');
        //$innerBoard.width($innerBoard.width() + 5);
        //var $row = $('.row-5277c');
        //$row.width($row.width() + 5);

        if(width > height) {
            $controls.width(width - height - 0);
            $controls.addClass('horizontal-controls');
        }
        else {
            $controls.width(width - 2);
            $controls.removeClass('horizontal-controls');
        }
    };

    setLayout();

    $(window).resize(function () {
        setLayout();
        view.resize(arguments);
        controller.bindSquareClick();
    });

    controller.bindSquareClick();
    controller.bindPawnPromotionSelect();
    controller.bindUndoRedo();
    controller.bindSaveLoad();
    controller.bindNewGame();
};
// });

}());
