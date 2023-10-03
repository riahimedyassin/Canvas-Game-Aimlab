"use strict";
let mouse = {
  x: undefined,
  y: undefined,
  radius: 200,
};
const difficulty = {
  easy : {
    speedX:0, 
    speedY:0 
  },
  normal : {
    speedX:Math.floor(Math.random() - 0.5 * 5),
    speedY:Math.floor(Math.random() - 0.5 * 5)
  },
  hard : {
    speedX:Math.floor(Math.random() - 0.5 * 10),
    speedY:Math.floor(Math.random() - 0.5 * 10)
  }
}





const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const circleColors = ["#6CB4EE", "#0000FF", "#3457D5", "#2a52be","#6F00FF"];

//System de point
class Points {
  points = 0;
  constructor() {}
  getPoints() {
    return this.points;
  }
  setPoints(increment) {
    this.points += increment;
  }
}
const gui = () => {
  const pointsHolder = document.querySelector("#points");
  pointsHolder.innerHTML = `Current Score : ${points.getPoints()}`;
};

const handleRezier = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

const points = new Points();
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
    } else {
      points.setPoints(1);
      gui();
    }
  });
});

class Circle {
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
let time = 5;
let difficultyChosen = document.querySelector('#difficulity'); 
const TIME = 5 ; 



let timeHolder = document.querySelector("#time");
let index = 0;
timeHolder.innerHTML = `Time Left : ${time}`;

const setTime=()=> {
  let TRACK_LENGTH= circles.length
  let interval = setInterval(() => {
    if (time < 1) {
      clearInterval(interval);
      circles = [];
    } else {
      if(TRACK_LENGTH===circles.length) index++;
      console.log(circles[index])
      time -= 1;
      timeHolder.innerHTML = `Time Left : ${time}`;
    }
  }, 1000);
}
const createCircles = ()=> {
  for (let i = 0; i < time+1 ; i++) {
    const randomX = Math.floor(Math.random() * innerWidth);
    const randomY = Math.floor(Math.random() * innerHeight);
    const randomSpeedX = difficulty[difficultyChosen.value].speedX;
    const randomSpeedY = difficulty[difficultyChosen.value].speedY;
    const randomColor =
      circleColors[Math.floor(Math.random() * circleColors.length)];
    circles.push(
      new Circle(randomX, randomY, 50, randomSpeedX, randomSpeedY, randomColor)
    );
  }
}



const animate = () => {
  const context = canvas.getContext("2d");
  if (circles.length != 0 && points.getPoints() != circles.length && time>0) {
    requestAnimationFrame(animate);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    circles[index].update();
  } else {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
};

const init = () => {
  createCircles(); 
  gui();
  handleRezier();
  setTime(); 
  animate();
};
const start_menu = document.querySelector('.start_menu')

start_menu.width=innerWidth;
start_menu.height=innerHeight

const togglePlay  =document.querySelector('#togglePlay')
togglePlay.addEventListener("click",()=> {
  init()
  start_menu.style.cssText='display:none'
})
// window.addEventListener("load", () => {
//   init();
// });
