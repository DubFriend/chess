(function () {
"use strict";

var boardModel,
    boardData;

module("boardModel", {
    setup: function () {
        boardData = undefined;
        boardModel = createBoardModel();
        boardModel.subscribe("board", function (data) {
            boardData = data;
        });
    }
});

test("initial board piece setup", function () {
    var rowOfPawns = function (side) {
            var row = [];
            _.each(_.range(8), function () {
                row.push({ type: PIECE.pawn, side: side });
            });
            return row;
        },

        homeRow = function (side) {
            return [
                { type: PIECE.rook, side: SIDE.black },
                { type: PIECE.knight, side: SIDE.black },
                { type: PIECE.bishop, side: SIDE.black },
                { type: PIECE.king, side: SIDE.black },
                { type: PIECE.queen, side: SIDE.black },
                { type: PIECE.bishop, side: SIDE.black },
                { type: PIECE.knight, side: SIDE.black },
                { type: PIECE.rook, side: SIDE.black }
            ];
        },

        emptyRow = function () {
            var row = [];
            _.each(_.range(8), function () {
                row.push(null);
            });
            return row;
        };

    boardModel.newGame();
    deepEqual(
        boardData,
        [
            homeRow(SIDE.black),
            rowOfPawns(SIDE.black),
            emptyRow(), emptyRow(), emptyRow(), emptyRow(),
            rowOfPawns(SIDE.white),
            homeRow(SIDE.white)
        ],
        "pieces are set up for a new game"
    );
});

}());