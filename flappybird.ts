import * as readline from "readline";

const WIDTH = 40;
const HEIGHT = 10;
const BIRD_CHAR = "🐦";
const PIPE_CHAR = "|";
const EMPTY_SPACE = " ";
const GRAVITY = 1;
const JUMP_STRENGTH = -2;
const PIPE_INTERVAL = 20;
const PIPE_GAP = 4;

let birdY = Math.floor(HEIGHT / 2);
let velocity = 0;
let pipes: { x: number; gapStart: number }[] = [];
let score = 0;
let isGameOver = false;

// Set up input
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stdin.on("keypress", (_str, key) => {
  if (key.name === "space" && !isGameOver) {
    velocity = JUMP_STRENGTH;
  }
  if (key.name === "q") {
    process.exit();
  }
  if (isGameOver && key.name === "r") {
    restartGame();
  }
});

// Game loop
function gameLoop() {
  if (isGameOver) return;

  velocity += GRAVITY;
  birdY += velocity;

  if (birdY < 0) birdY = 0;
  if (birdY >= HEIGHT) gameOver();

  if (pipes.length === 0 || pipes[pipes.length - 1].x < WIDTH - PIPE_INTERVAL) {
    pipes.push({
      x: WIDTH - 1,
      gapStart: Math.floor(Math.random() * (HEIGHT - PIPE_GAP)),
    });
  }

  pipes = pipes.map((p) => ({ ...p, x: p.x - 1 })).filter((p) => p.x > 0);

  if (
    pipes.some(
      (p) => p.x === 2 && (birdY < p.gapStart || birdY > p.gapStart + PIPE_GAP),
    )
  ) {
    gameOver();
  }

  if (pipes.some((p) => p.x === 2)) {
    score++;
  }

  render();
}

// Render function
function render() {
  console.clear();
  let screen: string[][] = Array.from({ length: HEIGHT }, () =>
    Array(WIDTH).fill(EMPTY_SPACE),
  );

  screen[Math.round(birdY)][2] = BIRD_CHAR;

  pipes.forEach((pipe) => {
    for (let y = 0; y < HEIGHT; y++) {
      if (y < pipe.gapStart || y > pipe.gapStart + PIPE_GAP) {
        screen[y][pipe.x] = PIPE_CHAR;
      }
    }
  });

  console.log(screen.map((row) => row.join("")).join("\n"));
  console.log(`Score: ${score}`);
  if (isGameOver) {
    console.log("\nGame Over! Press 'r' to restart or 'q' to quit.");
  }
}

// Game over function
function gameOver() {
  isGameOver = true;
  render();
}

// Restart function
function restartGame() {
  birdY = Math.floor(HEIGHT / 2);
  velocity = 0;
  pipes = [];
  score = 0;
  isGameOver = false;
  gameLoop();
}

// Start the game loop
setInterval(gameLoop, 100);
