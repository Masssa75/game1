// script.js - Snake Game Step 4: Restart Button & Increasing Speed
/* global ethers, netlifyIdentity */

document.addEventListener('DOMContentLoaded', () => {

    // --- Get references to elements ---
    // (Includes new #restart-button)
    const startButton = document.getElementById('start-button');
    const rulesScreen = document.getElementById('rules-screen');
    const playButton = document.getElementById('play-button');
    const gameArea = document.getElementById('game-area');
    const player = document.getElementById('player');
    const food = document.getElementById('food');
    const scoreDisplayContainer = document.getElementById('score-display');
    const scoreSpan = document.getElementById('score');
    const controlsContainer = document.getElementById('controls');
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const restartButton = document.getElementById('restart-button'); // Added Restart Button
    // --- Identity, Wallet, Leaderboard elements ---
    const identityMenuPlaceholder = document.querySelector('[data-netlify-identity-menu]');
    const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
    const leaderboardDialog = document.getElementById('leaderboard-dialog');
    const leaderboardList = document.getElementById('leaderboard-list');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const walletStatusDiv = document.getElementById('wallet-status');
    const walletSectionDiv = document.getElementById('wallet-section');
    const signScoreBtn = document.getElementById('sign-score-btn');


    // --- Snake Game state variables ---
    const segmentSize = 20;
    let snake = [];
    let dx = segmentSize;
    let dy = 0;
    let foodX = 0;
    let foodY = 0;
    let score = 0;
    let changingDirection = false;
    let gameLoopIntervalId = null;
    // Speed variables
    const baseGameSpeed = 200; // Initial speed (milliseconds)
    const minGameSpeed = 60;  // Fastest speed allowed
    const speedIncreaseInterval = 3; // Points needed to increase speed
    const speedIncreaseAmount = 10; // Milliseconds to decrease interval by
    let currentGameSpeed = baseGameSpeed; // Track current speed
    // --- End Speed Variables ---
    let isGameActive = false;

    // --- Wallet state variables ---
    let ethersProvider = null;
    let signer = null;
    let userAddress = null;
    let scoreToSign = null;

    // --- Check Core Elements ---
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !food ||
        !scoreDisplayContainer || !scoreSpan || !controlsContainer || !restartButton || // Added restartButton check
        !btnUp || !btnDown || !btnLeft || !btnRight) {
        console.error("One or more required game elements are missing!");
        document.body.innerHTML = "<h1>Error loading game elements. Please check HTML structure/IDs.</h1>";
        return;
    }

    // --- Snake Game Functions ---

    function clearSnakeBody() {
        const oldSegments = gameArea.querySelectorAll('.snake-segment');
        oldSegments.forEach(segment => segment.remove());
    }

    function drawSnake() {
        if (!isGameActive && snake.length === 0) {
             clearSnakeBody();
             player.classList.add('hidden');
             return;
        }
        if (snake.length === 0) return;

        clearSnakeBody();

        snake.forEach((segment, index) => {
            // Use #player div for head, create new divs for body
            const element = (index === 0) ? player : document.createElement('div');
            if (index !== 0) {
                element.classList.add('snake-segment');
                gameArea.appendChild(element); // Append body segments to game area
            }
            element.style.left = segment.x + 'px';
            element.style.top = segment.y + 'px';
            // Ensure head is visible if snake exists
            if (index === 0) player.classList.remove('hidden');
        });
    }


    function createFood() {
        const gameAreaWidth = gameArea.offsetWidth;
        const gameAreaHeight = gameArea.offsetHeight;
        const maxX = Math.floor((gameAreaWidth - segmentSize) / segmentSize);
        const maxY = Math.floor((gameAreaHeight - segmentSize) / segmentSize);
        let newFoodX, newFoodY, foodOnSnake;
        if (maxX < 0 || maxY < 0) {
            console.error("Game area too small"); food.classList.add('hidden'); return;
        }
        do {
            foodOnSnake = false;
            const gridX = Math.max(0, Math.floor(Math.random() * (maxX + 1)));
            const gridY = Math.max(0, Math.floor(Math.random() * (maxY + 1)));
            newFoodX = gridX * segmentSize; newFoodY = gridY * segmentSize;
            for (let i = 0; i < snake.length; i++) {
                if (snake[i].x === newFoodX && snake[i].y === newFoodY) { foodOnSnake = true; break; }
            }
        } while (foodOnSnake);
        foodX = newFoodX; foodY = newFoodY;
        food.style.left = foodX + 'px'; food.style.top = foodY + 'px';
        food.classList.remove('hidden');
    }

    function moveSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        const didEatFood = head.x === foodX && head.y === foodY;

        snake.unshift(head); // Add new head first

        if (didEatFood) {
            score++;
            scoreSpan.textContent = score;
            // Keep the tail (growth) - DON'T pop

            // --- Speed Increase Logic ---
            // Check if score is a multiple of the interval and speed isn't already minimum
            if (score > 0 && score % speedIncreaseInterval === 0 && currentGameSpeed > minGameSpeed) {
                // Calculate the potential new speed
                const newSpeedCandidate = currentGameSpeed - speedIncreaseAmount;
                // Ensure new speed doesn't go below minimum
                const newSpeed = Math.max(minGameSpeed, newSpeedCandidate);

                // Only update if speed actually changed
                if (newSpeed < currentGameSpeed) {
                    currentGameSpeed = newSpeed;
                    clearInterval(gameLoopIntervalId); // Stop old loop
                    gameLoopIntervalId = setInterval(gameLoop, currentGameSpeed); // Start new faster loop
                    console.log(`Speed increased! New interval: ${currentGameSpeed}ms`);
                }
            }
            // --- End Speed Increase ---

             createFood(); // Generate new food AFTER potentially increasing speed

        } else {
            snake.pop(); // Remove tail if no food eaten
        }
    }

     function gameOver() {
        console.log("GAME OVER!");
        isGameActive = false;
        clearInterval(gameLoopIntervalId);
        gameLoopIntervalId = null;

        alert(`Game Over! Your score: ${score}`);
        saveScore(score); // Attempt to save score
        updateSignButtonVisibility(); // Check if sign button should appear

        // Show restart button
        if (restartButton) restartButton.classList.remove('hidden');
    }

    function gameLoop() {
        if (!isGameActive) return;
        changingDirection = false;
        const nextHeadX = snake[0].x + dx;
        const nextHeadY = snake[0].y + dy;
        const gameAreaWidth = gameArea.offsetWidth;
        const gameAreaHeight = gameArea.offsetHeight;

        // Wall Collision Check (Adjusted bounds slightly for clarity)
        const hitLeftWall = nextHeadX < 0;
        const hitRightWall = nextHeadX >= gameAreaWidth; // If left edge >= width, it's out
        const hitTopWall = nextHeadY < 0;
        const hitBottomWall = nextHeadY >= gameAreaHeight; // If top edge >= height, it's out

        if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
            console.log("Collision: Wall"); gameOver(); return;
        }

        // Self Collision Check
        for (let i = 1; i < snake.length; i++) {
            if (nextHeadX === snake[i].x && nextHeadY === snake[i].y) {
                console.log("Collision: Self"); gameOver(); return;
            }
        }

        moveSnake();
        drawSnake();
    }

    function handleDirectionChange(event) {
        // No changes needed here from previous step
        if (!isGameActive || changingDirection) return;
        const key = event.key; const buttonId = event.target?.id;
        const goingUp = dy === -segmentSize; const goingDown = dy === segmentSize;
        const goingLeft = dx === -segmentSize; const goingRight = dx === segmentSize;
        let newDx = dx; let newDy = dy;

        if ((key === "ArrowUp" || buttonId === 'btn-up') && !goingDown) { newDx = 0; newDy = -segmentSize; }
        else if ((key === "ArrowDown" || buttonId === 'btn-down') && !goingUp) { newDx = 0; newDy = segmentSize; }
        else if ((key === "ArrowLeft" || buttonId === 'btn-left') && !goingRight) { newDx = -segmentSize; newDy = 0; }
        else if ((key === "ArrowRight" || buttonId === 'btn-right') && !goingLeft) { newDx = segmentSize; newDy = 0; }
        else { return; }

        if (dx !== newDx || dy !== newDy) { changingDirection = true; dx = newDx; dy = newDy; }
    }

    function startGame() {
        if (gameLoopIntervalId) { clearInterval(gameLoopIntervalId); }

        isGameActive = true;
        score = 0; scoreSpan.textContent = score;
        snake = [ { x: segmentSize * 4, y: segmentSize }, { x: segmentSize * 3, y: segmentSize }, { x: segmentSize * 2, y: segmentSize } ];
        dx = segmentSize; dy = 0;
        changingDirection = false;
        currentGameSpeed = baseGameSpeed; // Reset speed to base speed
        clearSnakeBody();

        // Hide/show elements for new game
        rulesScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');
        scoreDisplayContainer.classList.remove('hidden');
        controlsContainer.classList.remove('hidden');
        player.classList.remove('hidden');
        food.classList.remove('hidden');
        if (restartButton) restartButton.classList.add('hidden'); // Hide restart button
        updateSignButtonVisibility(); // Hide sign button

        drawSnake();
        createFood();
        gameLoopIntervalId = setInterval(gameLoop, currentGameSpeed); // Use current (base) speed
    }

    // --- Functions to Keep/Modify ---

    function updateSignButtonVisibility() {
        const user = netlifyIdentity.currentUser();
        // Show button only if Game is OVER, user logged in, wallet connected, and score >= 0
        if (!isGameActive && score >= 0 && user && signer) {
            scoreToSign = score;
             if (signScoreBtn) signScoreBtn.classList.remove('hidden');
        } else {
             if (signScoreBtn) signScoreBtn.classList.add('hidden');
             scoreToSign = null;
        }
    }

    async function saveScore(finalScore) {
        const user = netlifyIdentity.currentUser();
        if (user) {
            console.log(`Attempting to save final score: ${finalScore}`);
            try {
                const token = await user.jwt();
                const response = await fetch('/.netlify/functions/save-score', {
                    method: 'POST', headers: {'Content-Type': 'application/json','Authorization': `Bearer ${token}`,},
                    body: JSON.stringify({ score: finalScore }),
                });
                if (!response.ok) { const errorData = await response.json(); console.error(`Error saving score (${response.status}):`, errorData.error || 'Unknown error'); }
                else { console.log('Score saved successfully.'); }
            } catch (error) { console.error('Network or other error calling save-score function:', error); }
        } else { console.log('User not logged in, score not saved.'); }
    }

    async function fetchAndDisplayLeaderboard() {
        leaderboardList.innerHTML = '<li>Loading...</li>';
        leaderboardDialog.showModal();
         try {
             const response = await fetch('/.netlify/functions/get-leaderboard');
             if (!response.ok) { throw new Error(`Leaderboard fetch failed: ${response.statusText}`); }
             const leaderboardData = await response.json();
             leaderboardList.innerHTML = '';
             if (leaderboardData && leaderboardData.length > 0) {
                 leaderboardData.forEach(entry => {
                     const li = document.createElement('li');
                     const email = entry.user_email;
                     const maskedEmail = email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : 'Anonymous';
                     li.textContent = `${maskedEmail}: ${entry.score}`;
                     leaderboardList.appendChild(li);
                 });
             } else {
                 leaderboardList.innerHTML = '<li>Leaderboard is empty.</li>';
             }
         } catch (error) {
             console.error("Error fetching or displaying leaderboard:", error);
             leaderboardList.innerHTML = '<li>Error loading leaderboard.</li>';
         }
    }

    async function connectWallet() {
        if (typeof ethers === 'undefined') { console.error('Ethers.js not loaded!'); walletStatusDiv.textContent = 'Error: Ethers library missing.'; return; }
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is available!'); walletStatusDiv.textContent = 'Connecting... Please check wallet.';
            try {
                ethersProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
                await ethersProvider.send("eth_requestAccounts", []);
                signer = ethersProvider.getSigner();
                userAddress = await signer.getAddress();
                console.log('Wallet connected:', userAddress);
                const shortAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                walletStatusDiv.innerHTML = `Connected: <span title="${userAddress}">${shortAddress}</span>`;
                walletSectionDiv.classList.add('connected');
                updateSignButtonVisibility();
            } catch (error) {
                console.error('Error connecting wallet:', error); let errorMessage = 'Connection failed.';
                if (error.code === 4001) { errorMessage = 'Connection rejected by user.'; } else if (error.message) { errorMessage = error.message; }
                walletStatusDiv.textContent = `Error: ${errorMessage}`;
                ethersProvider = null; signer = null; userAddress = null;
                walletSectionDiv.classList.remove('connected');
                updateSignButtonVisibility();
            }
        } else {
            console.error('MetaMask (or compatible wallet) not found!'); walletStatusDiv.textContent = 'Error: Wallet not found!';
            alert('Browser wallet not detected. Please install MetaMask or a similar wallet extension!');
        }
    }


    async function signScoreVerification() {
        if (!signer) { console.error("Signer not available."); alert("Wallet not connected."); return; }
        if (scoreToSign === null || scoreToSign < 0) {
             console.error("No valid final score available to sign.");
             alert("No valid final score from this session to sign.");
             return;
        }
        const message = `Verifying my score in Snake Game: ${scoreToSign} points.`;
        console.log("Attempting to sign message:", message);
        alert(`Please sign the message in your wallet to verify your score of ${scoreToSign}.`);
        try {
            const signature = await signer.signMessage(message);
            console.log("Signature received:", signature);
            alert(`Score signed successfully!\nSignature: ${signature.substring(0, 10)}...${signature.substring(signature.length - 4)}`);
        } catch (error) {
            console.error("Error signing message:", error);
            if (error.code === 4001) { alert("Signature request rejected by user."); }
            else { alert(`Failed to sign message: ${error.message}`); }
        }
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', () => { startButton.classList.add('hidden'); rulesScreen.classList.remove('hidden'); });
    playButton.addEventListener('click', startGame);
    if (restartButton) restartButton.addEventListener('click', startGame); // Added listener for restart button
    document.addEventListener('keydown', handleDirectionChange);
    btnUp.addEventListener('click', handleDirectionChange);
    btnDown.addEventListener('click', handleDirectionChange);
    btnLeft.addEventListener('click', handleDirectionChange);
    btnRight.addEventListener('click', handleDirectionChange);
    showLeaderboardBtn.addEventListener('click', fetchAndDisplayLeaderboard);
    closeLeaderboardBtn.addEventListener('click', () => { if (leaderboardDialog.open) leaderboardDialog.close(); });
    leaderboardDialog.addEventListener('click', (event) => { const rect = leaderboardDialog.getBoundingClientRect(); const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width); if (!isInDialog && leaderboardDialog.open) { leaderboardDialog.close(); } });
    if(connectWalletBtn) { connectWalletBtn.addEventListener('click', connectWallet); } else { console.error("Connect Wallet Button not found!"); }
    if(signScoreBtn) { signScoreBtn.addEventListener('click', signScoreVerification); } else { console.error("Sign Score Button not found!"); }

    // Netlify Identity listeners
     netlifyIdentity.on('login', user => {
        console.log('Netlify login event for:', user.email);
        updateSignButtonVisibility();
    });
    netlifyIdentity.on('logout', () => {
        console.log('Netlify logout event');
        updateSignButtonVisibility();
    });
     netlifyIdentity.on('init', user => {
         console.log('Netlify init event');
         if (user) { console.log('User already logged in:', user.email); }
         else { console.log('User not logged in on init.'); }
         updateSignButtonVisibility();
     });

}); // <<< --- } closes Outer DOMContentLoaded