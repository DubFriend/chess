$(document).ready(function () {
//'use strict';

var view = new ChessBoard('board');
var model = createBoardModel();
var controller = createController({
    model: model,
    view: view
});


model.subscribe("board", function (data) {
    controller.boardUpdate(data);
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
    bindSquareClick();
});

var bindSquareClick = function () {
    $('.square-55d63').click(function () {
        $('.square-55d63').removeClass('selected');
        if(controller.clickSquare($(this).attr('data-square'))) {
            $(this).addClass('selected');
        }
    });
};

bindSquareClick();

});
