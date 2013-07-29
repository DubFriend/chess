(function () {
"use strict";

// ---------------------------- Board Model ------------------------------------
// The board Model takes care of managing the state of the board, and handling,
// board level rules such as castling, moving into check, and en passant.  The
// Board Model should try to remain unaware of the types that each piece is (let
// the Piece Models handle piece specific Logic).

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

}).call(this);
