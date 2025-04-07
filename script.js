// script.js - Snake Game (No Identity, No Signing, Faster Speed, Claim Logic)
/* global ethers */ // Removed netlifyIdentity global reference

document.addEventListener('DOMContentLoaded', () => {

    // --- Get references to elements ---
    // REMOVED: identityMenuPlaceholder
    // REMOVED: signScoreBtn
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
    const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
    const leaderboardDialog = document.getElementById('leaderboard-dialog');
    const leaderboardList = document.getElementById('leaderboard-list');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const walletStatusDiv = document.getElementById('wallet-status');
    const walletSectionDiv = document.getElementById('wallet-section');
    const claimPrizeBtn = document.getElementById('claim-prize-btn');
    let tokenInfoSpan = document.querySelector('.token-info');
    let tokenBalanceSpan = document.getElementById('token-balance');
    const playabilityStatusDiv = document.createElement('div');
    playabilityStatusDiv.setAttribute('id', 'playability-status');
    playabilityStatusDiv.style.marginTop = '10px';
    playabilityStatusDiv.style.textAlign = 'center';
    playabilityStatusDiv.style.fontWeight = 'bold';
    playabilityStatusDiv.style.minHeight = '1.2em';
    if (rulesScreen && rulesScreen.parentNode) {
       rulesScreen.parentNode.insertBefore(playabilityStatusDiv, rulesScreen.nextSibling);
    } else { console.error("Could not find rulesScreen parent to insert playability status."); }

    // --- Constants and State Variables ---
    const TOKEN_CONTRACT_ADDRESS = "0x3Aa2BAbD88056a6bA995056B6e139C42411b068E";
    const TOKEN_ABI = [ /* FToken FULL ABI */ {"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"address","name":"_pulseXRouter","type":"address"},{"internalType":"address","name":"_forgeAddress","type":"address"},{"internalType":"address","name":"_founderTaxAddress","type":"address"},{"internalType":"address","name":"_forgeTaxAddress","type":"address"},{"internalType":"address","name":"_communityDistributionWallet","type":"address"},{"internalType":"uint256","name":"_founderTaxRate","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFounderTaxRate","type":"uint256"}],"name":"FounderTaxRateUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRouter","type":"address"}],"name":"RouterUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"},{"indexed":false,"internalType":"string","name":"walletType","type":"string"}],"name":"TaxAddressUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"bool","name":"isSenderExempt","type":"bool"},{"indexed":false,"internalType":"bool","name":"isRecipientExempt","type":"bool"},{"indexed":false,"internalType":"uint256","name":"founderTaxAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"forgeTaxAmount","type":"uint256"}],"name":"TaxCalculation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"bool","name":"exempt","type":"bool"}],"name":"TaxExemptionUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"communityDistributionWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"forgeAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"forgeTaxAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"founderTaxAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"founderTaxRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isTaxExempt","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pulseXRouter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"exempt","type":"bool"}],"name":"setTaxExemption","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newForgeTaxAddress","type":"address"}],"name":"updateForgeTaxAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newFounderTaxAddress","type":"address"}],"name":"updateFounderTaxAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFounderTaxRate","type":"uint256"}],"name":"updateFounderTaxRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRouter","type":"address"}],"name":"updatePulseXRouter","outputs":[],"stateMutability":"nonpayable","type":"function"} ];
    const TOKEN_DECIMALS = 18;
    const REQUIRED_TOKENS = 10000;
    const PULSECHAIN_ID = 369;
    let REQUIRED_BALANCE_WEI = null;
    const PRIZE_CONTRACT_ADDRESS = "0xF81627C02A99D46384bc2341760c263dE1a5DAb3";
    const PRIZE_CONTRACT_ABI = [ { "inputs": [], "name": "claimPrize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_prizeTokenAddress", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "claimant", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "PrizeClaimed", "type": "event" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "fallback" }, { "inputs": [ { "internalType": "address", "name": "_tokenAddress", "type": "address" } ], "name": "withdrawAccidentalTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "withdrawExcessPrizeTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "withdrawNative", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PRIZE_TOKEN_DECIMALS", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "prizeAmount", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "prizeToken", "outputs": [ { "internalType": "contract IERC20", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" } ];

    const segmentSize = 20;
    let snake = [];
    let dx = segmentSize; let dy = 0;
    let foodX = 0; let foodY = 0;
    let score = 0;
    let changingDirection = false;
    let gameLoopIntervalId = null;
    // --- Speed Change ---
    const baseGameSpeed = 100; // Halved from 200
    // --------------------
    const minGameSpeed = 50; // Adjusted slightly (was 60)
    const speedIncreaseInterval = 3;
    const speedIncreaseAmount = 5;  // Reduced amount slightly (was 10)
    let currentGameSpeed = baseGameSpeed;
    let isGameActive = false;
    let ethersProvider = null;
    let signer = null;
    let userAddress = null;
    // REMOVED: scoreToSign
    let currentUserTokenBalance = null;
    let currentLeaderboardData = null;

    // --- Check Core Elements (Removed signScoreBtn) ---
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !food || !scoreDisplayContainer || !scoreSpan || !controlsContainer || !restartButton || !btnUp || !btnDown || !btnLeft || !btnRight || !tokenInfoSpan || !tokenBalanceSpan || !playabilityStatusDiv || !showLeaderboardBtn || !leaderboardDialog || !leaderboardList || !closeLeaderboardBtn || !connectWalletBtn || !walletStatusDiv || !walletSectionDiv || !claimPrizeBtn ) {
        console.error("CRITICAL: One or more required game elements are missing from the DOM!");
        document.body.innerHTML = "<h1>Error: Game initialization failed. Required elements not found.</h1>";
        return;
    }

    // --- Utility & Helper Functions ---
    function updateBalanceDisplay(displayValue) { /* ... no change ... */ }
    if (typeof ethers !== 'undefined') { /* ... no change ... */ } else { /* ... no change ... */ }

    // --- Function Definitions ---

    function checkPlayability() { /* ... no change ... */ }
    function clearSnakeBody() { /* ... no change ... */ }
    function drawSnake() { /* ... no change ... */ }
    function createFood() { /* ... no change ... */ }

    function moveSnake() { // Removed scoreToSign assignment
        if (!snake || snake.length === 0 || !gameArea) return;
        const head = { x: snake[0].x + dx, y: snake[0].y + dy };
        const hitLeftWall = head.x < 0;
        const hitRightWall = head.x >= gameArea.clientWidth;
        const hitTopWall = head.y < 0;
        const hitBottomWall = head.y >= gameArea.clientHeight;
        if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
            gameOver(); return;
        }
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver(); return;
            }
        }
        snake.unshift(head);
        const didEatFood = snake[0].x === foodX && snake[0].y === foodY;
        if (didEatFood) {
            score += 1;
            if(scoreSpan) scoreSpan.textContent = score;
            // scoreToSign = score; // REMOVED
            if (score > 0 && score % speedIncreaseInterval === 0) {
                currentGameSpeed = Math.max(minGameSpeed, currentGameSpeed - speedIncreaseAmount);
                if(gameLoopIntervalId) clearInterval(gameLoopIntervalId);
                gameLoopIntervalId = setInterval(gameLoop, currentGameSpeed);
            }
            createFood();
        } else {
            snake.pop();
        }
    }

    function gameOver() { // Removed call to updateSignButtonVisibility
        if (!isGameActive) return;
        isGameActive = false;
        if(gameLoopIntervalId) clearInterval(gameLoopIntervalId); gameLoopIntervalId = null;
        if (restartButton) restartButton.classList.remove('hidden');
        // --- Score Saving now happens if wallet is connected ---
        if (userAddress) { // Check if we have a wallet address instead of Netlify user
            saveScore(score);
        } else {
             console.log("Wallet not connected, score not saved."); // Log if no address
        }
        // updateSignButtonVisibility(); // REMOVED
    }

    function gameLoop() { /* ... no change ... */ }
    function handleDirectionChange(event) { /* ... no change ... */ }

    function startGame() { // Removed scoreToSign reset
        if (!checkPlayability()) { /* ... no change ... */ return; }
        isGameActive = true; score = 0;
        // scoreToSign = null; // REMOVED
        if(scoreSpan) scoreSpan.textContent = score;
        currentGameSpeed = baseGameSpeed; // Reset to new faster base speed
        snake = [ { x: segmentSize * 4, y: segmentSize }, { x: segmentSize * 3, y: segmentSize }, { x: segmentSize * 2, y: segmentSize } ];
        dx = segmentSize; dy = 0; changingDirection = false;
        if (gameLoopIntervalId) { clearInterval(gameLoopIntervalId); gameLoopIntervalId = null; }
        clearSnakeBody();
        if(rulesScreen) rulesScreen.classList.add('hidden');
        if (playabilityStatusDiv) playabilityStatusDiv.textContent = '';
        if(gameArea) gameArea.classList.remove('hidden');
        if(scoreDisplayContainer) scoreDisplayContainer.classList.remove('hidden');
        if(controlsContainer) controlsContainer.classList.remove('hidden');
        if(player) player.classList.remove('hidden');
        if(food) food.classList.remove('hidden');
        if (restartButton) restartButton.classList.add('hidden');
        // if (signScoreBtn) signScoreBtn.classList.add('hidden'); // signScoreBtn removed
        if (claimPrizeBtn) claimPrizeBtn.classList.add('hidden');
        drawSnake(); createFood();
        if(gameArea) gameArea.focus();
        gameLoopIntervalId = setInterval(gameLoop, currentGameSpeed);
    }

    // REMOVED: updateSignButtonVisibility function
    // REMOVED: signScoreVerification function

    async function saveScore(finalScore) { // No longer checks Netlify user
        // Removed Netlify user check
        if (!userAddress) { // Now only relies on userAddress
             console.error("Cannot save score: Wallet address not found (userAddress is null).");
             return;
        }
        try {
            // Removed Netlify token fetching (const token = await user.jwt();)
            const response = await fetch('/.netlify/functions/save-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // Removed Authorization header
                body: JSON.stringify({ score: finalScore, wallet_address: userAddress })
            });
            if (!response.ok) {
                 const result = await response.json().catch(() => ({}));
                console.error('Error saving score:', response.status, result.error || response.statusText);
            }
            // Removed success log/alert
        } catch (error) {
            console.error('Network or parsing error while saving score:', error);
        }
    }

    function checkClaimEligibility() { /* ... no change ... */ }
    async function handleClaimPrize() { /* ... no change ... */ }

    // --- Updated Leaderboard Display ---
    async function fetchAndDisplayLeaderboard() {
        if(!leaderboardList) { console.error("Leaderboard list element not found."); return; }
        leaderboardList.innerHTML = '<li>Loading...</li>';
        if (claimPrizeBtn) claimPrizeBtn.classList.add('hidden');

        if (leaderboardDialog && !leaderboardDialog.open) {
            leaderboardDialog.showModal();
        } else if (!leaderboardDialog) { console.error("Leaderboard dialog element not found!"); return; }

         try {
             const response = await fetch('/.netlify/functions/get-leaderboard'); // Fetches wallet_address now
             if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
                 throw new Error(`Leaderboard fetch failed: ${errorData.error || response.statusText}`);
             }
             const data = await response.json();
             currentLeaderboardData = data;

             leaderboardList.innerHTML = '';
             if (currentLeaderboardData && currentLeaderboardData.length > 0) {
                 currentLeaderboardData.forEach(entry => {
                     const li = document.createElement('li');
                     // --- Display Masked Wallet Address ---
                     const address = entry.wallet_address;
                     const maskedAddress = address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Anonymous';
                     li.textContent = `${maskedAddress}: ${entry.score}`;
                     // -------------------------------------
                     leaderboardList.appendChild(li);
                 });
             } else {
                 leaderboardList.innerHTML = '<li>Leaderboard is empty.</li>';
             }
             checkClaimEligibility();
         } catch (error) {
             console.error("Error fetching or displaying leaderboard:", error);
             if(leaderboardList) leaderboardList.innerHTML = `<li>Error loading leaderboard: ${error.message}</li>`;
             currentLeaderboardData = null;
             checkClaimEligibility();
         }
    }
    // ---------------------------------

    async function connectWallet() { // Removed calls to updateSignButtonVisibility
        if (typeof window.ethereum === 'undefined') { /* ... */ return; }
        if(walletStatusDiv) walletStatusDiv.textContent = 'Status: Connecting...';
        if (claimPrizeBtn) claimPrizeBtn.classList.add('hidden');
        try {
            ethersProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await ethersProvider.send("eth_requestAccounts", []);
            signer = ethersProvider.getSigner();
            userAddress = await signer.getAddress();
            const network = await ethersProvider.getNetwork();

            if (network.chainId !== PULSECHAIN_ID) {
                 if(walletStatusDiv) walletStatusDiv.innerHTML = `Status: Wrong Network...`; // Simplified
                 if(walletSectionDiv) walletSectionDiv.classList.add('connected');
                 currentUserTokenBalance = null; ethersProvider = null; signer = null; userAddress = null;
                 updateBalanceDisplay('--'); checkPlayability();
                 // updateSignButtonVisibility(); // REMOVED
                 checkClaimEligibility();
                 return;
            }
            // Network OK...
            const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
            currentUserTokenBalance = await tokenContract.balanceOf(userAddress);
            const balanceFormatted = ethers.utils.formatUnits(currentUserTokenBalance, TOKEN_DECIMALS);
            const displayBalance = parseFloat(balanceFormatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if(walletStatusDiv) walletStatusDiv.innerHTML = `Status: Connected (PulseChain)...`; // Simplified
            if(walletSectionDiv) walletSectionDiv.classList.add('connected');
            updateBalanceDisplay(displayBalance);
            checkPlayability();
            // updateSignButtonVisibility(); // REMOVED
            checkClaimEligibility();

             // Add listeners...
             if (ethersProvider) { /* ... */ }
             if (window.ethereum) { /* ... */ }
        } catch (error) {
            console.error("Wallet connection error:", error);
            if(walletStatusDiv) walletStatusDiv.textContent = `Status: Connection failed...`;
            ethersProvider = null; signer = null; userAddress = null; currentUserTokenBalance = null;
            if(walletSectionDiv) walletSectionDiv.classList.remove('connected');
            updateBalanceDisplay('--'); checkPlayability();
            // updateSignButtonVisibility(); // REMOVED
            checkClaimEligibility();
        }
    }

    // --- Event Listeners Setup ---
    // REMOVED: signScoreBtn listener
    // REMOVED: Netlify Identity listeners
    if(startButton) startButton.addEventListener('click', () => { /* ... */ });
    if(playButton) playButton.addEventListener('click', startGame);
    if (restartButton) restartButton.addEventListener('click', startGame);
    if(document) document.addEventListener('keydown', handleDirectionChange);
    if(btnUp) btnUp.addEventListener('click', handleDirectionChange);
    if(btnDown) btnDown.addEventListener('click', handleDirectionChange);
    if(btnLeft) btnLeft.addEventListener('click', handleDirectionChange);
    if(btnRight) btnRight.addEventListener('click', handleDirectionChange);
    if (showLeaderboardBtn) showLeaderboardBtn.addEventListener('click', fetchAndDisplayLeaderboard);
    if (closeLeaderboardBtn) closeLeaderboardBtn.addEventListener('click', () => { /* ... */ });
    if (leaderboardDialog) leaderboardDialog.addEventListener('click', (event) => { /* ... */ });
    if (connectWalletBtn) connectWalletBtn.addEventListener('click', connectWallet);
    if (claimPrizeBtn) { claimPrizeBtn.addEventListener('click', handleClaimPrize); }

    // Initial check on page load
    checkPlayability(); // Check if user can play (based on wallet connection status initially)

}); // <<< --- End of DOMContentLoaded listener --- >>>