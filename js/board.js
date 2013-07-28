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
        return my.tempBoard[coord.x][coord.y];
    };

    //returns null | PIECE.white | PIECE.black, depending on whats on the square.
    var sideOnSquare = function (coord) {
        var square = getSquare(coord);
        return square && square.side();
    };

    my.isOpponent = function (coord) {
        return sideOnSquare(coord) !== that.side();
    };

    my.isAlly = function (coord) {
        return sideOnSquare(coord) === that.side();
    };

    var line = function (coord, advanceA, advanceB, isBlocked) {
        var a = advanceA(coord),
            b = advanceB(coord),
            moves = [];
        while(my.isOnBoard(a) && !isBlocked(a)) {
            moves.push(a);
            a = advanceA(a);
        }
        while(my.isOnBoard(b) && !isBlocked(b)) {
            moves.push(b);
            b = advanceB(b);
        }
        return moves;
    };

    var createIsProgressBlocked = function () {
        return (function () {
            var stopProgress = false;
            return function (coord) {
                var isContinue;
                if(stopProgress) {
                    isContinue = false;
                }
                else if(my.isAlly(coord)) {

                }
                return isContinue;
            };
        }());
    };

    my.horizontal = function (coord) {
        return line(
            coord,
            function (coord) {
                return { x: coord.x - 1, y: coord.y };
            },
            function (coord) {
                return { x: coord.x + 1, y: coord.y };
            },
            createIsProgressBlocked()
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
            },
            createIsProgressBlocked()
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
            },
            createIsProgressBlocked()
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
            },
            createIsProgressBlocked()
        );
    };

    return that;
};





pieceModel.king = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.king, fig, my),
        rawMoves = function (coord) {
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
        };

    that.isMoved = false;

    my.getMoves = function (coord) {
        return _.filter(rawMoves(coord), function (coord) {
            return !my.isAlly(coord);
        });
    };

    return that;
};



pieceModel.queen = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.queen, fig, my),
        rawMoves = function (coord) {
            return _.union(
                my.horizontal(coord),
                my.vertical(coord),
                my.rising(coord),
                my.falling(coord)
            );
        };

    my.getMoves = function (coord) {
        return rawMoves(coord);
    };

    return that;
};



pieceModel.rook = function (fig) {
    fig = fig || {};
    var my = {},
        that = createPieceModelBase(PIECE.rook, fig, my);

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
        movesRaw = function (coord) {
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

    my.getMoves = function (coord) {
        return movesRaw(coord);
    };

    return that;
};



}).call(this);
