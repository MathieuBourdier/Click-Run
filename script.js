const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variables de jeu
let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let obstacles = [];
let score = 0;
let gameRunning = true;

// Leaderboard
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

// Gérer les mouvements de la souris
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - rect.left;
  mouse.y = event.clientY - rect.top;
});

// Classe pour les obstacles
class Obstacle {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.x -= this.speed;
    if (this.x + this.width < 0) {
      this.x = canvas.width;
      this.y = Math.random() * (canvas.height - this.height);
      score += 5; // Gagner des points pour chaque obstacle passé
    }
    this.draw();
  }
}

// Ajouter des obstacles
function addObstacles() {
  for (let i = 0; i < 5; i++) {
    const height = Math.random() * 100 + 50;
    const y = Math.random() * (canvas.height - height);
    const speed = Math.random() * 2 + 2;
    obstacles.push(new Obstacle(canvas.width + i * 200, y, 20, height, speed));
  }
}

// Vérifier les collisions
function checkCollision(obstacle) {
  return (
    mouse.x > obstacle.x &&
    mouse.x < obstacle.x + obstacle.width &&
    mouse.y > obstacle.y &&
    mouse.y < obstacle.y + obstacle.height
  );
}

// Supprimer un joueur du leaderboard
function deletePlayer(index) {
  leaderboard.splice(index, 1); // Supprime le joueur à l'index donné
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard)); // Met à jour le localStorage
  displayLeaderboard(); // Réaffiche le leaderboard
}

// Afficher le leaderboard avec des boutons "Supprimer"
function displayLeaderboard() {
  const leaderboardList = document.getElementById("leaderboard-list");
  leaderboardList.innerHTML = ""; // Réinitialiser la liste

  leaderboard.forEach((entry, index) => {
    const li = document.createElement("li");

    // Texte du joueur
    const text = document.createTextNode(`${index + 1}. ${entry.name} - ${entry.score} points`);
    li.appendChild(text);

    // Bouton supprimer
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Supprimer";
    deleteButton.style.marginLeft = "10px";
    deleteButton.onclick = () => deletePlayer(index);
    li.appendChild(deleteButton);

    leaderboardList.appendChild(li);
  });
}

// Afficher le formulaire pour entrer le nom
function showNameForm() {
  const form = document.getElementById("name-form");
  form.style.display = "block";
  document.getElementById("final-score").textContent = score; // Afficher le score final
}

// Soumettre le score et cacher le formulaire
function submitScore() {
  const playerNameInput = document.getElementById("player-name");
  const playerName = playerNameInput.value || "Anonymous"; // Si le nom est vide, "Anonymous"
  leaderboard.push({ name: playerName, score: score });
  leaderboard.sort((a, b) => b.score - a.score); // Trier par score décroissant
  leaderboard = leaderboard.slice(0, 5); // Garder le top 5
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  displayLeaderboard();

  // Réinitialiser pour la prochaine partie
  playerNameInput.value = "";
  score = 0; // Réinitialiser le score pour la prochaine partie
  document.getElementById("score").textContent = score;

  const form = document.getElementById("name-form");
  form.style.display = "none"; // Cacher le formulaire
  gameRunning = true; // Relancer le jeu
  gameLoop(); // Redémarrer la boucle du jeu
}

// Arrêter le jeu en cas de collision
function handleGameOver() {
  gameRunning = false;
  showNameForm(); // Affiche le formulaire pour entrer le nom
}

// Boucle principale du jeu
function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dessiner et mettre à jour les obstacles
  obstacles.forEach((obstacle) => {
    obstacle.update();
    if (checkCollision(obstacle)) {
      handleGameOver(); // Gérer la fin de partie
    }
  });

  // Dessiner le pointeur de la souris
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();

  // Mettre à jour le score
  document.getElementById("score").textContent = score;

  requestAnimationFrame(gameLoop);
}

// Initialiser le jeu
addObstacles();
displayLeaderboard();
gameLoop();
