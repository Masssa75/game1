// script.js - Snake Game Step 1: Basic Movement
/* global ethers, netlifyIdentity */

document.addEventListener('DOMContentLoaded', () => {

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

    // --- Adjust player size to match segmentSize (Do this in CSS preferably!) ---
    // player.style.width = segmentSize + 'px';
    // player.style.height = segmentSize + 'px';
    // player.style.backgroundColor = 'green'; // Snake color?

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
            changingDirection = true; // Mark direction