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

var blankBoard = function () {
    return _.map(_.range(8), function () {
        return _.pad(8, null);
    });
};

var mockPiece = function (fig) {
    return {
        side: function () { return fig.side; },
        type: function () { return fig.type; }
    };
};

var blackPawn = function () {
    return mockPiece({ side: SIDE.black, type: PIECE.pawn });
};

var whitePawn = function () {
    return mockPiece({ side: SIDE.white, type: PIECE.pawn });
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
        king.getMoves({ x: 0, y: 0 }, blankBoard()),
       [{x: 1, y: 1},
        {x: 1, y: 0},
        {x: 0, y: 1}],
        "top right corner ok"
    );

    deepEqual(
        king.getMoves({ x: 1, y: 1}, blankBoard()),
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

    var populatedBoard = blankBoard();
    populatedBoard[1][2] = whitePawn();
    populatedBoard[3][2] = blackPawn();
    deepEqual(
        king.getMoves({ x: 2, y: 2 }, populatedBoard),
        [{ x: 3, y: 3 },
         { x: 3, y: 1 },
         { x: 2, y: 3 },
         { x: 2, y: 1 },
         { x: 1, y: 3 },
         { x: 1, y: 2 },
         { x: 1, y: 1 }],
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

test("getMoves", function () {
    var coord = { x: 1, y: 1 };
    deepEqual(
        queen.getMoves(coord, blankBoard()),
        _.union(
            horizontal(coord),
            vertical(coord),
            rising(coord),
            falling(coord)
        ),
        "correct queen moves returned"
    );

    var populatedBoard = blankBoard();
    populatedBoard[0][2] = blackPawn();
    populatedBoard[4][2] = whitePawn();
    populatedBoard[2][3] = blackPawn();
    populatedBoard[3][3] = whitePawn();
/*
    deepEqual(
        queen.getMoves({ x: 2, y: 2 }, populatedBoard),
        "foo",
        "respects blocked paths"
    );
*/
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
        rook.getMoves(coord, blankBoard()),
        _.union(horizontal(coord), vertical(coord)),
        "correct rook moves returned"
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
        bishop.getMoves(coord, blankBoard()),
        _.union(rising(coord), falling(coord)),
        "correct bishop moves returned"
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
        knight.getMoves({ x: 6, y: 2 }, blankBoard()),
       [{ x: 4, y: 1 },
        { x: 4, y: 3 },
        { x: 5, y: 0 },
        { x: 5, y: 4 },
        { x: 7, y: 0 },
        { x: 7, y: 4 }],
        "correct knight moves set"
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
        pawn.getMoves({x: 1, y: 1}, blankBoard()),
       [{ x: 1, y: 2},
        { x: 1, y: 3}],
        "correct moves from home row"
    );

    deepEqual(
        pawn.getMoves({x: 0, y: 3}, blankBoard()),
        [{ x: 0, y: 4}],
        "correct moves off home row"
    );
});



}()); //end outer iife
