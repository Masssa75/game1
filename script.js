// script.js - Snake Game (Updated saveScore to send wallet address)
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
    const identityMenuPlaceholder = document.querySelector('[data-netlify-identity-menu]');
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
    playabilityStatusDiv.style.minHeight = '1.2em';
    if (rulesScreen && rulesScreen.parentNode) {
       rulesScreen.parentNode.insertBefore(playabilityStatusDiv, rulesScreen.nextSibling);
    } else {
       console.error("Could not find rulesScreen parent to insert playability status.");
    }


    // --- Token Contract Constants ---
    const TOKEN_CONTRACT_ADDRESS = "0x3Aa2BAbD88056a6bA995056B6e139C42411b068E";
    const TOKEN_ABI = [ /* FULL ABI */ {"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"address","name":"_pulseXRouter","type":"address"},{"internalType":"address","name":"_forgeAddress","type":"address"},{"internalType":"address","name":"_founderTaxAddress","type":"address"},{"internalType":"address","name":"_forgeTaxAddress","type":"address"},{"internalType":"address","name":"_communityDistributionWallet","type":"address"},{"internalType":"uint256","name":"_founderTaxRate","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFounderTaxRate","type":"uint256"}],"name":"FounderTaxRateUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRouter","type":"address"}],"name":"RouterUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"},{"indexed":false,"internalType":"string","name":"walletType","type":"string"}],"name":"TaxAddressUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"bool","name":"isSenderExempt","type":"bool"},{"indexed":false,"internalType":"bool","name":"isRecipientExempt","type":"bool"},{"indexed":false,"internalType":"uint256","name":"founderTaxAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"forgeTaxAmount","type":"uint256"}],"name":"TaxCalculation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"bool","name":"exempt","type":"bool"}],"name":"TaxExemptionUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"communityDistributionWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"forgeAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"forgeTaxAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"founderTaxAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"founderTaxRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isTaxExempt","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pulseXRouter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"exempt","type":"bool"}],"name":"setTaxExemption","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newForgeTaxAddress","type":"address"}],"name":"updateForgeTaxAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newFounderTaxAddress","type":"address"}],"name":"updateFounderTaxAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFounderTaxRate","type":"uint256"}],"name":"updateFounderTaxRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRouter","type":"address"}],"name":"updatePulseXRouter","outputs":[],"stateMutability":"nonpayable","type":"function"} ];
    const TOKEN_DECIMALS = 18;
    const REQUIRED_TOKENS = 10000;
    const PULSECHAIN_ID = 369;
    let REQUIRED_BALANCE_WEI = null;

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
    const baseGameSpeed = 200;
    const minGameSpeed = 60;
    const speedIncreaseInterval = 3;
    const speedIncreaseAmount = 10;
    let currentGameSpeed = baseGameSpeed;
    let isGameActive = false;

    // --- Wallet state variables ---
    let ethersProvider = null;
    let signer = null;
    let userAddress = null; // <<< This holds the connected wallet address
    let scoreToSign = null;
    let currentUserTokenBalance = null;

    // --- Check Core Elements (Initial check) ---
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !food ||
        !scoreDisplayContainer || !scoreSpan || !controlsContainer || !restartButton ||
        !btnUp || !btnDown || !btnLeft || !btnRight || !tokenInfoSpan || !tokenBalanceSpan || !playabilityStatusDiv ||
        !showLeaderboardBtn || !leaderboardDialog || !leaderboardList || !closeLeaderboardBtn ||
        !connectWalletBtn || !walletStatusDiv || !walletSectionDiv || !signScoreBtn) {
        console.error("CRITICAL: One or more required game elements are missing from the DOM!");
        document.body.innerHTML = "<h1>Error: Game initialization failed. Required elements not found.</h1>";
        return;
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

    function clearSnakeBody() { /* ... (no changes needed) ... */ }
    function drawSnake() { /* ... (no changes needed) ... */ }
    function createFood() { /* ... (no changes needed) ... */ }
    function moveSnake() { /* ... (no changes needed) ... */ }
    function gameOver() { /* ... (no changes needed) ... */ }
    function gameLoop() { /* ... (no changes needed) ... */ }
    function handleDirectionChange(event) { /* ... (no changes needed) ... */ }
    function startGame() { /* ... (no changes needed) ... */ }

    // --- Wallet/Auth/Score Functions ---

    function updateSignButtonVisibility() { /* ... (no changes needed) ... */ }

    // *** UPDATED saveScore function ***
    async function saveScore(finalScore) {
        const user = netlifyIdentity.currentUser();
        if (!user) { return; } // Exit if no user logged in

        // Ensure userAddress is available (should be set by connectWallet)
        if (!userAddress) {
             console.error("Cannot save score: Wallet address not found (userAddress is null).");
             // You might want to inform the user here that the score wasn't saved due to a missing address.
             // alert("Error: Could not save score because wallet address is missing. Please reconnect wallet and try again.");
             return; // Stop execution if address is missing
        }

        // console.log(`Attempting to save score: ${finalScore} for user ${user.email} with address ${userAddress}`); // Optional log

        try {
            const token = await user.jwt();
            const response = await fetch('/.netlify/functions/save-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                // *** INCLUDE wallet_address IN THE BODY ***
                body: JSON.stringify({
                    score: finalScore,
                    wallet_address: userAddress // Send the stored wallet address
                })
                // *****************************************
            });

            const result = await response.json(); // Try to parse JSON response

            if (!response.ok) {
                console.error('Error saving score:', response.status, result.error || response.statusText);
                // Handle error display if needed (e.g., alert user)
            } else {
                // console.log('Score saved successfully (including address):', result.message); // Optional log
                // Handle success display if needed (e.g., alert user)
            }
        } catch (error) {
            console.error('Network or parsing error while saving score:', error);
            // Handle error display if needed (e.g., alert user)
        }
    }
    // *** END OF UPDATED saveScore function ***

    async function fetchAndDisplayLeaderboard() { /* ... (no changes needed) ... */ }
    async function connectWallet() { /* ... (no changes needed) ... */ }
    async function signScoreVerification() { /* ... (no changes needed) ... */ }

    // --- Event Listeners Setup ---
    /* ... (no changes needed) ... */

    // Initialize Identity Widget
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on("init", user => {
        if (!user) {
          window.netlifyIdentity.on("login", () => { document.location.href = "/"; });
        }
      });
    }

}); // <<< --- End of DOMContentLoaded listener --- >>>


// Re-adding the full implementations for functions previously collapsed, just in case
// (These are identical to the 'cleaned log' version provided earlier)

// --- Snake Game Functions Implementation ---
function clearSnakeBody() {
    const segments = gameArea.querySelectorAll('.snake-segment');
    segments.forEach(segment => gameArea.removeChild(segment));
}

function drawSnake() {
    if (!snake || snake.length === 0) return;
    player.style.left = snake[0].x + 'px';
    player.style.top = snake[0].y + 'px';
    clearSnakeBody();
    for (let i = 1; i < snake.length; i++) {
        const segmentDiv = document.createElement('div');
        segmentDiv.classList.add('snake-segment');
        segmentDiv.style.left = snake[i].x + 'px';
        segmentDiv.style.top = snake[i].y + 'px';
        gameArea.appendChild(segmentDiv);
    }
}

function createFood() {
    const maxX = gameArea.clientWidth - segmentSize;
    const maxY = gameArea.clientHeight - segmentSize;
    let foodPlaced = false;
    while (!foodPlaced) {
        foodX = Math.floor(Math.random() * (maxX / segmentSize)) * segmentSize;
        foodY = Math.floor(Math.random() * (maxY / segmentSize)) * segmentSize;
        let collision = false;
        for (const segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                collision = true;
                break;
            }
        }
        if (!collision) foodPlaced = true;
    }
    food.style.left = foodX + 'px';
    food.style.top = foodY + 'px';
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x >= gameArea.clientWidth;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y >= gameArea.clientHeight;
    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        gameOver();
        return;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    snake.unshift(head);
    const didEatFood = snake[0].x === foodX && snake[0].y === foodY;
    if (didEatFood) {
        score += 1;
        scoreSpan.textContent = score;
        scoreToSign = score;
        if (score > 0 && score % speedIncreaseInterval === 0) {
            currentGameSpeed = Math.max(minGameSpeed, currentGameSpeed - speedIncreaseAmount);
            clearInterval(gameLoopIntervalId);
            gameLoopIntervalId = setInterval(gameLoop, currentGameSpeed);
        }
        createFood();
    } else {
        snake.pop();
    }
}

function gameOver() {
    const scope = this ?? window; // Define scope for clarity or fallback
    if (!scope.isGameActive) return;
    scope.isGameActive = false;
    clearInterval(scope.gameLoopIntervalId);
    scope.gameLoopIntervalId = null;
    if (scope.restartButton) scope.restartButton.classList.remove('hidden');
    const currentUser = window.netlifyIdentity.currentUser(); // Explicitly use window
    if (currentUser) {
        // Call saveScore from the correct scope if it's defined globally or on window
        if (typeof saveScore === 'function') {
             saveScore(scope.score);
        } else {
             console.error("saveScore function not found in the expected scope.");
        }
    }
    if (typeof updateSignButtonVisibility === 'function') {
        updateSignButtonVisibility();
    } else {
         console.error("updateSignButtonVisibility function not found.");
    }
}


function gameLoop() {
    const scope = this ?? window;
    if (!scope.isGameActive) return;
    scope.changingDirection = false;
    if(typeof moveSnake === 'function') moveSnake(); else console.error("moveSnake not found");
    if (scope.isGameActive) { // Check again as moveSnake might call gameOver
        if(typeof drawSnake === 'function') drawSnake(); else console.error("drawSnake not found");
    }
}


function handleDirectionChange(event) {
    const scope = this ?? window;
    if (scope.changingDirection) return;
    const keyPressed = event.key;
    const buttonId = event.target?.id;
    const goingUp = scope.dy === -scope.segmentSize;
    const goingDown = scope.dy === scope.segmentSize;
    const goingLeft = scope.dx === -scope.segmentSize;
    const goingRight = scope.dx === scope.segmentSize;
    let newDx = scope.dx;
    let newDy = scope.dy;
    if ((keyPressed === 'ArrowUp' || buttonId === 'btn-up') && !goingDown) {
        newDx = 0; newDy = -scope.segmentSize;
    } else if ((keyPressed === 'ArrowDown' || buttonId === 'btn-down') && !goingUp) {
        newDx = 0; newDy = scope.segmentSize;
    } else if ((keyPressed === 'ArrowLeft' || buttonId === 'btn-left') && !goingRight) {
        newDx = -scope.segmentSize; newDy = 0;
    } else if ((keyPressed === 'ArrowRight' || buttonId === 'btn-right') && !goingLeft) {
        newDx = scope.segmentSize; newDy = 0;
    } else {
        return;
    }
    if (scope.dx !== newDx || scope.dy !== newDy) {
         scope.dx = newDx;
         scope.dy = newDy;
         scope.changingDirection = true;
    }
}

function startGame() {
    const scope = this ?? window;
    if (!checkPlayability()) { // Assumes checkPlayability is global or accessible
        scope.playabilityStatusDiv.textContent = "Cannot start game. Check wallet connection and token balance.";
        scope.playabilityStatusDiv.style.color = 'red';
        return;
    }
    scope.isGameActive = true; scope.score = 0; scope.scoreToSign = null; scope.scoreSpan.textContent = scope.score; scope.currentGameSpeed = scope.baseGameSpeed;
    scope.snake = [ { x: scope.segmentSize * 4, y: scope.segmentSize }, { x: scope.segmentSize * 3, y: scope.segmentSize }, { x: scope.segmentSize * 2, y: scope.segmentSize } ];
    scope.dx = scope.segmentSize; scope.dy = 0; scope.changingDirection = false;
    if (scope.gameLoopIntervalId) { clearInterval(scope.gameLoopIntervalId); scope.gameLoopIntervalId = null; }
    if(typeof clearSnakeBody === 'function') clearSnakeBody(); else console.error("clearSnakeBody not found");
    scope.rulesScreen.classList.add('hidden'); scope.playabilityStatusDiv.textContent = '';
    scope.gameArea.classList.remove('hidden'); scope.scoreDisplayContainer.classList.remove('hidden'); scope.controlsContainer.classList.remove('hidden');
    scope.player.classList.remove('hidden'); scope.food.classList.remove('hidden');
    if (scope.restartButton) scope.restartButton.classList.add('hidden');
    scope.signScoreBtn.classList.add('hidden');
    if(typeof drawSnake === 'function') drawSnake(); else console.error("drawSnake not found");
    if(typeof createFood === 'function') createFood(); else console.error("createFood not found");
    scope.gameArea.focus();
    scope.gameLoopIntervalId = setInterval(gameLoop, scope.currentGameSpeed); // Use gameLoop directly if it's globally defined
}


// --- Wallet/Auth/Score Functions Implementation ---
function updateSignButtonVisibility() {
    const scope = this ?? window;
    const user = window.netlifyIdentity.currentUser(); // Explicitly use window
    const canSign = user && scope.signer && scope.scoreToSign !== null && scope.scoreToSign > 0 && !scope.isGameActive;
    if (scope.signScoreBtn) {
        scope.signScoreBtn.classList.toggle('hidden', !canSign);
         if (canSign) { scope.signScoreBtn.textContent = `Sign Last Score (${scope.scoreToSign})`; }
    } else {
        console.error("Sign Score button not found.");
    }
}

async function fetchAndDisplayLeaderboard() {
    const scope = this ?? window;
    scope.leaderboardList.innerHTML = '<li>Loading...</li>';
    if (scope.leaderboardDialog && !scope.leaderboardDialog.open) {
        scope.leaderboardDialog.showModal();
    } else if (!scope.leaderboardDialog) {
        console.error("Leaderboard dialog element not found!");
        return;
    }
     try {
         const response = await fetch('/.netlify/functions/get-leaderboard');
         if (!response.ok) {
             const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
             throw new Error(`Leaderboard fetch failed: ${errorData.error || response.statusText}`);
         }
         const leaderboardData = await response.json();
         scope.leaderboardList.innerHTML = '';
         if (leaderboardData && leaderboardData.length > 0) {
             leaderboardData.forEach(entry => {
                 const li = document.createElement('li');
                 const email = entry.user_email;
                 const maskedEmail = email ? `${email.substring(0, Math.min(3, email.indexOf('@')))}***@${email.split('@')[1] || 'domain.com'}` : 'Anonymous';
                 li.textContent = `${maskedEmail}: ${entry.score}`;
                 scope.leaderboardList.appendChild(li);
             });
         } else {
             scope.leaderboardList.innerHTML = '<li>Leaderboard is empty.</li>';
         }
     } catch (error) {
         console.error("Error fetching or displaying leaderboard:", error);
         scope.leaderboardList.innerHTML = `<li>Error loading leaderboard: ${error.message}</li>`;
     }
}

async function connectWallet() {
    const scope = this ?? window;
    if (typeof window.ethereum === 'undefined') {
        scope.walletStatusDiv.textContent = 'Status: MetaMask not detected!';
        return;
    }
    scope.walletStatusDiv.textContent = 'Status: Connecting...';
    try {
        scope.ethersProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await scope.ethersProvider.send("eth_requestAccounts", []);
        scope.signer = scope.ethersProvider.getSigner();
        scope.userAddress = await scope.signer.getAddress(); // <<< Stores the address
        const network = await scope.ethersProvider.getNetwork();
        if (network.chainId !== scope.PULSECHAIN_ID) {
             scope.walletStatusDiv.innerHTML = `Status: Wrong Network! Please switch to PulseChain (ID: ${scope.PULSECHAIN_ID}).<br/>Connected: ${scope.userAddress.substring(0, 6)}...${scope.userAddress.substring(scope.userAddress.length - 4)}`;
             scope.walletSectionDiv.classList.add('connected');
             scope.currentUserTokenBalance = null; scope.ethersProvider = null; scope.signer = null; // Reset signer/provider on wrong network
             updateBalanceDisplay('--'); checkPlayability(); updateSignButtonVisibility(); // Update UI based on state
             return;
        }
        const tokenContract = new ethers.Contract(scope.TOKEN_CONTRACT_ADDRESS, scope.TOKEN_ABI, scope.signer);
        scope.currentUserTokenBalance = await tokenContract.balanceOf(scope.userAddress);
        const balanceFormatted = ethers.utils.formatUnits(scope.currentUserTokenBalance, scope.TOKEN_DECIMALS);
        const displayBalance = parseFloat(balanceFormatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        scope.walletStatusDiv.innerHTML = `Status: Connected (PulseChain)<br/>Address: ${scope.userAddress.substring(0, 6)}...${scope.userAddress.substring(scope.userAddress.length - 4)}`;
        scope.walletSectionDiv.classList.add('connected');
        updateBalanceDisplay(displayBalance); // Assumes updateBalanceDisplay is global
        checkPlayability(); // Assumes checkPlayability is global
        updateSignButtonVisibility(); // Assumes updateSignButtonVisibility is global
         scope.ethersProvider.on("network", (newNetwork, oldNetwork) => { if (oldNetwork) { window.location.reload(); } });
         window.ethereum.on('accountsChanged', (accounts) => { window.location.reload(); });
    } catch (error) {
        console.error("Wallet connection error:", error);
        scope.walletStatusDiv.textContent = `Status: Connection failed: ${error.message.substring(0, 50)}...`;
        scope.ethersProvider = null; scope.signer = null; scope.userAddress = null; scope.currentUserTokenBalance = null;
        scope.walletSectionDiv.classList.remove('connected'); updateBalanceDisplay('--');
        checkPlayability(); updateSignButtonVisibility(); // Update UI based on state
    }
}


async function signScoreVerification() {
    const scope = this ?? window;
    if (!scope.signer) { alert("Wallet not connected."); return; }
    if (scope.scoreToSign === null || scope.scoreToSign <= 0) { alert("No valid score to sign."); return; }
    const message = `Verifying my score in Snake Game: ${scope.scoreToSign} points.`;
    try {
        const signature = await scope.signer.signMessage(message);
        alert(`Score signed successfully!\nSignature: ${signature.substring(0, 10)}...${signature.substring(signature.length - 10)}\n\n(Note: This signature is for off-chain verification only)`);
    } catch (error) {
        console.error("Error signing message:", error);
        alert(`Failed to sign score: ${error.message}`);
    }
}


// --- Event Listeners Setup ---
document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('start-button').classList.add('hidden');
    document.getElementById('rules-screen').classList.remove('hidden');
    checkPlayability(); // Assumes global
});
document.getElementById('play-button').addEventListener('click', startGame); // Assumes global

const localRestartButton = document.getElementById('restart-button'); // Use local var
if (localRestartButton) {
    localRestartButton.addEventListener('click', startGame); // Assumes global
} else {
    console.warn("Restart button element not found during listener setup.");
}

document.addEventListener('keydown', handleDirectionChange); // Assumes global
document.getElementById('btn-up').addEventListener('click', handleDirectionChange); // Assumes global
document.getElementById('btn-down').addEventListener('click', handleDirectionChange); // Assumes global
document.getElementById('btn-left').addEventListener('click', handleDirectionChange); // Assumes global
document.getElementById('btn-right').addEventListener('click', handleDirectionChange); // Assumes global

const localShowLeaderboardBtn = document.getElementById('show-leaderboard-btn'); // Use local var
if (localShowLeaderboardBtn) {
    localShowLeaderboardBtn.addEventListener('click', fetchAndDisplayLeaderboard); // Assumes global
} else {
    console.error("Show Leaderboard Button element not found!");
}

const localCloseLeaderboardBtn = document.getElementById('close-leaderboard-btn'); // Use local var
if (localCloseLeaderboardBtn) {
    localCloseLeaderboardBtn.addEventListener('click', () => {
        const dialog = document.getElementById('leaderboard-dialog'); // Get dialog inside handler
        if (dialog && dialog.open) dialog.close();
    });
} else {
     console.error("Close Leaderboard Button element not found!");
}

const localLeaderboardDialog = document.getElementById('leaderboard-dialog'); // Use local var
if (localLeaderboardDialog) {
    localLeaderboardDialog.addEventListener('click', (event) => {
        if (event.target === localLeaderboardDialog) { // Check if click is on backdrop
            localLeaderboardDialog.close();
        }
     });
} else {
     console.error("Leaderboard Dialog element not found!");
}

const localConnectWalletBtn = document.getElementById('connect-wallet-btn'); // Use local var
if(localConnectWalletBtn) {
    localConnectWalletBtn.addEventListener('click', connectWallet); // Assumes global
} else {
    console.error("Connect Wallet Button not found!");
}

const localSignScoreBtn = document.getElementById('sign-score-btn'); // Use local var
if(localSignScoreBtn) {
    localSignScoreBtn.addEventListener('click', signScoreVerification); // Assumes global
} else {
    console.error("Sign Score Button not found!");
}

// Netlify Identity listeners setup using window.netlifyIdentity
if (window.netlifyIdentity) {
    window.netlifyIdentity.on('login', user => {
        if(typeof updateSignButtonVisibility === 'function') updateSignButtonVisibility();
    });
    window.netlifyIdentity.on('logout', () => {
        if(typeof updateSignButtonVisibility === 'function') updateSignButtonVisibility();
    });
    window.netlifyIdentity.on('init', user => {
        if(typeof updateSignButtonVisibility === 'function') updateSignButtonVisibility();
    });
} else {
     console.warn("Netlify Identity widget not found during listener setup.");
}


// Initial check on page load
if(typeof checkPlayability === 'function') checkPlayability(); else console.error("checkPlayability not found for initial call");

// <<< --- End of DOMContentLoaded listener --- >>>