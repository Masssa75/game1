// script.js - Snake Game Step 5: Token Holding Requirement Check (Corrected ABI Syntax)
/* global ethers, netlifyIdentity */

document.addEventListener('DOMContentLoaded', () => {

    // --- Get references to elements ---
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
    // --- New Token Info Elements ---
    let tokenInfoSpan = document.querySelector('.token-info');
    let tokenBalanceSpan = document.getElementById('token-balance');
    // --- Create status div dynamically ---
    const playabilityStatusDiv = document.createElement('div');
    playabilityStatusDiv.setAttribute('id', 'playability-status');
    playabilityStatusDiv.style.marginTop = '10px';
    playabilityStatusDiv.style.textAlign = 'center';
    playabilityStatusDiv.style.fontWeight = 'bold';
    playabilityStatusDiv.style.minHeight = '1.2em';
    if (rulesScreen && rulesScreen.parentNode) {
       rulesScreen.parentNode.insertBefore(playabilityStatusDiv, rulesScreen.nextSibling);
    }


    // --- Token Contract Constants ---
    const TOKEN_CONTRACT_ADDRESS = "0x3Aa2BAbD88056a6bA995056B6e139C42411b068E";
    // *** CORRECTED ABI - Should be just the array ***
    const TOKEN_ABI = [ { "inputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "address", "name": "_pulseXRouter", "type": "address" }, { "internalType": "address", "name": "_forgeAddress", "type": "address" }, { "internalType": "address", "name": "_founderTaxAddress", "type": "address" }, { "internalType": "address", "name": "_forgeTaxAddress", "type": "address" }, { "internalType": "address", "name": "_communityDistributionWallet", "type": "address" }, { "internalType": "uint256", "name": "_founderTaxRate", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "allowance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientAllowance", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "balance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientBalance", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "approver", "type": "address" } ], "name": "ERC20InvalidApprover", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "receiver", "type": "address" } ], "name": "ERC20InvalidReceiver", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" } ], "name": "ERC20InvalidSender", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" } ], "name": "ERC20InvalidSpender", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "oldRate", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newFounderTaxRate", "type": "uint256" } ], "name": "FounderTaxRateUpdated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "newRouter", "type": "address" } ], "name": "RouterUpdated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "newAddress", "type": "address" }, { "indexed": false, "internalType": "string", "name": "walletType", "type": "string" } ], "name": "TaxAddressUpdated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "address", "name": "recipient", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isSenderExempt", "type": "bool" }, { "indexed": false, "internalType": "bool", "name": "isRecipientExempt", "type": "bool" }, { "indexed": false, "internalType": "uint256", "name": "founderTaxAmount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "forgeTaxAmount", "type": "uint256" } ], "name": "TaxCalculation", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "exempt", "type": "bool" } ], "name": "TaxExemptionUpdated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "communityDistributionWallet", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "forgeAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "forgeTaxAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "founderTaxAddress", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "founderTaxRate", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "isTaxExempt", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pulseXRouter", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "bool", "name": "exempt", "type": "bool" } ], "name": "setTaxExemption", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newForgeTaxAddress", "type": "address" } ], "name": "updateForgeTaxAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newFounderTaxAddress", "type": "address" } ], "name": "updateFounderTaxAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "newFounderTaxRate", "type": "uint256" } ], "name": "updateFounderTaxRate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newRouter", "type": "address" } ], "name": "updatePulseXRouter", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];
    const TOKEN_DECIMALS = 18;
    const REQUIRED_TOKENS = 10000;
    let REQUIRED_BALANCE_WEI = null;

    // --- Snake Game state variables ---
    const segmentSize = 20;
    let snake = [];
    let dx = segmentSize; let dy = 0;
    let foodX = 0; let foodY = 0;
    let score = 0;
    let changingDirection = false;
    let gameLoopIntervalId = null;
    const baseGameSpeed = 200; const minGameSpeed = 60;
    const speedIncreaseInterval = 3; const speedIncreaseAmount = 10;
    let currentGameSpeed = baseGameSpeed;
    let isGameActive = false;

    // --- Wallet state variables ---
    let ethersProvider = null;
    let signer = null;
    let userAddress = null;
    let scoreToSign = null;
    let currentUserTokenBalance = null;

    // --- Check Core Elements ---
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !food ||
        !scoreDisplayContainer || !scoreSpan || !controlsContainer || !restartButton ||
        !btnUp || !btnDown || !btnLeft || !btnRight || !tokenInfoSpan || !tokenBalanceSpan || !playabilityStatusDiv) {
        console.error("One or more required game elements are missing!");
        document.body.innerHTML = "<h1>Error loading game elements. Please check HTML structure/IDs or dynamic creation.</h1>";
        return;
    }

    // --- Utility & Helper Functions ---

    function updateBalanceDisplay(displayValue) {
        if (tokenBalanceSpan && tokenInfoSpan) {
            tokenBalanceSpan.textContent = displayValue;
            tokenInfoSpan.classList.remove('hidden');
        }
    }

    function checkPlayability() {
        let canPlay = false;
        let message = "";
        if (!REQUIRED_BALANCE_WEI) {
             message = "Error: Token config.";
             console.error("Cannot check playability: REQUIRED_BALANCE_WEI not set.");
        } else if (!signer) {
            message = "Connect wallet to play.";
        } else if (currentUserTokenBalance === null) {
            message = "Checking token balance...";
        } else if (currentUserTokenBalance.lt(REQUIRED_BALANCE_WEI)) {
            message = `You need at least ${REQUIRED_TOKENS.toLocaleString()} tokens to play.`;
        } else {
            message = `Holding requirement met! (${REQUIRED_TOKENS.toLocaleString()}+ Tokens)`;
            canPlay = true;
        }
        playButton.disabled = !canPlay;
        if (playabilityStatusDiv) playabilityStatusDiv.textContent = message;
        if (playabilityStatusDiv) playabilityStatusDiv.style.color = canPlay ? 'darkgreen' : 'red';
        console.log(`Check Playability: ${canPlay}, Message: "${message}"`);
        return canPlay;
    }

     if (typeof ethers !== 'undefined') {
        try {
            REQUIRED_BALANCE_WEI = ethers.utils.parseUnits(REQUIRED_TOKENS.toString(), TOKEN_DECIMALS);
            console.log(`Required balance in Wei (${TOKEN_DECIMALS} decimals): ${REQUIRED_BALANCE_WEI.toString()}`);
        } catch (e) {
            console.error("Error calculating required balance.", e);
            if (playabilityStatusDiv) playabilityStatusDiv.textContent = "Error: Invalid token configuration.";
            if (playButton) playButton.disabled = true;
        }
     } else {
         console.error("Ethers.js not loaded, cannot calculate required balance.");
         if (playabilityStatusDiv) playabilityStatusDiv.textContent = "Error: Cannot load wallet library.";
         if (playButton) playButton.disabled = true;
     }

    // --- Snake Game Functions (No changes from previous correct version) ---
    function clearSnakeBody() {
        const oldSegments = gameArea.querySelectorAll('.snake-segment');
        oldSegments.forEach(segment => segment.remove());
    }
    function drawSnake() {
        if (!isGameActive && snake.length === 0) { clearSnakeBody(); player.classList.add('hidden'); return; }
        if (snake.length === 0) return;
        clearSnakeBody();
        snake.forEach((segment, index) => {
            const element = (index === 0) ? player : document.createElement('div');
            if (index !== 0) { element.classList.add('snake-segment'); gameArea.appendChild(element); }
            element.style.left = segment.x + 'px'; element.style.top = segment.y + 'px';
            if (index === 0) player.classList.remove('hidden');
        });
    }
    function createFood() {
        const gameAreaWidth = gameArea.offsetWidth; const gameAreaHeight = gameArea.offsetHeight;
        const maxX = Math.floor((gameAreaWidth - segmentSize) / segmentSize); const maxY = Math.floor((gameAreaHeight - segmentSize) / segmentSize);
        let newFoodX, newFoodY, foodOnSnake;
        if (maxX < 0 || maxY < 0) { console.error("Game area too small"); food.classList.add('hidden'); return; }
        do {
            foodOnSnake = false;
            const gridX = Math.max(0, Math.floor(Math.random() * (maxX + 1))); const gridY = Math.max(0, Math.floor(Math.random() * (maxY + 1)));
            newFoodX = gridX * segmentSize; newFoodY = gridY * segmentSize;
            for (let i = 0; i < snake.length; i++) { if (snake[i].x === newFoodX && snake[i].y === newFoodY) { foodOnSnake = true; break; } }
        } while (foodOnSnake);
        foodX = newFoodX; foodY = newFoodY;
        food.style.left = foodX + 'px'; food.style.top = foodY + 'px';
        food.classList.remove('hidden');
    }
    function moveSnake() {
        const head = { x: snake[0].x + dx, y: snake[0].y + dy }; const didEatFood = head.x === foodX && head.y === foodY;
        snake.unshift(head);
        if (didEatFood) {
            score++; scoreSpan.textContent = score;
            if (score > 0 && score % speedIncreaseInterval === 0 && currentGameSpeed > minGameSpeed) {
                const newSpeedCandidate = currentGameSpeed - speedIncreaseAmount; const newSpeed = Math.max(minGameSpeed, newSpeedCandidate);
                if (newSpeed < currentGameSpeed) {
                    currentGameSpeed = newSpeed; clearInterval(gameLoopIntervalId); gameLoopIntervalId = setInterval(gameLoop, currentGameSpeed);
                    console.log(`Speed increased! New interval: ${currentGameSpeed}ms`);
                }
            }
            createFood();
        } else { snake.pop(); }
    }
    function gameOver() {
        console.log("GAME OVER!"); isGameActive = false; if (gameLoopIntervalId) clearInterval(gameLoopIntervalId); gameLoopIntervalId = null;
        alert(`Game Over! Your score: ${score}`); saveScore(score); updateSignButtonVisibility(); if (restartButton) restartButton.classList.remove('hidden');
    }
    function gameLoop() {
        if (!isGameActive) return; changingDirection = false;
        const nextHeadX = snake[0].x + dx; const nextHeadY = snake[0].y + dy;
        const gameAreaWidth = gameArea.offsetWidth; const gameAreaHeight = gameArea.offsetHeight;
        const hitLeftWall = nextHeadX < 0; const hitRightWall = nextHeadX >= gameAreaWidth;
        const hitTopWall = nextHeadY < 0; const hitBottomWall = nextHeadY >= gameAreaHeight;
        if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) { gameOver(); return; }
        for (let i = 1; i < snake.length; i++) { if (nextHeadX === snake[i].x && nextHeadY === snake[i].y) { gameOver(); return; } }
        moveSnake(); drawSnake();
    }
    function handleDirectionChange(event) {
        if (!isGameActive || changingDirection) return; const key = event.key; const buttonId = event.target?.id;
        const goingUp = dy === -segmentSize; const goingDown = dy === segmentSize; const goingLeft = dx === -segmentSize; const goingRight = dx === segmentSize;
        let newDx = dx; let newDy = dy;
        if ((key === "ArrowUp" || buttonId === 'btn-up') && !goingDown) { newDx = 0; newDy = -segmentSize; }
        else if ((key === "ArrowDown" || buttonId === 'btn-down') && !goingUp) { newDx = 0; newDy = segmentSize; }
        else if ((key === "ArrowLeft" || buttonId === 'btn-left') && !goingRight) { newDx = -segmentSize; newDy = 0; }
        else if ((key === "ArrowRight" || buttonId === 'btn-right') && !goingLeft) { newDx = segmentSize; newDy = 0; }
        else { return; }
        if (dx !== newDx || dy !== newDy) { changingDirection = true; dx = newDx; dy = newDy; }
    }
    function startGame() {
        console.log("Play Now button clicked, startGame entered."); // Keep debug log
        if (!checkPlayability()) { console.warn("Start game blocked INSIDE startGame: Requirements not met."); if (playabilityStatusDiv) { playabilityStatusDiv.style.transition = 'opacity 0.1s ease-in-out'; playabilityStatusDiv.style.opacity = '0.5'; setTimeout(() => { playabilityStatusDiv.style.opacity = '1'; }, 100); } return; }
        console.log("Playability check passed in startGame. Initializing game..."); // Keep debug log
        if (gameLoopIntervalId) { clearInterval(gameLoopIntervalId); } isGameActive = true; score = 0; scoreSpan.textContent = score;
        snake = [ { x: segmentSize * 4, y: segmentSize }, { x: segmentSize * 3, y: segmentSize }, { x: segmentSize * 2, y: segmentSize } ];
        dx = segmentSize; dy = 0; changingDirection = false; currentGameSpeed = baseGameSpeed; clearSnakeBody();
        rulesScreen.classList.add('hidden'); gameArea.classList.remove('hidden'); scoreDisplayContainer.classList.remove('hidden');
        controlsContainer.classList.remove('hidden'); player.classList.remove('hidden'); food.classList.remove('hidden');
        if (restartButton) restartButton.classList.add('hidden'); updateSignButtonVisibility(); drawSnake(); createFood();
        gameLoopIntervalId = setInterval(gameLoop, currentGameSpeed);
    }

    // --- Wallet/Auth/Score Functions ---
    function updateSignButtonVisibility() {
        const user = netlifyIdentity.currentUser();
        if (!isGameActive && score >= 0 && user && signer) {
            scoreToSign = score; if (signScoreBtn) signScoreBtn.classList.remove('hidden');
        } else { if (signScoreBtn) signScoreBtn.classList.add('hidden'); scoreToSign = null; }
    }
    async function saveScore(finalScore) { /* ... includes corrected headers ... */
        const user = netlifyIdentity.currentUser(); if (!user) { console.log('User not logged in, score not saved.'); return; }
        console.log(`Attempting to save final score: ${finalScore}`);
        try {
            const token = await user.jwt(); const response = await fetch('/.netlify/functions/save-score', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ score: finalScore }),
            });
            if (!response.ok) { const errorData = await response.json(); console.error(`Error saving score (${response.status}):`, errorData.error || 'Unknown error'); }
            else { console.log('Score saved successfully.'); }
        } catch (error) { console.error('Network or other error calling save-score function:', error); }
    }
    async function fetchAndDisplayLeaderboard() { /* ... no change ... */ }
    async function connectWallet() { /* ... includes let->const fix from previous step ... */
        if (typeof ethers === 'undefined') { console.error('Ethers.js not loaded!'); updateBalanceDisplay('Lib Err'); checkPlayability(); return; }
        if (!REQUIRED_BALANCE_WEI) { console.error("Token configuration error."); updateBalanceDisplay('Cfg Err'); checkPlayability(); return;}
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is available!');
            walletStatusDiv.innerHTML = 'Connecting...<br><span class="token-info hidden">Balance: <span id="token-balance">--</span> FToken</span>';
            tokenInfoSpan = document.querySelector('.token-info'); tokenBalanceSpan = document.getElementById('token-balance');
            currentUserTokenBalance = null; checkPlayability();
            try {
                ethersProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
                await ethersProvider.send("eth_requestAccounts", []); signer = ethersProvider.getSigner(); userAddress = await signer.getAddress();
                console.log('Wallet connected:', userAddress); const shortAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                walletStatusDiv.firstChild.textContent = `Connected: `; const addrSpan = document.createElement('span'); addrSpan.title = userAddress; addrSpan.textContent = shortAddress;
                while (walletStatusDiv.childNodes.length > 1 && walletStatusDiv.childNodes[1].nodeName !== 'BR') { walletStatusDiv.removeChild(walletStatusDiv.childNodes[1]); }
                walletStatusDiv.insertBefore(addrSpan, walletStatusDiv.childNodes[1]);
                walletSectionDiv.classList.add('connected');
                console.log(`Workspaceing balance for ${userAddress} from ${TOKEN_CONTRACT_ADDRESS}`);
                if (tokenInfoSpan) tokenInfoSpan.classList.remove('hidden'); updateBalanceDisplay('Loading...');
                try {
                    const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
                    const network = await ethersProvider.getNetwork();
                    if (network.chainId !== 369) {
                        console.warn(`Connected to wrong network: ${network.name} (${network.chainId}). Please switch to PulseChain.`); updateBalanceDisplay('Wrong Network'); currentUserTokenBalance = ethers.BigNumber.from(0);
                    } else {
                        const balanceWei = await tokenContract.balanceOf(userAddress); currentUserTokenBalance = balanceWei;
                        console.log(`Token Balance (Wei): ${balanceWei.toString()}`); const formattedBalance = ethers.utils.formatUnits(balanceWei, TOKEN_DECIMALS); console.log(`Token Balance (Formatted): ${formattedBalance}`);
                        updateBalanceDisplay(parseFloat(formattedBalance).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}));
                    }
                } catch (contractError) { console.error("Error fetching token balance:", contractError); currentUserTokenBalance = null; updateBalanceDisplay("Error"); }
                updateSignButtonVisibility(); checkPlayability();
            } catch (error) {
                console.error('Error connecting wallet:', error); let errorMessage = 'Connection failed.'; if (error.code === 4001) { errorMessage = 'Connection rejected by user.'; }
                walletStatusDiv.innerHTML = `Error: ${errorMessage}<br><span class="token-info hidden">Balance: <span id="token-balance">--</span> FToken</span>`;
                tokenInfoSpan = document.querySelector('.token-info'); tokenBalanceSpan = document.getElementById('token-balance');
                ethersProvider = null; signer = null; userAddress = null; currentUserTokenBalance = null; walletSectionDiv.classList.remove('connected');
                updateSignButtonVisibility(); checkPlayability();
            }
        } else {
            console.error('MetaMask (or compatible wallet) not found!');
            walletStatusDiv.innerHTML = 'Error: Wallet not found!<br><span class="token-info hidden">Balance: <span id="token-balance">--</span> FToken</span>';
            tokenInfoSpan = document.querySelector('.token-info'); tokenBalanceSpan = document.getElementById('token-balance');
            alert('Browser wallet not detected. Please install MetaMask or a similar wallet extension!'); checkPlayability();
        }
    }
    async function signScoreVerification() { /* ... no change ... */ }

    // --- Event Listeners ---
    startButton.addEventListener('click', () => { startButton.classList.add('hidden'); rulesScreen.classList.remove('hidden'); checkPlayability(); });
    playButton.addEventListener('click', startGame);
    if (restartButton) restartButton.addEventListener('click', startGame);
    document.addEventListener('keydown', handleDirectionChange);
    btnUp.addEventListener('click', handleDirectionChange); btnDown.addEventListener('click', handleDirectionChange);
    btnLeft.addEventListener('click', handleDirectionChange); btnRight.addEventListener('click', handleDirectionChange);
    showLeaderboardBtn.addEventListener('click', fetchAndDisplayLeaderboard);
    closeLeaderboardBtn.addEventListener('click', () => { if (leaderboardDialog.open) leaderboardDialog.close(); });
    leaderboardDialog.addEventListener('click', (event) => { const rect = leaderboardDialog.getBoundingClientRect(); const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && rect.clientX <= rect.left + rect.width); if (!isInDialog && leaderboardDialog.open) { leaderboardDialog.close(); } });
    if(connectWalletBtn) { connectWalletBtn.addEventListener('click', connectWallet); } else { console.error("Connect Wallet Button not found!"); }
    if(signScoreBtn) { signScoreBtn.addEventListener('click', signScoreVerification); } else { console.error("Sign Score Button not found!"); }

    // Netlify Identity listeners
    netlifyIdentity.on('login', user => { updateSignButtonVisibility(); });
    netlifyIdentity.on('logout', () => { updateSignButtonVisibility(); checkPlayability(); });
    netlifyIdentity.on('init', user => { updateSignButtonVisibility(); checkPlayability(); });

    // Initial check on page load
    checkPlayability();

}); // <<< --- } closes Outer DOMContentLoaded