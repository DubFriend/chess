$(document).ready(function () {
    'use strict';

    var $canvasArea = $('#board');

    $canvasArea.html(
        '<canvas ' +
            'id="canvas" ' +
            'width="' + $canvasArea.width() + '" ' +
            'height="' + $canvasArea.height() + '">' +
        '</canvas>'
    );

    var $canvas = $('#canvas'),
        draw = createDraw({
            context: $canvas[0].getContext('2d'),
            width: $canvas.width(),
            height: $canvas.height()
        });

    draw.circle({
        coord: {x: 40, y: 50},
        size: 50
    });

    draw.disc({
        coord: {x: 250, y: 300},
        size: 70,
        color: "pink"
    });

    draw.rectangle({
        coord: {x: 10, y: 20},
        width: 30,
        height: 50,
        color: "orange"
    });

    draw.square({
        coord: {x: 120, y: 150},
        size: 100,
        color: "green"
    });
});
