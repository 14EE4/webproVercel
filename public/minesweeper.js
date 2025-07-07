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
let time = 0; // time is now in milliseconds

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
    timerElement.textContent = (0).toFixed(2); // Display with 2 decimal places
    revealedCells = 0;
    flaggedCells = 0;
    firstClick = true;
    gameOver = false;
    board = [];
    mines = [];
    clearInterval(timer);
    time = 0;
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
    if (gameOver || cell.isFlagged) return;

    if (cell.isRevealed) {
        handleChord(cell);
        return;
    }

    if (firstClick) {
        placeMines(cell);
        firstClick = false;
    }

    if (revealCell(cell)) {
        endGame(false);
    }
}

function handleChord(cell) {
    if (!cell.isRevealed || cell.adjacentMines === 0) return;

    const { rows, cols } = difficulties[currentDifficulty];
    let flaggedCount = 0;
    const adjacentCellsToReveal = [];

    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            if (r === 0 && c === 0) continue;
            const newRow = cell.row + r;
            const newCol = cell.col + c;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                const adjacentCell = board[newRow][newCol];
                if (adjacentCell.isFlagged) {
                    flaggedCount++;
                } else if (!adjacentCell.isRevealed) {
                    adjacentCellsToReveal.push(adjacentCell);
                }
            }
        }
    }

    if (flaggedCount === cell.adjacentMines) {
        let mineHit = false;
        adjacentCellsToReveal.forEach(adjCell => {
            if (revealCell(adjCell)) {
                mineHit = true;
            }
        });

        if (mineHit) {
            endGame(false);
        }
    }
}

function revealCell(cell) {
    if (cell.isRevealed || cell.isFlagged) return false;

    const { rows, cols } = difficulties[currentDifficulty];
    cell.isRevealed = true;
    cell.element.classList.add('revealed');
    revealedCells++;

    if (cell.isMine) {
        cell.element.classList.add('mine');
        cell.element.innerHTML = '💣';
        return true; // Mine hit
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
    return false; // No mine hit
}

function toggleFlag(cell) {
    if (gameOver || cell.isRevealed) return;

    const { mines: minesCount } = difficulties[currentDifficulty];
    cell.isFlagged = !cell.isFlagged;
    if (cell.isFlagged) {
        cell.element.classList.add('flagged');
        flaggedCells++;
        if (navigator.vibrate) {
            navigator.vibrate(100); // Vibrate for 100ms
        }
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
        handleWin();
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

async function handleWin() {
    try {
        // 1. 현재 난이도의 최고 기록을 가져옵니다.
        const response = await fetch(`/api/high-scores?difficulty=${currentDifficulty}`);
        const existingHighScores = await response.json();
        // bestScore는 이제 항상 밀리초 단위로 옵니다.
        const currentBestScore = existingHighScores.length > 0 ? existingHighScores[0].score : null;

        let isNewHighScore = false;
        // time (현재 기록)도 밀리초 단위이므로 직접 비교합니다.
        if (currentBestScore === null || time < currentBestScore) {
            isNewHighScore = true;
        }

        if (isNewHighScore) {
            const name = prompt(`New high score for ${currentDifficulty} difficulty! Enter your name:`);
            if (!name) return; // If user cancels, do nothing

            const canvas = await html2canvas(boardElement);
            const imageData = canvas.toDataURL('image/png');

            // 2. high_scores 테이블에 새로운 기록을 저장합니다.
            await fetch('/api/high-scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, difficulty: currentDifficulty, score: time, imageData }),
            });

            alert(`Congratulations, ${name}! You set a new record of ${(time / 1000).toFixed(2)} seconds on ${currentDifficulty} difficulty!`);
            
            // 3. 스레드에 축하 글을 올립니다.
            await postToThreads(name, currentDifficulty, (time / 1000).toFixed(2), imageData);

        } else {
            // currentBestScore는 이미 밀리초 단위이므로 1000으로 나눕니다.
            alert(`Good game! Your time was ${(time / 1000).toFixed(2)} seconds. The current best is ${(currentBestScore / 1000).toFixed(2)} seconds.`);
        }

    } catch (error) {
        console.error('Error handling win:', error);
        alert('An error occurred while processing your score.');
    }
}

async function postToThreads(name, difficulty, score, image) {
    try {
        const title = `New High Score in Minesweeper!`;
        const content = `${name} set a new record of ${score} seconds on ${difficulty} difficulty!`;

        const response = await fetch('/api/threads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, title, content, image }),
        });

        if (response.ok) {
            alert('Your new high score has been posted to the threads!');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to post to threads');
        }
    } catch (error) {
        console.error('Error posting to threads:', error);
        alert(`Failed to post to threads: ${error.message}`);
    }
}

function startTimer() {
    timer = setInterval(() => {
        time += 10; // Increment by 10 milliseconds
        timerElement.textContent = (time / 1000).toFixed(2); // Display seconds with 2 decimal places
    }, 10); // Update every 10 milliseconds
}

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => setDifficulty(button.dataset.difficulty));
});

restartBtn.addEventListener('click', startGame);