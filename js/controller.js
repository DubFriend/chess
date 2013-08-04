//connects model to the view and handles user actions
var createController = function (fig) {
    fig = fig || {};

    var that = jsMessage.mixinPubSub(),

        model = fig.model || createBoardModel(),
        view = fig.view || new ChessBoard('board'),

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
        view.position(boardToView(modelBoard));
    };

    that.sideUpdate = function (data) {
        var fadeTime = 200;
        $('#status-indicator').html(data === SIDE.white ? "White's move." : "Black's move.");
        if($('#is-change-orientation').is(":checked")) {
            setTimeout(function () {
                $('#board img').fadeOut(fadeTime);
                setTimeout(function () {
                    view.orientation(data === SIDE.white ? "white" : "black");
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
            model.makeMove(selectedSquare, modelCoord);
            selectedSquare = null;
        }
        else {
            selectedSquare = modelCoord;
        }

        return selectedSquare ? true : false;
    };

    return that;
};