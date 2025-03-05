// game.ts
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var gravity = 0.4;
var birdJump = -7;
var pipeWidth = 50;
var pipeGap = 120;
var pipeSpeed = 2;
var birdY = canvas.height / 2;
var birdVelocity = 0;
var score = 0;
var pipes = [
  {
    x: canvas.width,
    height: Math.random() * (canvas.height - pipeGap - 50) + 30,
  },
];
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    birdVelocity = birdJump;
  }
});
function update() {
  birdVelocity += gravity;
  birdY += birdVelocity;
  for (let pipe of pipes) {
    pipe.x -= pipeSpeed;
  }
  if (pipes[pipes.length - 1].x < canvas.width - 200) {
    pipes.push({
      x: canvas.width,
      height: Math.random() * (canvas.height - pipeGap - 50) + 30,
    });
  }
  if (pipes[0].x + pipeWidth < 0) {
    pipes.shift();
    score++;
  }
  for (let pipe of pipes) {
    if (
      (birdY < pipe.height || birdY > pipe.height + pipeGap) &&
      canvas.width / 4 > pipe.x &&
      canvas.width / 4 < pipe.x + pipeWidth
    ) {
      resetGame();
    }
  }
  if (birdY + 20 >= canvas.height) {
    resetGame();
  }
}
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
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(canvas.width / 4, birdY, 10, 0, Math.PI * 2);
  ctx.fill();
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
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 20);
}
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();
