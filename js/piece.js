(function () {
"use strict";
// ----------------------------- Piece Models ----------------------------------
// Piece Models understand how they can move in relation to the board and other
// pieces, but are not aware of board level rules (such as moving into check).
// Piece Models understand that other pieces are black or white, but not which
// type (king, rook, etc.) the other pieces are.

var pieceModel = {};
this.createPieceModel = pieceModel;

var createPieceModelBase = function (type, fig, my) {
    fig = fig || {};
    var that = {};

    that.side = function () {
        return my.side;
    };

    that.type = function () {
        return type;
    };

    // ! my.getMoves must be implemented by subclass.
    that.getMoves = function (coord, board) {
        my.tempBoard = board;
        var results = my.getMoves(coord);
        my.tempBoard = undefined;
        return results;
    };

    //temporarily stores board state, so we dont have to pass the board around
    //should be reset to undefined after every public method call that sets it.
    my.tempBoard = undefined;

    my.side = fig.side;

    my.isOnBoard = function (coord) {
        return coord.x >= 0 && coord.x < 8 && coord.y >= 0 && coord.y < 8;
    };

    var getSquare = function (coord) {
        if(my.isOnBoard(coord)) {
            return my.tempBoard[coord.y][coord.x];
        }
    };

    //returns null | PIECE.white | PIECE.black, depending on whats on the square.
    var sideOnSquare = function (coord) {
        var square = getSquare(coord);
        return square && square.side();
    };

    my.isOpponent = function (coord) {
        var a = sideOnSquare(coord),
            b = that.side();
        return (a === SIDE.white && b === SIDE.black ||
                a === SIDE.black && b === SIDE.white);
    };

    my.isAlly = function (coord) {
        return sideOnSquare(coord) === that.side();
    };

    var line = function (coord, advanceA, advanceB) {
        var a = advanceA(coord),
            b = advanceB(coord),
            isBlockedA = createIsProgressBlocked(),
            isBlockedB = createIsProgressBlocked(),
            moves = [];
        while(my.isOnBoard(a) && !isBlockedA(a)) {
            moves.push(a);
            a = advanceA(a);
        }
        while(my.isOnBoard(b) && !isBlockedB(b)) {
            moves.push(b);
            b = advanceB(b);
        }
        return moves;
    };

    var createIsProgressBlocked = function () {
        var stopProgress = false;
        return function (coord) {
            var isBlocked = false;
            if(stopProgress) {
                isBlocked = true;
            }
            else if(my.isAlly(coord)) {
                isBlocked = true;
            }
            else if(my.isOpponent(coord)) {
                stopProgress = true;
            }
            return isBlocked;
        };
    };

    my.advance = function (dx, dy, coord) {
        return { x: coord.x + dx, y: coord.y + dy };
    };

    var advance = function (dx, dy) {
        return _.partial(my.advance, dx, dy);
    };

    my.horizontal = function (coord) {
        return line(coord, advance(-1, 0), advance(1, 0));
    };

    my.vertical = function (coord) {
        return line(coord, advance(0, 1), advance(0, -1));
    };

    my.rising = function (coord) {
        return line(coord, advance(1, -1), advance(-1, 1));
    };

    my.falling = function (coord) {
        return line(coord, advance(1, 1), advance(-1, -1));
    };

    return that;
};


pieceModel.king = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.king, fig, my);

    that.isMoved = false;

    my.getMoves = function (coord) {
        return _.filter(
            _.map(
                [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,1],[-1,0],[-1,-1]],
                function (move) {
                    return my.advance(move[0], move[1], coord);
                }
            ),
            function (move) {
                return my.isOnBoard(move) && !my.isAlly(move);
            }
        );
    };

    return that;
};


pieceModel.queen = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.queen, fig, my);

    my.getMoves = function (coord) {
        return _.union(
            my.horizontal(coord),
            my.vertical(coord),
            my.rising(coord),
            my.falling(coord)
        );
    };

    return that;
};


pieceModel.rook = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.rook, fig, my);

    that.isMoved = false;

    my.getMoves = function (coord) {
        return _.union(my.horizontal(coord), my.vertical(coord));
    };

    return that;
};


pieceModel.bishop = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.bishop, fig, my);

    my.getMoves = function (coord) {
        return _.union(my.rising(coord), my.falling(coord));
    };

    return that;
};


pieceModel.knight = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.knight, fig, my);

    my.getMoves = function (coord) {
        return _.filter(
            _.map(
                [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]],
                function (move) {
                    return my.advance(move[0], move[1], coord);
                }
            ),
            function (coord) {
                return my.isOnBoard(coord) && !my.isAlly(coord);
            }
        );
    };

    return that;
};


pieceModel.pawn = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.pawn, fig, my),

        movesRaw = function (coord) {
            var moves = [], forward, homeRow;

            if(that.side() === SIDE.black) {
                forward = 1;
                homeRow = 1;
            }
            else {
                forward = -1;
                homeRow = 6;
            }

            moves.push({ x: coord.x, y: coord.y + forward });
            if(coord.y === homeRow) {
                moves.push({ x: coord.x, y: coord.y + forward * 2 });
            }

            return _.filter(moves, function (coord) {
                return ( my.isOnBoard(coord) &&
                        !my.isOpponent(coord) &&
                        !my.isAlly(coord) );
            });
        },

        attackMoves = function (coord) {
            var forward = that.side() === SIDE.black ? 1 : -1;
            return _.filter(
                [{ x: coord.x + 1, y: coord.y + forward },
                 { x: coord.x - 1, y: coord.y + forward }],
                my.isOpponent
            );
        };

    my.getMoves = function (coord) {
        return _.union(movesRaw(coord), attackMoves(coord));
    };

    that.isEnPassant = false;

    return that;
};

}).call(this);
