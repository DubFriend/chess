(function () {
"use strict";

this.createBoardModel = function (fig) {
    fig = fig || {};
    var that = jsMessage.mixinPubSub(),
        board = that.autoPublish("board"),
        side = that.autoPublish("side"),

        setupNewGameBoard = (function () {
            var homeRow = function (side) {
                    return [
                        { type: PIECE.rook, side: side },
                        { type: PIECE.knight, side: side },
                        { type: PIECE.bishop, side: side },
                        { type: PIECE.king, side: side },
                        { type: PIECE.queen, side: side },
                        { type: PIECE.bishop, side: side },
                        { type: PIECE.knight, side: side },
                        { type: PIECE.rook, side: side }
                    ];
                },

                emptyRow = function () {
                    var row = [];
                    _.each(_.range(8), function () {
                        row.push(null);
                    });
                    return row;
                },

                rowOfPawns = function (side) {
                    var row = [];
                    _.each(_.range(8), function () {
                        row.push({ type: PIECE.pawn, side: side });
                    });
                    return row;
                };

            return function () {
                return [
                    homeRow(SIDE.black),
                    rowOfPawns(SIDE.black),
                    emptyRow(), emptyRow(), emptyRow(), emptyRow(),
                    rowOfPawns(SIDE.white),
                    homeRow(SIDE.white)
                ];
            };

        }()),

        //gets the value from the board of the passed coordinates
        getPiece = function (coord) {
            return board()[coord.x][coord.y];
        },

        movePiece = function (start, end) {
            var tempBoard = board(),
                piece = getPiece(start);
            tempBoard[end.x][end.y] = piece;
            tempBoard[start.x][start.y] = null;
            if(piece.type === PIECE.king) {
                isKingMoved[piece.side] = true;
            }
            board(tempBoard);
        },

        opponentSide = function () {
            return side() === SIDE.black ? SIDE.white : SIDE.black;
        },

        changeSides = function () {
            side(opponentSide());
        };

    that.newGame = function () {
        board(setupNewGameBoard());
        side(SIDE.white);
    };

    that.makeMove = function (start, end) {
        if(isBelongToPlayer(start) && isLegalMove(start, end)) {
            movePiece(start, end);
            changeSides();
            return true;
        }
        else {
            return false;
        }
    };

    return that;
};





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

    my.side = fig.side;

    my.isOnBoard = function (coord) {
        return coord.x >= 0 && coord.x < 8 && coord.y >= 0 && coord.y < 8;
    };

    var getSquare = function (coord, board) {
        return board[coord.x][coord.y];
    };

    //returns null | PIECE.white | PIECE.black, depending on whats on the square.
    var sideOnSquare = function (coord, board) {
        var square = getSquare(coord, board);
        return square && square.side();
    };

    my.isOpponent = function (coord, board) {
        return sideOnSquare(coord, board) !== that.side();
    };

    my.isAlly = function (coord, board) {
        return sideOnSquare(coord, board) === that.side();
    };

    var line = function (coord, advanceA, advanceB) {
        var a = advanceA(coord),
            b = advanceB(coord),
            moves = [];
        while(my.isOnBoard(a)) {
            moves.push(a);
            a = advanceA(a);
        }
        while(my.isOnBoard(b)) {
            moves.push(b);
            b = advanceB(b);
        }
        return moves;
    };

    my.horizontal = function (coord) {
        return line(
            coord,
            function (coord) {
                return { x: coord.x - 1, y: coord.y };
            },
            function (coord) {
                return { x: coord.x + 1, y: coord.y };
            }
        );
    };

    my.vertical = function (coord) {
        return line(
            coord,
            function (coord) {
                return { x: coord.x, y: coord.y + 1 };
            },
            function (coord) {
                return { x: coord.x, y: coord.y - 1};
            }
        );
    };

    my.rising = function (coord) {
        return line(
            coord,
            function (coord) {
                return { x: coord.x + 1, y: coord.y - 1 };
            },
            function (coord) {
                return { x: coord.x - 1, y: coord.y + 1 };
            }
        );
    };

    my.falling = function (coord) {
        return line(
            coord,
            function (coord) {
                return { x: coord.x + 1, y: coord.y + 1 };
            },
            function (coord) {
                return { x: coord.x - 1, y: coord.y - 1 };
            }
        );
    };

    return that;
};





pieceModel.king = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.king, fig, my),
        rawMoves = function (coord, board) {
            return _.filter([
                { x: coord.x + 1, y: coord.y + 1 },
                { x: coord.x + 1, y: coord.y },
                { x: coord.x + 1, y: coord.y - 1 },
                { x: coord.x, y: coord.y + 1 },
                { x: coord.x, y: coord.y - 1 },
                { x: coord.x - 1, y: coord.y + 1 },
                { x: coord.x - 1, y: coord.y },
                { x: coord.x - 1, y: coord.y - 1 }
            ], my.isOnBoard);
        },

        filterBlockedPaths = function (coords) {
            return coords;
        };

    that.isMoved = false;

    that.getMoves = function (coord, board) {

        return _.filter(rawMoves(coord, board), function (coord) {
            return !my.isAlly(coord, board);
        });
    };

    return that;
};



pieceModel.queen = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.queen, fig, my);

    that.getMoves = function (coord, board) {
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

    that.getMoves = function (coord, board) {
        return _.union(my.horizontal(coord), my.vertical(coord));
    };

    return that;
};



pieceModel.bishop = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.bishop, fig, my);

    that.getMoves = function (coord, board) {
        return _.union(my.rising(coord), my.falling(coord));
    };

    return that;
};



pieceModel.knight = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.knight, fig, my);

    that.getMoves = function (coord, board) {
        return _.filter(
           [{ x: coord.x - 2, y: coord.y - 1 },
            { x: coord.x - 2, y: coord.y + 1 },
            { x: coord.x - 1, y: coord.y - 2 },
            { x: coord.x - 1, y: coord.y + 2 },
            { x: coord.x + 1, y: coord.y - 2 },
            { x: coord.x + 1, y: coord.y + 2 },
            { x: coord.x + 2, y: coord.y - 1 },
            { x: coord.x + 2, y: coord.y + 1 }],
            my.isOnBoard
        );
    };

    return that;
};



pieceModel.pawn = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.pawn, fig, my),
        movesRaw = function (coord, board) {
            var moves = [];
            if(that.side() === SIDE.black) {
                moves.push({ x: coord.x, y: coord.y + 1 });
                if(coord.y === 1) {
                    moves.push({ x: coord.x, y: coord.y + 2 });
                }
            }
            else {
                moves.push({ x: coord.x, y: coord.y - 1 });
                if(coord.y === 6) {
                    moves.push({ x: coord.x, y: coord.y - 2 });
                }
            }
            return _.filter(moves, my.isOnBoard);
        };

    that.getMoves = function (coord, board) {
        return movesRaw(coord, board);//_.filter(movesRaw(coord), my.isOnBoard);
    };

    return that;
};



}).call(this);
