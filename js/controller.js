//connects model to the view and handles user actions
var createController = function (fig) {
    fig = fig || {};
    var that = jsMessage.mixinPubSub(),
        board = fig.board || createBoardModel(),
        view = fig.view || new ChessBoard(),
        selectedSquare = null;



    //subscribes to boardModel's "board" topic, and updates the view.
    that.onBoardUpdate = function (board) {

    };

    that.onSquareClick = function (coord, piece) {

    };

    that.onPieceDrop = function (start, end, piece) {

    };

    return that;
};