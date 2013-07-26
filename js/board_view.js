var createPieceDrawer = function (fig) {
    fig = fig || {};
    var that = {},
        draw = fig.draw,
        sprite = fig.sprite,
        square = fig.square,
        pad = 3, //padding in pixels
        config = {};

    //piece specific configurations.
    config[PIECE.king] = { xcoord: 290, width: 95 };
    config[PIECE.queen] = { xcoord: 190, width: 95 };
    config[PIECE.bishop] = { xcoord: 90, width: 95 };
    config[PIECE.knight] = { xcoord: 395, width: 95 };
    config[PIECE.rook] = { xcoord: 0, width: 90 };
    config[PIECE.pawn] = { xcoord: 500, width: 70 };

    that.draw = function (type, side, coord) {
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
                    x: config[type].xcoord,
                    y: ycoord
                },
                width: config[type].width,
                height: 108
            }
        });
    };

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
        },

        drawPiece = function (type, side, coord) {
            pieceDrawer.draw(type, side, mapCoord(coord.x, coord.y));
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
        drawPiece(PIECE.king, SIDE.black, { x: 3, y: 0 });
        drawPiece(PIECE.queen, SIDE.black, { x: 4, y: 0 });
        drawPiece(PIECE.bishop, SIDE.black, { x: 5, y: 0 });
        drawPiece(PIECE.bishop, SIDE.black, { x: 2, y: 0 });
        drawPiece(PIECE.knight, SIDE.black, { x: 6, y: 0 });
        drawPiece(PIECE.knight, SIDE.black, { x: 1, y: 0 });
        drawPiece(PIECE.rook, SIDE.black, { x: 7, y: 0 });
        drawPiece(PIECE.rook, SIDE.black, { x: 0, y: 0 });
        _.each(_.range(8), function (col) {
            drawPiece(PIECE.pawn, SIDE.black, { x: col, y: 1 });
        });
    };

    return that;
};
