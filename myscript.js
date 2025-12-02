// --- DOM-based Tic-Tac-Toe ---
const boardSize = 3;
let gameboard = [];

let currentPlayer = 'X';
let gameActive = true;
let difficulty = 'easy';
let lastMove = null;

function initBoard() {
    gameboard = [];
    for (let i = 0; i < boardSize; i++) {
        gameboard[i] = [null, null, null];
    }
}


function renderBoard(winningCells = []) {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.textContent = gameboard[i][j] ? gameboard[i][j] : '';
            if (winningCells.some(([x, y]) => x === i && y === j)) {
                cell.classList.add('winner');
            }
            if (gameboard[i][j]) {
                cell.classList.add('marked');
                if (gameboard[i][j] === 'X') cell.classList.add('x');
                if (gameboard[i][j] === 'O') cell.classList.add('o');
            }
            if (lastMove && lastMove[0] === i && lastMove[1] === j) {
                cell.classList.add('recent');
            }
            cell.addEventListener('click', onCellClick);
            boardDiv.appendChild(cell);
        }
    }
}


function setMessage(msg) {
    const el = document.getElementById('message');
    el.textContent = msg;
    el.classList.remove('msg-fade');
    // trigger reflow to restart animation
    void el.offsetWidth;
    el.classList.add('msg-fade');
}

function onCellClick(e) {
    if (!gameActive) return;
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    if (gameboard[row][col]) {
        e.target.classList.add('invalid');
        setTimeout(() => e.target.classList.remove('invalid'), 500);
        return;
    }
    // Player X move
    gameboard[row][col] = 'X';
    lastMove = [row, col];
    let win = getWinningCells('X');
    renderBoard(win);
    if (win.length) {
        setMessage('Player X wins!');
        triggerConfetti();
        gameActive = false;
        return;
    }
    if (checkTie()) {
        setMessage("It's a tie!");
        gameActive = false;
        return;
    }
    setMessage("Computer's turn...");
    gameActive = false;
    setTimeout(() => {
        computerMove();
    }, 500);
}



// Computer move dispatcher
function computerMove() {
    if (difficulty === 'easy') {
        computerMoveEasy();
    } else if (difficulty === 'hard') {
        computerMoveHard();
    } else {
        computerMoveImpossible();
    }
}

// Easy: random move
function computerMoveEasy() {
    let empty = [];
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (!gameboard[i][j]) empty.push([i, j]);
        }
    }
    if (empty.length === 0) return;
    const [i, j] = empty[Math.floor(Math.random() * empty.length)];
    gameboard[i][j] = 'O';
    lastMove = [i, j];
    let win = getWinningCells('O');
    renderBoard(win);
    if (win.length) {
        setMessage('Computer (O) wins!');
        triggerConfetti();
        gameActive = false;
        return;
    }
    if (checkTie()) {
        setMessage("It's a tie!");
        gameActive = false;
        return;
    }
    setMessage("Player X's turn");
    gameActive = true;
}

// Hard: block win or random
function computerMoveHard() {
    // Try to win
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (!gameboard[i][j]) {
                gameboard[i][j] = 'O';
                let win = getWinningCells('O');
                if (win.length) {
                    renderBoard(win);
                    setMessage('Computer (O) wins!');
                    gameActive = false;
                    return;
                }
                gameboard[i][j] = null;
            }
        }
    }
    // Block X
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (!gameboard[i][j]) {
                gameboard[i][j] = 'X';
                let win = getWinningCells('X');
                if (win.length) {
                    gameboard[i][j] = 'O';
                    lastMove = [i, j];
                    renderBoard();
                    setMessage("Player X's turn");
                    gameActive = true;
                    return;
                }
                gameboard[i][j] = null;
            }
        }
    }
    // Else random
    computerMoveEasy();
}

// Impossible: minimax
function computerMoveImpossible() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (!gameboard[i][j]) {
                    gameboard[i][j] = 'O';
                    lastMove = [i, j];
                let score = minimax(gameboard, 0, false);
                gameboard[i][j] = null;
                if (score > bestScore) {
                    bestScore = score;
                    move = { i, j };
                }
            }
        }
    }
    if (move) {
        gameboard[move.i][move.j] = 'O';
        lastMove = [move.i, move.j];
    }
    let win = getWinningCells('O');
    renderBoard(win);
    if (win.length) {
        setMessage('Computer (O) wins!');
        triggerConfetti();
        gameActive = false;
        return;
    }
    if (checkTie()) {
        setMessage("It's a tie!");
        gameActive = false;
        return;
    }
    setMessage("Player X's turn");
    gameActive = true;
}
// Returns array of [row, col] for winning cells, or []
function getWinningCells(player) {
    // Rows
    for (let i = 0; i < boardSize; i++) {
        if (gameboard[i][0] === player && gameboard[i][1] === player && gameboard[i][2] === player)
            return [[i,0],[i,1],[i,2]];
    }
    // Columns
    for (let j = 0; j < boardSize; j++) {
        if (gameboard[0][j] === player && gameboard[1][j] === player && gameboard[2][j] === player)
            return [[0,j],[1,j],[2,j]];
    }
    // Diagonals
    if (gameboard[0][0] === player && gameboard[1][1] === player && gameboard[2][2] === player)
        return [[0,0],[1,1],[2,2]];
    if (gameboard[0][2] === player && gameboard[1][1] === player && gameboard[2][0] === player)
        return [[0,2],[1,1],[2,0]];
    return [];
}

function minimax(board, depth, isMaximizing) {
    if (checkWin('O')) return 10 - depth;
    if (checkWin('X')) return depth - 10;
    if (checkTie()) return 0;
    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (!board[i][j]) {
                    board[i][j] = 'O';
                    best = Math.max(best, minimax(board, depth + 1, false));
                    board[i][j] = null;
                }
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (!board[i][j]) {
                    board[i][j] = 'X';
                    best = Math.min(best, minimax(board, depth + 1, true));
                    board[i][j] = null;
                }
            }
        }
        return best;
    }
}

function checkWin(player) {
    // Rows
    for (let i = 0; i < boardSize; i++) {
        if (gameboard[i][0] === player && gameboard[i][1] === player && gameboard[i][2] === player) return true;
    }
    // Columns
    for (let j = 0; j < boardSize; j++) {
        if (gameboard[0][j] === player && gameboard[1][j] === player && gameboard[2][j] === player) return true;
    }
    // Diagonals
    if (gameboard[0][0] === player && gameboard[1][1] === player && gameboard[2][2] === player) return true;
    if (gameboard[0][2] === player && gameboard[1][1] === player && gameboard[2][0] === player) return true;
    return false;
}

function checkTie() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (!gameboard[i][j]) return false;
        }
    }
    return true;
}

function restartGame() {
    initBoard();
    currentPlayer = 'X';
    gameActive = true;
    renderBoard();
    setMessage(`Player ${currentPlayer}'s turn`);
}

function setDifficulty(diff) {
    difficulty = diff;
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.diff === diff) btn.classList.add('selected');
    });
    restartGame();
}

window.onload = function() {
    initBoard();
    renderBoard();
    setMessage(`Player ${currentPlayer}'s turn`);
    document.getElementById('restart').onclick = restartGame;
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.onclick = () => setDifficulty(btn.dataset.diff);
    });
    setDifficulty('easy');
    // Theme toggle set up
    const stored = localStorage.getItem('ttt-theme') || 'dark';
    setTheme(stored);
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.onclick = () => setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark');
    }
    // Trigger entrance animation
    setTimeout(() => {
        document.getElementById('game-container').classList.add('entrance');
    }, 100);
};

function setTheme(theme) {
    if (!theme) theme = 'dark';
    document.body.dataset.theme = theme;
    localStorage.setItem('ttt-theme', theme);
    const tbtn = document.getElementById('theme-toggle');
    if (tbtn) {
        tbtn.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}

function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        container.appendChild(confetti);
    }
    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}
    
