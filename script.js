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
    const controlsContainer = document.getElementById('controls');
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    // Get the placeholder div for the identity menu
    const identityMenuPlaceholder = document.querySelector('[data-netlify-identity-menu]');


    // Game state variables
    let score = 0;
    let isGameActive = false;
    let playerX = 10;
    let playerY = 10;
    const speedFactor = 0.075; // Or your preferred speed

    // Check elements
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !target ||
        !scoreDisplayContainer || !scoreSpan || !controlsContainer ||
        !btnUp || !btnDown || !btnLeft || !btnRight || !identityMenuPlaceholder) {
        console.error("One or more required game elements are missing!");
        document.body.innerHTML = "<h1>Error loading game elements. Please check HTML structure/IDs.</h1>";
        return;
    }

    // --- Function to move target ---
    function moveTarget() {
        const gameAreaWidth = gameArea.offsetWidth; const gameAreaHeight = gameArea.offsetHeight;
        const targetWidth = target.offsetWidth; const targetHeight = target.offsetHeight;
        if (gameAreaWidth <= targetWidth || gameAreaHeight <= targetHeight) { target.style.left = '0px'; target.style.top = '0px'; return; }
        const maxX = gameAreaWidth - targetWidth; const maxY = gameAreaHeight - targetHeight;
        const randomX = Math.floor(Math.random() * maxX); const randomY = Math.floor(Math.random() * maxY);
        target.style.left = randomX + 'px'; target.style.top = randomY + 'px';
    }

    // --- Function to update player position ---
    function updatePlayerPosition() {
        player.style.left = playerX + 'px'; player.style.top = playerY + 'px';
    }

    // --- Collision Detection ---
    function checkCollision() {
        const playerRect = { left: playerX, top: playerY, right: playerX + player.offsetWidth, bottom: playerY + player.offsetHeight };
        const targetRect = { left: target.offsetLeft, top: target.offsetTop, right: target.offsetLeft + target.offsetWidth, bottom: target.offsetTop + target.offsetHeight };
        return ( playerRect.left < targetRect.right && playerRect.right > targetRect.left && playerRect.top < targetRect.bottom && playerRect.bottom > targetRect.top );
    }

    // --- NEW Function to save score via Netlify Function ---
    async function saveScore(currentScore) {
        const user = netlifyIdentity.currentUser(); // Check if user is logged in

        if (user) {
            // User is logged in, proceed to save score
            console.log('User logged in, attempting to save score:', currentScore);
            try {
                // Get the user's JWT token for authentication
                const token = await user.jwt();

                const response = await fetch('/.netlify/functions/save-score', { // Relative path to function
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`, // Send auth token
                    },
                    body: JSON.stringify({ score: currentScore }), // Send score in body
                });

                if (!response.ok) {
                    // Handle errors from the function (e.g., 401, 500)
                    const errorData = await response.json();
                    console.error(`Error saving score (${response.status}):`, errorData.error || 'Unknown error');
                } else {
                    // Handle success
                    const result = await response.json();
                    console.log('Score saved successfully:', result);
                }
            } catch (error) {
                console.error('Network or other error calling save-score function:', error);
            }

        } else {
            // User is not logged in
            console.log('User not logged in, score not saved.');
        }
    }


    // --- Movement Logic ---
    function movePlayer(direction) {
        if (!isGameActive) return; // Only move if game is active

        const gameAreaWidth = gameArea.offsetWidth;
        const gameAreaHeight = gameArea.offsetHeight;
        const moveX = Math.max(1, gameAreaWidth * speedFactor);
        const moveY = Math.max(1, gameAreaHeight * speedFactor);

        let newX = playerX; let newY = playerY;
        switch (direction) {
            case "up":    newY -= moveY; break;
            case "down":  newY += moveY; break;
            case "left":  newX -= moveX; break;
            case "right": newX += moveX; break;
        }

        const playerWidth = player.offsetWidth; const playerHeight = player.offsetHeight;
        playerX = Math.max(0, Math.min(newX, gameAreaWidth - playerWidth));
        playerY = Math.max(0, Math.min(newY, gameAreaHeight - playerHeight));

        updatePlayerPosition();

        if (checkCollision()) {
            score++;
            scoreSpan.textContent = score;
            // --- ADDED THE CALL TO saveScore HERE ---
            saveScore(score); // Call the function to save the score
            // --- End of added line ---
            moveTarget();
        }
    }

    // --- Handle Keyboard Input ---
    function handleKeyDown(event) {
        if (!isGameActive) return;
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            switch (event.key) {
                case "ArrowUp":    movePlayer('up');    break;
                case "ArrowDown":  movePlayer('down');  break;
                case "ArrowLeft":  movePlayer('left');  break;
                case "ArrowRight": movePlayer('right'); break;
            }
        }
    }

    // --- Function to start the game ---
    function startGame() {
        isGameActive = true;
        score = 0;
        scoreSpan.textContent = score;
        playerX = 10; playerY = 10; updatePlayerPosition();

        rulesScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');
        scoreDisplayContainer.classList.remove('hidden');
        controlsContainer.classList.remove('hidden');

        moveTarget();
        gameArea.focus();
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', () => {
         startButton.classList.add('hidden'); rulesScreen.classList.remove('hidden'); playButton.focus();
     });
    playButton.addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyDown);

    // On-Screen Button Listeners
    btnUp.addEventListener('click', () => movePlayer('up'));
    btnDown.addEventListener('click', () => movePlayer('down'));
    btnLeft.addEventListener('click', () => movePlayer('left'));
    btnRight.addEventListener('click', () => movePlayer('right'));

    // --- Netlify Identity Event Listeners ---
    // (No listeners needed right now based on allowing anonymous play first)
    // We check currentUser() directly in saveScore

}); // End of DOMContentLoaded listener