"use strict";
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const start_menu = document.querySelector(".start_menu");
const average_score = document.querySelector("#average--score");
const sound_effect = document.querySelector("audio");
const alert = document.querySelector(".alert");
const history = document.querySelector("#history");
const toggleHistory = document.querySelector("#btn_toggle_history");
const backToHome = document.querySelector("#toggle_home");
const sound_controller = document.querySelector("#sound-off");
const pause = document.querySelector("#pause");
let difficultyChosen = document.querySelector("#difficulity");
let timeHolder = document.querySelector("#time");
const target = document.querySelector(".target_history");
const avg_bar = document.querySelector(".averg-bar");
const togglePlay = document.querySelector("#togglePlay");
let index = 0; // Track du cercle courante
let circles = [];
const circleColors = ["#6CB4EE", "#0000FF", "#3457D5", "#2a52be", "#6F00FF"];
let time = 5; // On peut modifier le temp du jeu et donc le nombre de cercle d'après ce variable
const TIME = 5;
let SOUND_STATE = true;
let PAUSED = false; // Pause le jeu
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
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
start_menu.width = window.innerWidth;
start_menu.height = window.innerHeight;

const handleRezier = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  start_menu.width = window.innerWidth;
  start_menu.height = window.innerHeight;
};

timeHolder.innerHTML = `Time Left : ${time}`;

//Classes Section : START
class Points {
  points = 0;
  constructor() {}
  getPoints() {
    return this.points;
  }
  setPoints(increment) {
    this.points += increment;
  }
  initPoints() {
    this.points = 0;
  }
}
const points = new Points();

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
const points_tracker = new LocalStorageManager();
//Classes Section : END

const gui = () => {
  const pointsHolder = document.querySelector("#points");
  pointsHolder.innerHTML = `Current Score : ${points.getPoints()}`;
};
const alertHit = () => {
  if (SOUND_STATE) sound_effect.play();
  setInterval(() => {
    alert.style.cssText = "display:block";
  }, 500);
  alert.style.cssText = "display:none";
};

const value_avg = () => {
  const local = points_tracker.getLocalStorage();
  let totalAverage = 0;
  if (local.length != 0) {
    local.map((game) => {
      totalAverage += game.score / game.total;
    });
    return (totalAverage / local.length) * 100;
  }
  return 0;
};

const cal_avg = () => {
  const totalAverage = value_avg();
  if (totalAverage != 0) {
    average_score.innerHTML = `Your avergae accuracy is ${Math.ceil(
      totalAverage
    )}%`;
  } else {
    average_score.innerHTML = "Play games to calculate your averge score";
  }
};

const displayHistory = () => {
  const local = points_tracker.getLocalStorage();
  target.innerHTML = "";
  if (local.length != 0) {
    const avg = value_avg();
    avg_bar.style.cssText = `width:${avg}%`;
    avg_bar.innerHTML = `${Math.ceil(avg)} %`;
    local.map((game) => {
      const div = document.createElement("div");
      div.innerHTML = `<p>Difficulty : ${game.diff}</p> <p> Points : ${
        game.score
      } </p> <p>Accuracy : ${(game.score / game.total) * 100}%`;
      target.appendChild(div);
    });
  } else {
    target.innerHTML = "<h2> No matches has been found </h1>";
  }
};

const handleHistory = (to_display, to_hide, callback) => {
  to_hide.style.cssText = "display:none";
  to_display.style.cssText = "display:flex";
  if (callback) {
    callback();
  }
};

const getInterval = () => {
  const TOTAL_CIRCLES = circles.length;
  const TRACK_LENGTH = circles.length;
  let interval = setInterval(() => {
    if (time < 1) {
      clearInterval(interval);
      points_tracker.setScore(
        points.getPoints(),
        difficultyChosen.value,
        TOTAL_CIRCLES
      );
      start_menu.style.cssText = "display:flex";
      cal_avg();
    } else {
      if (TRACK_LENGTH === circles.length) index++;
      else {
        if (circleColors[index + 1] == undefined && circleColors.length != 0)
          index--;
      }
      time -= 1;
      timeHolder.innerHTML = `Time Left : ${time}`;
    }
  }, 1000);
  return interval;
};

const setTime = () => {
  let interval = getInterval();
  pause.addEventListener("click", () => {
    PAUSED ? clearInterval(interval) : getInterval();
  });
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
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (circles.length != 0 && time > 0) {
    requestAnimationFrame(animate);
    circles[index].update();
  }
};

const init = () => {
  index = 0;
  time = TIME;
  circles = [];
  createCircles();
  gui();
  handleRezier();
  setTime();
  animate();
};

//EVENT LISTENNERS :
sound_controller.addEventListener("click", () => {
  SOUND_STATE = !SOUND_STATE;
});
window.addEventListener("resize", () => {
  handleRezier();
});
window.addEventListener("click", (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
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

toggleHistory.addEventListener("click", () => {
  handleHistory(history, start_menu, displayHistory);
});
backToHome.addEventListener("click", () => {
  handleHistory(start_menu, history);
});
pause.addEventListener("click", () => {
  PAUSED = !PAUSED;
});
togglePlay.addEventListener("click", () => {
  points.initPoints();
  init();
  start_menu.style.cssText = "display:none";
});

window.addEventListener("load", () => {
  cal_avg();
});
