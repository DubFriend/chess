var createPieceDrawer = function (fig) {
    fig = fig || {};
    var that = {},
        draw = fig.draw,
        sprite = fig.sprite,
        square = fig.square,
        pad = 3, //padding in pixels
        king = {
            width: 96,
            xcoord: 288
        },
        piece = function (type, side, coord) {
            var ycoord = side === SIDE.black ? 0 : 108;
            return draw.image({
                img: sprite,
                coord: {
                    x: coord.x + pad,
                    y: coord.y + pad
                },
                width: square.width - 2 * pad,
                height: square.height - 2 * pad,
                clip: {
                    coord: {
                        x: king.xcoord,
                        y: ycoord
                    },
                    width: king.width,
                    height: 108
                }
            });
        };

    that.king = _.partial(piece, KING);
    that.queen = _.partial(piece, QUEEN);
    that.rook = _.partial(piece, ROOK);
    that.knight = _.partial(piece, KNIGHT);
    that.bishop = _.partial(piece, BISHOP);
    that.pawn = _.partial(piece, PAWN);

    return that;
};


var createBoardView = function (fig) {
    fig = fig || {};
    var that = {},
        draw = fig.draw,
        pieceDrawer = fig.pieceDrawer,

        square = {
            width: fig.width / 8,
            height: fig.width / 8,
            color: {
                light: fig.lightSquareColor || "rgb(178, 195, 247)",
                dark: fig.darkSquareColor || "rgb(9, 32, 105)"
            }
        },

        //map row, col indexes to their pixel value equivalent
        mapCoord = function (row, col) {
            return {
                x: row * square.width,
                y: col * square.height
            };
        },

        isDarkSquare = function (row, col) {
            return (row + col) % 2 === 0;
        },

        squareColor = function (isDarkSquare) {
            return isDarkSquare ? square.color.dark : square.color.light;
        };

    //draw the game board
    that.renderSquares = function () {
        _.each(_.range(8), function (row) {
            _.each(_.range(8), function (col) {
                draw.rectangle({
                    coord: mapCoord(row, col),
                    width: square.width,
                    height: square.height,
                    color: squareColor(isDarkSquare(row, col))
                });
            });
        });
    };

    //render all the pieces onto the board
    that.renderPieces = function (pieces) {
        pieceDrawer.king(SIDE.black, mapCoord(3, 0));
    };

    return that;
};
