import Konva from 'konva';
import { fadeIn, fadeOut } from '~/js/common/plugins';

import imageSrc from '~/assets/images/image.jpg';

var stage = new Konva.Stage({
    container: 'container',
    width: 700,
    height: 600,
});

const layer = new Konva.Layer();

let isEraising = false;
let eraser = null;
let cursor = null;

const image = new Image();
image.src = imageSrc;

const ERASER_RADIUS = 15;

stage.add(layer);

drawScene(image);

initActions();

function drawScene(image) {
    image.onload = function () {
        const img = new Konva.Image({
            x: 0,
            y: 0,
            image,
        });

        layer.add(img);
        img.zIndex(0);
    };

    cursor = new Konva.Circle({
        x: 0,
        y: 0,
        radius: ERASER_RADIUS,
        fill: 'transparent',
        strokeWidth: 2,
        stroke: 'black',
        visible: false,
        listening: false,
    });

    layer.add(cursor);
}

function setSceneEvents() {
    stage.on('mousedown touchstart', function (e) {
        isEraising = true;
        const pos = stage.getPointerPosition();
        eraser = new Konva.Line({
            stroke: '#fff',
            strokeWidth: ERASER_RADIUS * 2,
            lineCap: 'round',
            lineJoin: 'round',
            globalCompositeOperation: 'destination-out',
            points: [pos.x, pos.y],
        });
        layer.add(eraser);
        eraser.zIndex(1);
    });

    stage.on('mouseup touchend', function () {
        isEraising = false;
    });

    layer.on('mousemove', function (e) {
        const pos = stage.getPointerPosition();
        cursor.show();
        cursor.x(pos.x);
        cursor.y(pos.y);
    });

    layer.on('mouseleave', function (e) {
        cursor.hide();
    });

    stage.on('mousemove touchmove', function () {
        if (!isEraising) {
            return;
        }

        const pos = stage.getPointerPosition();
        var newPoints = eraser.points().concat([pos.x, pos.y]);
        eraser.points(newPoints);
        cursor.x(pos.x);
        cursor.y(pos.y);
    });
}

function clearSceneEvents() {
    stage.off('mousedown touchstart mouseup touchend mousemove touchmove');
    layer.off('mousemove mouseleave');

    cursor.hide();
}

function downloadURI(uri, name) {
    let link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    link = null;
}

function initActions() {
    const applyBtn = document.querySelector('#apply');
    const editBtn = document.querySelector('#edit');
    const saveBtn = document.querySelector('#save');
    const resetBnt = document.querySelector('#reset');

    applyBtn.addEventListener('click', () => {
        const newImage = new Image();
        const savedUri = stage.toDataURL();

        layer.destroyChildren();
        newImage.src = savedUri;

        drawScene(newImage);

        fadeOut(applyBtn);
        fadeOut(resetBnt).then(() => {
            fadeIn(editBtn);
            clearSceneEvents();
        });
    });

    saveBtn.addEventListener('click', () => {
        var dataURL = stage.toDataURL();
        downloadURI(dataURL, 'result.png');
    });

    resetBnt.addEventListener('click', () => {
        layer.destroyChildren();
        const newImage = new Image();
        newImage.src = imageSrc;
        drawScene(newImage);
        fadeOut(applyBtn);
        fadeOut(resetBnt).then(() => {
            fadeIn(editBtn);
            clearSceneEvents();
        });
    });

    editBtn.addEventListener('click', () => {
        fadeOut(editBtn).then(() => {
            fadeIn(resetBnt);
            fadeIn(applyBtn);

            setSceneEvents();
        });
    });
}
