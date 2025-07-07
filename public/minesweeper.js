document.addEventListener('DOMContentLoaded', startGame);

const boardElement = document.getElementById('minesweeper-board');
const minesCountElement = document.getElementById('mines-count');
const timerElement = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');

const ROWS = 10;
const COLS = 10;
const MINES_COUNT = 10;

let board = [];
let mines = [];
let revealedCells = 0;
let flaggedCells = 0;
let firstClick = true;
let gameOver = false;
let timer;

function startGame() {
    boardElement.innerHTML = '';
    minesCountElement.textContent = MINES_COUNT;
    timerElement.textContent = 0;
    revealedCells = 0;
    flaggedCells = 0;
    firstClick = true;
    gameOver = false;
    board = [];
    mines = [];
    clearInterval(timer);
    startTimer();

    for (let r = 0; r < ROWS; r++) {
        const row = [];
        for (let c = 0; c < COLS; c++) {
            const cell = {
                element: document.createElement('div'),
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0,
                row: r,
                col: c,
            };
            cell.element.classList.add('cell');
            cell.element.addEventListener('click', () => handleCellClick(cell));
            cell.element.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(cell);
            });
            boardElement.appendChild(cell.element);
            row.push(cell);
        }
        board.push(row);
    }
}

function placeMines(clickedCell) {
    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        const cell = board[r][c];

        if (!cell.isMine && !(cell.row === clickedCell.row && cell.col === clickedCell.col)) {
            cell.isMine = true;
            mines.push(cell);
            minesPlaced++;
        }
    }

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (!board[r][c].isMine) {
                board[r][c].adjacentMines = countAdjacentMines(r, c);
            }
        }
    }
}

function countAdjacentMines(row, col) {
    let count = 0;
    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            if (r === 0 && c === 0) continue;
            const newRow = row + r;
            const newCol = col + c;
            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol].isMine) {
                count++;
            }
        }
    }
    return count;
}

function handleCellClick(cell) {
    if (gameOver || cell.isRevealed || cell.isFlagged) return;

    if (firstClick) {
        placeMines(cell);
        firstClick = false;
    }

    revealCell(cell);

    if (cell.isMine) {
        endGame(false);
    }
}

function revealCell(cell) {
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    revealedCells++;

    if (cell.isMine) {
        cell.element.classList.add('mine');
        cell.element.innerHTML = '💣';
        return;
    }

    if (cell.adjacentMines > 0) {
        cell.element.textContent = cell.adjacentMines;
        cell.element.setAttribute('data-mines', cell.adjacentMines);
    } else {
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (r === 0 && c === 0) continue;
                const newRow = cell.row + r;
                const newCol = cell.col + c;
                if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                    revealCell(board[newRow][newCol]);
                }
            }
        }
    }

    checkWin();
}

function toggleFlag(cell) {
    if (gameOver || cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    if (cell.isFlagged) {
        cell.element.classList.add('flagged');
        flaggedCells++;
    } else {
        cell.element.classList.remove('flagged');
        flaggedCells--;
    }
    minesCountElement.textContent = MINES_COUNT - flaggedCells;
}

function checkWin() {
    if (revealedCells === ROWS * COLS - MINES_COUNT) {
        endGame(true);
    }
}

function endGame(isWin) {
    gameOver = true;
    clearInterval(timer);

    if (isWin) {
        alert('You win!');
    } else {
        alert('Game over!');
        mines.forEach(mine => {
            if (!mine.isRevealed) {
                mine.element.classList.add('revealed', 'mine');
                mine.element.innerHTML = '💣';
            }
        });
    }
}

function startTimer() {
    let time = 0;
    timer = setInterval(() => {
        time++;
        timerElement.textContent = time;
    }, 1000);
}

restartBtn.addEventListener('click', startGame);