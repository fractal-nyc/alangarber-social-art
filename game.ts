const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// Game settings
const gravity = 0.4;
const birdJump = -7;
const pipeWidth = 50;
const pipeGap = 120;
const pipeSpeed = 2;

// Bird settings
let birdY = canvas.height / 2;
let birdVelocity = 0;
let score = 0;

// Pipe settings
let pipes: { x: number; height: number }[] = [
  {
    x: canvas.width,
    height: Math.random() * (canvas.height - pipeGap - 50) + 30,
  },
];

// Handle bird jump
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    birdVelocity = birdJump;
  }
});

// Game loop
function update() {
  birdVelocity += gravity;
  birdY += birdVelocity;

  // Move pipes
  for (let pipe of pipes) {
    pipe.x -= pipeSpeed;
  }

  // Add new pipes
  if (pipes[pipes.length - 1].x < canvas.width - 200) {
    pipes.push({
      x: canvas.width,
      height: Math.random() * (canvas.height - pipeGap - 50) + 30,
    });
  }

  // Remove off-screen pipes
  if (pipes[0].x + pipeWidth < 0) {
    pipes.shift();
    score++;
  }

  // Check collision
  for (let pipe of pipes) {
    if (
      (birdY < pipe.height || birdY > pipe.height + pipeGap) &&
      canvas.width / 4 > pipe.x &&
      canvas.width / 4 < pipe.x + pipeWidth
    ) {
      resetGame();
    }
  }

  // Bird hits the ground
  if (birdY + 20 >= canvas.height) {
    resetGame();
  }
}

// Reset game on collision
function resetGame() {
  birdY = canvas.height / 2;
  birdVelocity = 0;
  pipes = [
    {
      x: canvas.width,
      height: Math.random() * (canvas.height - pipeGap - 50) + 30,
    },
  ];
  score = 0;
}

// Render function
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw bird
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(canvas.width / 4, birdY, 10, 0, Math.PI * 2);
  ctx.fill();

  // Draw pipes
  ctx.fillStyle = "green";
  for (let pipe of pipes) {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.height);
    ctx.fillRect(
      pipe.x,
      pipe.height + pipeGap,
      pipeWidth,
      canvas.height - pipe.height - pipeGap,
    );
  }

  // Draw score
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
