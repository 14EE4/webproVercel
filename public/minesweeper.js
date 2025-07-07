document.addEventListener('DOMContentLoaded', () => setDifficulty('easy'));

const boardElement = document.getElementById('minesweeper-board');
const minesCountElement = document.getElementById('mines-count');
const timerElement = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const difficultyButtons = document.querySelectorAll('#difficulty-selector button');

const difficulties = {
    easy: { rows: 10, cols: 10, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 24, cols: 24, mines: 99 },
};

let currentDifficulty = 'easy';
let board = [];
let mines = [];
let revealedCells = 0;
let flaggedCells = 0;
let firstClick = true;
let gameOver = false;
let timer;

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    const { rows, cols } = difficulties[difficulty];
    document.documentElement.style.setProperty('--rows', rows);
    document.documentElement.style.setProperty('--cols', cols);
    startGame();
}

function startGame() {
    const { rows, cols, mines: minesCount } = difficulties[currentDifficulty];

    boardElement.innerHTML = '';
    minesCountElement.textContent = minesCount;
    timerElement.textContent = 0;
    revealedCells = 0;
    flaggedCells = 0;
    firstClick = true;
    gameOver = false;
    board = [];
    mines = [];
    clearInterval(timer);
    startTimer();

    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
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
    const { rows, cols, mines: minesCount } = difficulties[currentDifficulty];
    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        const cell = board[r][c];

        if (!cell.isMine && !(cell.row === clickedCell.row && cell.col === clickedCell.col)) {
            cell.isMine = true;
            mines.push(cell);
            minesPlaced++;
        }
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].isMine) {
                board[r][c].adjacentMines = countAdjacentMines(r, c);
            }
        }
    }
}

function countAdjacentMines(row, col) {
    const { rows, cols } = difficulties[currentDifficulty];
    let count = 0;
    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            if (r === 0 && c === 0) continue;
            const newRow = row + r;
            const newCol = col + c;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && board[newRow][newCol].isMine) {
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

    const { rows, cols } = difficulties[currentDifficulty];
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
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    revealCell(board[newRow][newCol]);
                }
            }
        }
    }

    checkWin();
}

function toggleFlag(cell) {
    if (gameOver || cell.isRevealed) return;

    const { mines: minesCount } = difficulties[currentDifficulty];
    cell.isFlagged = !cell.isFlagged;
    if (cell.isFlagged) {
        cell.element.classList.add('flagged');
        flaggedCells++;
    } else {
        cell.element.classList.remove('flagged');
        flaggedCells--;
    }
    minesCountElement.textContent = minesCount - flaggedCells;
}

function checkWin() {
    const { rows, cols, mines: minesCount } = difficulties[currentDifficulty];
    if (revealedCells === rows * cols - minesCount) {
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

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => setDifficulty(button.dataset.difficulty));
});

restartBtn.addEventListener('click', startGame);
