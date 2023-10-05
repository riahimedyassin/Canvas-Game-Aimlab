"use strict";
const start_menu = document.querySelector(".start_menu");
const average_score = document.querySelector("#average--score");
const sound_effect = document.querySelector("audio");
const alert = document.querySelector(".alert");
const history = document.querySelector("#history");
const toggleHistory = document.querySelector("#btn_toggle_history");
const backToHome = document.querySelector('#toggle_home');
const sound_controller = document.querySelector('#sound-off')

let SOUND_STATE = true ; 
sound_controller.addEventListener('click',()=> {
  SOUND_STATE=!SOUND_STATE
})





let mouse = {
  x: undefined,
  y: undefined,
  radius: 50,
};
const difficulty = {
  easy: {
    speedX: 0,
    speedY: 0,
  },
  normal: {
    speedX: Math.floor(Math.random() - 0.5 * 5),
    speedY: Math.floor(Math.random() - 0.5 * 5),
  },
  hard: {
    speedX: Math.floor(Math.random() - 0.5 * 10),
    speedY: Math.floor(Math.random() - 0.5 * 10),
  },
};

const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const circleColors = ["#6CB4EE", "#0000FF", "#3457D5", "#2a52be", "#6F00FF"];

//System de point
class Points {
  points = 0;
  constructor() {}
  getPoints() {
    return this.points;
  }
  setPoints(increment) {
    if(SOUND_STATE) sound_effect.play();
    this.points += increment;
  }
  initPoints() {
    this.points = 0;
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
const alertHit = () => {
  setInterval(() => {
    alert.style.cssText = "display:block";
  }, 500);
  alert.style.cssText = "display:none";
};

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
      alertHit();
      points.setPoints(1);
      gui();
    }
  });
});
class LocalStorageManager {
  init() {
    localStorage.setItem("track-points", []);
  }
  getLocalStorage() {
    let local = localStorage.getItem("track-points");
    if (local) return JSON.parse(local);
    this.init();
    return [];
  }
  setScore(score, diff, total) {
    let saved = this.getLocalStorage();
    const final = { score: score, diff, game_id: saved.length + 1, total };
    saved.push(final);
    localStorage.setItem("track-points", JSON.stringify(saved));
  }
}

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
      this.y <= mouse.y + mouse.radius &&
      this.radius < this.RADIUS + 10
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
let difficultyChosen = document.querySelector("#difficulity");
const TIME = 5;

let timeHolder = document.querySelector("#time");
let index = 0;
timeHolder.innerHTML = `Time Left : ${time}`;

const points_tracker = new LocalStorageManager();

const value_avg=()=> {
  const local = points_tracker.getLocalStorage();
  let totalPoints = 0;
  if (local.length != 0) {
    local.map((game) => {
      totalPoints += game.score / game.total;
    });
  }
  return totalPoints
}

const cal_avg = () => {
  const local = points_tracker.getLocalStorage();
  let totalPoints = value_avg();
  if (totalPoints!=0) {
    average_score.innerHTML = `Your avergae accuracy is ${Math.ceil(
      (totalPoints / local.length) * 100
    )}%`;
  } else {
    average_score.innerHTML = "Play games to calculate your averge score";
  }
};
const displayHistory=()=> {
  const local= points_tracker.getLocalStorage(); 
  const target= document.querySelector('.target_history'); 
  const avg_bar = document.querySelector('.averg-bar')
  if(local.length!=0) {
    target.innerHTML=''
    avg_bar.style.cssText=`width:${(value_avg() / local.length) * 100}%`
    avg_bar.innerHTML=`${Math.ceil((value_avg() / local.length) * 100)} %`
     local.map(game=> {
        const div = document.createElement("div")
        div.classList.add('recent--game');
        div.innerHTML=`<p>Difficulty : ${game.diff}</p> <p> Points : ${game.score} </p> <p>Accuracy : ${(game.score / game.total)*100}%`
        target.appendChild(div)
     })
  }
  else {
    target.innerHTML="<h2> No matches has been found </h1>"
  }
}




toggleHistory.addEventListener("click", () => {
  start_menu.style.cssText = "display:none";
  history.style.cssText = "display:flex";
  displayHistory();
});
backToHome.addEventListener('click',()=> {
  start_menu.style.cssText = "display:flex";
  history.style.cssText = "display:none";
})

const pause = document.querySelector('#pause')

const getInterval=()=> {
  const TOTAL_CIRCLES = circles.length;
  let TRACK_LENGTH = circles.length;
  let interval =  setInterval(() => {
    console.log(circles);
    if (time < 1) {
      clearInterval(interval);
      circles = [];
      points_tracker.setScore(
        points.getPoints(),
        difficultyChosen.value,
        TOTAL_CIRCLES
      );
      start_menu.style.cssText = "display:flex";
      cal_avg();
    } else {
      if (TRACK_LENGTH === circles.length) index++;
      time -= 1;
      timeHolder.innerHTML = `Time Left : ${time}`;
    }
  }, 1000);
  return interval
}
let PAUSED= false ; 
pause.addEventListener('click',()=> {
  PAUSED=!PAUSED
})


const setTime = () => {
  let interval = getInterval();
  pause.addEventListener('click',()=> {
    PAUSED ? clearInterval(interval) : getInterval()
  })
};
const createCircles = () => {
  for (let i = 0; i < TIME; i++) {
    const randomX = Math.floor(Math.random() * innerWidth);
    const randomY = Math.floor(Math.random() * innerHeight);
    const randomSpeedX = difficulty[difficultyChosen.value].speedX;
    const randomSpeedY = difficulty[difficultyChosen.value].speedY;
    const randomColor =
      circleColors[Math.floor(Math.random() * circleColors.length)];
    const randomRadius = Math.floor(Math.random() * 100);
    circles.push(
      new Circle(
        randomX,
        randomY,
        randomRadius,
        randomSpeedX,
        randomSpeedY,
        randomColor
      )
    );
  }
};

const animate = () => {
  const context = canvas.getContext("2d");
  if (circles.length != 0 && time > 0) {
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

start_menu.width = innerWidth;
start_menu.height = innerHeight;

const togglePlay = document.querySelector("#togglePlay");
togglePlay.addEventListener("click", () => {
  time = TIME;
  points.initPoints();
  init();
  start_menu.style.cssText = "display:none";
});

window.addEventListener("load", () => {
  cal_avg();
});
