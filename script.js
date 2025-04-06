document.addEventListener('DOMContentLoaded', () => {

    // --- Get references to elements ---
    const startButton = document.getElementById('start-button');
    const rulesScreen = document.getElementById('rules-screen');
    const playButton = document.getElementById('play-button');
    console.log('Debug: Getting playButton element:', playButton);
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
    // New Leaderboard elements
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
    // Updated check to include leaderboard elements
    if (!startButton || !rulesScreen || !playButton || !gameArea || !player || !target ||
        !scoreDisplayContainer || !scoreSpan || !controlsContainer ||
        !btnUp || !btnDown || !btnLeft || !btnRight || !identityMenuPlaceholder ||
        !showLeaderboardBtn || !leaderboardDiv || !leaderboardList ) { // Added leaderboard elements check
        console.error("One or more required game elements are missing!");
        document.body.innerHTML = "<h1>Error loading game elements. Please check HTML structure/IDs.</h1>";
        return;
    }

    // --- Function to move target ---
    function moveTarget() { /* ... same code as before ... */ }

    // --- Function to update player position ---
    function updatePlayerPosition() { /* ... same code as before ... */ }

    // --- Collision Detection ---
    function checkCollision() { /* ... same code as before ... */ }

    // --- Function to save score via Netlify Function ---
    async function saveScore(currentScore) { /* ... same code as before ... */ }

    // --- Movement Logic ---
    function movePlayer(direction) { /* ... same code as before, includes saveScore(score); call ... */ }

    // --- Handle Keyboard Input ---
    function handleKeyDown(event) { /* ... same code as before ... */ }

    // --- Function to start the game ---
    function startGame() {     console.log('Debug: startGame function CALLED!'); // /* ... same code as before ... */ }


    // --- NEW: Function to Fetch and Display Leaderboard ---
    async function fetchAndDisplayLeaderboard() {
        // Show loading state
        leaderboardList.innerHTML = '<li>Loading...</li>';
        leaderboardDiv.classList.remove('hidden'); // Show the leaderboard container

        try {
            const response = await fetch('/.netlify/functions/get-leaderboard');

            if (!response.ok) {
                const errorData = await response.json(); // Try to get error details
                throw new Error(`Failed to fetch leaderboard (${response.status}): ${errorData.error || 'Unknown error'}`);
            }

            const leaderboardData = await response.json();
            leaderboardList.innerHTML = ''; // Clear loading/previous entries

            if (Array.isArray(leaderboardData) && leaderboardData.length > 0) {
                leaderboardData.forEach((entry, index) => {
                    const listItem = document.createElement('li');
                    // Handle cases where email might be null (e.g., old scores)
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
    console.log('Debug: Added click listener to playButton.');
    document.addEventListener('keydown', handleKeyDown);

    // On-Screen Button Listeners
    btnUp.addEventListener('click', () => movePlayer('up'));
    btnDown.addEventListener('click', () => movePlayer('down'));
    btnLeft.addEventListener('click', () => movePlayer('left'));
    btnRight.addEventListener('click', () => movePlayer('right'));

    // NEW: Leaderboard Button Listener
    showLeaderboardBtn.addEventListener('click', fetchAndDisplayLeaderboard);


    // --- Netlify Identity Event Listeners ---
    // (We removed the ones that hid the start button earlier)
    // You could add listeners here later to display user status if desired

}); // End of DOMContentLoaded listener