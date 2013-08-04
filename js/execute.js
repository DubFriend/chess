$(document).ready(function () {
'use strict';

var view = new ChessBoard('board', {
    showNotation: false
});

var model = createBoardModel();
var controller = createController({
    model: model,
    view: view
});

model.subscribe("board", function (data) {
    controller.boardUpdate(data);
});

model.subscribe("side", function (data) {
    controller.sideUpdate(data);
});

model.newGame();

var setLayout = function () {
    var $board = $('#board'),
        $controls = $('#controls'),
        width = $(window).width(),
        height = $(window).height();

    $board.width(_.min([width, height]) - 1);
    view.resize();

    if(width > height) {
        $controls.width(width - height - 5);
        $controls.addClass('horizontal-controls');
    }
    else {
        $controls.width(width);
        $controls.removeClass('horizontal-controls');
    }
};

setLayout();

$(window).resize(setLayout);
$(window).resize(function () {
    view.resize(arguments);
    controller.bindSquareClick();
});

controller.bindSquareClick();

});
