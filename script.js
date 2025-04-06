// script.js - Updated for flexible Sign Score button display
/* global ethers, netlifyIdentity */

document.addEventListener('DOMContentLoaded', () => {

    // --- Get references to elements ---
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
    const identityMenuPlaceholder = document.querySelector('[data-netlify-identity-menu]');
    const showLeaderboardBtn = document.getElementById('show-leaderboard-btn');
    const leaderboardDialog = document.getElementById('leaderboard-dialog');
    const leaderboardList = document.getElementById('leaderboard-list');
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const walletStatusDiv = document.getElementById('wallet-status');
    const walletSectionDiv = document.getElementById('wallet-section');
    const signScoreBtn = document.getElementById('sign-score-btn');


    // --- Game state variables ---
    let score = 0;
    let isGameActive = false;
    let playerX = 10;
    let playerY = 10;
    const speedFactor = 0.075;
    let scoreToSign = null; // Keep track of the latest score in the session

    // --- Wallet state variables ---
    let ethersProvider = null;
    let signer = null;
    let userAddress = null;


    // --- Check elements ---
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !target ||
        !scoreDisplayContainer || !scoreSpan || !controlsContainer ||
        !btnUp || !btnDown || !btnLeft || !btnRight || !identityMenuPlaceholder ||
        !showLeaderboardBtn || !leaderboardDialog || !leaderboardList || !closeLeaderboardBtn ||
        !connectWalletBtn || !walletStatusDiv || !walletSectionDiv || !signScoreBtn ) {
        console.error("One or more required game elements are missing!");
        document.body.innerHTML = "<h1>Error loading game elements. Please check HTML structure/IDs.</h1>";
        return;
    }

    // --- NEW: Function to update Sign Score Button Visibility ---
    function updateSignButtonVisibility() {
        const user = netlifyIdentity.currentUser();
        // Show button only if logged in, wallet connected, and score > 0
        if (user && signer && score > 0) {
            scoreToSign = score; // Update score to be signed
             if (signScoreBtn) signScoreBtn.classList.remove('hidden');
        } else {
             if (signScoreBtn) signScoreBtn.classList.add('hidden');
             scoreToSign = null; // Reset if conditions aren't met
        }
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
            try {
                const token = await user.jwt();
                const response = await fetch('/.netlify/functions/save-score', {
                    method: 'POST', headers: {'Content-Type': 'application/json','Authorization': `Bearer ${token}`,},
                    body: JSON.stringify({ score: currentScore }),
                });
                if (!response.ok) { const errorData = await response.json(); console.error(`Error saving score (${response.status}):`, errorData.error || 'Unknown error'); }
                else { /* const result = await response.json(); console.log('Score saved successfully:', result); */ }
            } catch (error) { console.error('Network or other error calling save-score function:', error); }
        } else { /* console.log('User not logged in, score not saved.'); */ }
    }

    // --- Movement Logic ---
    function movePlayer(direction) {
        if (!isGameActive) return;
        const gameAreaWidth = gameArea.offsetWidth; const gameAreaHeight = gameArea.offsetHeight;
        const moveX = Math.max(1, gameAreaWidth * speedFactor); const moveY = Math.max(1, gameAreaHeight * speedFactor);
        let newX = playerX; let newY = playerY;
        switch (direction) {
            case "up":    newY -= moveY; break; case "down":  newY += moveY; break;
            case "left":  newX -= moveX; break; case "right": newX += moveX; break;
        }
        const playerWidth = player.offsetWidth; const playerHeight = player.offsetHeight;
        playerX = Math.max(0, Math.min(newX, gameAreaWidth - playerWidth));
        playerY = Math.max(0, Math.min(newY, gameAreaHeight - playerHeight));
        updatePlayerPosition();
        if (checkCollision()) {
            score++;
            scoreSpan.textContent = score;
            saveScore(score); // Save score attempt
            updateSignButtonVisibility(); // << Check if sign button should show AFTER scoring
            moveTarget();
        }
    }

    // --- Handle Keyboard Input ---
    function handleKeyDown(event) {
        if (!isGameActive) return;
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            switch (event.key) {
                case "ArrowUp":    movePlayer('up');    break; case "ArrowDown":  movePlayer('down');  break;
                case "ArrowLeft":  movePlayer('left');  break; case "ArrowRight": movePlayer('right'); break;
            }
        }
    }

    // --- Function to start the game ---
    function startGame() {
        isGameActive = true;
        score = 0; scoreSpan.textContent = score;
        playerX = 10; playerY = 10; updatePlayerPosition();
        rulesScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');
        scoreDisplayContainer.classList.remove('hidden');
        controlsContainer.classList.remove('hidden');
        scoreToSign = null; // Reset score to sign
        updateSignButtonVisibility(); // Ensure button is hidden at start
        moveTarget();
        gameArea.focus();
    }

    // --- Function to Fetch and Display Leaderboard ---
    async function fetchAndDisplayLeaderboard() { /* ... same code as before ... */ }

    // --- Wallet Connection Logic ---
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
                const shortAddress = `<span class="math-inline">\{userAddress\.substring\(0, 6\)\}\.\.\.</span>{userAddress.substring(userAddress.length - 4)}`;
                walletStatusDiv.innerHTML = `Connected: <span title="<span class="math-inline">\{userAddress\}"\></span>{shortAddress}</span>`;
                walletSectionDiv.classList.add('connected');
                updateSignButtonVisibility(); // << Check if sign button should show AFTER connecting wallet
            } catch (error) {
                console.error('Error connecting wallet:', error); let errorMessage = 'Connection failed.';
                if (error.code === 4001) { errorMessage = 'Connection rejected by user.'; } else if (error.message) { errorMessage = error.message; }
                walletStatusDiv.textContent = `Error: ${errorMessage}`;
                ethersProvider = null; signer = null; userAddress = null;
                walletSectionDiv.classList.remove('connected');
                updateSignButtonVisibility(); // Ensure button is hidden if connect fails
            }
        } else {
            console.error('MetaMask (or compatible wallet) not found!'); walletStatusDiv.textContent = 'Error: Wallet not found!';
            alert('Browser wallet not detected. Please install MetaMask or a similar wallet extension!');
        }
    }

    // --- Function to Sign Score Verification ---
    async function signScoreVerification() { /* ... same code as before ... */ }


    // --- Event Listeners ---
    startButton.addEventListener('click', () => { startButton.classList.add('hidden'); rulesScreen.classList.remove('hidden'); playButton.focus(); });
    playButton.addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyDown);
    btnUp.addEventListener('click', () => movePlayer('up')); btnDown.addEventListener('click', () => movePlayer('down'));
    btnLeft.addEventListener('click', () => movePlayer('left')); btnRight.addEventListener('click', () => movePlayer('right'));
    showLeaderboardBtn.addEventListener('click', fetchAndDisplayLeaderboard);
    closeLeaderboardBtn.addEventListener('click', () => { leaderboardDialog.close(); });
    leaderboardDialog.addEventListener('click', (event) => { const rect = leaderboardDialog.getBoundingClientRect(); const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width); if (!isInDialog) { leaderboardDialog.close(); } });
    if(connectWalletBtn) { connectWalletBtn.addEventListener('click', connectWallet); } else { console.error("Connect Wallet Button not found!"); }
    if(signScoreBtn) { signScoreBtn.addEventListener('click', signScoreVerification); } else { console.error("Sign Score Button not found!"); }

    // --- Netlify Identity Event Listeners (for Sign Button update) ---
    netlifyIdentity.on('login', user => {
        console.log('Netlify login event');
        updateSignButtonVisibility(); // Check visibility on login
    });
    netlifyIdentity.on('logout', () => {
        console.log('Netlify logout event');
        updateSignButtonVisibility(); // Check visibility on logout
    });
     netlifyIdentity.on('init', user => {
         console.log('Netlify init event');
         // Optional: update UI based on initial login state if needed elsewhere
         // updateSignButtonVisibility(); // Might not be needed if score is 0 initially
     });


}); // End of DOMContentLoaded listener