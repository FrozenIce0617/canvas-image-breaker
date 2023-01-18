"use strict";

const getFileBlob = function (url, cb) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "blob";
  xhr.addEventListener("load", function () {
    cb(xhr.response);
  });
  xhr.send(null);
};

const blobToFile = function (blob, name) {
  blob.lastModifiedDate = new Date();
  blob.name = name;
  return blob;
};

const getFileObject = function (filePathOrUrl, cb) {
  getFileBlob(filePathOrUrl, function (blob) {
    cb(blobToFile(blob, "test.jpg"));
  });
};

const pixel_canvase = {
  canvas: null,
  ctx: null,
  imageX: undefined,
  imageY: undefined,
  w: undefined,
  h: undefined,
  image: null,
  reader: null,
  pix: [], // canvas pixel information
  step: 2, // image tile size
  size: undefined,
  timerId: undefined,
  mouse: {
    x: undefined,
    y: undefined,
  },

  getBase64(file = null) {
    this.reader = new FileReader();
    if (file) {
      this.reader.readAsDataURL(file);
    } else {
      this.reader.readAsDataURL(document.getElementById("file-input").files[0]);
    }
    this.reader.addEventListener("load", (e) => {
      this.main();
    });
  },

  init() {
    this.canvas = document.getElementById("pixel-maipulation");
    this.w = this.canvas.width = window.innerWidth;
    this.h = this.canvas.height = window.innerHeight;

    this.ctx = this.canvas.getContext("2d");

    this.imageX = this.w / 2 - this.image.width / 2;
    this.imageY = this.h / 2 - this.image.height / 2;

    this.size = (this.image.width + this.image.width) * 10;
    this.ctx.drawImage(this.image, this.imageX, this.imageY);

    let p = this.ctx.getImageData(0, 0, this.w, this.h).data;

    for (let m = 0; m < this.h; m += this.step) {
      for (let n = 0; n < this.w; n += this.step) {
        let i = (m * this.w + n) * 4;
        let color = `rgb(${p[i]}, ${p[i + 1]}, ${p[i + 2]})`;
        if (p[i + 3] > 0) {
          this.pix.push(new Pixel(n, m, color));
        }
      }
    }
  },

  draw() {
    // clear canvas
    this.ctx.fillStyle = "hsla(0, 0%, 0%, 1)";
    this.ctx.fillRect(0, 0, this.w, this.h);

    // draw
    for (let i = 0; i < this.pix.length; i += 1) {
      this.pix[i].update();
      this.ctx.fillStyle = this.pix[i].color;
      this.ctx.fillRect(this.pix[i].x, this.pix[i].y, this.step, this.step);
    }
  },

  main() {
    this.image = document.createElement("img");
    this.image.src = pixel_canvase.reader.result;
    this.image.addEventListener("load", () => {
      this.init();
    });

    pixel_canvase.timerId = setInterval(function () {
      pixel_canvase.draw();
    }, 1000 / 60); // 60 frames per second
  },
};

class Pixel {
  constructor(x, y, color) {
    this.x = this.oldX = x;
    this.y = this.oldY = y;
    this.color = color;

    this.deltaX = this.deltaY = undefined;
    this.dx = this.dy = undefined;
    this.angle = undefined;
    this.shift = undefined;
    this.gravity = 0.1;
  }

  update() {
    this.deltaX = this.x - pixel_canvase.mouse.x;
    this.deltaY = this.y - pixel_canvase.mouse.y;
    this.shift = (this.deltaX ** 2 + this.deltaY ** 2) ** 0.7;
    this.angle = -Math.atan2(this.deltaY, this.deltaX);
    this.dx = (pixel_canvase.size / this.shift) * Math.cos(this.angle);
    this.dy = (pixel_canvase.size / this.shift) * Math.sin(this.angle);
    this.x += this.dx + (this.oldX - this.x) * this.gravity;
    this.y += this.dx + (this.oldY - this.y) * this.gravity;
  }
}

window.addEventListener(
  "mousemove",
  function (e) {
    pixel_canvase.mouse.x = e.x;
    pixel_canvase.mouse.y = e.y;
  },
  false
);

window.addEventListener("load", function () {
  getFileObject("card.png", function (fileObject) {
    pixel_canvase.getBase64(fileObject);

    alert("Refresh the page once if you are not able to see image");
  });
});
