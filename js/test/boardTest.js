(function () {
"use strict";

var boardModel,
    boardData,
    sideData,
    startingBoard = function () {
        var rowOfPawns = function (side) {
                return _.map(_.range(8), function () {
                    return { side: side, type: PIECE.pawn };
                });
            },

            homeRow = function (side) {
                return _.map(
                    [PIECE.rook, PIECE.knight, PIECE.bishop, PIECE.king,
                     PIECE.queen, PIECE.bishop, PIECE.knight, PIECE.rook],
                    function (type) {
                        return { side: side, type: type };
                    }
                );
            },

            emptyRow = function () {
                return _.pad(8, null);
            };

        return [
            homeRow(SIDE.black),
            rowOfPawns(SIDE.black),
            emptyRow(), emptyRow(), emptyRow(), emptyRow(),
            rowOfPawns(SIDE.white),
            homeRow(SIDE.white)
        ];
    };

module("boardModel", {
    setup: function () {
        boardData = undefined;
        sideData = undefined;
        boardModel = createBoardModel();
        boardModel.subscribe("board", function (data) {
            boardData = data;
        });
        boardModel.subscribe("side", function (data) {
            sideData = data;
        });
        boardModel.newGame();
    }
});

test("initial board piece setup", function () {
    deepEqual(boardData, startingBoard(), "pieces are set up on board");
    deepEqual(sideData, SIDE.white, "side started on white");
});

test("makeMove - ok", function () {
    ok(boardModel.makeMove({ x: 0, y: 6 }, { x: 0, y: 5}));
    deepEqual(boardData[6][0], null, "old square is empty");
    deepEqual(
        boardData[5][0],
        { side: SIDE.white, type: PIECE.pawn },
        "new square contains the moved piece"
    );
    //check that rest of pieces match original board
    boardData[6][0] = boardData[5][0];
    boardData[5][0] = null;
    deepEqual(boardData, startingBoard(), "rest of pieces in correct places");
});
/*
test("makeMove - fail - wrong player", function () {
    ok(!boardModel.makeMove({ x: 0, y: 1}, { x: 0, y: 2 }));
    deepEqual(boardData, startingBoard(), "board unchanged");
});

test("makeMove - fail - null square", function () {
    ok(!boardModel.makeMove({ x: 0, y: 3}, { x: 0, y: 4 }));
    deepEqual(boardData, startingBoard(), "board unchanged");
});

test("makeMove - fail - break piece's move rules", function () {
    ok(!boardModel.makeMove({ x: 0, y: 6 }, { x: 0, y: 4}));
    deepEqual(boardData, startingBoard(), "board unchanged");
});

var setupCheckTests = function (side) {
    var board = tLib.blankBoard();
    board[2][2] = createPieceModel.king({ side: SIDE.black });
    board[2][4] = createPieceModel.rook({ side: SIDE.black });
    board[2][5] = createPieceModel.rook({ side: SIDE.white });
    board[3][4] = createPieceModel.pawn({ side: SIDE.white });
    boardModel = createBoardModel({ board : board, side: side });
    boardModel.subscribe("board", function (data) {
        boardData = data;
    });
};

test("makeMove - ok - puts opponent into check", function () {
    setupCheckTests(SIDE.white);
    ok(boardModel.makeMove({ x: 5, y: 2 }, { x: 4, y: 2 }));
    deepEqual(
        boardData[2][4],
        { side: SIDE.white, type: PIECE.rook },
        "moves white rook"
    );
});

test("makeMove - fail - moves into check", function () {
    setupCheckTests(SIDE.black);
    ok(true);
});
*/

}());
