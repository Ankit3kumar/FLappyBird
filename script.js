const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverDialog = document.getElementById('gameOverDialog');
const gameOverMessage = document.getElementById('gameOverMessage');
const retryButton = document.getElementById('retryButton');
const startGameMessage = document.getElementById('startGameMessage');
const startButton = document.getElementById('startButton');
const scoreBoard = document.getElementById('scoreBoard');

const birdImageSrc = 'https://i.postimg.cc/BQYWDn4q/pngwing-com-1.png';
const pipeImageSrc = 'https://i.postimg.cc/ZR4Hq69V/Nice-Png-pipes-png-388476.png';
const backgroundImageSrc = 'https://i.postimg.cc/1RqtHG64/background1.png';

let bird = {
    x: -50,
    y: 150,
    width: 34,
    height: 24,
    gravity: 0.25,
    lift: -6,
    velocity: 0,
    image: new Image(),
    startX: -50
};
bird.image.src = birdImageSrc;

let pipes = [];
let frame = 0;
let pipeWidth = 50;
let pipeGap = 150; // Increased gap between pipes
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameStarted = false;
let gameOver = false;

const pipeImage = new Image();
pipeImage.src = pipeImageSrc;

const backgroundImage = new Image();
backgroundImage.src = backgroundImageSrc;

document.addEventListener('keydown', () => {
    if (gameStarted && !gameOver) {
        bird.velocity = bird.lift;
    }
});

canvas.addEventListener('click', () => {
    if (!gameStarted) {
        startGame();
    } else if (!gameOver) {
        bird.velocity = bird.lift;
    }
});

retryButton.addEventListener('click', () => {
    resetGame();
});

startButton.addEventListener('click', () => {
    startGame();
});

function startGame() {
    gameStarted = true;
    startGameMessage.style.display = 'none';
    animateBirdStart();
}

function resizeCanvas() {
    const width = Math.min(window.innerWidth, 480);
    const height = Math.min(window.innerHeight, 640);
    canvas.width = width;
    canvas.height = height;

    // Adjust bird and pipes sizes based on the new canvas size
    bird.width = canvas.width * 0.1;
    bird.height = canvas.height * 0.06;
    pipeWidth = canvas.width * 0.15;
    pipeGap = canvas.height * 0.3; // Increased gap between pipes dynamically
}

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawBird() {
    ctx.drawImage(bird.image, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    for (let pipe of pipes) {
        // Draw the top pipe
        ctx.drawImage(pipeImage, pipe.x, pipe.topY, pipeWidth, pipe.topHeight);

        // Draw the bottom pipe
        ctx.drawImage(pipeImage, pipe.x, pipe.bottomY, pipeWidth, pipe.bottomHeight);
    }
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }
}

function updatePipes() {
    if (frame % 90 === 0) {
        const topHeight = Math.floor(Math.random() * (canvas.height / 2 - pipeGap / 2)) + pipeGap / 4;
        const bottomHeight = canvas.height - topHeight - pipeGap;
        pipes.push({
            x: canvas.width,
            topY: 0,
            topHeight: topHeight,
            bottomY: topHeight + pipeGap,
            bottomHeight: bottomHeight
        });
    }

    for (let pipe of pipes) {
        pipe.x -= 2;
    }

    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
}

function detectCollision() {
    for (let pipe of pipes) {
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (
                bird.y < pipe.topHeight ||
                bird.y + bird.height > pipe.bottomY
            )
        ) {
            endGame();
        }
    }

    if (pipes.length > 0 && pipes[0].x + pipeWidth < bird.x && !pipes[0].passed) {
        pipes[0].passed = true;
        score++;
        updateScore();
    }
}

function updateScore() {
    scoreBoard.textContent = `Score: ${score} | High Score: ${highScore}`;
}

function endGame() {
    gameOver = true;
    gameOverDialog.style.display = 'block';
    gameOverMessage.innerHTML = `Game Over<br>Score: ${score}<br>High Score: ${highScore}`;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    updateScore();
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    bird.x = bird.startX;
    pipes = [];
    frame = 0;
    score = 0;
    gameOver = false;
    gameOverDialog.style.display = 'none';
    startGameMessage.style.display = 'block';
    gameStarted = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateScore();
}

function animateBirdStart() {
    const targetX = 50;
    const duration = 1000; // 1 second
    const startTime = performance.now();

    function animationStep(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        bird.x = bird.startX + (targetX - bird.startX) * progress;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawBird();
        
        if (progress < 1) {
            requestAnimationFrame(animationStep);
        } else {
            gameLoop();
        }
    }

    requestAnimationFrame(animationStep);
}

function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawBird();
    drawPipes();

    updateBird();
    updatePipes();

    detectCollision();

    frame++;
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
updateScore();
