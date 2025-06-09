const gameBoard = document.getElementById('game');
const restartBtn = document.getElementById('restartBtn');
const wakaSound = document.getElementById('wakaSound');
const deathSound = document.getElementById('deathSound');

const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');

let layout;
let cells = [];
let pacmanPos;
let ghostPositions;
let gameOver = false;
let ghostIntervals = [];
let score = 0;
let lives = 3;

function initGame() {
  layout = [
    ['W','W','W','W','W','W','W','W','W','W','W','W'],
    ['W','.','.','.','.','.','.','.','.','.','.','W'],
    ['W','.','W','W','W','.','W','W','W','W','.','W'],
    ['W','.','.','.','W','.','.','.','.','W','.','W'],
    ['W','W','W','.','W','W','W','W','.','W','.','W'],
    ['W','.','.','.','.','.','P','.','.','W','.','W'],
    ['W','.','W','W','W','W','W','W','.','W','.','W'],
    ['W','.','.','.','.','.','.','.','.','.','.','W'],
    ['W','.','W','W','W','W','W','W','W','W','G','W'],
    ['W','W','W','W','W','W','W','W','W','W','W','W']
  ];
  cells = [];
  pacmanPos = { x: 6, y: 5 };
  ghostPositions = [
    { x: 10, y: 8, className: 'ghost' },
  ];
  score = 0;
  lives = 3;
  gameOver = false;

  updateScore();
  updateLives();
  drawBoard();

  ghostIntervals.forEach(i => clearInterval(i));
  ghostIntervals = [];

  ghostPositions.forEach((ghost, idx) => {
    ghostIntervals[idx] = setInterval(() => moveGhost(idx), 500);
  });

  restartBtn.style.display = 'none';
}

function drawBoard() {
  gameBoard.innerHTML = '';
  cells.length = 0;

  for (let y = 0; y < layout.length; y++) {
    for (let x = 0; x < layout[y].length; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');

      const val = layout[y][x];
      if (val === 'W') cell.classList.add('wall');
      else if (val === '.') cell.classList.add('dot');
      else if (val === 'P') cell.classList.add('pacman');
      else if (val === 'G') {
        const ghostIndex = ghostPositions.findIndex(g => g.x === x && g.y === y);
        if (ghostIndex !== -1) {
          cell.classList.add(ghostPositions[ghostIndex].className);
        } else {
          cell.classList.add('ghost');
        }
      }

      gameBoard.appendChild(cell);
      cells.push(cell);
    }
  }
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score}`;
}

function updateLives() {
  livesDisplay.textContent = `Lives: ${lives}`;
}

function movePacman(dx, dy) {
  if (gameOver) return;

  const newX = pacmanPos.x + dx;
  const newY = pacmanPos.y + dy;

  if (layout[newY][newX] !== 'W') {
    if (layout[newY][newX] === 'G') {
      loseLife();
      return;
    }

    layout[pacmanPos.y][pacmanPos.x] = ' ';
    pacmanPos = { x: newX, y: newY };

    if (layout[newY][newX] === '.') {
      layout[newY][newX] = ' ';
      score++;
      updateScore();
      wakaSound.currentTime = 0;
      wakaSound.play();

      if (checkWin()) {
        winGame();
        return;
      }
    }

    layout[newY][newX] = 'P';
    drawBoard();
  }
}

function moveGhost(index) {
  if (gameOver) return;

  const ghost = ghostPositions[index];
  const directions = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  const validMoves = directions.filter(dir => {
    const nx = ghost.x + dir.dx;
    const ny = ghost.y + dir.dy;
    if (layout[ny][nx] === 'W') return false;

    for (const otherGhost of ghostPositions) {
      if (otherGhost !== ghost && otherGhost.x === nx && otherGhost.y === ny) return false;
    }

    return true;
  });

  if (validMoves.length > 0) {
    const move = validMoves[Math.floor(Math.random() * validMoves.length)];
    const newX = ghost.x + move.dx;
    const newY = ghost.y + move.dy;

    if (layout[newY][newX] === 'P') {
      loseLife();
      return;
    }

    layout[ghost.y][ghost.x] = ' ';
    ghost.x = newX;
    ghost.y = newY;
    layout[newY][newX] = 'G';

    drawBoard();
  }
}

function loseLife() {
  lives--;
  updateLives();
  deathSound.play();
  if (lives <= 0) {
    endGame();
  } else {
    resetPositions();
  }
}

function resetPositions() {
  for (let y = 0; y < layout.length; y++) {
    for (let x = 0; x < layout[y].length; x++) {
      if (layout[y][x] === 'P' || layout[y][x] === 'G') {
        layout[y][x] = ' ';
      }
    }
  }
  pacmanPos = { x: 6, y: 5 };
  ghostPositions[0].x = 10; ghostPositions[0].y = 8;

  layout[pacmanPos.y][pacmanPos.x] = 'P';
  ghostPositions.forEach(g => {
    layout[g.y][g.x] = 'G';
  });
  drawBoard();
}

function endGame() {
  gameOver = true;
  deathSound.play();
  clearIntervals();
  setTimeout(() => {
    alert(`💀 GAME OVER! Your final score: ${score}`);
    restartBtn.style.display = 'block';
  }, 200);
}

function clearIntervals() {
  ghostIntervals.forEach(i => clearInterval(i));
  ghostIntervals = [];
}

function checkWin() {
  for (let row of layout) {
    if (row.includes('.')) return false;
  }
  return true;
}

function winGame() {
  gameOver = true;
  clearIntervals();
  setTimeout(() => {
    alert(`🎉 YOU WIN! Your final score: ${score}`);
    restartBtn.style.display = 'block';
  }, 100);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') movePacman(0, -1);
  else if (e.key === 'ArrowDown') movePacman(0, 1);
  else if (e.key === 'ArrowLeft') movePacman(-1, 0);
  else if (e.key === 'ArrowRight') movePacman(1, 0);
});

restartBtn.addEventListener('click', initGame);

initGame();
