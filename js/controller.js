//connects model to the view and handles user actions
var createController = function (fig) {
    fig = fig || {};

    var that = jsMessage.mixinPubSub(),

        model = fig.model || createBoardModel(),
        view = fig.view || new ChessBoard(),

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

    //subscribes to boardModel's "board" topic, and updates the view.
    that.boardUpdate = function (modelBoard) {
        view.position(boardToView(modelBoard));
    };

    that.clickSquare = function (viewCoord) {//, viewPiece) {
        var modelCoord = coordToModel(viewCoord);
        if(selectedSquare) {
            model.makeMove(selectedSquare, modelCoord);
            selectedSquare = null;
        }
        else {
            selectedSquare = modelCoord;
        }
    };

    that.dropPiece = function (viewStart, viewEnd) {//, viewPiece) {
        if(viewStart !== viewEnd) {
            model.makeMove(coordToModel(viewStart), coordToModel(viewEnd));
            selectedSquare = null;
        }
    };

    return that;
};