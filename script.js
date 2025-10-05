// Your JavaScript is unchanged and placed here
history.replaceState({ screen: "menu" }, "", "");

//function to create actual game board based on the difficulty
function placeMinesAndHints(board, rows, cols, mines) {
  // Place mines
  let placedMines = 0;
  let minesArray = [];
  while (placedMines < mines) {
    let randRow = Math.floor(Math.random() * rows);
    let randCol = Math.floor(Math.random() * cols);

    // Only place mine if cell is not already a mine
    if (board[randRow][randCol] !== -1) {
      board[randRow][randCol] = -1; // mark in array
      // Construct cell ID and add to minesArray
      let cellId = `cell_${randRow}_${randCol}`;
      minesArray.push(cellId);

      // Increment all 8 neighbors
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue; // skip the mine itself

          let newRow = randRow + i;
          let newCol = randCol + j;

          // Check bounds
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            if (board[newRow][newCol] !== -1) {
              board[newRow][newCol]++; // increment array
            }
          }
        }
      }

      placedMines++;
    }
  }
  //returns an arra ythat has the cell id of each mine
  return minesArray;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// Assuming minesArray contains all mine cell IDs
async function revealAllMinesRandomly(minesArray) {
  while (minesArray.length > 0) {
    // Pick a random index
    const randIndex = Math.floor(Math.random() * minesArray.length);
    const cellId = minesArray[randIndex];

    // Reveal the cell
    const cell = document.getElementById(cellId);
    if (cell && cell.classList.contains("type1")) {
      cell.textContent = "💣";
      cell.classList.remove("type1");
      cell.classList.add("type2");
    }

    

    // Remove the revealed mine from array
    minesArray.splice(randIndex, 1);
    // wait 100ms before next mine
    await sleep(100);
  }
}

function generateBoard(rows, cols, total_cells, mines, flags) {
  // Remove existing board if any
  let oldBoard = document.getElementById("game-board");
  if (oldBoard) oldBoard.remove();

  // Create the container
  let container = document.createElement("div");
  container.id = "game-board";
  container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  let board = [];
  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < cols; j++) {
      // Initialize matrix
      board[i][j] = 0;
      // Create cell element
      let cell = document.createElement("div");
      cell.id = `cell_${i}_${j}`;
      cell.classList.add("cell", "type1");
      container.appendChild(cell);
    }
  }

  document.body.appendChild(container);

  let minesArray = placeMinesAndHints(board, rows, cols, mines);

  function revealCell(cell, value) {
    if (!cell.classList.contains("type1")) return; // Don't re-reveal

    cell.classList.remove("type1");
    cell.classList.add("type2"); // revealed style
    if (value > 0) {
      cell.textContent = value; // show number
      // Add class for number color
      if (value === 1) cell.classList.add("num1");
      if (value === 2) cell.classList.add("num2");
      if (value === 3) cell.classList.add("num3");
      if (value === 4) cell.classList.add("num4");
      if (value === 5) cell.classList.add("num5");
      if (value === 6) cell.classList.add("num6");
      if (value === 7) cell.classList.add("num7");
      if (value === 8) cell.classList.add("num8");
    } else if (value === 0) {
      cell.textContent = ""; // empty for 0
    } else {
      cell.textContent = "💣";
      revealAllMinesRandomly(minesArray);
    }
  }

  async function floodFill(r, c) {
    // bounds check
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;

    let cell = document.getElementById(`cell_${r}_${c}`);
    if (!cell || !cell.classList.contains("type1")) return; // already revealed

    let value = board[r][c];
    revealCell(cell, value);

    if (value > 0) return; // stop recursion at numbered cells

    // value === 0 → recursively reveal all 8 neighbors
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (let [dr, dc] of directions) {
      await sleep(2);
      floodFill(r + dr, c + dc);
    }
  }

  container.addEventListener("click", function (e) {
    if (!e.target.classList.contains("cell")) return;
    let cell = e.target;
    if (cell.textContent === "🚩") return; // Don't click flagged cells

    let [_, i, j] = cell.id.split("_").map(Number);

    let cellValue = board[i][j];

    if (cellValue === 0) {
      floodFill(i, j);
    } else {
      revealCell(cell, cellValue);
    }
  });

  // Right-click listener for flagging cells
  container.addEventListener("contextmenu", function (e) {
    if (!e.target.classList.contains("cell")) return;

    e.preventDefault();

    let cell = e.target;

    if (cell.classList.contains("type2")) return;

    if (cell.textContent === "🚩") {
      cell.textContent = ""; // remove flag
    } else if (cell.textContent === "") {
      cell.textContent = "🚩"; // add flag
    }
  });
}

// to detect if user is on a small screen (like a phone)
function isMobile() {
  return window.innerWidth < 768; // adjust breakpoint if needed
}

//this function runs when any button is clicked for choosing the diffculty of the game
function playGame(difficulty) {
  let gameModesDiv = document.getElementById("game-modes-buttons-div");
  gameModesDiv.style.display = "none";
  history.pushState({ screen: "gameStarted" }, "", "");

  let rows = 0,
    cols = 0,
    mines = 0;

  if (isMobile()) {
    // smaller grids for mobile, but still challenging
    if (difficulty == "easy") {
      rows = 12;
      cols = 8;
      mines = 10;
    } else if (difficulty == "medium") {
      rows = 20;
      cols = 12;
      mines = 35;
    } else if (difficulty == "hard") {
      rows = 30;
      cols = 16;
      mines = 80;
    }
  } else {
    // standard PC sizes
    if (difficulty == "easy") {
      rows = 10;
      cols = 20;
      mines = 15;
    } else if (difficulty == "medium") {
      rows = 15;
      cols = 30;
      mines = 56;
    } else if (difficulty == "hard") {
      rows = 20;
      cols = 40;
      mines = 140;
    }
  }

  let total_cells = rows * cols;
  let flags = mines;
  generateBoard(rows, cols, total_cells, mines, flags);
}

//event.state gives the state after the pop
// handle back/forward
window.addEventListener("popstate", (event) => {
  // if we land on menu -> show buttons
  if (event.state && event.state.screen === "menu") {
    document.getElementById("game-modes-buttons-div").style.display = "flex";
    let oldBoard = document.getElementById("game-board");
    if (oldBoard) oldBoard.remove();
  }
  // if we land on gameStarted -> hide buttons
  else if (event.state && event.state.screen === "gameStarted") {
    document.getElementById("game-modes-buttons-div").style.display = "none";
  }
  // fallback (handles null or unexpected states)
  else {
    document.getElementById("game-modes-buttons-div").style.display = "flex";
  }
});
