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
            var piece = getPiece(start, optBoard);
            if(piece && (
                piece.type() === PIECE.king ||
                piece.type() === PIECE.rook
            )) {
                piece.isMoved = true;
            }
            setPiece(piece, end, optBoard);
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
            foreachSquare(board, function (piece, coord) {
                if(piece && piece.type() === PIECE.king) {
                    position[piece.side()] = coord;
                }
            });
            return position;
        },

        foreachSquare = function (board, callback) {
            var x, y, row;
            for(y = 0; y < board.length; y += 1) {
                row = board[y];
                for(x = 0; x < row.length; x += 1) {
                    callback(getPiece({ x: x, y: y }, board), { x: x, y: y });
                }
            }
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

        isCastleMove = function (start, end) {

            return ( start.x === 4 && (start.y === 0 || start.y === 7) &&
                (end.x === 6 || end.x === 2) && (start.y === end.y) );
        },

        isRookPresentForCastle = function (end) {
            var rookCoord = end.x === 6 ? { x: 7, y: 0 } : { x: 0, y: 0 },
                piece = getPiece(rookCoord);
            if(piece && piece.side() === side() && piece.type() === PIECE.rook) {
                return true;
            }
            else {
                return false;
            }
        },

        isCastleIntoCheck = function (start, end) {
            var tempBoard = cloneBoard(board());
            movePiece(start, end, tempBoard);
            var rookStart = end.x === 6 ? {x:7, y: end.y} :  {x: 0, y: end.y};
            var rookEnd = end.x === 6 ? {x:5, y: end.y} : {x: 3, y: end.y};
            movePiece(rookStart, rookEnd, tempBoard);
            return isInCheck(side(), tempBoard);
        },

        isKingsFirstMove = function () {
            var king = getPiece(getKingPositions(board())[side()]);
            return !king.isMoved;
        },

        isRooksFirstMove = function (castlingCoord) {
            var rookCoord = (castlingCoord.x === 6 ?
                            { x: 7, y: castlingCoord.y } :
                            { x: 0, y: castlingCoord.y }),
                rook = getPiece(rookCoord);
            return !rook.isMoved;
        },

        castle = function (start, end) {
            movePiece(start, end);
            var rookStart = end.x === 6 ? {x:7, y: end.y} :  {x: 0, y: end.y};
            var rookEnd = end.x === 6 ? {x:5, y: end.y} : {x: 3, y: end.y};
            movePiece(rookStart, rookEnd);
        },

        isSpaceClearForCastle = function (end) {
            if(end.x === 6) {
                return (getPiece({ x: 5, y: end.y }) === null
                    && getPiece({ x: 6, y: end.y }) === null);
            }
            else {
                return (getPiece({ x: 3, y: end.y }) === null
                    && getPiece({ x: 2, y: end.y }) === null
                    && getPiece({ x: 1, y: end.y }) === null);
            }
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
        var isMoved;
        if(isOwnPiece(start)) {
            //console.log("is own piece");
            if(isCastleMove(start, end)) {
                //console.log("is castle");
                if(
                    isRookPresentForCastle(end)
                    && isKingsFirstMove()
                    && isRooksFirstMove(end)
                    && isSpaceClearForCastle(end)
                    && !isCastleIntoCheck(start, end)
                ) {
                    castle(start, end);
                    isMoved = true;
                }
                else {
                    isMoved = false;
                }
            }
            //else if(isEnpassant(start, end)) {}
            else {
                //console.log("regular move");
                if(canPieceMove(start, end) && !isMoveIntoCheck(start, end)) {
                    //console.log("move piece");
                    movePiece(start, end);
                    changeSides();
                    isMoved = true;
                }
                else {
                    isMoved = false;
                }
            }
        }
        else {
            isMoved = false;
        }
        return isMoved;
    };

    return that;
};

}).call(this);
