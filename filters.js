function draw(option) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var query = document.getElementById('query').value;
    var img = new Image();

    img.onload = function() {
        if (img.width > window.innerWidth * 0.9) {
            var ratio = img.width / img.height;
            var w = window.innerWidth * 0.9;
            var h = w / ratio;
            canvas.width = w;
            canvas.height = h;
            context.drawImage(img, 0, 0, w, h);
        } else {
            canvas.height = img.height;
            canvas.width = img.width;
            context.drawImage(img, 0, 0);
        }

        if (option === 'original') {
            return;
        }

        var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        var data = imgData.data;

        if (option === 'inverted') {
            invert(data);
        } else if (option === 'grayscale') {
            gray(data);
        } else if (option === 'split') {
            split(data, canvas.width * .02, canvas, context);
            return;
        }
        context.putImageData(imgData, 0, 0);
    };
    img.crossOrigin = "anonymous";
    img.src = query;
};

function invert(data) {
    for (var i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
};

function gray(data) {
    for (var i = 0; i < data.length; i += 4) {
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }
};

function split(data, offset, canvas, context) {
    var red = getChannel([1, 0, 0], data, canvas, context);
    var green = getChannel([0, 1, 0], data, canvas, context);
    var blue = getChannel([0, 0, 1], data, canvas, context);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = 'screen';

    renderChannel(red, 0, canvas, context);
    renderChannel(green, offset, canvas, context);
    renderChannel(blue, offset * 2, canvas, context);
};

function getChannel(colorArray, data, canvas, context) {
    var channel = context.createImageData(canvas.width, canvas.height);
    for (var i = 0; i < data.length; i += 4) {
        channel.data[i] = data[i] * colorArray[0];
        channel.data[i + 1] = data[i + 1] * colorArray[1];
        channel.data[i + 2] = data[i + 2] * colorArray[2];
        channel.data[i + 3] = data[i + 3];
    }
    return channel;
};

function renderChannel(channel, offset, canvas, context) {
    var tempCanvas = document.createElement('canvas');
    var tempContext = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempContext.putImageData(channel, -offset, 0);
    
    var tempImage = new Image();
    tempImage.onload = function() {
        context.drawImage(tempImage, 0, 0);
    };
    tempImage.src = tempCanvas.toDataURL();
};