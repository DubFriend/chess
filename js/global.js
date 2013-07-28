//utility functions added into the underscore namespace.
_.mixin({
    pad: function (num, val) {
        return _.map(_.range(num), function () { return val; });
    }
});

var PIECE = {
        king: "k",
        queen: "q",
        rook: "r",
        knight: "n",
        bishop: "b",
        pawn: "p"
    },

    SIDE = {
        black: "b",
        white: "w"
    },

    GAME_STATUS = {
        newGame: "new"
    };
