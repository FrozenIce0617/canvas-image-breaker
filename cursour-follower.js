"use strict";

let cursour_canvas = {
  canvas: null,
  ctx: null,
  x: undefined,
  y: undefined,
  amt: 20,
  colors: [],
  array: [],
  life: [],
  angle: [],

  init() {
    this.canvas = document.getElementById("cursour-follower");
    this.canvas.width = window.innerWidth;
    this.canvas.height = 1200;

    this.ctx = this.canvas.getContext("2d");
    this.paint();

    this.canvas.addEventListener(
      "mousemove",
      function (e) {
        // erase with fade effect
        cursour_canvas.ctx.fillStyle = "hsla(0, 0%, 0%, 0.1)";
        cursour_canvas.ctx.fillRect(0, 0, cursour_canvas.canvas.width, cursour_canvas.canvas.width);

        cursour_canvas.x = e.pageX;
        cursour_canvas.y = e.pageY;

        for (let i = 0; i < cursour_canvas.amt; i++) {
          cursour_canvas.array.push(
            new Sprite({ x: cursour_canvas.x, y: cursour_canvas.y, l: 10, color: cursour_canvas.colors[i] })
          );
          cursour_canvas.life.push(1);
          cursour_canvas.angle.push(i + 360);
        }
      },
      false
    );

    this.rendering();
  },

  paint() {
    for (let i = 0; i < this.amt; i++) {
      this.colors.push("hsla(" + i * 360 / this.amt + ", 100%, 50%, 1)");
    }
  },

  rendering() {
    for (let i = 0; i < cursour_canvas.array.length; i++) {
      cursour_canvas.array[i].update(i);
    }

    requestAnimationFrame(cursour_canvas.rendering);
  },
};

class Sprite {
  constructor(options) {
    this.x = this.oldX = options.x;
    this.y = this.oldY = options.y;
    this.l = options.l;
    this.color = options.color;
    this.dx = this.dy = undefined;
    this.shift = undefined;
    this.gravity = 0.3;
  }

  update(i) {
    if (cursour_canvas.life[i] < 150) {
      cursour_canvas.life[i]++;
      this.shift = ((this.x - cursour_canvas.x) ** 2 + (this.y - cursour_canvas.y) ** 2) ** 0.25;
      cursour_canvas.angle[i] -= 0.0001 * cursour_canvas.angle[i];
      this.dx = this.shift * Math.cos(cursour_canvas.angle[i]);
      this.dy = this.shift * Math.sin(cursour_canvas.angle[i]);
      this.x += this.dx + (this.oldX - this.x) * this.gravity;
      this.y += this.dy + (this.oldY - this.y) * this.gravity;
      cursour_canvas.ctx.fillStyle = this.color;
      cursour_canvas.ctx.fillRect(
        this.x,
        this.y,
        this.l - cursour_canvas.life[i] / 5,
        this.l - cursour_canvas.life[i] / 5
      );
    } else {
      cursour_canvas.array.splice(i, 1);
      cursour_canvas.angle.splice(i, 1);
      cursour_canvas.life.splice(i, 1);
    }
  }
}

window.addEventListener("load", () => {
  cursour_canvas.init();
});
