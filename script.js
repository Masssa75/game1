// script.js - Snake Game Step 1: Basic Movement (Corrected Syntax Error)
/* global ethers, netlifyIdentity */

document.addEventListener('DOMContentLoaded', () => { // <--- Outer DOMContentLoaded { starts here

    // --- Get references to elements ---
    const startButton = document.getElementById('start-button');
    const rulesScreen = document.getElementById('rules-screen');
    const playButton = document.getElementById('play-button');
    const gameArea = document.getElementById('game-area');
    const player = document.getElementById('player'); // Will represent snake head for now
    // const target = document.getElementById('target'); // Rename or repurpose later for food
    const scoreDisplayContainer = document.getElementById('score-display');
    const scoreSpan = document.getElementById('score');
    const controlsContainer = document.getElementById('controls');
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    // --- Identity, Wallet, Leaderboard elements (keep for later integration) ---
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
    const segmentSize = 20; // Size of each snake segment (adjust CSS for #player too!)
    let snake = []; // Array of {x, y} segment positions
    let dx = segmentSize; // Initial horizontal velocity (step size)
    let dy = 0; // Initial vertical velocity (step size)
    let score = 0;
    let changingDirection = false; // Flag to prevent rapid direction changes
    let gameLoopIntervalId = null;
    const gameSpeed = 200; // Milliseconds between game ticks (lower is faster)
    let isGameActive = false; // Track if game is running

    // --- Wallet state variables (keep for later) ---
    let ethersProvider = null;
    let signer = null;
    let userAddress = null;
    let scoreToSign = null;

    // --- Check Core Elements ---
    // Simplified check for snake game start
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player ||
        !scoreDisplayContainer || !scoreSpan || !controlsContainer ||
        !btnUp || !btnDown || !btnLeft || !btnRight) {
        console.error("One or more required game elements are missing!");
        document.body.innerHTML = "<h1>Error loading game elements. Please check HTML structure/IDs.</h1>";
        return;
    }

    // --- NEW Snake Game Functions ---

    function drawSnake() {
        // For Step 1, just draw the head using the #player div
        if (snake.length === 0) return;
        const head = snake[0];
        player.style.left = head.x + 'px';
        player.style.top = head.y + 'px';
        // In later steps, we'll draw all segments here
    }

    function moveSnake() {
        // Calculate the new head position based on current velocity (dx, dy)
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        // Add the new head to the beginning of the snake array
        snake.unshift(head);
        // Remove the last segment to simulate movement (growth comes later)
        snake.pop();
    }

    function gameLoop() {
        if (!isGameActive) return; // Stop loop if game ended

        // Allow direction change for the next tick
        changingDirection = false;

        // --- Collision Detection (To be added in later steps) ---
        // checkWallCollision();
        // checkSelfCollision();
        // checkFoodCollision(); // Will handle growth

        // --- Move the snake ---
        moveSnake();

        // --- Draw the result ---
        drawSnake();
    }

    function handleDirectionChange(event) {
        if (!isGameActive || changingDirection) return; // Prevent change if game over or already changed this tick

        const key = event.key; // For keyboard events
        const buttonId = event.target?.id; // For button clicks

        const goingUp = dy === -segmentSize;
        const goingDown = dy === segmentSize;
        const goingLeft = dx === -segmentSize;
        const goingRight = dx === segmentSize;

        let newDx = dx;
        let newDy = dy;

        // Determine new direction based on input, preventing reversal
        if ((key === "ArrowUp" || buttonId === 'btn-up') && !goingDown) {
            newDx = 0; newDy = -segmentSize;
        } else if ((key === "ArrowDown" || buttonId === 'btn-down') && !goingUp) {
            newDx = 0; newDy = segmentSize;
        } else if ((key === "ArrowLeft" || buttonId === 'btn-left') && !goingRight) {
            newDx = -segmentSize; newDy = 0;
        } else if ((key === "ArrowRight" || buttonId === 'btn-right') && !goingLeft) {
            newDx = segmentSize; newDy = 0;
        } else {
            return; // No valid direction change or attempt to reverse
        }

        // Check if the direction actually changed
        if (dx !== newDx || dy !== newDy) {
            changingDirection = true; // Mark direction as changed for this tick
            dx = newDx;
            dy = newDy;
        }
    }

    // --- Modified Game Flow Functions ---
    function startGame() {
        // Clear previous game loop if any
        if (gameLoopIntervalId) {
            clearInterval(gameLoopIntervalId);
        }

        isGameActive = true;
        score = 0;
        scoreSpan.textContent = score;
        // Initialize the snake (e.g., head near top-left)
        snake = [{ x: segmentSize * 2, y: segmentSize }];
        // Set initial direction (e.g., moving right)
        dx = segmentSize;
        dy = 0;
        changingDirection = false;
        // scoreToSign = null; // Reset for signing logic later

        // Hide/show UI elements
        rulesScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');
        scoreDisplayContainer.classList.remove('hidden');
        controlsContainer.classList.remove('hidden');
        player.classList.remove('hidden'); // Make sure snake head is visible
        // target.classList.add('hidden'); // Hide old target for now

        // Update sign button visibility (will need adjustment later for game over state)
        updateSignButtonVisibility();

        // Initial draw
        drawSnake();

        // Start the game loop
        gameLoopIntervalId = setInterval(gameLoop, gameSpeed);
    }

    // --- Functions to Keep (Modify/Integrate Later) ---

    function updateSignButtonVisibility() {
        // *** This logic WILL NEED TO CHANGE ***
        const user = netlifyIdentity.currentUser();
        if (signScoreBtn) signScoreBtn.classList.add('hidden'); // Hide for now
        scoreToSign = null;
    }

    async function saveScore(finalScore) {
        // *** Call this on Game Over ***
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
        // Existing function - should still work fine
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

    // CORRECTED connectWallet function
    async function connectWallet() {
        if (typeof ethers === 'undefined') { console.error('Ethers.js not loaded!'); walletStatusDiv.textContent = 'Error: Ethers library missing.'; return; }

        if (typeof window.ethereum !== 'undefined') { // <-- Opens the 'if ethereum exists' block
            console.log('MetaMask is available!'); walletStatusDiv.textContent = 'Connecting... Please check wallet.';
            try { // <-- Opens try block
                ethersProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
                await ethersProvider.send("eth_requestAccounts", []);
                signer = ethersProvider.getSigner();
                userAddress = await signer.getAddress();
                console.log('Wallet connected:', userAddress);
                const shortAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                walletStatusDiv.innerHTML = `Connected: <span title="${userAddress}">${shortAddress}</span>`;
                walletSectionDiv.classList.add('connected');
                updateSignButtonVisibility(); // Re-evaluate sign button (logic needs update later)
            } catch (error) { // <-- Opens catch block
                console.error('Error connecting wallet:', error); let errorMessage = 'Connection failed.';
                if (error.code === 4001) { errorMessage = 'Connection rejected by user.'; } else if (error.message) { errorMessage = error.message; }
                walletStatusDiv.textContent = `Error: ${errorMessage}`;
                ethersProvider = null; signer = null; userAddress = null;
                walletSectionDiv.classList.remove('connected');
                updateSignButtonVisibility();
            } // <-- Closes catch block
        
        } // <<<<<<< ***** THIS BRACE WAS MISSING ***** Closes the 'if ethereum exists' block
        
        else { // <-- Opens the 'else' block for 'if ethereum exists'
            console.error('MetaMask (or compatible wallet) not found!'); walletStatusDiv.textContent = 'Error: Wallet not found!';
            alert('Browser wallet not detected. Please install MetaMask or a similar wallet extension!');
        } // <-- Closes the 'else' block
    } // <-- Closes the connectWallet function


    async function signScoreVerification() {
        // *** This logic WILL NEED TO CHANGE ***
        if (!signer) { console.error("Signer not available."); alert("Wallet not connected."); return; }
        const finalScore = score;
        scoreToSign = finalScore;
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
            // scoreToSign = null;
        } catch (error) {
            console.error("Error signing message:", error);
            if (error.code === 4001) { alert("Signature request rejected by user."); }
            else { alert(`Failed to sign message: ${error.message}`); }
        }
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', () => { startButton.classList.add('hidden'); rulesScreen.classList.remove('hidden'); });
    playButton.addEventListener('click', startGame);
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