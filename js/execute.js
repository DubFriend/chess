$(document).ready(function () {
//'use strict';



var boardConfig = {
    draggable: true,
    //showNotation: false,
    position: 'start',
    onDragStart: function (source, piece, position, orientation) {
        console.log(source);
        console.log(piece);
        console.log(position);
        console.log(orientation);
        console.log('\n');
    },
    onDrop: function(source, target, piece, newPos, oldPos, orientation) {
        console.log(source);
        console.log(target);
        console.log(piece);
        console.log(newPos);
        console.log(oldPos);
        console.log(orientation);
        console.log('\n');
    }
};

boardView = new ChessBoard('board', boardConfig);

var setLayout = function () {
    var $board = $('#board');
    var $controls = $('#controls');
    var width = $(window).width();
    var height = $(window).height();

    $board.width(_.min([width, height]) - 1);
    boardView.resize();

    if(width > height) {
        $controls.width(width - height);
        $controls.addClass('horizontal-controls');
    }
    else {
        $controls.width(width);
        $controls.removeClass('horizontal-controls');
    }
};

setLayout();

$(window).resize(setLayout);
$(window).resize(boardView.resize);
});
