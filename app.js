window.onload = (document.querySelector(".loading-screen").style.display="none")

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