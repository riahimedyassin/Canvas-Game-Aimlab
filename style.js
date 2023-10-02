"use strict";
let mouse = {
  x: undefined,
  y: undefined,
  radius: 200,
};
const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const circleColors = ["white", "black", "blue", "green"];


//System de point 
class Points { 
  points = 0; 
  constructor(){
  }
  getPoints() {
      return this.points;
  }
  setPoints(increment) {
      this.points+=increment
  }

}
const gui=()=> {
  const pointsHolder = document.querySelector("#points")
  pointsHolder.innerHTML=points.getPoints(); 
}

const handleRezier = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
};


const points = new Points()
window.addEventListener("mousemove", (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
});
window.addEventListener("resize", () => {
  handleRezier();
});

window.addEventListener("click", (event) => {
  circles = circles.filter((circle) => {
    if (
      !(
        circle.x + circle.radius >= mouse.x &&
        circle.x - circle.radius <= mouse.x &&
        circle.y + circle.radius >= mouse.y &&
        circle.y - circle.radius <= mouse.y + mouse.radius
      )
    ) {
      return circle;
    }
    else {
      points.setPoints(1);
      gui()
    }
  });
});




class Circle   {
  constructor(x, y, radius, speedX, speedY, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
    this.color = color;
    this.RADIUS = radius;
  }
  draw() {
    const context = canvas.getContext("2d");
    context.beginPath();
    if (
      this.x >= mouse.x - mouse.radius &&
      this.x <= mouse.x + mouse.radius &&
      this.y >= mouse.y - mouse.radius &&
      this.y <= mouse.y + mouse.radius
    ) {
      this.radius++;
    } else {
      if (this.radius != this.RADIUS) this.radius--;
    }

    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

    context.strokeStyle = "black";
    context.fillStyle = this.color;
    context.fill();

    context.stroke();
  }
  update() {
    if (this.x - this.radius < innerWidth && this.x - this.radius > 0) {
      this.x = this.x + this.speedX;
    } else {
      this.speedX = -this.speedX;
      this.x = this.x + this.speedX;
    }
    if (this.y - this.radius < innerHeight && this.y - this.radius > 0) {
      this.y = this.y + this.speedY;
    } else {
      this.speedY = -this.speedY;
      this.y = this.y + this.speedY;
    }
    this.draw();
  }
}

let circles = [];

for (let i = 0; i < 20; i++) {
  const randomX = Math.floor(Math.random() * innerWidth);
  const randomY = Math.floor(Math.random() * innerHeight);
  const randomSpeedX = Math.floor(Math.random() - 0.5 * 5);
  const randomSpeedY = Math.floor(Math.random() - 0.5 * 5);
  const randomColor =
    circleColors[Math.floor(Math.random() * circleColors.length)];
  circles.push(
    new Circle(randomX, randomY, 50, randomSpeedX, randomSpeedY, randomColor)
  );
}

const animate = () => {
  const context = canvas.getContext("2d");
  requestAnimationFrame(animate);
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = 0; i < circles.length; i++) {
    circles[i].update();
  }
};

const init=() => {
  gui()
  handleRezier()
  animate(); 
}





window.addEventListener("load", () => {
  init()
});