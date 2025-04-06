// script.js - Snake Game with Wallet Integration, Score Saving/Signing, Leaderboard
/* global ethers, netlifyIdentity */

document.addEventListener('DOMContentLoaded', () => {

    // --- Get references to elements ---
    const startButton = document.getElementById('start-button');
    const rulesScreen = document.getElementById('rules-screen');
    const playButton = document.getElementById('play-button');
    const gameArea = document.getElementById('game-area');
    const player = document.getElementById('player'); // Snake Head
    const food = document.getElementById('food');
    const scoreDisplayContainer = document.getElementById('score-display');
    const scoreSpan = document.getElementById('score');
    const controlsContainer = document.getElementById('controls');
    const btnUp = document.getElementById('btn-up');
    const btnDown = document.getElementById('btn-down');
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const restartButton = document.getElementById('restart-button');
    // --- Identity, Wallet, Leaderboard elements ---
    const identityMenuPlaceholder = document.querySelector('[data-netlify-identity-menu]'); // Keep reference if needed later
    const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
    const leaderboardDialog = document.getElementById('leaderboard-dialog');
    const leaderboardList = document.getElementById('leaderboard-list');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const walletStatusDiv = document.getElementById('wallet-status');
    const walletSectionDiv = document.getElementById('wallet-section');
    const signScoreBtn = document.getElementById('sign-score-btn');
    // --- Token Info Elements ---
    let tokenInfoSpan = document.querySelector('.token-info');
    let tokenBalanceSpan = document.getElementById('token-balance');
    // --- Dynamic Playability Status ---
    const playabilityStatusDiv = document.createElement('div');
    playabilityStatusDiv.setAttribute('id', 'playability-status');
    playabilityStatusDiv.style.marginTop = '10px';
    playabilityStatusDiv.style.textAlign = 'center';
    playabilityStatusDiv.style.fontWeight = 'bold';
    playabilityStatusDiv.style.minHeight = '1.2em'; // Prevent layout shifts
    if (rulesScreen && rulesScreen.parentNode) {
       rulesScreen.parentNode.insertBefore(playabilityStatusDiv, rulesScreen.nextSibling);
    } else {
       console.error("Could not find rulesScreen parent to insert playability status.");
    }


    // --- Token Contract Constants ---
    const TOKEN_CONTRACT_ADDRESS = "0x3Aa2BAbD88056a6bA995056B6e139C42411b068E";
    const TOKEN_ABI = [ /* FULL ABI as provided before */ {"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"address","name":"_pulseXRouter","type":"address"},{"internalType":"address","name":"_forgeAddress","type":"address"},{"internalType":"address","name":"_founderTaxAddress","type":"address"},{"internalType":"address","name":"_forgeTaxAddress","type":"address"},{"internalType":"address","name":"_communityDistributionWallet","type":"address"},{"internalType":"uint256","name":"_founderTaxRate","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFounderTaxRate","type":"uint256"}],"name":"FounderTaxRateUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRouter","type":"address"}],"name":"RouterUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"},{"indexed":false,"internalType":"string","name":"walletType","type":"string"}],"name":"TaxAddressUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"bool","name":"isSenderExempt","type":"bool"},{"indexed":false,"internalType":"bool","name":"isRecipientExempt","type":"bool"},{"indexed":false,"internalType":"uint256","name":"founderTaxAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"forgeTaxAmount","type":"uint256"}],"name":"TaxCalculation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"bool","name":"exempt","type":"bool"}],"name":"TaxExemptionUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"communityDistributionWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"forgeAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"forgeTaxAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"founderTaxAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"founderTaxRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isTaxExempt","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pulseXRouter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"exempt","type":"bool"}],"name":"setTaxExemption","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newForgeTaxAddress","type":"address"}],"name":"updateForgeTaxAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newFounderTaxAddress","type":"address"}],"name":"updateFounderTaxAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFounderTaxRate","type":"uint256"}],"name":"updateFounderTaxRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRouter","type":"address"}],"name":"updatePulseXRouter","outputs":[],"stateMutability":"nonpayable","type":"function"} ];
    const TOKEN_DECIMALS = 18;
    const REQUIRED_TOKENS = 10000;
    const PULSECHAIN_ID = 369; // Chain ID for PulseChain
    let REQUIRED_BALANCE_WEI = null;

    // --- Snake Game state variables ---
    const segmentSize = 20; // Should match CSS width/height for #player, .snake-segment, #food
    let snake = []; // Array of {x, y} objects, head is snake[0]
    let dx = segmentSize; // Initial horizontal velocity
    let dy = 0;           // Initial vertical velocity
    let foodX = 0;
    let foodY = 0;
    let score = 0;
    let changingDirection = false; // Flag to prevent rapid 180 turns
    let gameLoopIntervalId = null;
    const baseGameSpeed = 200; // Initial interval in ms
    const minGameSpeed = 60;   // Fastest interval
    const speedIncreaseInterval = 3; // Increase speed every N points
    const speedIncreaseAmount = 10;  // Decrease interval by X ms
    let currentGameSpeed = baseGameSpeed;
    let isGameActive = false;

    // --- Wallet state variables ---
    let ethersProvider = null;
    let signer = null;
    let userAddress = null;
    let scoreToSign = null; // Store the last score for signing
    let currentUserTokenBalance = null; // Stores BigNumber balance

    // --- Check Core Elements (Initial check) ---
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !food ||
        !scoreDisplayContainer || !scoreSpan || !controlsContainer || !restartButton ||
        !btnUp || !btnDown || !btnLeft || !btnRight || !tokenInfoSpan || !tokenBalanceSpan || !playabilityStatusDiv ||
        !showLeaderboardBtn || !leaderboardDialog || !leaderboardList || !closeLeaderboardBtn ||
        !connectWalletBtn || !walletStatusDiv || !walletSectionDiv || !signScoreBtn) {
        console.error("CRITICAL: One or more required game elements are missing from the DOM!");
        document.body.innerHTML = "<h1>Error: Game initialization failed. Required elements not found.</h1>";
        // Optional: Provide more specific feedback about which element is missing
        return; // Stop script execution
    }

    // --- Utility & Helper Functions ---

    function updateBalanceDisplay(displayValue) {
        if (tokenBalanceSpan && tokenInfoSpan) {
            tokenBalanceSpan.textContent = displayValue;
            tokenInfoSpan.classList.remove('hidden');
        } else {
            console.error("Balance display elements not found.");
        }
    }

    // Calculate REQUIRED_BALANCE_WEI once ethers is confirmed loaded
    if (typeof ethers !== 'undefined') {
        try {
            REQUIRED_BALANCE_WEI = ethers.utils.parseUnits(REQUIRED_TOKENS.toString(), TOKEN_DECIMALS);
        } catch (e) {
            console.error("Error calculating required balance.", e);
            if (playabilityStatusDiv) playabilityStatusDiv.textContent = "Error: Invalid token configuration.";
            if (playButton) playButton.disabled = true;
        }
    } else {
         console.error("Ethers.js not loaded, cannot initialize required balance.");
         if (playabilityStatusDiv) playabilityStatusDiv.textContent = "Error: Wallet library failed to load.";
         if (playButton) playButton.disabled = true;
    }

    function checkPlayability() {
        let canPlay = false;
        let message = "";

        if (!REQUIRED_BALANCE_WEI) {
             message = "Error: Token configuration failed.";
             console.error("Cannot check playability: REQUIRED_BALANCE_WEI not calculated.");
        } else if (!signer) {
            message = "Connect wallet with PulseChain network to check token balance.";
        } else if (currentUserTokenBalance === null) {
            // This case should ideally be covered by connectWallet updating the status
            message = "Checking token balance...";
        } else if (currentUserTokenBalance.lt(REQUIRED_BALANCE_WEI)) {
            const requiredFormatted = ethers.utils.formatUnits(REQUIRED_BALANCE_WEI, TOKEN_DECIMALS);
            message = `You need at least ${Number(requiredFormatted).toLocaleString()} tokens to play.`;
        } else {
            const requiredFormatted = ethers.utils.formatUnits(REQUIRED_BALANCE_WEI, TOKEN_DECIMALS);
            message = `Holding requirement met! (${Number(requiredFormatted).toLocaleString()}+ Tokens)`;
            canPlay = true;
        }

        playButton.disabled = !canPlay;
        if (playabilityStatusDiv) {
            playabilityStatusDiv.textContent = message;
            playabilityStatusDiv.style.color = canPlay ? 'darkgreen' : 'red';
        }
        return canPlay;
    }


    // --- Snake Game Functions ---

    // Removes existing snake body segment divs from the DOM
    function clearSnakeBody() {
        const segments = gameArea.querySelectorAll('.snake-segment');
        segments.forEach(segment => gameArea.removeChild(segment));
    }

    // Draws the snake (head and body) on the game area
    function drawSnake() {
        // Draw head (player div)
        if (!snake || snake.length === 0) return; // Safety check
        player.style.left = snake[0].x + 'px';
        player.style.top = snake[0].y + 'px';

        // Clear previous body segments
        clearSnakeBody();

        // Draw new body segments (skip the head, index 0)
        for (let i = 1; i < snake.length; i++) {
            const segmentDiv = document.createElement('div');
            segmentDiv.classList.add('snake-segment');
            segmentDiv.style.left = snake[i].x + 'px';
            segmentDiv.style.top = snake[i].y + 'px';
            gameArea.appendChild(segmentDiv);
        }
    }

    // Generates random coordinates for the food, avoiding the snake's body
    function createFood() {
        const maxX = gameArea.clientWidth - segmentSize;
        const maxY = gameArea.clientHeight - segmentSize;
        let foodPlaced = false;

        while (!foodPlaced) {
            foodX = Math.floor(Math.random() * (maxX / segmentSize)) * segmentSize;
            foodY = Math.floor(Math.random() * (maxY / segmentSize)) * segmentSize;

            // Check if food position overlaps with any snake segment
            let collision = false;
            for (const segment of snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    collision = true;
                    break;
                }
            }

            if (!collision) {
                foodPlaced = true;
            }
        }

        // Position the food element
        food.style.left = foodX + 'px';
        food.style.top = foodY + 'px';
    }

    // Calculates the snake's next position and handles collisions/eating
    function moveSnake() {
        // Calculate new head position
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // --- Collision Detection ---
        // Wall collision
        const hitLeftWall = head.x < 0;
        const hitRightWall = head.x >= gameArea.clientWidth;
        const hitTopWall = head.y < 0;
        const hitBottomWall = head.y >= gameArea.clientHeight;

        if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
            gameOver();
            return; // Stop further movement processing
        }

        // Self collision (check if new head position overlaps any body segment)
        // Start checking from index 1 (skip the current head)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return; // Stop further movement processing
            }
        }

        // --- No Collision ---
        // Add new head to the beginning of the snake array
        snake.unshift(head);

        // --- Food Eating Check ---
        const didEatFood = snake[0].x === foodX && snake[0].y === foodY;
        if (didEatFood) {
            score += 1;
            scoreSpan.textContent = score;
            scoreToSign = score; // Update score for potential signing later

            // Increase speed (decrease interval) every few points
            if (score > 0 && score % speedIncreaseInterval === 0) {
                currentGameSpeed = Math.max(minGameSpeed, currentGameSpeed - speedIncreaseAmount);
                // Clear old interval and start new one with updated speed
                clearInterval(gameLoopIntervalId);
                gameLoopIntervalId = setInterval(gameLoop, currentGameSpeed);
                // console.log("Speed increased. New interval:", currentGameSpeed);
            }

            createFood(); // Create new food
        } else {
            // Remove the last segment of the snake if no food was eaten
            snake.pop();
        }
    }

    // Handles the game over state
    function gameOver() {
        if (!isGameActive) return; // Prevent multiple calls

        console.log("Game Over! Final Score:", score);
        isGameActive = false;
        clearInterval(gameLoopIntervalId);
        gameLoopIntervalId = null; // Clear the interval ID

        // Show game over message/options
        if (restartButton) restartButton.classList.remove('hidden');
        // Hide controls if needed
        // controlsContainer.classList.add('hidden');

        // Attempt to save score if user is logged in
        if (netlifyIdentity.currentUser()) {
            saveScore(score); // Pass the final score
        } else {
            console.log("User not logged in, score not saved.");
        }

        // Update visibility of sign button AFTER game over
        updateSignButtonVisibility();

        // Maybe display a "Game Over" text element? (Optional)
        // gameOverText.classList.remove('hidden');
    }

    // The main game loop, called repeatedly by setInterval
    function gameLoop() {
        if (!isGameActive) return; // Exit if game is not active

        // Reset the direction change flag before moving
        changingDirection = false;

        moveSnake(); // Move snake, handles eating and collision checks internally
        // Check if gameOver() was called inside moveSnake
        if (isGameActive) {
            drawSnake(); // Draw snake in new position if game is still active
        }
    }

    // Handles arrow key presses and control button clicks
    function handleDirectionChange(event) {
        if (changingDirection) return; // Prevent changing direction twice in one frame

        const keyPressed = event.key; // For keyboard events
        const buttonId = event.target?.id; // For button clicks

        const goingUp = dy === -segmentSize;
        const goingDown = dy === segmentSize;
        const goingLeft = dx === -segmentSize;
        const goingRight = dx === segmentSize;

        // Determine new direction based on input
        let newDx = dx;
        let newDy = dy;

        if ((keyPressed === 'ArrowUp' || buttonId === 'btn-up') && !goingDown) {
            newDx = 0; newDy = -segmentSize;
        } else if ((keyPressed === 'ArrowDown' || buttonId === 'btn-down') && !goingUp) {
            newDx = 0; newDy = segmentSize;
        } else if ((keyPressed === 'ArrowLeft' || buttonId === 'btn-left') && !goingRight) {
            newDx = -segmentSize; newDy = 0;
        } else if ((keyPressed === 'ArrowRight' || buttonId === 'btn-right') && !goingLeft) {
            newDx = segmentSize; newDy = 0;
        } else {
            return; // No valid direction change
        }

        // Check if direction actually changed
        if (dx !== newDx || dy !== newDy) {
             dx = newDx;
             dy = newDy;
             changingDirection = true; // Set flag after valid change
        }
    }

    // Initializes and starts the game
    function startGame() {
        // Double-check playability right before starting
        if (!checkPlayability()) {
            console.warn("Start game blocked: Playability requirements not met.");
            // Optional: Add more visual feedback here if needed
            playabilityStatusDiv.textContent = "Cannot start game. Check wallet connection and token balance.";
            playabilityStatusDiv.style.color = 'red';
            return;
        }

        console.log("Starting game...");
        isGameActive = true;
        score = 0;
        scoreToSign = null; // Reset score to sign
        scoreSpan.textContent = score;
        currentGameSpeed = baseGameSpeed; // Reset speed

        // Initial snake position (e.g., 3 segments horizontally)
        snake = [
            { x: segmentSize * 4, y: segmentSize }, // Head
            { x: segmentSize * 3, y: segmentSize },
            { x: segmentSize * 2, y: segmentSize }
        ];
        dx = segmentSize; // Start moving right
        dy = 0;
        changingDirection = false;

        // Clear any existing game loop interval
        if (gameLoopIntervalId) {
            clearInterval(gameLoopIntervalId);
            gameLoopIntervalId = null;
        }

        // Clear previous snake segments from DOM if any (e.g., from previous game)
        clearSnakeBody();

        // UI updates for game start
        rulesScreen.classList.add('hidden');
        playabilityStatusDiv.textContent = ''; // Clear status message
        gameArea.classList.remove('hidden');
        scoreDisplayContainer.classList.remove('hidden');
        controlsContainer.classList.remove('hidden');
        player.classList.remove('hidden'); // Show snake head
        food.classList.remove('hidden');   // Show food element
        if (restartButton) restartButton.classList.add('hidden'); // Hide restart button
        signScoreBtn.classList.add('hidden'); // Hide sign button initially

        // Initial setup
        drawSnake();
        createFood();
        gameArea.focus(); // Focus game area for keyboard input (if needed)

        // Start the game loop
        gameLoopIntervalId = setInterval(gameLoop, currentGameSpeed);
    }

    // --- Wallet/Auth/Score Functions ---

    // Shows/hides the "Sign Last Score" button based on conditions
    function updateSignButtonVisibility() {
        const user = netlifyIdentity.currentUser();
        const canSign = user && signer && scoreToSign !== null && scoreToSign > 0 && !isGameActive;

        if (signScoreBtn) {
            signScoreBtn.classList.toggle('hidden', !canSign);
             if (canSign) {
                signScoreBtn.textContent = `Sign Last Score (${scoreToSign})`;
             }
        } else {
            console.error("Sign Score button not found.");
        }
    }

    // Calls the Netlify function to save the score (frontend part)
    async function saveScore(finalScore) {
        const user = netlifyIdentity.currentUser();
        if (!user) {
            console.log("User not logged in. Cannot save score.");
            return; // Exit if no user
        }

        console.log(`Attempting to save score: ${finalScore} for user ${user.email}`);

        try {
            const token = await user.jwt(); // Get the Netlify Identity JWT
            const response = await fetch('/.netlify/functions/save-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send the JWT
                },
                body: JSON.stringify({ score: finalScore })
            });

            const result = await response.json(); // Always try to parse JSON

            if (!response.ok) {
                console.error('Error saving score:', response.status, result.error || response.statusText);
                // Optionally display error to user
                // alert(`Failed to save score: ${result.error || 'Server error'}`);
            } else {
                console.log('Score saved successfully:', result.message);
                // Optionally display success message
                // alert('Score saved!');
            }
        } catch (error) {
            console.error('Network or parsing error while saving score:', error);
            // alert('Error connecting to server to save score.');
        }
    }


    // Fetches leaderboard data and displays it in the modal
    async function fetchAndDisplayLeaderboard() {
        console.log("Fetching and displaying leaderboard..."); // Keep debug log for now
        leaderboardList.innerHTML = '<li>Loading...</li>';

        if (leaderboardDialog && !leaderboardDialog.open) {
            leaderboardDialog.showModal();
        } else if (!leaderboardDialog) {
            console.error("Leaderboard dialog element not found!");
            return;
        }

         try {
             const response = await fetch('/.netlify/functions/get-leaderboard');
             console.log("Leaderboard fetch response status:", response.status);
             if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
                 throw new Error(`Leaderboard fetch failed: ${errorData.error || response.statusText}`);
             }
             const leaderboardData = await response.json();
             console.log("Leaderboard data received:", leaderboardData);

             leaderboardList.innerHTML = ''; // Clear loading/previous entries

             if (leaderboardData && leaderboardData.length > 0) {
                 leaderboardData.forEach(entry => {
                     const li = document.createElement('li');
                     const email = entry.user_email;
                     // Mask email: show first 3 chars (or fewer if name is short) + ***@domain
                     const maskedEmail = email
                         ? `${email.substring(0, Math.min(3, email.indexOf('@')))}***@${email.split('@')[1] || 'domain.com'}`
                         : 'Anonymous';
                     li.textContent = `${maskedEmail}: ${entry.score}`;
                     leaderboardList.appendChild(li);
                 });
             } else {
                 leaderboardList.innerHTML = '<li>Leaderboard is empty.</li>';
             }

         } catch (error) {
             console.error("Error fetching or displaying leaderboard:", error);
             leaderboardList.innerHTML = `<li>Error loading leaderboard: ${error.message}</li>`;
         }
    }


    // Connects to the user's wallet (MetaMask)
    async function connectWallet() {
        if (typeof window.ethereum === 'undefined') {
            walletStatusDiv.textContent = 'Status: MetaMask not detected!';
            return;
        }

        walletStatusDiv.textContent = 'Status: Connecting...';

        try {
            // Use Ethers.js v5 syntax
            ethersProvider = new ethers.providers.Web3Provider(window.ethereum, "any"); // "any" allows network change events

            // Request account access
            await ethersProvider.send("eth_requestAccounts", []);
            signer = ethersProvider.getSigner();
            userAddress = await signer.getAddress();

            // Check network
            const network = await ethersProvider.getNetwork();
            if (network.chainId !== PULSECHAIN_ID) {
                 walletStatusDiv.innerHTML = `Status: Wrong Network! Please switch to PulseChain (ID: ${PULSECHAIN_ID}).<br/>Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                 walletSectionDiv.classList.add('connected'); // Show address even on wrong network
                 currentUserTokenBalance = null; // Reset balance if network is wrong
                 ethersProvider = null; // Nullify provider/signer if network wrong? Maybe keep address.
                 signer = null;
                 updateBalanceDisplay('--'); // Clear balance display
                 checkPlayability(); // Update playability status (will fail)
                 updateSignButtonVisibility(); // Update sign button
                 return; // Stop connection process
            }

            // Network is correct, proceed to get balance
            const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
            currentUserTokenBalance = await tokenContract.balanceOf(userAddress); // Returns BigNumber

            const balanceFormatted = ethers.utils.formatUnits(currentUserTokenBalance, TOKEN_DECIMALS);
            // Format with commas for better readability
            const displayBalance = parseFloat(balanceFormatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            walletStatusDiv.innerHTML = `Status: Connected (PulseChain)<br/>Address: ${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
            walletSectionDiv.classList.add('connected'); // Style section as connected
            updateBalanceDisplay(displayBalance);

            console.log(`Wallet connected: ${userAddress}`);
            console.log(`Token Balance (Wei): ${currentUserTokenBalance.toString()}`);
            console.log(`Token Balance (Formatted): ${balanceFormatted}`);

            // Update game state based on connection
            checkPlayability();
            updateSignButtonVisibility();

             // Listen for network changes
             ethersProvider.on("network", (newNetwork, oldNetwork) => {
                // Reload page or re-check connection on network change
                 if (oldNetwork) {
                     console.log("Network changed, reloading page.");
                     window.location.reload();
                 }
             });

             // Listen for account changes
             window.ethereum.on('accountsChanged', (accounts) => {
                 console.log("Account changed, reloading page.");
                 window.location.reload(); // Simple way to handle account change is reload
             });


        } catch (error) {
            console.error("Wallet connection error:", error);
            walletStatusDiv.textContent = `Status: Connection failed: ${error.message.substring(0, 50)}...`;
            // Reset state variables
            ethersProvider = null;
            signer = null;
            userAddress = null;
            currentUserTokenBalance = null;
            walletSectionDiv.classList.remove('connected');
            updateBalanceDisplay('--');
            checkPlayability();
            updateSignButtonVisibility();
        }
    }

    // Handles the signing of the last score
    async function signScoreVerification() {
        if (!signer) {
            alert("Wallet not connected.");
            return;
        }
        if (scoreToSign === null || scoreToSign <= 0) {
            alert("No valid score to sign.");
            return;
        }

        const message = `Verifying my score in Snake Game: ${scoreToSign} points.`;
        console.log(`Requesting signature for message: "${message}"`);

        try {
            // Request signature
            const signature = await signer.signMessage(message);

            console.log("Signature received:", signature);
            // Display success message with signature snippet
            alert(`Score signed successfully!\nSignature: ${signature.substring(0, 10)}...${signature.substring(signature.length - 10)}\n\n(Note: This signature is for off-chain verification and is not sent to a contract currently)`);

            // Optionally, you could do something with the signature here,
            // like store it alongside the score, or send it to a different backend endpoint.
            // For now, just displaying it is sufficient per requirements.

        } catch (error) {
            console.error("Error signing message:", error);
            alert(`Failed to sign score: ${error.message}`);
        }
    }

    // --- Event Listeners Setup ---
    startButton.addEventListener('click', () => {
        startButton.classList.add('hidden');
        rulesScreen.classList.remove('hidden');
        checkPlayability(); // Check again when rules are shown
    });

    playButton.addEventListener('click', startGame);

    if (restartButton) {
        restartButton.addEventListener('click', startGame); // Restart button also calls startGame
    } else {
        console.warn("Restart button element not found during listener setup.");
    }

    // Keyboard input for snake direction
    document.addEventListener('keydown', handleDirectionChange);

    // On-screen controls
    btnUp.addEventListener('click', handleDirectionChange);
    btnDown.addEventListener('click', handleDirectionChange);
    btnLeft.addEventListener('click', handleDirectionChange);
    btnRight.addEventListener('click', handleDirectionChange);

    // Leaderboard listeners
    if (showLeaderboardBtn) {
         showLeaderboardBtn.addEventListener('click', fetchAndDisplayLeaderboard);
    } else {
         console.error("Show Leaderboard Button element not found!");
    }

    if (closeLeaderboardBtn) {
         closeLeaderboardBtn.addEventListener('click', () => {
             if (leaderboardDialog && leaderboardDialog.open) leaderboardDialog.close();
         });
    } else {
         console.error("Close Leaderboard Button element not found!");
    }

    // Close leaderboard dialog on backdrop click
    if (leaderboardDialog) {
        leaderboardDialog.addEventListener('click', (event) => {
            // Check if the click was directly on the dialog backdrop
            if (event.target === leaderboardDialog) {
                 leaderboardDialog.close();
            }
         });
    } else {
         console.error("Leaderboard Dialog element not found!");
    }

    // Wallet connect button
    if(connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    } else {
        console.error("Connect Wallet Button not found!");
    }

    // Sign score button
    if(signScoreBtn) {
        signScoreBtn.addEventListener('click', signScoreVerification);
    } else {
        console.error("Sign Score Button not found!");
    }

    // Netlify Identity listeners
    netlifyIdentity.on('login', user => {
        console.log('Netlify Identity: Login event', user?.email);
        updateSignButtonVisibility(); // Update based on login state
        // No need to call checkPlayability here, depends on wallet
        // If score was saved while logged out, it wouldn't associate correctly anyway.
        // Best practice: save score only happens if logged in *during* gameOver.
    });
    netlifyIdentity.on('logout', () => {
        console.log('Netlify Identity: Logout event');
        updateSignButtonVisibility(); // Update based on login state
        // checkPlayability(); // Wallet state doesn't change on logout
    });
    netlifyIdentity.on('init', user => {
        console.log('Netlify Identity: Init event', user?.email);
        // Initial UI state based on whether user is already logged in
        updateSignButtonVisibility();
        // checkPlayability(); // checkPlayability called below anyway
    });

    // Initial checks on page load
    checkPlayability(); // Set initial button state based on wallet connection/balance
    // updateSignButtonVisibility(); // Already called by identity init or will be if login state changes

    console.log("Snake game script initialized.");

}); // <<< --- End of DOMContentLoaded listener --- >>>