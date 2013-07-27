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
            var row = [];
            _.each(_.range(8), function () {
                row.push({ type: PIECE.pawn, side: side });
            });
            return row;
        },

        homeRow = function (side) {
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