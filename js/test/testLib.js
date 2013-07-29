var tLib = (function () {
    var self = {};

    self.blankBoard = function () {
        return _.map(_.range(8), function () {
            return _.pad(8, null);
        });
    };

    self.mockPiece = function (side, type) {
        return {
            side: function () { return side; },
            type: function () { return type; }
        };
    };

    self.blackPawn = function () {
        return self.mockPiece(SIDE.black, PIECE.pawn);
    };

    self.whitePawn = function () {
        return self.mockPiece(SIDE.white, PIECE.pawn);
    };

    return self;
}());
