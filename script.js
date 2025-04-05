document.addEventListener('DOMContentLoaded', () => {

    // Get references to elements
    const startButton = document.getElementById('start-button');
    const rulesScreen = document.getElementById('rules-screen');
    const playButton = document.getElementById('play-button');
    const gameArea = document.getElementById('game-area');
    const player = document.getElementById('player');
    const target = document.getElementById('target');
    const scoreDisplayContainer = document.getElementById('score-display');
    const scoreSpan = document.getElementById('score');

    // Game state variables
    let score = 0;
    let isGameActive = false;
    let playerX = 10;
    let playerY = 10;
    // REMOVED: const playerSpeed = 10;
    // NEW: Define speed as a fraction of the game area dimensions
    const speedFactor = 0.075; // Move 2.5% of the dimension per key press

    // Check elements exist
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !target || !scoreDisplayContainer || !scoreSpan) {
        console.error("One or more required game elements are missing!");
        document.body.innerHTML = "<h1>Error loading game elements. Please check the HTML structure.</h1>";
        return;
    }

    // --- Function to move the target ---
    function moveTarget() {
        const gameAreaWidth = gameArea.offsetWidth;
        const gameAreaHeight = gameArea.offsetHeight;
        const targetWidth = target.offsetWidth;
        const targetHeight = target.offsetHeight;

        if (gameAreaWidth <= targetWidth || gameAreaHeight <= targetHeight) {
            target.style.left = '0px'; target.style.top = '0px'; return;
        }
        const maxX = gameAreaWidth - targetWidth;
        const maxY = gameAreaHeight - targetHeight;
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        target.style.left = randomX + 'px';
        target.style.top = randomY + 'px';
    }

     // --- Function to update player position ---
     function updatePlayerPosition() {
        player.style.left = playerX + 'px';
        player.style.top = playerY + 'px';
    }

    // --- Collision Detection ---
    function checkCollision() {
        const playerRect = { left: playerX, top: playerY, right: playerX + player.offsetWidth, bottom: playerY + player.offsetHeight };
        const targetRect = { left: target.offsetLeft, top: target.offsetTop, right: target.offsetLeft + target.offsetWidth, bottom: target.offsetTop + target.offsetHeight };
        return ( playerRect.left < targetRect.right && playerRect.right > targetRect.left && playerRect.top < targetRect.bottom && playerRect.bottom > targetRect.top );
    }

    // --- Handle Keyboard Input ---
    function handleKeyDown(event) {
        if (!isGameActive) return;
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); }

        // Calculate dynamic speed based on game area size
        const gameAreaWidth = gameArea.offsetWidth;
        const gameAreaHeight = gameArea.offsetHeight;
        // Calculate horizontal/vertical movement ensuring it's at least 1 pixel
        const moveX = Math.max(1, gameAreaWidth * speedFactor);
        const moveY = Math.max(1, gameAreaHeight * speedFactor);

        // Calculate potential new position
        let newX = playerX;
        let newY = playerY;

        switch (event.key) {
            case "ArrowUp":
                newY -= moveY; // Use dynamic vertical speed
                break;
            case "ArrowDown":
                newY += moveY; // Use dynamic vertical speed
                break;
            case "ArrowLeft":
                newX -= moveX; // Use dynamic horizontal speed
                break;
            case "ArrowRight":
                newX += moveX; // Use dynamic horizontal speed
                break;
            default:
                return;
        }

        // Boundary checks
        const playerWidth = player.offsetWidth;
        const playerHeight = player.offsetHeight;
        playerX = Math.max(0, Math.min(newX, gameAreaWidth - playerWidth));
        playerY = Math.max(0, Math.min(newY, gameAreaHeight - playerHeight));

        updatePlayerPosition();

        if (checkCollision()) {
            score++;
            scoreSpan.textContent = score;
            moveTarget();
        }
    }

    // --- Function to start the game ---
    function startGame() {
        isGameActive = true;
        score = 0;
        scoreSpan.textContent = score;
        playerX = 10; playerY = 10; updatePlayerPosition(); // Reset player

        rulesScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');
        scoreDisplayContainer.classList.remove('hidden');

        moveTarget();
        gameArea.focus();
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', () => {
        startButton.classList.add('hidden');
        rulesScreen.classList.remove('hidden');
        playButton.focus();
    });

    playButton.addEventListener('click', () => {
        startGame();
    });

    document.addEventListener('keydown', handleKeyDown);

});