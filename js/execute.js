$(document).ready(function () {
'use strict';
/*
var $canvasArea = $('#board-area');

$canvasArea.html(
    '<canvas ' +
        'id="canvas" ' +
        'width="' + $canvasArea.width() + '" ' +
        'height="' + $canvasArea.height() + '">' +
    '</canvas>'
);

var $canvas = $('#canvas'),

    WIDTH = $canvas.width(),
    HEIGHT = $canvas.height(),

    draw = createDraw({
        context: $canvas[0].getContext('2d'),
        width: WIDTH,
        height: HEIGHT
    }),

    spriteSheet = new Image(),

    boardView = createBoardView({
        draw: draw,
        pieceDrawer: createPieceDrawer({
            draw: draw,
            sprite: spriteSheet,
            square: {
                width: WIDTH / 8,
                height: HEIGHT / 8
            }
        }),
        width: WIDTH,
        height: HEIGHT
    });


boardView.renderSquares();
spriteSheet.src = "img/pieces.png";
spriteSheet.onload = function () {
    log("loaded pieces.png");
    boardView.renderPieces();
};
*/

var board = new ChessBoard('board', 'start');

});//end document ready
