document.addEventListener('DOMContentLoaded', () => {

    // --- Get references to elements ---
    const startButton = document.getElementById('start-button');
    const rulesScreen = document.getElementById('rules-screen');
    const playButton = document.getElementById('play-button');
    console.log('Debug: Getting playButton element:', playButton); // Keep debug log
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
    const identityMenuPlaceholder = document.querySelector('[data-netlify-identity-menu]');
    const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
    const leaderboardDiv = document.getElementById('leaderboard');
    const leaderboardList = document.getElementById('leaderboard-list');


    // --- Game state variables ---
    let score = 0;
    let isGameActive = false;
    let playerX = 10;
    let playerY = 10;
    const speedFactor = 0.075; // Or your preferred speed

    // --- Check elements ---
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !target ||
        !scoreDisplayContainer || !scoreSpan || !controlsContainer ||
        !btnUp || !btnDown || !btnLeft || !btnRight || !identityMenuPlaceholder ||
        !showLeaderboardBtn || !leaderboardDiv || !leaderboardList ) {
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

    // --- Function to save score via Netlify Function ---
    async function saveScore(currentScore) {
        const user = netlifyIdentity.currentUser();
        if (user) {
            console.log('User logged in, attempting to save score:', currentScore);
            try {
                const token = await user.jwt();
                const response = await fetch('/.netlify/functions/save-score', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ score: currentScore }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`Error saving score (${response.status}):`, errorData.error || 'Unknown error');
                } else {
                    const result = await response.json();
                    console.log('Score saved successfully:', result);
                }
            } catch (error) {
                console.error('Network or other error calling save-score function:', error);
            }
        } else {
            console.log('User not logged in, score not saved.');
        }
    }

    // --- Movement Logic ---
    function movePlayer(direction) {
        if (!isGameActive) return;
        const gameAreaWidth = gameArea.offsetWidth; const gameAreaHeight = gameArea.offsetHeight;
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
            score++; scoreSpan.textContent = score;
            saveScore(score);
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

    // --- Function to start the game --- // <<< RESTORED BODY
    function startGame() {
        console.log('Debug: startGame function CALLED!'); // Keep debug log
        isGameActive = true;
        score = 0;
        scoreSpan.textContent = score;
        playerX = 10; playerY = 10;
        updatePlayerPosition(); // Set initial player position on screen

        rulesScreen.classList.add('hidden');
        // Show game elements
        gameArea.classList.remove('hidden');
        scoreDisplayContainer.classList.remove('hidden');
        controlsContainer.classList.remove('hidden'); // Show controls too

        moveTarget(); // Place initial target
        gameArea.focus(); // Focus game area for keyboard input
    }
    // <<< END OF RESTORED BODY


    // --- Function to Fetch and Display Leaderboard ---
    async function fetchAndDisplayLeaderboard() {
        leaderboardList.innerHTML = '<li>Loading...</li>';
        leaderboardDiv.classList.remove('hidden');
        try {
            const response = await fetch('/.netlify/functions/get-leaderboard');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to fetch leaderboard (${response.status}): ${errorData.error || 'Unknown error'}`);
            }
            const leaderboardData = await response.json();
            leaderboardList.innerHTML = '';
            if (Array.isArray(leaderboardData) && leaderboardData.length > 0) {
                leaderboardData.forEach((entry, index) => {
                    const listItem = document.createElement('li');
                    const displayName = entry.user_email || 'Anonymous';
                    listItem.textContent = `${displayName}: ${entry.score}`;
                    leaderboardList.appendChild(listItem);
                });
            } else {
                leaderboardList.innerHTML = '<li>No scores recorded yet.</li>';
            }
        } catch (error) {
            console.error("Error fetching or displaying leaderboard:", error);
            leaderboardList.innerHTML = `<li>Error loading leaderboard: ${error.message}</li>`;
        }
    }


    // --- Event Listeners ---
    startButton.addEventListener('click', () => {
         startButton.classList.add('hidden'); rulesScreen.classList.remove('hidden'); playButton.focus();
     });
    playButton.addEventListener('click', startGame);
    console.log('Debug: Added click listener to playButton.'); // Keep debug log
    document.addEventListener('keydown', handleKeyDown);

    // On-Screen Button Listeners
    btnUp.addEventListener('click', () => movePlayer('up'));
    btnDown.addEventListener('click', () => movePlayer('down'));
    btnLeft.addEventListener('click', () => movePlayer('left'));
    btnRight.addEventListener('click', () => movePlayer('right'));

    // Leaderboard Button Listener
    showLeaderboardBtn.addEventListener('click', fetchAndDisplayLeaderboard);

}); // End of DOMContentLoaded listener