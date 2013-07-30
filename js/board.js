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

        extractBoardData = function (board) {
            return _.map(board, function (row) {
                return _.map(row, function (square) {
                    return square && { side: square.side(), type: square.type() };
                });
            });
        },

        board = that.autoPublish("board", extractBoardData),

        side = that.autoPublish("side"),

        setupNewGameBoard = (function () {
            var homeRow = function (side) {
                    return _.map(
                        ['rook', 'knight', 'bishop', 'king',
                         'queen', 'bishop', 'knight', 'rook'],
                        function (type) {
                            return createPieceModel[type]({ side: side });
                        }
                    );
                },

                emptyRow = function () {
                    return _.pad(8, null);
                },

                rowOfPawns = function (side) {
                    return _.map(_.range(8), function () {
                        return createPieceModel.pawn({ side: side });
                    });
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

        cloneBoard = function (board) {
            return _.map(board, function (row) {
                return _.map(row, function (square) {
                    var type;
                    if(square) {
                        type = _.invert(PIECE)[square.type()];
                        return createPieceModel[type]({ side: square.side() });
                    }
                    else {
                        return null;
                    }
                });
            });
        },

        //gets the value from the board of the passed coordinates
        getPiece = function (coord, optBoard) {
            if(optBoard) {
                return optBoard[coord.y][coord.x];
            }
            else {
                return board()[coord.y][coord.x];
            }
        },

        setPiece = function (piece, coord, optBoard) {
            if(optBoard) {
                optBoard[coord.y][coord.x] = piece;
            }
            else {
                var tempBoard = board();
                tempBoard[coord.y][coord.x] = piece;
                board(tempBoard);
            }
        },

        movePiece = function (start, end, optBoard) {
            setPiece(getPiece(start, optBoard), end, optBoard);
            setPiece(null, start, optBoard);
        },

        opponentSide = function (optSide) {
            var testSide = optSide || side();
            return testSide === SIDE.black ? SIDE.white : SIDE.black;
        },

        changeSides = function () {
            side(opponentSide());
        },

        isOwnPiece = function (coord) {
            var piece = getPiece(coord);
            return piece && piece.side() === side();
        },

        canPieceMove = function (start, end) {
            return _.find(
                getPiece(start).getMoves(start, board()),
                _.partial(_.isEqual, end)
            ) ? true : false;
        },

        getKingPositions = function (board) {
            var position = {};
            _.each(board, function (row, y) {
                _.each(row, function (square, x) {
                    if(square && square.type() === PIECE.king) {
                        position[square.side()] = { x: x, y: y };
                    }
                });
            });
            return position;
        },

        isInCheck = function (testSide, testBoard) {
            var kingPosition = getKingPositions(testBoard)[testSide];
            var isCheck;
            _.each(testBoard, function (row, y) {
                _.each(row, function (square, x) {
                    if(square && square.side() === opponentSide(testSide)) {
                        _.each(square.getMoves({x:x,y:y}, testBoard), function (move) {
                            if(_.isEqual(move, kingPosition)) {
                                isCheck = true;
                            }
                        });
                    }
                });
            });
            return isCheck;
        },

        isMoveIntoCheck = function (start, end) {
            var tempBoard = cloneBoard(board());
            movePiece(start, end, tempBoard);
            return isInCheck(side(), tempBoard);
        };

    //optionally initialize board state.
    if(fig.board) {
        board(fig.board);
    }
    if(fig.side) {
        side(fig.side);
    }

    that.newGame = function () {
        board(setupNewGameBoard());
        side(SIDE.white);
    };

    that.makeMove = function (start, end) {
        if(
            isOwnPiece(start)
            && canPieceMove(start, end)
            && !isMoveIntoCheck(start, end)
        ) {
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
