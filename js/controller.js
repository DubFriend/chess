//connects model to the view and handles user actions
var createController = function (fig) {
    fig = fig || {};

    var that = jsMessage.mixinPubSub(),

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

    that.newGame = function () {};
    that.loadGame = function () {};

    that.bindSquareClick = function () {
        $('.square-55d63').click(function () {
        $('.square-55d63').removeClass('selected');
            if(that.clickSquare($(this).attr('data-square'))) {
                $(this).addClass('selected');
            }
        });
    };

    //subscribes to boardModel's "board" topic, and updates the view.
    that.boardUpdate = function (modelBoard) {
        boardView.position(boardToView(modelBoard));
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