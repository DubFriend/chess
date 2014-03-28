(function () {
"use strict";

var isOnBoard = function (coord) {
    return coord.x >= 0 && coord.x < 8 && coord.y >= 0 && coord.y < 8;
};

var line = function (coord, advanceA, advanceB) {
    var a = advanceA(coord),
        b = advanceB(coord),
        moves = [];
    while(isOnBoard(a)) {
        moves.push(a);
        a = advanceA(a);
    }
    while(isOnBoard(b)) {
        moves.push(b);
        b = advanceB(b);
    }
    return moves;
};

var horizontal = function (coord) {
    return line(
        coord,
        function (coord) {
            return { x: coord.x - 1, y: coord.y };
        },
        function (coord) {
            return { x: coord.x + 1, y: coord.y };
        }
    );
};

var vertical = function (coord) {
    return line(
        coord,
        function (coord) {
            return { x: coord.x, y: coord.y + 1 };
        },
        function (coord) {
            return { x: coord.x, y: coord.y - 1};
        }
    );
};

var rising = function (coord) {
    return line(
        coord,
        function (coord) {
            return { x: coord.x + 1, y: coord.y - 1 };
        },
        function (coord) {
            return { x: coord.x - 1, y: coord.y + 1 };
        }
    );
};

var falling = function (coord) {
    return line(
        coord,
        function (coord) {
            return { x: coord.x + 1, y: coord.y + 1 };
        },
        function (coord) {
            return { x: coord.x - 1, y: coord.y - 1 };
        }
    );
};

var king;
module("King Model", {
    setup: function () {
        king = createPieceModel.king({ side: SIDE.black });
    }
});

test("side (on all pieces)", function () {
    deepEqual(king.side(), SIDE.black, "side is set");
});

test("type", function () {
    deepEqual(king.type(), PIECE.king, "type is set");
});

test("getMoves", function () {
    deepEqual(
        king.getMoves({ x: 0, y: 0 }, tLib.blankBoard()),
       [{x: 1, y: 1},
        {x: 1, y: 0},
        {x: 0, y: 1}],
        "top right corner ok"
    );

    deepEqual(
        king.getMoves({ x: 1, y: 1}, tLib.blankBoard()),
       [{x: 2, y: 2},
        {x: 2, y: 1},
        {x: 2, y: 0},
        {x: 1, y: 2},
        {x: 1, y: 0},
        {x: 0, y: 2},
        {x: 0, y: 1},
        {x: 0, y: 0}],
        "off the sides ok"
    );

    var populatedBoard = tLib.blankBoard();
    populatedBoard[2][1] = tLib.whitePawn();
    populatedBoard[2][3] = tLib.blackPawn();

    deepEqual(
        king.getMoves({ x: 2, y: 2 }, populatedBoard),
        [{ x: 3, y: 3 }, { x: 3, y: 1 }, { x: 2, y: 3 }, { x: 2, y: 1 },
         { x: 1, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 1 }],
        "respects blocked paths"
    );
});



var queen;
module("Queen Model", {
    setup: function () {
        queen = createPieceModel.queen({
            side: SIDE.black
        });
    }
});

test("type", function () {
    deepEqual(queen.type(), PIECE.queen, "type is set");
});

var populatedBoard = function () {
    var board = tLib.blankBoard();
    board[2][0] = tLib.blackPawn();
    board[2][4] = tLib.whitePawn();
    board[3][2] = tLib.blackPawn();
    board[3][3] = tLib.whitePawn();
    return board;
};

test("getMoves", function () {
    var coord = { x: 1, y: 1 };
    deepEqual(
        queen.getMoves(coord, tLib.blankBoard()),
        _.union(
            horizontal(coord),
            vertical(coord),
            rising(coord),
            falling(coord)
        ),
        "correct queen moves returned"
    );

    deepEqual(
        queen.getMoves({ x: 2, y: 2 }, populatedBoard()),
        [{ x: 1, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 2, y: 1 },
         { x: 2, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 0 }, { x: 1, y: 3 },
         { x: 0, y: 4 }, { x: 3, y: 3 }, { x: 1, y: 1 }, { x: 0, y: 0 }],
        "respects blocked paths"
    );
});



var rook;
module("Rook Model", {
    setup: function () {
        rook = createPieceModel.rook({ side: SIDE.black });
    }
});

test("type", function () {
    deepEqual(rook.type(), PIECE.rook, "type is set");
});

test("getMoves", function () {
    var coord = { x: 5, y: 5 };
    deepEqual(
        rook.getMoves(coord, tLib.blankBoard()),
        _.union(horizontal(coord), vertical(coord)),
        "correct rook moves returned"
    );

    deepEqual(
        rook.getMoves({ x: 2, y: 2 }, populatedBoard()),
        [{ x: 1, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
         { x: 2, y: 1 }, { x: 2, y: 0 }],
        "respects blocked paths"
    );
});



var bishop;
module("Bishop Model", {
    setup: function () {
        bishop = createPieceModel.bishop({ side: SIDE.black });
    }
});

test("type", function () {
    deepEqual(bishop.type(), PIECE.bishop, "type is set");
});

test("getMoves", function () {
    var coord = { x: 3, y: 2 };
    deepEqual(
        bishop.getMoves(coord, tLib.blankBoard()),
        _.union(rising(coord), falling(coord)),
        "correct bishop moves returned"
    );

    var testBoard = populatedBoard();
    testBoard[3][1] = tLib.blackPawn();
    deepEqual(
        bishop.getMoves({ x: 2, y: 2 }, testBoard),
        [{ x: 3, y: 1 }, { x: 4, y: 0 }, { x: 3, y: 3 },
         { x: 1, y: 1 }, { x: 0, y: 0 }],
        "respects blocked paths"
    );
});



var knight;
module("Knight Model", {
    setup: function () {
        knight = createPieceModel.knight({ side: SIDE.black });
    }
});

test("type", function () {
    deepEqual(knight.type(), PIECE.knight, "type is set");
});

test("getMoves", function () {
    deepEqual(
        knight.getMoves({ x: 6, y: 2 }, tLib.blankBoard()),
       [{ x: 4, y: 1 },
        { x: 4, y: 3 },
        { x: 5, y: 0 },
        { x: 5, y: 4 },
        { x: 7, y: 0 },
        { x: 7, y: 4 }],
        "correct knight moves set"
    );

    var populatedBoard = tLib.blankBoard();
    populatedBoard[0][1] = tLib.whitePawn();
    populatedBoard[0][3] = tLib.blackPawn();
    populatedBoard[1][1] = tLib.blackPawn();
    populatedBoard[1][2] = tLib.blackPawn();
    populatedBoard[2][1] = tLib.blackPawn();
    deepEqual(
        knight.getMoves({ x: 2, y: 2 }, populatedBoard),
        [{ x: 0, y: 1 }, { x: 0, y: 3 }, { x: 1, y: 0 }, { x: 1, y: 4 },
         { x: 3, y: 4 }, { x: 4, y: 1 }, { x: 4, y: 3 }],
        "does not land on square occupied by own player"
    );
});



var pawn;
module("Pawn Model", {
    setup: function () {
        pawn = createPieceModel.pawn({ side: SIDE.black });
    }
});

test("type", function () {
    deepEqual(pawn.type(), PIECE.pawn, "type is set");
});

test("getMoves", function () {
    deepEqual(
        pawn.getMoves({ x: 1, y: 1 }, tLib.blankBoard()),
       [{ x: 1, y: 2}, { x: 1, y: 3}],
        "correct moves from home row"
    );

    deepEqual(
        pawn.getMoves({ x: 0, y: 3 }, tLib.blankBoard()),
        [{ x: 0, y: 4}],
        "correct moves off home row"
    );

    var populatedBoard = tLib.blankBoard();
    populatedBoard[3][1] = tLib.blackPawn();
    populatedBoard[3][2] = tLib.whitePawn();
    populatedBoard[3][3] = tLib.whitePawn();
    deepEqual(
        pawn.getMoves({ x: 2, y: 2 }, populatedBoard),
        [{x: 3, y: 3 }],
        "respects blocked paths, and attacks diagonally (black)"
    );
});

test("getMoves - white pawn", function () {
    var pawn = createPieceModel.pawn({ side: SIDE.white });

    deepEqual(
        pawn.getMoves({ x: 0, y: 6 }, tLib.blankBoard()),
       [{ x: 0, y: 5}, { x: 0, y: 4}],
        "correct moves from home row"
    );

    deepEqual(
        pawn.getMoves({ x: 1, y: 5 }, tLib.blankBoard()),
        [{ x: 1, y: 4}],
        "correct moves off home row"
    );

    var populatedBoard = tLib.blankBoard();
    populatedBoard[4][1] = tLib.whitePawn();
    populatedBoard[4][2] = tLib.blackPawn();
    populatedBoard[4][3] = tLib.blackPawn();
    deepEqual(
        pawn.getMoves({ x: 2, y: 5 }, populatedBoard),
        [{x: 3, y: 4 }],
        "respects blocked paths, and attacks diagonally (white)"
    );
});


}()); //end outer iife
