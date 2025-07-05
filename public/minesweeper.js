const gameBoard = document.getElementById('gameBoard');
const resetButton = document.getElementById('resetButton');
const mineCountDisplay = document.getElementById('mineCount');
const timerDisplay = document.getElementById('timer');
const messageDisplay = document.getElementById('message');

const BOARD_SIZE = 10;
const NUM_MINES = 15;
let board = [];
let mines = [];
let revealedCells = 0;
let gameOver = false;
let timerInterval;
let seconds = 0;

function initGame() {
    board = [];
    mines = [];
    revealedCells = 0;
    gameOver = false;
    seconds = 0;
    messageDisplay.textContent = '';
    mineCountDisplay.textContent = `지뢰: ${NUM_MINES}`;
    timerDisplay.textContent = `시간: 0`;
    clearInterval(timerInterval);
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;

    createBoard();
    placeMines();
    calculateNumbers();
    startTimer();
}

function createBoard() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        board.push([]);
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleClick);
            cell.addEventListener('contextmenu', handleRightClick);
            gameBoard.appendChild(cell);
            board[i].push({ element: cell, isMine: false, isRevealed: false, isFlagged: false, value: 0 });
        }
    }
}

function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < NUM_MINES) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        if (!board[row][col].isMine) {
            board[row][col].isMine = true;
            mines.push({ row, col });
            minesPlaced++;
        }
    }
}

function calculateNumbers() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (!board[r][c].isMine) {
                let mineCount = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newRow = r + i;
                        const newCol = c + j;
                        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE && board[newRow][newCol].isMine) {
                            mineCount++;
                        }
                    }
                }
                board[r][c].value = mineCount;
            }
        }
    }
}

function handleClick(event) {
    if (gameOver) return;
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = board[row][col];

    if (cell.isRevealed || cell.isFlagged) return;

    if (cell.isMine) {
        revealMines();
        messageDisplay.textContent = '게임 오버! 졌습니다.';
        messageDisplay.style.color = 'red';
        gameOver = true;
        clearInterval(timerInterval);
    } else {
        revealCell(row, col);
        checkWin();
    }
}

function handleRightClick(event) {
    event.preventDefault();
    if (gameOver) return;
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = board[row][col];

    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    if (cell.isFlagged) {
        cell.element.classList.add('flagged');
        cell.element.textContent = '🚩';
    } else {
        cell.element.classList.remove('flagged');
        cell.element.textContent = '';
    }
    updateMineCountDisplay();
}

function revealCell(row, col) {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
    const cell = board[row][col];

    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    revealedCells++;

    if (cell.value > 0) {
        cell.element.textContent = cell.value;
        cell.element.classList.add(`number-${cell.value}`);
    } else {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealCell(row + i, col + j);
            }
        }
    }
}

function revealMines() {
    mines.forEach(mine => {
        const cell = board[mine.row][mine.col];
        cell.element.classList.add('mine');
        cell.element.textContent = '💣';
    });
}

function checkWin() {
    if (revealedCells === (BOARD_SIZE * BOARD_SIZE) - NUM_MINES) {
        messageDisplay.textContent = '축하합니다! 이겼습니다!';
        messageDisplay.style.color = 'green';
        gameOver = true;
        clearInterval(timerInterval);
        revealMines(); // Show mines even on win
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        timerDisplay.textContent = `시간: ${seconds}`;
    }, 1000);
}

function updateMineCountDisplay() {
    const flaggedMines = board.flat().filter(cell => cell.isFlagged).length;
    mineCountDisplay.textContent = `지뢰: ${NUM_MINES - flaggedMines}`;
}

resetButton.addEventListener('click', initGame);

initGame();
