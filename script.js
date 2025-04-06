// Corrected script.js (Fixes ArrowLeft/ArrowRight keys)
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
    // Add reference for sign score button
    const signScoreBtn = document.getElementById('sign-score-btn');


    // --- Game state variables ---
    let score = 0;
    let isGameActive = false;
    let playerX = 10;
    let playerY = 10;
    const speedFactor = 0.075;
    let scoreToSign = null; // Variable to hold score for signing

    // --- Wallet state variables ---
    let ethersProvider = null;
    let signer = null;
    let userAddress = null;


    // --- Check elements ---
    // Added signScoreBtn check
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !target ||
        !scoreDisplayContainer || !scoreSpan || !controlsContainer ||
        !btnUp || !btnDown || !btnLeft || !btnRight || !identityMenuPlaceholder ||
        !showLeaderboardBtn || !leaderboardDialog || !leaderboardList || !closeLeaderboardBtn ||
        !connectWalletBtn || !walletStatusDiv || !walletSectionDiv || !signScoreBtn ) {
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
            // console.log('User logged in, attempting to save score:', currentScore);
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
                    // console.log('Score saved successfully:', result);
                }
            } catch (error) {
                console.error('Network or other error calling save-score function:', error);
            }
        } else {
            // console.log('User not logged in, score not saved.');
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
            score++;
            scoreSpan.textContent = score;
            saveScore(score); // Call existing save function

            // Show Sign button if conditions met
            if (signer && netlifyIdentity.currentUser()) {
                scoreToSign = score;
                if (signScoreBtn) signScoreBtn.classList.remove('hidden');
            }

            moveTarget();
        }
    }

    // --- Handle Keyboard Input --- // <<< CORRECTED SECTION
    function handleKeyDown(event) {
        if (!isGameActive) return;
        // Corrected key names (no extra spaces)
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            // Corrected key names (no extra spaces)
            switch (event.key) {
                case "ArrowUp":    movePlayer('up');    break;
                case "ArrowDown":  movePlayer('down');  break;
                case "ArrowLeft":  movePlayer('left');  break; // Corrected case
                case "ArrowRight": movePlayer('right'); break; // Corrected case
            }
        }
    }
    // <<< END OF CORRECTION

    // --- Function to start the game ---
    function startGame() {
        isGameActive = true;
        score = 0; scoreSpan.textContent = score;
        playerX = 10; playerY = 10; updatePlayerPosition();
        rulesScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');
        scoreDisplayContainer.classList.remove('hidden');
        controlsContainer.classList.remove('hidden');
        // Hide sign score button when starting new game
        if(signScoreBtn) signScoreBtn.classList.add('hidden');
        scoreToSign = null;

        moveTarget();
        gameArea.focus();
    }

    // --- Function to Fetch and Display Leaderboard ---
    async function fetchAndDisplayLeaderboard() {
        leaderboardList.innerHTML = '<li>Loading...</li>';
        leaderboardDialog.showModal();
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

    // --- Wallet Connection Logic ---
    async function connectWallet() {
        if (typeof ethers === 'undefined') {
             console.error('Ethers.js not loaded!');
             walletStatusDiv.textContent = 'Error: Ethers library missing.';
             return;
        }
        if (typeof window.ethereum !== 'undefined') {
            console.log('MetaMask is available!');
            walletStatusDiv.textContent = 'Connecting... Please check wallet.';
            try {
                ethersProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
                await ethersProvider.send("eth_requestAccounts", []);
                signer = ethersProvider.getSigner();
                userAddress = await signer.getAddress();
                console.log('Wallet connected:', userAddress);
                const shortAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                walletStatusDiv.innerHTML = `Connected: <span title="${userAddress}">${shortAddress}</span>`;
                walletSectionDiv.classList.add('connected');
            } catch (error) {
                console.error('Error connecting wallet:', error);
                let errorMessage = 'Connection failed.';
                if (error.code === 4001) { errorMessage = 'Connection rejected by user.'; }
                else if (error.message) { errorMessage = error.message; }
                walletStatusDiv.textContent = `Error: ${errorMessage}`;
                ethersProvider = null; signer = null; userAddress = null;
                walletSectionDiv.classList.remove('connected');
            }
        } else {
            console.error('MetaMask (or compatible wallet) not found!');
            walletStatusDiv.textContent = 'Error: Wallet not found!';
            alert('Browser wallet not detected. Please install MetaMask or a similar wallet extension!');
        }
    }

    // --- Function to Sign Score Verification ---
    async function signScoreVerification() {
        const netlifyUser = netlifyIdentity.currentUser();
        if (!signer) { alert("Please connect your wallet first."); return; }
        if (!netlifyUser) { alert("Please log in to verify score."); return; }
        if (scoreToSign === null) { alert("No current score available to sign."); return; }

        const message = `Verify score: ${scoreToSign}\nUser: ${netlifyUser.email}\nWallet: ${userAddress}`;
        try {
            console.log("Requesting signature for message:", message);
            walletStatusDiv.textContent = 'Signing... Check Wallet';
            const signature = await signer.signMessage(message);
            console.log("--- Score Verification ---");
            console.log("Message Signed:", message);
            console.log("Signature:", signature);
            console.log("Signer Address:", userAddress);
            console.log("--------------------------");
            alert(`Score of ${scoreToSign} signed successfully!\nSignature logged to console.`);
            if (signScoreBtn) signScoreBtn.classList.add('hidden');
            scoreToSign = null;
            const shortAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
            walletStatusDiv.innerHTML = `Connected: <span title="${userAddress}">${shortAddress}</span>`;
            // FUTURE: Send signature to backend
        } catch (error) {
            console.error("Error signing message:", error);
            alert(`Signing failed: ${error.code === 4001 ? 'User rejected signature.' : error.message}`);
             if(userAddress){
                 const shortAddress = `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                 walletStatusDiv.innerHTML = `Connected: <span title="${userAddress}">${shortAddress}</span>`;
             } else {
                 walletStatusDiv.textContent = 'Status: Not Connected';
             }
        }
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
    // Leaderboard Button Listener
    showLeaderboardBtn.addEventListener('click', fetchAndDisplayLeaderboard);
    // Close Leaderboard Button Listener
    closeLeaderboardBtn.addEventListener('click', () => {
        leaderboardDialog.close();
    });
    // Optional: Close dialog if user clicks outside on the backdrop
    leaderboardDialog.addEventListener('click', (event) => {
       const rect = leaderboardDialog.getBoundingClientRect();
       const isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height
         && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
       if (!isInDialog) {
         leaderboardDialog.close();
       }
     });
    // Wallet Connect Button Listener
    if(connectWalletBtn) { connectWalletBtn.addEventListener('click', connectWallet); }
    else { console.error("Connect Wallet Button not found!"); }
    // Sign Score Button Listener
    if(signScoreBtn) { signScoreBtn.addEventListener('click', signScoreVerification); }
     else { console.error("Sign Score Button not found!"); }

}); // End of DOMContentLoaded listener