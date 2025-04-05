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
    // New: Get controls container and buttons
    const controlsContainer = document.getElementById('controls');
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');


    // Game state variables
    let score = 0;
    let isGameActive = false;
    let playerX = 10;
    let playerY = 10;
    const speedFactor = 0.075; // Keep the speed factor from before (or adjust)

    // --- Check elements ---
    // Updated check to include controls
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !target ||
        !scoreDisplayContainer || !scoreSpan || !controlsContainer ||
        !btnUp || !btnDown || !btnLeft || !btnRight) {
        console.error("One or more required game elements are missing!");
        document.body.innerHTML = "<h1>Error loading game elements. Please check HTML structure/IDs.</h1>";
        return;
    }

    // --- Function to move target --- (Keep as is)
    function moveTarget() { /* ... same code as before ... */
        const gameAreaWidth = gameArea.offsetWidth; const gameAreaHeight = gameArea.offsetHeight;
        const targetWidth = target.offsetWidth; const targetHeight = target.offsetHeight;
        if (gameAreaWidth <= targetWidth || gameAreaHeight <= targetHeight) { target.style.left = '0px'; target.style.top = '0px'; return; }
        const maxX = gameAreaWidth - targetWidth; const maxY = gameAreaHeight - targetHeight;
        const randomX = Math.floor(Math.random() * maxX); const randomY = Math.floor(Math.random() * maxY);
        target.style.left = randomX + 'px'; target.style.top = randomY + 'px';
    }

    // --- Function to update player position --- (Keep as is)
    function updatePlayerPosition() { /* ... same code as before ... */
        player.style.left = playerX + 'px'; player.style.top = playerY + 'px';
    }

    // --- Collision Detection --- (Keep as is)
    function checkCollision() { /* ... same code as before ... */
        const playerRect = { left: playerX, top: playerY, right: playerX + player.offsetWidth, bottom: playerY + player.offsetHeight };
        const targetRect = { left: target.offsetLeft, top: target.offsetTop, right: target.offsetLeft + target.offsetWidth, bottom: target.offsetTop + target.offsetHeight };
        return ( playerRect.left < targetRect.right && playerRect.right > targetRect.left && playerRect.top < targetRect.bottom && playerRect.bottom > targetRect.top );
    }

    // --- NEW: Refactored Movement Logic ---
    function movePlayer(direction) {
        if (!isGameActive) return; // Only move if game is active

        // Calculate dynamic speed
        const gameAreaWidth = gameArea.offsetWidth;
        const gameAreaHeight = gameArea.offsetHeight;
        const moveX = Math.max(1, gameAreaWidth * speedFactor);
        const moveY = Math.max(1, gameAreaHeight * speedFactor);

        // Calculate potential new position based on direction
        let newX = playerX;
        let newY = playerY;

        switch (direction) {
            case "up":    newY -= moveY; break;
            case "down":  newY += moveY; break;
            case "left":  newX -= moveX; break;
            case "right": newX += moveX; break;
        }

        // Boundary checks
        const playerWidth = player.offsetWidth;
        const playerHeight = player.offsetHeight;
        playerX = Math.max(0, Math.min(newX, gameAreaWidth - playerWidth));
        playerY = Math.max(0, Math.min(newY, gameAreaHeight - playerHeight));

        updatePlayerPosition();

        // Check for collision after moving
        if (checkCollision()) {
            score++;
            scoreSpan.textContent = score;
            moveTarget();
        }
    }

    // --- UPDATED: Handle Keyboard Input ---
    function handleKeyDown(event) {
        if (!isGameActive) return;
         // Only prevent default for arrow keys if game is active and focused?
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
             event.preventDefault(); // Prevent scrolling page
             switch (event.key) {
                 case "ArrowUp":    movePlayer('up');    break;
                 case "ArrowDown":  movePlayer('down');  break;
                 case "ArrowLeft":  movePlayer('left');  break;
                 case "ArrowRight": movePlayer('right'); break;
             }
        }
    }

    // --- UPDATED: Function to start the game ---
    function startGame() {
        isGameActive = true;
        score = 0;
        scoreSpan.textContent = score;
        playerX = 10; playerY = 10; updatePlayerPosition();

        rulesScreen.classList.add('hidden');
        // Show game elements AND controls
        gameArea.classList.remove('hidden');
        scoreDisplayContainer.classList.remove('hidden');
        controlsContainer.classList.remove('hidden'); // Show controls

        moveTarget();
        gameArea.focus(); // Still useful for potential keyboard use
    }

    // --- Event Listeners --- (Keep Start/Play button listeners as is)
    startButton.addEventListener('click', () => { /* ... same ... */
        startButton.classList.add('hidden'); rulesScreen.classList.remove('hidden'); playButton.focus();
     });
    playButton.addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyDown);

    // --- NEW: Add Button Click Listeners ---
    // Using 'click' works for both mouse and basic taps on touchscreens
    btnUp.addEventListener('click', () => movePlayer('up'));
    btnDown.addEventListener('click', () => movePlayer('down'));
    btnLeft.addEventListener('click', () => movePlayer('left'));
    btnRight.addEventListener('click', () => movePlayer('right'));

}); // End of DOMContentLoaded listener