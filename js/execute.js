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
