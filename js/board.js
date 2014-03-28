// ---------------------------- Board Model ------------------------------------
// The board Model takes care of managing the state of the board, and handling,
// board level rules such as castling, moving into check, and en passant.  The
// Board Model should try to remain unaware of the types that each piece is (let
// the Piece Models handle piece specific Logic).
createBoardModel = function (fig) {
    "use strict";
    fig = fig || {};
    var that = jsMessage.mixinPubSub(),

        gameStack = (function () {
            var stack = [], redoStack = [];
            return {
                clear: function () {
                    stack = [];
                    redoStack = [];
                },
                push: function (data) {
                    stack.push(data);
                },
                undo: function () {
                    var current = stack.pop();
                    if(current) {
                        redoStack.push(current);
                        return _.last(stack);
                    }
                },
                redo: function () {
                    var oldState = redoStack.pop();
                    if(oldState) {
                        stack.push(oldState);
                        return _.last(stack);
                    }
                }
            };
        }()),

        extractBoardData = function (board) {
            return _.map(board, function (row) {
                return _.map(row, function (square) {
                    return square && { side: square.side(), type: square.type() };
                });
            });
        },

        buildGameFromData = function (boardData) {
            return _.map(boardData, function (row) {
                return _.map(row, function (square) {
                    if(square) {
                        var type = _.invert(PIECE)[square.type];
                        return createPieceModel[type]({ side: square.side });
                    }
                    else {
                        return null;
                    }
                });
            });
        },

        board = that.autoPublish("board", extractBoardData),

        side = that.autoPublish("side"),

        awaitingPawnPromotion = false,

        setupNewGameBoard = (function () {
            var homeRow = function (side) {
                    return _.map(
                        ['rook', 'knight', 'bishop', 'queen',
                         'king', 'bishop', 'knight', 'rook'],
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

        resetEnPassant = function (board) {
            foreachSquare(board, function (piece, coord) {
                if(piece && piece.type() === PIECE.pawn) {
                    piece.isEnPassant = false;
                }
            });
        },

        movePiece = function (start, end, optBoard) {
            var piece = getPiece(start, optBoard);
            resetEnPassant(optBoard || board());
            if(piece) {
                if(piece.type() === PIECE.king || piece.type() === PIECE.rook) {
                    piece.isMoved = true;
                }
                else if(
                    piece.type() === PIECE.pawn &&
                    Math.abs(start.y - end.y) === 2
                ) {
                    piece.isEnPassant = true;
                }
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
            gameStack.push({
                board: extractBoardData(board()),
                side: side()
            });
            if(isGameOver()) {
                that.publish("winner", opponentSide());
            }
        },

        isGameOver = function () {
            var isGameOver = true,
                tempBoard;

            if(isInCheck(board())) {
                foreachSquare(board(), function (piece, coord) {
                    if(piece && piece.side() === side()) {
                        _.each(piece.getMoves(coord, board()), function (moveCoord) {
                            tempBoard = cloneBoard(board());
                            movePiece(coord, moveCoord, tempBoard);
                            if(!isInCheck(tempBoard)) {
                                isGameOver = false;
                            }
                        });
                    }
                });
                return isGameOver;
            }
            else {
                return false;
            }
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

        isInCheck = function (testBoard, optSide) {
            var testSide = optSide || side(),
                kingPosition = getKingPositions(testBoard)[testSide],
                isCheck = false;

            foreachSquare(testBoard, function (piece, coord) {
                if(piece && piece.side() === opponentSide(testSide)) {
                    _.each(piece.getMoves(coord, testBoard), function (move) {
                        if(_.isEqual(move, kingPosition)) {
                            isCheck = true;
                        }
                    });
                }
            });
            return isCheck;
        },

        isCastleMove = function (start, end) {
            return ( start.x === 4 && (start.y === 0 || start.y === 7) &&
                    (end.x === 6 || end.x === 2) && (start.y === end.y) );
        },

        getRookCastleStartCoord = function (end) {
            return end.x === 6 ? { x: 7, y: end.y } : { x: 0, y: end.y };
        },

        getRookCastleEndCoord = function (end) {
            return end.x === 6 ? { x: 5, y: end.y } : { x: 3, y: end.y };
        },

        isRookPresentForCastle = function (end) {
            var rookCoord = getRookCastleStartCoord(end),
                piece = getPiece(rookCoord);

            return piece && piece.side() === side() && piece.type() === PIECE.rook;
        },

        isCastleIntoCheck = function (start, end) {
            var tempBoard = cloneBoard(board());
            movePiece(start, end, tempBoard);
            movePiece(
                getRookCastleStartCoord(end),
                getRookCastleEndCoord(end),
                tempBoard
            );
            return isInCheck(tempBoard);
        },

        isCastleThroughCheck = function (start, end) {
            var tempBoard = cloneBoard(board());
            movePiece(
                start,
                {
                    x: end.x === 2 ? start.x - 1 : start.x + 1,
                    y: end.y
                },
                tempBoard
            );
            return isInCheck(tempBoard);
        },

        isKingsFirstMove = function () {
            var king = getPiece(getKingPositions(board())[side()]);
            return !king.isMoved;
        },

        isRooksFirstMove = function (castlingCoord) {
            var rook = getPiece(getRookCastleStartCoord(castlingCoord));
            return rook && rook.type() === PIECE.rook && !rook.isMoved;
        },

        castle = function (start, end) {
            movePiece(start, end);
            movePiece(getRookCastleStartCoord(end), getRookCastleEndCoord(end));
        },

        isSpaceClearForCastle = function (end) {
            if(end.x === 6) {
                return ( getPiece({ x: 5, y: end.y }) === null &&
                         getPiece({ x: 6, y: end.y }) === null );
            }
            else {
                return ( getPiece({ x: 3, y: end.y }) === null &&
                         getPiece({ x: 2, y: end.y }) === null &&
                         getPiece({ x: 1, y: end.y }) === null );
            }
        },

        isMoveIntoCheck = function (start, end) {
            var tempBoard = cloneBoard(board());
            movePiece(start, end, tempBoard);
            return isInCheck(tempBoard);
        },

        isEnPassantMove = function (start, end) {
            var piece = getPiece(start),
                opponent = getPiece({ x: end.x, y: start.y });
            if(
                piece &&
                piece.type() === PIECE.pawn &&
                Math.abs(start.x - end.x) === 1 &&
                Math.abs(start.y - end.y) === 1 &&
                getPiece(end) === null &&
                opponent.type() === PIECE.pawn &&
                opponent.side() === opponentSide() &&
                opponent.isEnPassant
            ) {
                if(side() === SIDE.white) {
                    return start.y - end.y > 0;
                }
                else {
                    return start.y - end.y < 0;
                }
            }
            else {
                return false;
            }
        },

        isPawnPromotion = function (start, end) {
            var piece = getPiece(start);

            return (
                piece &&
                piece.type() === PIECE.pawn &&
                (
                    (piece.side() === SIDE.white && end.y === 0) ||
                    (piece.side() === SIDE.black && end.y === 7)
                ) &&
                canPieceMove(start, end)
            );
        };

    //optionally initialize board state.
    if(fig.board && fig.side) {
        board(fig.board);
        side(fig.side);
        gameStack.push({
            board: extractBoardData(fig.board),
            side: fig.side
        });
    }
    else if(fig.board || fig.side) {
        throw "must supply board and side or none at all";
    }

    that.undo = function () {
        var newState = gameStack.undo();
        if(newState) {
            side(newState.side);
            board(buildGameFromData(newState.board));
        }
    };

    that.redo = function () {
        var newState = gameStack.redo();
        if(newState) {
            side(newState.side);
            board(buildGameFromData(newState.board));
        }
    };

    that.getGameState = function () {
        return {
            side: side(),
            board: extractBoardData(board())
        };
    };

    that.loadGame = function (boardData, sideData) {
        gameStack.clear();
        board(buildGameFromData(boardData));
        side(sideData);
    };

    that.newGame = function () {
        gameStack.clear();
        board(setupNewGameBoard());
        side(SIDE.white);
        gameStack.push({
            board: extractBoardData(board()),
            side: side()
        });
        that.publish("newGame", {});
    };

    var findPawnToPromoteCoord = function () {
        var row = side() === SIDE.black ? 7 : 0,
            foundCoord;

        foreachSquare(board(), function (piece, coord) {
            if(
                coord.y === row && piece &&
                piece.type() === PIECE.pawn &&
                piece.side() === side()
            ) {
                foundCoord = coord;
            }
        });
        return foundCoord;
    };

    that.promotePawn = function (newType) {
        var coord = findPawnToPromoteCoord(),
            piece = getPiece(coord),
            promoteType = _.invert(PIECE)[newType];

        if(
            piece &&
            piece.type() === PIECE.pawn &&
            (coord.y === 0 || coord.y === 7)
        ) {
            setPiece(createPieceModel[promoteType]({ side: side() }), coord);
            changeSides();
            awaitingPawnPromotion = false;
        }
    };

    that.isOwnPiece = function (coord) {
        return isOwnPiece(coord);
    };

    that.makeMove = function (start, end) {
        var isMoved;
        if(isOwnPiece(start) && !awaitingPawnPromotion) {
            if(isCastleMove(start, end)) {
                if(
                    isRookPresentForCastle(end) &&
                    isKingsFirstMove() &&
                    isRooksFirstMove(end) &&
                    isSpaceClearForCastle(end) &&
                    !isCastleIntoCheck(start, end) &&
                    !isCastleThroughCheck(start, end)
                ) {
                    castle(start, end);
                    changeSides();
                    isMoved = true;
                }
                else {
                    isMoved = false;
                }
            }
            else if(isEnPassantMove(start, end) && !isMoveIntoCheck(start, end)) {
                setPiece(null, { x: end.x, y: start.y });
                movePiece(start, end);
                changeSides();
                isMoved = true;
            }
            else if(isPawnPromotion(start, end) && !isMoveIntoCheck(start,end)) {
                movePiece(start, end);
                awaitingPawnPromotion = true;
                isMoved = true;
                that.publish("pawnPromotion", side());
            }
            else {
                if(canPieceMove(start, end) && !isMoveIntoCheck(start, end)) {
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
