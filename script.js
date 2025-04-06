// script.js - Snake Game (Corrected Scope Issues, Updated saveScore)
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
    const identityMenuPlaceholder = document.querySelector('[data-netlify-identity-menu]');
    const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
    const leaderboardDialog = document.getElementById('leaderboard-dialog');
    const leaderboardList = document.getElementById('leaderboard-list');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const walletStatusDiv = document.getElementById('wallet-status');
    const walletSectionDiv = document.getElementById('wallet-section');
    const signScoreBtn = document.getElementById('sign-score-btn');
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
    } else {
       console.error("Could not find rulesScreen parent to insert playability status.");
    }

    // --- Constants and State Variables ---
    const TOKEN_CONTRACT_ADDRESS = "0x3Aa2BAbD88056a6bA995056B6e139C42411b068E";
    const TOKEN_ABI = [ /* FULL ABI */ {"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"address","name":"_pulseXRouter","type":"address"},{"internalType":"address","name":"_forgeAddress","type":"address"},{"internalType":"address","name":"_founderTaxAddress","type":"address"},{"internalType":"address","name":"_forgeTaxAddress","type":"address"},{"internalType":"address","name":"_communityDistributionWallet","type":"address"},{"internalType":"uint256","name":"_founderTaxRate","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[],"name":"ReentrancyGuardReentrantCall","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFounderTaxRate","type":"uint256"}],"name":"FounderTaxRateUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRouter","type":"address"}],"name":"RouterUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"},{"indexed":false,"internalType":"string","name":"walletType","type":"string"}],"name":"TaxAddressUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"bool","name":"isSenderExempt","type":"bool"},{"indexed":false,"internalType":"bool","name":"isRecipientExempt","type":"bool"},{"indexed":false,"internalType":"uint256","name":"founderTaxAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"forgeTaxAmount","type":"uint256"}],"name":"TaxCalculation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"bool","name":"exempt","type":"bool"}],"name":"TaxExemptionUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"communityDistributionWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"forgeAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"forgeTaxAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"founderTaxAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"founderTaxRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"isTaxExempt","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pulseXRouter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"exempt","type":"bool"}],"name":"setTaxExemption","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newForgeTaxAddress","type":"address"}],"name":"updateForgeTaxAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newFounderTaxAddress","type":"address"}],"name":"updateFounderTaxAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFounderTaxRate","type":"uint256"}],"name":"updateFounderTaxRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRouter","type":"address"}],"name":"updatePulseXRouter","outputs":[],"stateMutability":"nonpayable","type":"function"} ];
    const TOKEN_DECIMALS = 18;
    const REQUIRED_TOKENS = 10000;
    const PULSECHAIN_ID = 369;
    let REQUIRED_BALANCE_WEI = null;
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
    let ethersProvider = null;
    let signer = null;
    let userAddress = null;
    let scoreToSign = null;
    let currentUserTokenBalance = null;

    // --- Check Core Elements ---
    // (Check remains the same)
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !food || !scoreDisplayContainer || !scoreSpan || !controlsContainer || !restartButton || !btnUp || !btnDown || !btnLeft || !btnRight || !tokenInfoSpan || !tokenBalanceSpan || !playabilityStatusDiv || !showLeaderboardBtn || !leaderboardDialog || !leaderboardList || !closeLeaderboardBtn || !connectWalletBtn || !walletStatusDiv || !walletSectionDiv || !signScoreBtn) {
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

    // Calculate REQUIRED_BALANCE_WEI
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

    // --- All functions defined within this scope ---

    function checkPlayability() {
        let canPlay = false;
        let message = "";
        if (!REQUIRED_BALANCE_WEI) {
             message = "Error: Token configuration failed.";
             console.error("Cannot check playability: REQUIRED_BALANCE_WEI not calculated.");
        } else if (!signer) { // Check if signer is set (implies wallet connected and correct network)
            message = "Connect wallet with PulseChain network to check token balance.";
        } else if (currentUserTokenBalance === null) {
             // This might happen briefly during connection or if balance fetch failed
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
        if (!snake || snake.length === 0) return; // Safety check
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
            score += 1; scoreSpan.textContent = score; scoreToSign = score;
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
        if (!isGameActive) return;
        isGameActive = false;
        clearInterval(gameLoopIntervalId); gameLoopIntervalId = null;
        if (restartButton) restartButton.classList.remove('hidden');
        const currentUser = netlifyIdentity.currentUser();
        if (currentUser) {
            saveScore(score); // Call saveScore directly
        }
        updateSignButtonVisibility(); // Call updateSignButtonVisibility directly
    }

    function gameLoop() {
        if (!isGameActive) return;
        changingDirection = false;
        moveSnake(); // Call moveSnake directly
        if (isGameActive) { // Check again as moveSnake might call gameOver
            drawSnake(); // Call drawSnake directly
        }
    }

    function handleDirectionChange(event) {
        if (changingDirection) return;
        const keyPressed = event.key;
        const buttonId = event.target?.id;
        const goingUp = dy === -segmentSize;
        const goingDown = dy === segmentSize;
        const goingLeft = dx === -segmentSize;
        const goingRight = dx === segmentSize;
        let newDx = dx; let newDy = dy;
        if ((keyPressed === 'ArrowUp' || buttonId === 'btn-up') && !goingDown) {
            newDx = 0; newDy = -segmentSize;
        } else if ((keyPressed === 'ArrowDown' || buttonId === 'btn-down') && !goingUp) {
            newDx = 0; newDy = segmentSize;
        } else if ((keyPressed === 'ArrowLeft' || buttonId === 'btn-left') && !goingRight) {
            newDx = -segmentSize; newDy = 0;
        } else if ((keyPressed === 'ArrowRight' || buttonId === 'btn-right') && !goingLeft) {
            newDx = segmentSize; newDy = 0;
        } else { return; }
        if (dx !== newDx || dy !== newDy) {
             dx = newDx; dy = newDy; changingDirection = true;
        }
    }

    function startGame() {
        if (!checkPlayability()) { // Call checkPlayability directly
            if (playabilityStatusDiv){ // Check if div exists before using
                 playabilityStatusDiv.textContent = "Cannot start game. Check wallet connection and token balance.";
                 playabilityStatusDiv.style.color = 'red';
            }
            return;
        }
        isGameActive = true; score = 0; scoreToSign = null; scoreSpan.textContent = score; currentGameSpeed = baseGameSpeed;
        snake = [ { x: segmentSize * 4, y: segmentSize }, { x: segmentSize * 3, y: segmentSize }, { x: segmentSize * 2, y: segmentSize } ];
        dx = segmentSize; dy = 0; changingDirection = false;
        if (gameLoopIntervalId) { clearInterval(gameLoopIntervalId); gameLoopIntervalId = null; }
        clearSnakeBody(); // Call clearSnakeBody directly
        rulesScreen.classList.add('hidden');
        if (playabilityStatusDiv) playabilityStatusDiv.textContent = ''; // Clear status
        gameArea.classList.remove('hidden'); scoreDisplayContainer.classList.remove('hidden'); controlsContainer.classList.remove('hidden');
        player.classList.remove('hidden'); food.classList.remove('hidden');
        if (restartButton) restartButton.classList.add('hidden');
        if (signScoreBtn) signScoreBtn.classList.add('hidden'); // Check if exists
        drawSnake(); createFood(); // Call directly
        gameArea.focus();
        gameLoopIntervalId = setInterval(gameLoop, currentGameSpeed); // Call gameLoop directly
    }

    function updateSignButtonVisibility() {
        const user = netlifyIdentity.currentUser();
        // Use state variables directly (signer, scoreToSign, isGameActive)
        const canSign = user && signer && scoreToSign !== null && scoreToSign > 0 && !isGameActive;
        if (signScoreBtn) {
            signScoreBtn.classList.toggle('hidden', !canSign);
             if (canSign) { signScoreBtn.textContent = `Sign Last Score (${scoreToSign})`; }
        } else {
            // This case should have been caught by the initial element check
            // console.error("Sign Score button not found (in updateSignButtonVisibility).");
        }
    }

    async function saveScore(finalScore) {
        const user = netlifyIdentity.currentUser();
        if (!user) { return; }
        if (!userAddress) { // Use userAddress directly
             console.error("Cannot save score: Wallet address not found (userAddress is null).");
             return;
        }
        try {
            const token = await user.jwt();
            const response = await fetch('/.netlify/functions/save-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ score: finalScore, wallet_address: userAddress }) // Use userAddress directly
            });
            const result = await response.json();
            if (!response.ok) {
                console.error('Error saving score:', response.status, result.error || response.statusText);
            }
        } catch (error) {
            console.error('Network or parsing error while saving score:', error);
        }
    }

    async function fetchAndDisplayLeaderboard() {
        if(!leaderboardList) { console.error("Leaderboard list element not found."); return; } // Add check
        leaderboardList.innerHTML = '<li>Loading...</li>';
        if (leaderboardDialog && !leaderboardDialog.open) {
            leaderboardDialog.showModal();
        } else if (!leaderboardDialog) {
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
             leaderboardList.innerHTML = ''; // Clear loading
             if (leaderboardData && leaderboardData.length > 0) {
                 leaderboardData.forEach(entry => {
                     const li = document.createElement('li');
                     const email = entry.user_email;
                     const maskedEmail = email ? `${email.substring(0, Math.min(3, email.indexOf('@')))}***@${email.split('@')[1] || 'domain.com'}` : 'Anonymous';
                     li.textContent = `${maskedEmail}: ${entry.score}`;
                     leaderboardList.appendChild(li);
                 });
             } else {
                 leaderboardList.innerHTML = '<li>Leaderboard is empty.</li>';
             }
         } catch (error) {
             console.error("Error fetching or displaying leaderboard:", error);
             if(leaderboardList) leaderboardList.innerHTML = `<li>Error loading leaderboard: ${error.message}</li>`;
         }
    }

    async function connectWallet() {
        if (typeof window.ethereum === 'undefined') {
            if(walletStatusDiv) walletStatusDiv.textContent = 'Status: MetaMask not detected!';
            return;
        }
        if(walletStatusDiv) walletStatusDiv.textContent = 'Status: Connecting...';
        try {
            // Use state variables directly (ethersProvider, signer, userAddress, etc.)
            ethersProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await ethersProvider.send("eth_requestAccounts", []);
            signer = ethersProvider.getSigner();
            userAddress = await signer.getAddress();
            const network = await ethersProvider.getNetwork();
            if (network.chainId !== PULSECHAIN_ID) {
                 if(walletStatusDiv) walletStatusDiv.innerHTML = `Status: Wrong Network! Please switch to PulseChain (ID: ${PULSECHAIN_ID}).<br/>Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                 if(walletSectionDiv) walletSectionDiv.classList.add('connected');
                 // Reset state for incorrect network
                 currentUserTokenBalance = null; ethersProvider = null; signer = null;
                 updateBalanceDisplay('--'); checkPlayability(); updateSignButtonVisibility();
                 return;
            }
            const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer);
            currentUserTokenBalance = await tokenContract.balanceOf(userAddress);
            const balanceFormatted = ethers.utils.formatUnits(currentUserTokenBalance, TOKEN_DECIMALS);
            const displayBalance = parseFloat(balanceFormatted).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if(walletStatusDiv) walletStatusDiv.innerHTML = `Status: Connected (PulseChain)<br/>Address: ${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
            if(walletSectionDiv) walletSectionDiv.classList.add('connected');
            updateBalanceDisplay(displayBalance);
            checkPlayability();
            updateSignButtonVisibility();
             // Add listeners if provider exists
             if (ethersProvider) {
                 ethersProvider.on("network", (newNetwork, oldNetwork) => { if (oldNetwork) { window.location.reload(); } });
             }
             if (window.ethereum) { // Check ethereum exists before adding listener
                 window.ethereum.on('accountsChanged', (accounts) => { window.location.reload(); });
             }
        } catch (error) {
            console.error("Wallet connection error:", error);
            if(walletStatusDiv) walletStatusDiv.textContent = `Status: Connection failed: ${error.message.substring(0, 50)}...`;
             // Reset state on error
            ethersProvider = null; signer = null; userAddress = null; currentUserTokenBalance = null;
            if(walletSectionDiv) walletSectionDiv.classList.remove('connected');
            updateBalanceDisplay('--');
            checkPlayability();
            updateSignButtonVisibility();
        }
    }

    async function signScoreVerification() {
        // Use state variables directly (signer, scoreToSign)
        if (!signer) { alert("Wallet not connected."); return; }
        if (scoreToSign === null || scoreToSign <= 0) { alert("No valid score to sign."); return; }
        const message = `Verifying my score in Snake Game: ${scoreToSign} points.`;
        try {
            const signature = await signer.signMessage(message);
            alert(`Score signed successfully!\nSignature: ${signature.substring(0, 10)}...${signature.substring(signature.length - 10)}\n\n(Note: This signature is for off-chain verification only)`);
        } catch (error) {
            console.error("Error signing message:", error);
            alert(`Failed to sign score: ${error.message}`);
        }
    }

    // --- Event Listeners Setup ---
    // Assign listeners directly using the function names defined above
    if(startButton) startButton.addEventListener('click', () => {
        startButton.classList.add('hidden');
        if(rulesScreen) rulesScreen.classList.remove('hidden');
        checkPlayability();
    });
    if(playButton) playButton.addEventListener('click', startGame);
    if (restartButton) restartButton.addEventListener('click', startGame);
    if(document) document.addEventListener('keydown', handleDirectionChange);
    if(btnUp) btnUp.addEventListener('click', handleDirectionChange);
    if(btnDown) btnDown.addEventListener('click', handleDirectionChange);
    if(btnLeft) btnLeft.addEventListener('click', handleDirectionChange);
    if(btnRight) btnRight.addEventListener('click', handleDirectionChange);
    if (showLeaderboardBtn) showLeaderboardBtn.addEventListener('click', fetchAndDisplayLeaderboard);
    if (closeLeaderboardBtn) closeLeaderboardBtn.addEventListener('click', () => {
        if (leaderboardDialog && leaderboardDialog.open) leaderboardDialog.close();
    });
    if (leaderboardDialog) leaderboardDialog.addEventListener('click', (event) => {
        if (event.target === leaderboardDialog) leaderboardDialog.close();
    });
    if (connectWalletBtn) connectWalletBtn.addEventListener('click', connectWallet);
    if (signScoreBtn) signScoreBtn.addEventListener('click', signScoreVerification);

    // Netlify Identity listeners
    if (window.netlifyIdentity) {
      // Initialize only once
      netlifyIdentity.on('init', user => {
        updateSignButtonVisibility();
        // Optional: Handle initial login state if needed
      });
      netlifyIdentity.on('login', user => {
        updateSignButtonVisibility();
      });
      netlifyIdentity.on('logout', () => {
        updateSignButtonVisibility();
      });
      // Deprecated redirect logic removed unless specifically needed
      // window.netlifyIdentity.on("init", user => {
      //   if (!user) {
      //     window.netlifyIdentity.on("login", () => { document.location.href = "/"; });
      //   }
      // });
    } else {
         console.warn("Netlify Identity widget not found during listener setup.");
    }

    // Initial check on page load
    checkPlayability();


}); // <<< --- End of DOMContentLoaded listener --- >>>