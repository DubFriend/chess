(function () {
"use strict";

var boardModel,
    boardData,
    sideData;

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
    }
});

test("initial board piece setup", function () {
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

    deepEqual(sideData, SIDE.white, "side started on white");
});

}());
