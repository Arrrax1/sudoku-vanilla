window.onload = (document.querySelector(".loading-screen").style.display = "none")

// Initiate WebPage
let container = document.querySelector(".container");
//Board
for (let row = 0; row < 9; row++) {
    let rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    for (let col = 0; col < 9; col++) {
        let input = document.createElement("input");
        input.classList.add("tile");
        input.id = row + "-" + col;
        input.type = "number"
        rowDiv.appendChild(input)
    }
    container.appendChild(rowDiv);
}

// Add behaviour and check Input Validation
document.querySelectorAll(".tile").forEach(node => node.addEventListener('input', (event) => {
    let lastValue = event.target.value;
    let newValue = lastValue % 10;


    event.target.value = "";  // had to reset this so that the tiles/board gets
    // filled without the new value to avoid confusion 
    // when checking isValid if value exists in board (probably need to do something better but whatever)
    let my_board = getBoard();

    //getting row and column
    let row = event.target.id.split("-")[0];
    let col = event.target.id.split("-")[1];

    // if repeated cell warn user 
    if (!isValidMove(my_board, row, col, newValue)) {
        event.target.classList.add('warning')

        Number.parseInt(document.querySelector("#errors").textContent++)
        // if it's a null value then ignore it
        if (newValue == "" || newValue == 0) {
            event.target.classList.remove('warning')
        }
    } else {
        event.target.classList.remove('warning')
    }

    // finally we set the value that was selected
    event.target.value = newValue;
    if (event.target.value == 0) {
        event.target.value = ""
    }
    my_board = getBoard();
    if (isSolved(my_board)) document.querySelector('.winner').style.display='grid'
}))


// USED API to get Sudoku Puzzle board, then solve it using backtracking algorithm
// Button Functionalities

// NEW
document.querySelector("#new").addEventListener('click', (event) => {
    Number.parseInt(document.querySelector("#errors").textContent = 0)
    // event.preventDefault();
    let difficulty = false
    document.querySelectorAll("input[type='radio']").forEach(node => {
        if (node.checked) difficulty = node.id
    })
    if (!difficulty) document.querySelector("input[type='radio']").checked = true, difficulty = "easy" //default difficulty
    document.querySelector(".loading-screen").style.display = "grid"
    fetch('https://sugoku.onrender.com/board?difficulty=' + difficulty, {


        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Add any other headers if required
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Request failed with status ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            // Process the response data
            // console.log(data);
            // let grid = data.newboard.grids[0].value
            let grid = data.board
            let flattened_grid = []
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    flattened_grid.push(grid[i][j])
                }
            }

            tiles = [...document.querySelectorAll(".tile")];
            tiles.forEach(tile => {
                let headValue = flattened_grid.shift()
                if (headValue == 0) {
                    tile.value = ''
                    tile.classList.remove('read-only-tile')
                    tile.readOnly = false
                } else {
                    tile.value = headValue
                    tile.classList.add('read-only-tile')
                    tile.readOnly = true
                }
            })
            document.querySelector(".loading-screen").style.display = "none"
        })
        .catch(error => {
            document.querySelector(".loading-screen").style.display = "none"
            // Handle any errors that occur during the request
            console.error('Error:', error);
        });

})

// RESET
document.querySelector("#reset").addEventListener('click', (event) => {
    document.querySelectorAll("input.tile").forEach(node => {
        if (!node.classList.contains("read-only-tile")) node.value = '', node.classList.remove('warning')
    })
})

// SOLVE
document.querySelector("#solve").addEventListener('click', (event) => {
    var puzzle = [];
    console.log(puzzle)
    let tiles = []
    tiles = [...document.querySelectorAll(".tile")];

    for (let i = 0; i < 9; i++) {
        let row = []
        for (let index = 0; index < 9; index++) {
            let tile = tiles.shift();
            tile.classList.contains('read-only-tile') ? row.push(Number.parseInt(tile.value)) : row.push(0)
        }
        puzzle.push(row)
    }

    let solved_grid = solveSudoku(puzzle)

    let flattened_puzzle = []
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            flattened_puzzle.push(solved_grid[i][j])
        }
    }
    // Fill the Board in the WebPage
    tiles = [...document.querySelectorAll(".tile")];
    tiles.forEach(tile => {
        tile.value = flattened_puzzle.shift()
    })
})



function isValidMove(board, row, col, num) {
    // if value 0 or null don't bother check
    if (num > 0 && num < 10) {
        // Check if the number already exists in the row
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num) {
                return false;
            }
        }

        // Check if the number already exists in the column
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) {
                return false;
            }
        }

        // Check if the number already exists in the 3x3 sub-grid
        const subGridRow = Math.floor(row / 3) * 3;
        const subGridCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[subGridRow + i][subGridCol + j] === num) {
                    return false;
                }
            }
        }

        return true; // The number is valid and can be placed in the cell
    } else {
        // the input is Null or 0 or not Valid so don't bother checking
        return true;
    }
}

// Function to solve the Sudoku puzzle using backtracking

// NGL mine didn't work all the time so I copied this one, faced multiple conflicts
function solveSudoku(board) {
    if (isSolved(board)) {
        return board;
    }

    const { row, col } = findEmptyCell(board);

    for (let num = 1; num <= 9; num++) {
        if (isValidMove(board, row, col, num)) {
            board[row][col] = num;

            const solvedBoard = solveSudoku(board);

            if (solvedBoard) {
                return solvedBoard;
            }

            board[row][col] = 0;
        }
    }

    return null;
}

function isSolved(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] == 0 || board[i][j] == '') {
                return false;
            }
        }
    }

    return true;
}

function findEmptyCell(board) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] == 0 || board[i][j] == '') {
                return { row: i, col: j };
            }
        }
    }

    return null;
}

function getBoard() {
    const my_board = [];
    let tiles = []
    tiles = [...document.querySelectorAll(".tile")];
    tiles = tiles.map(tile => tile.value)
    for (let index = 0; index < 9; index++) {
        let row = []
        for (let index = 0; index < 9; index++) {
            let tileValue = tiles.shift();
            if (tileValue > 0 && tileValue < 10) row.push(Number.parseInt(tileValue))
            else row.push(0)
        }
        my_board.push(row)
    }
    return my_board
}

//Navigate USING ARROW KEYS
let current_row_index = 0
let current_col_index = 0
// document.addEventListener('keydown', (event) => {
//     switch (event.key) {
//         case 'ArrowUp':
//             let prevValue = document.getElementById(current_row_index + '-' + current_col_index).value
//             // console.log(document.getElementById(current_row_index+'-'+current_col_index).focus())
//             console.log(document.getElementById(current_row_index + '-' + current_col_index).value)
//             console.log('prev ' + prevValue)
//             document.getElementById(current_row_index + '-' + current_col_index).setAttribute('value', prevValue)
//             break;
//         default:
//             break;
//     }
// })
document.querySelectorAll('.tile').forEach(input => {
    input.addEventListener('focus',()=>{
        current_row_index=input.id.split("-")[0]
        current_col_index=input.id.split("-")[1]
    })
    input.addEventListener("keydown", function (event) {
        switch (event.keyCode) {
            case 37:
                event.preventDefault();
                if (current_col_index>0) {
                    current_col_index--
                    document.getElementById(current_row_index + '-' + current_col_index).focus()
                }
                break;
            case 38:
                event.preventDefault();
                if (current_row_index>0) {
                    current_row_index--
                    document.getElementById(current_row_index + '-' + current_col_index).focus()
                }
                break;
            case 39:
                event.preventDefault();
                if (current_col_index<8) {
                    current_col_index++
                    document.getElementById(current_row_index + '-' + current_col_index).focus()
                }
                break;
            case 40:
                event.preventDefault();
                if (current_row_index<8) {
                    current_row_index++
                    document.getElementById(current_row_index + '-' + current_col_index).focus()
                }
                break;

            default:
                break;
        }
    });
})

document.querySelector('#close').addEventListener('click',()=>{
    document.querySelector('.winner').style.display='none'
})

// ADD Numbers Keypad at bottom
// ADD SCORE and Save it in LocalStorage
// ADD Highlight on Selected Column and Row
// ADD Winner Screen