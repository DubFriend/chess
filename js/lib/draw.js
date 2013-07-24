//class for drawing to the canvas.
var createDraw = function (fig) {
    "use strict";

    var ctx = fig.context,
        WIDTH = fig.width,
        HEIGHT = fig.height,
        defaultColor = fig.defaultColor || 'yellow',

        path = function (callback) {
            ctx.beginPath();
            callback();
            ctx.closePath();
        },

        circlePath = function (coord, size) {
            path(function () {
                ctx.arc(coord.x, coord.y, size, 0, Math.PI * 2, true);
            });
        };

    return {
        disc: function (fig) {
            ctx.fillStyle = fig.color || defaultColor;
            circlePath(fig.coord, fig.size);
            ctx.fill();
        },

        circle: function (fig) {
            ctx.strokeStyle = fig.color || defaultColor;
            circlePath(fig.coord, fig.size);
            ctx.stroke();
        },

        rectangle: function (fig) {
            ctx.fillStyle = fig.color || defaultColor;
            ctx.fillRect(fig.coord.x, fig.coord.y, fig.width, fig.height);
        },

        square: function (fig) {
            this.rectangle({
                coord: fig.coord,
                color: fig.color,
                width: fig.size,
                height: fig.size
            });
        },

        image: function (fig) {
            ctx.drawImage(image, x, y);
        },

        clear: function () {
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
        }
    };
};
