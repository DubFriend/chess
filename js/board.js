var createBoardModel = function (fig) {
    var that = jsMessage.mixinPubSub({}),
        board,

        setupNewGameBoard = (function () {
            var homeRow = function (side) {
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
                },

                rowOfPawns = function (side) {
                    var row = [];
                    _.each(_.range(8), function () {
                        row.push({ type: PIECE.pawn, side: side });
                    });
                    return row;
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

        }());

    that.newGame = function () {
        board = setupNewGameBoard();
        that.publish("status", GAME_STATUS.newGame);
        that.publish("board", board);
    };

    return that;
};


var createBoardController = function (fig) {

};
