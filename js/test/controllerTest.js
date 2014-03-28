(function () {
"use strict";
var mockModel, mockView, controller;

module("controller", {
    setup: function () {
        mockModel = {
            makeMove: function (start, end) {
                this.makeMoveData = {
                    start: start,
                    end: end
                };
            },
            makeMoveData: null,
            isOwnPiece: function () {
                return this.ownPieceStack.pop();
            },
            ownPieceStack: [false, true]
        };

        mockView = {
            position: function (board) {
                this.positionData = board;
            },
            positionData: null
        };

        controller = createController({
            model: mockModel,
            view: mockView
        });

    }
});

test("click to move", function () {
    controller.clickSquare("e2");
    deepEqual(mockModel.makeMoveData, null, "unmoved on first click");
    controller.clickSquare("f3");
    deepEqual(
        mockModel.makeMoveData,
        {
            start: { x: 4, y: 6 },
            end: { x: 5, y: 5 }
        },
        "moved on second click"
    );
    mockModel.ownPieceStack = [false, true];
    controller.clickSquare("a2");
    controller.clickSquare("a1");
    deepEqual(
        mockModel.makeMoveData,
        {
            start: { x: 0, y: 6 },
            end: { x: 0, y: 7 }
        },
        "multiple moves ok"
    );
});

test("boardUpdate", function () {
    var eachPiece = function (side) {
            return _.values(_.map(PIECE, function (type) {
                return { type: type, side: side };
            }));
        },
        board = [eachPiece(SIDE.black), eachPiece(SIDE.white), [null]];
    controller.boardUpdate(board);
    deepEqual(mockView.positionData, {
        a8: "bK", b8: "bQ", c8: "bR", d8: "bN", e8: "bB", f8: "bP",
        a7: "wK", b7: "wQ", c7: "wR", d7: "wN", e7: "wB", f7: "wP"
    }, "view's board is updated");
});


}());