"use strict";
/*NOTE : Pour que le joue fonctionnera parfaitement , le temp doit etre un multipe de 2 , puisque chaque cercle 
spawn pour 2seconde , et si on veut affichier tous les cercles avant que le temp s'eccoule 
(On suppose que le joeur ne touchera jamis une cercle sinon le temp sera bien sure moins beaucoup important , 
puisque le nombre de cercle depend de temp (Voir la fonction createCercles)) , cette condition doit etre satisfaite
J'ai crée une fonction pour arrondi toujours le temp à un temp % 2 == 0 && typeof(temp) == (int)number 
(Si jamais vous remarquez que le temp saisie n'est pas toujours le temp affichier ) */

const round_time = (time) => {
  return Math.floor(time % 2 === 0 ? time : Math.floor(time + 1));
};

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
const pointsHolder = document.querySelector("#points");
let timeHolder = document.querySelector("#time");
const target = document.querySelector(".target_history");
const avg_bar = document.querySelector(".averg-bar");
const togglePlay = document.querySelector("#togglePlay");
let index = 0; // Track du cercle courante
let circles = []; // Tableau des cercles crées
const circleColors = ["#6CB4EE", "#0000FF", "#3457D5", "#2a52be", "#6F00FF"]; // Tableau de couleur possible des cercles
let time = round_time(5); // On peut modifier le temp du jeu et donc le nombre de cercle d'après ce variable
const TIME = round_time(5); // Utiliser pour initialiser le temp chaque fois on rejoue
let SOUND_STATE = true; // L'état du song
let PAUSED = false; // Pause le jeu
const pauseContainer = document.querySelector(".pause-container") // Utiliser pour masquer la page de l'utlisateur et ne le parmettre pas d'interagir avec les cercles
const GLOBAL_TOTAL_CIRCLES = round_time(5) // Nombre TOTAL des cercles generer dans le jeu (On l'utilisera pour le calcul de moyen)


//mouse : Sa definie une cercle virtuelle de souris d'ou on va l'utiliser pour l'effet de hover sur une cercle
let mouse = {
  x: undefined,
  y: undefined,
  radius: 50,
};
//Definie la difficulté du jeu et donc les vitesses de mouvement des cercle
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
//Puisque le CSS ne vient point de prendre le largeur et l'auteur totalle (reelle ) de fenetre , on l'initialise depuis le JS.
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
start_menu.width = window.innerWidth;
start_menu.height = window.innerHeight;

//Si le taille de fentre change, on change les largeur et l'auteur de menu et de canvas
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
    //On utilsera cette constante pour resize la cercle si on ne le hovre pas par la souris
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
    //Analyse de mouvement d'objet et decision de prochain mouvement selon sa position actuelle (Creation d'une bordure virtuelle)
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

//Classes Section : END

//Les instances : START
const points = new Points();
const points_tracker = new LocalStorageManager();
//Les instances : END

const gui = () => {
  pointsHolder.innerHTML = `Current Score : ${points.getPoints()}`;
  timeHolder.innerHTML = `Time Left : ${time}`;
};
const alertHit = () => {
  if (SOUND_STATE) sound_effect.play();
  const interval = setInterval(() => {
    alert.style.cssText = "display:block";
    clearInterval(interval)
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
    local.reverse().map((game) => {
      const div = document.createElement("div");
      div.innerHTML = `<p>Difficulty : ${game.diff}</p> <p> Points : ${
        game.score
      } </p> <p>Accuracy : ${Math.round((game.score / game.total) * 100)}%`;
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
  let interval = setInterval(() => {
    if (time < 1 || circles.length === 0) {
      clearInterval(interval);
      points_tracker.setScore(
        points.getPoints(),
        difficultyChosen.value,
        GLOBAL_TOTAL_CIRCLES
      );
      start_menu.style.cssText = "display:flex"; // Re-affichier le menu principale
      cal_avg(); // Calculer le nouveau avg
    } else {
      //Si on clique sur une cercle elle serra supprimer de tableau cercle , dont le pointeur index doit decider si
      // on va incrementer sa valeur ou la decrementer. Ce logique est implemeté comme ci dessous :
      // Un seul probleme , que ce logique va declencher un erreur si on clique  sur une cercle (puisque on demande d'animer)
      // une cercle undefini) , mais ce probleme est resolu automatiquement lors de prochain cycle de l'interval dont
      // ce logique de pointage sera implementé et donc on n'aura plus un pointeur sur une case undefini.
      if (circleColors.length != 0 && circles[index] == undefined) {
        while (circles[index] == undefined) index--;
      } else {
        index++;
      }
      // Le temp decrement independament du l'interval
      time -= 1;
      gui();
    }
  }, 2000);
  return interval;
};

const setTime = () => {
  let interval = getInterval();
  pause.addEventListener("click", () => {
    PAUSED ? clearInterval(interval) : getInterval();
  });
};

// Creation dynamique des cercles totalement aleatoire
const createCircles = () => {
  for (let i = 0; i < TIME; i++) {
    const randomX = Math.floor(Math.random() * innerWidth);
    const randomY = Math.floor(Math.random() * innerHeight);
    const randomSpeedX = difficulty[difficultyChosen.value].speedX;
    const randomSpeedY = difficulty[difficultyChosen.value].speedY;
    const randomColor =
      circleColors[Math.floor(Math.random() * circleColors.length)];
    const randomRadius = Math.floor(Math.random() * 100) + 20; // min(radius) == 20
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

// Animation principale des cercles
// Le logique de update des cercles sera seulement implementés ssi le niveau est different de facile (easy) , puisque
// le calcul implementé dans cette fonction est unnecessaire pour ces cercles statiques en terme de mouvement.
const animate = () => {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (circles.length != 0 && time > 0) {
    requestAnimationFrame(animate);
    if (!difficultyChosen === "easy") circles[index].draw();
    else circles[index].update();
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
  pauseContainer.style.cssText=PAUSED ? "display:flex" : "display:none"
});
togglePlay.addEventListener("click", () => {
  points.initPoints();
  init();
  start_menu.style.cssText = "display:none";
});

window.addEventListener("load", () => {
  cal_avg();
});
