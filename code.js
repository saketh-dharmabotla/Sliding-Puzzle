function manhattanPriority(puzzle, noOfMoves) {
    let m = 0;
    for(let i = 0; i < puzzle.length; i++) {
        m += Math.abs(getRow(puzzle[i]) - getRow(i + 1)) + Math.abs(getCol(puzzle[i]) - getCol(i + 1));
    }

    m += noOfMoves;

    return m;
}

function hammingPriority(puzzle, noOfMoves) {
    let h = 0;
    for(let i = 0; i < puzzle.length; i++) {
        if(puzzle[i] != i + 1) {
            h += 1;
        }
    }

    h += noOfMoves;

    return h;
}

class Node {
    constructor(puzzle, noOfMoves, way, emptyPos) {
        this.board = puzzle;
        this.moves = noOfMoves;
        this.manhattan = manhattanPriority(puzzle, noOfMoves);
        this.hamming = hammingPriority(puzzle, noOfMoves);
        this.empty = emptyPos;
        this.path = way;
    }

    getPath() {
        return this.path;
    }
}

class MinHeap {

    constructor (type) {
        this.heap = [null] 
        this.choice = type 
        this.size = 0;
    }

    getSize() {
        return this.size;
    }

    getMin () {
        return this.heap[1]
    }

    compare(node1, node2) {
        if(this.choice == 0) {return this.compMan(node1, node2);}
        
        return this.compHam(node1, node2);
    }

    compMan(node1, node2) {
        return node1.manhattan > node2.manhattan;
    }
    
    compHam(node1, node2) {
        return node1.hamming > node2.hamming;
    }

    insert (node) {

        this.heap.push(node)
        this.size++;

        if (this.heap.length > 1) {
            let current = this.heap.length - 1

            while (current > 1 && this.compare(this.heap[Math.floor(current/2)], this.heap[current])) {

                [this.heap[Math.floor(current/2)], this.heap[current]] = [this.heap[current], this.heap[Math.floor(current/2)]]
                current = Math.floor(current/2)
            }
        }
    }
    
    remove() {
        
        if(this.size >= 1) {this.size--;}
        
        let smallest = this.heap[1]

        if (this.heap.length > 2) {
            this.heap[1] = this.heap[this.heap.length-1]
            this.heap.splice(this.heap.length - 1)

            if (this.heap.length === 3) {
                if (this.compare(this.heap[1], this.heap[2])) {
                    [this.heap[1], this.heap[2]] = [this.heap[2], this.heap[1]]
                }
                return smallest
            }

            let current = 1
            let leftChildIndex = current * 2
            let rightChildIndex = current * 2 + 1

            while (this.heap[leftChildIndex] &&
                    this.heap[rightChildIndex] &&
                    (this.compare(this.heap[current], this.heap[leftChildIndex]) ||
                        this.compare(this.heap[current], this.heap[rightChildIndex]))) {
                if (this.compare(this.heap[rightChildIndex], this.heap[leftChildIndex])) {
                    [this.heap[current], this.heap[leftChildIndex]] = [this.heap[leftChildIndex], this.heap[current]]
                    current = leftChildIndex
                } else {
                    [this.heap[current], this.heap[rightChildIndex]] = [this.heap[rightChildIndex], this.heap[current]]
                    current = rightChildIndex
                }

                leftChildIndex = current * 2
                rightChildIndex = current * 2 + 1
            }
        }

        else if (this.heap.length === 2) {
            this.heap.splice(1, 1)
        } else {
            return null
        }

        return smallest
    }
}

let size = 3;

let initialState = [];
let currentState = [];
let empty = size*size;

let totalSolutionMoves = 0;
let totalUserMoves = 0;
let moveNumber = 0;

let solved = -1;

let gameWindow = document.querySelector("#game-window");
let puzzleContainer = document.getElementById("puzzle-container");
let buttonsContainer = document.getElementById("buttons-container");
let shuffleContainer = document.getElementById("shuffle-button-container");
let goToInitialContainer = document.getElementById("start-from-initial-state-button-container");
let setInitialContainer = document.getElementById("set-initial-state-button-container");
let showSolutionContainer = document.getElementById("show-the-solution-button-container");
let previousContainer = document.getElementById("show-the-previous-state-button-container");
let nextContainer = document.getElementById("show-the-next-state-button-container");

let shuffle = document.getElementById("shuffle-button");
let goToInitial = document.getElementById("start-from-initial-state-button");
let setInitial = document.getElementById("set-initial-state-button");
let showSolution = document.getElementById("show-the-solution-button");
let previous = document.getElementById("show-the-previous-state-button");
let next = document.getElementById("show-the-next-state-button");

let instructionsButton = document.getElementById("instructions-button");
let instructionsCloseButton = document.getElementById("instructions-close-button");
let instructionsWindow = document.getElementById("instructions-pop-up-window");

let playAgainButton = document.getElementById("play-again-button");
let viewSolutionButton = document.getElementById("view-the-solution-button");
let congratulationsCloseButton = document.getElementById("congratulations-close-button"); 
let congratulationsWindow = document.getElementById("congratulations-message-pop-up-window");

let neighbours = [];
let minHeap = new MinHeap(0);
let path = [];
let index = 0;

reset();
handleInput();

function getRow(pos) {
    return Math.ceil(pos/size) - 1;
}

function getCol(pos) {
    let col = pos % size;

    if(col == 0) {return size - 1;}

    return col - 1;
}

function isSolved() {
    
    for(let tile of currentState) {
        if(tile.value != tile.position) return 0;
    }

    return 2;
}

function display() {
    puzzleContainer.innerHTML = '';
    
    for(let tile of currentState) {

        if(tile.value == size*size) {
            continue;
        }

        puzzleContainer.innerHTML += `
        <div class = 'tiles', style = "top: ${tile.x*(480/size)}px; left: ${tile.y*(480/size)}px;"> 
        ${tile.value}
        </div>
        `;
    }

    //reset
    if(solved == -1) {
        ;
    }

    //unsolved 
    if(solved == -1 || solved == 0) {
        shuffleContainer.innerHTML = '';
        goToInitialContainer.innerHTML = '';
        setInitialContainer.innerHTML = '';
        showSolutionContainer.innerHTML = '';
        previousContainer.innerHTML = '';
        nextContainer.innerHTML = '';

        shuffleContainer.innerHTML += `
        <button class = "buttons" id = "shuffle-button">
            Shuffle the puzzle
        </button>
        `;

        goToInitialContainer.innerHTML += `
        <button class = "buttons" id = "start-from-initial-state-button">
            Start again from the initial state
        </button>
 
        `;
        
        setInitialContainer.innerHTML += `
        <button class = "buttons" id = "set-initial-state-button">
            Set the current state as the initial state
        </button>
        `;

        showSolutionContainer.innerHTML += `
        <button class = "buttons" id = "show-the-solution-button">
            Show the solution starting from the initial state
        </button>
        `;

        buttonsContainer.style.left = "70px";
        buttonsContainer.style.right = "0px";

        document.getElementById("current-user-moves").innerHTML = '';
        document.getElementById("current-user-moves").innerHTML += `
        You've made ${totalUserMoves} moves so far
        `;
        document.getElementById("current-user-moves").style.opacity = 1;
        
        document.getElementById("solution-move-number").innerHTML = '';
        document.getElementById("solution-move-number").style.opacity = 0;

        handleInput();
    }

    //solved by computer
    if(solved == 1) {
        shuffleContainer.innerHTML = '';
        goToInitialContainer.innerHTML = '';
        setInitialContainer.innerHTML = '';
        showSolutionContainer.innerHTML = '';
        previousContainer.innerHTML = '';
        nextContainer.innerHTML = '';

        shuffleContainer.innerHTML += `
        <button class = "buttons" id = "shuffle-button">
            Shuffle the puzzle
        </button>
        `;

        previousContainer.innerHTML += `
        <button class = "buttons" id = "show-the-previous-state-button">
            Show the previous state
        </button>
        `;

        nextContainer.innerHTML += `
        <button class = "buttons" id = "show-the-next-state-button">
            Show the next state
        </button>
        `;

        buttonsContainer.style.left = "200px";
        buttonsContainer.style.right = "550px";

        document.getElementById("current-user-moves").innerHTML = '';
        document.getElementById("current-user-moves").style.opacity = 0;

        document.getElementById("solution-move-number").innerHTML = '';
        document.getElementById("solution-move-number").innerHTML += `
        Move number : ${moveNumber}
        `;
        document.getElementById("solution-move-number").style.opacity = 1;

        handleInput();

    }

    //solved by user
    if(solved == 2) {

        shuffleContainer.innerHTML = '';
        goToInitialContainer.innerHTML = '';
        setInitialContainer.innerHTML = '';
        showSolutionContainer.innerHTML = '';
        previousContainer.innerHTML = '';
        nextContainer.innerHTML = '';

        shuffleContainer.innerHTML += `
        <button class = "buttons" id = "shuffle-button">
            Shuffle the puzzle
        </button>
        `;

        goToInitialContainer.innerHTML += `
        <button class = "buttons" id = "start-from-initial-state-button">
            Start again from the initial state
        </button>
 
        `;
        
        setInitialContainer.innerHTML += `
        <button class = "buttons" id = "set-initial-state-button">
            Set the current state as the initial state
        </button>
        `;

        showSolutionContainer.innerHTML += `
        <button class = "buttons" id = "show-the-solution-button">
            Show the solution starting from the initial state
        </button>
        `;

        congratulationsWindow.innerHTML = '';
        congratulationsWindow.innerHTML += `
        <div id = 'congratulations-message-container'>

            <p id = "congratulations-message">
                Congratulations!
                <br><br>
                You solved the puzzle.
                <br><br>
                It took you ${totalUserMoves} moves.  
                <br><br>
                The optimal solution takes ${totalSolutionMoves} moves.
                <br><br>
                See the solution or play again! 
            </p>    
    
            <div id = "congratulations-buttons-container">
                
                <button class = "buttons" id = "play-again-button">
                    Play again
                </button>

                <button class = "buttons" id = "view-the-solution-button">
                    View the solution
                </button>
    
            </div>
        </div>

        <button class = "close-button" id = "congratulations-close-button">
            <img class = "close-icon" src="/images/close-instructions-icon.jpg" alt="close button">
        </button>
        
        `;

        buttonsContainer.style.left = "70px";
        buttonsContainer.style.right = "0px";

        document.getElementById("current-user-moves").innerHTML = '';
        document.getElementById("current-user-moves").style.opacity = 0;
        document.getElementById("solution-move-number").innerHTML = '';
        document.getElementById("solution-move-number").style.opacity = 0;
        
        congratulationsWindow.style.opacity = 1;
        gameWindow.style.opacity = 0.4;
        
        handleInput();
    }
}

function instructionsDisplay() {
    instructionsWindow.style.opacity = 1;
    gameWindow.style.opacity = 0.4;
}

function instructionsClose() {
    instructionsWindow.style.opacity = 0;
    gameWindow.style.opacity = 1;
}

function instructionsDisplay() {
    instructionsWindow.style.opacity = 1;
    gameWindow.style.opacity = 0.4;
}

function congratulationsClose() {
    congratulationsWindow.style.opacity = 0;
    gameWindow.style.opacity = 1;
    reset();
}

function viewSolution() {
    congratulationsWindow.style.opacity = 0;
    gameWindow.style.opacity = 1;
    solveInitialState();
}

function playAgain() {
    congratulationsWindow.style.opacity = 0;
    gameWindow.style.opacity = 1;
    reset();
}

function reset(){

    initialState = [];
    currentState = [];
    empty = size*size;

    totalSolutionMoves = 0;
    totalUserMoves = 0;
    moveNumber = 0;

    solved = -1;

    for(let i = 1; i <= size*size; i++) {
        currentState.push({
            value: i,
            position: i,
            x: getRow(i),
            y: getCol(i),
        });

        initialState.push(currentState[i - 1].value);
    }

    display();
}

function handleInput() {

    
    gameWindow = document.getElementById("game-window");
    puzzleContainer = document.getElementById("puzzle-container");

    shuffleContainer = document.getElementById("shuffle-button-container");
    goToInitialContainer = document.getElementById("start-from-initial-state-button-container");
    setInitialContainer = document.getElementById("set-initial-state-button-container");
    showSolutionContainer = document.getElementById("show-the-solution-button-container");
    previousContainer = document.getElementById("show-the-previous-state-button-container");
    nextContainer = document.getElementById("show-the-next-state-button-container");


    shuffle = document.getElementById("shuffle-button");
    goToInitial = document.getElementById("start-from-initial-state-button");
    setInitial = document.getElementById("set-initial-state-button");
    showSolution = document.getElementById("show-the-solution-button");
    previous = document.getElementById("show-the-previous-state-button");
    next = document.getElementById("show-the-next-state-button");

    instructionsButton = document.getElementById("instructions-button");
    instructionsCloseButton = document.getElementById("instructions-close-button");
    instructionsWindow = document.getElementById("instructions-pop-up-window");

    playAgainButton = document.getElementById("play-again-button");
    viewSolutionButton = document.getElementById("view-the-solution-button");
    congratulationsCloseButton = document.getElementById("congratulations-close-button"); 
    congratulationsWindow = document.getElementById("congratulations-message-pop-up-window");


    handleKeyPress();
    handleShuffle();
    handleInitialState();
    handleSetInitialState();
    handleShowSolution();
    handlePreviousState();
    handleNextState();
    handleInstructionsButton();
    handleInstructionsClose();
    handlePlayAgain();
    handleViewSolution();
    handleCongratulationsClose();
}

function handleKeyPress() {
    document.addEventListener('keydown', handleKeys);
}

function handleKeys(e) {

    if(solved > 0) {return;}

    switch(e.key) {
        case "ArrowLeft": {
            moveRight();
            solved = isSolved();
            break;
        }

        case "ArrowRight": {
            moveLeft();
            solved = isSolved();
            break;
        }

        case "ArrowUp": {
            moveDown();
            solved = isSolved();
            break;
        }

        case "ArrowDown": {
            moveUp();
            solved = isSolved();
            break;
        }  
    }

    display();
}

function handleShuffle() {
    if(shuffle) {
        shuffle.addEventListener('click', shufflePuzzle);
    }
}

function handleInitialState() {
    if(goToInitial) {
        goToInitial.addEventListener('click', goToInitialState);
    }
}

function handleSetInitialState() {
    if(setInitial) {
        setInitial.addEventListener('click', setInitialState);
    }
}

function handleShowSolution() {
    if(showSolution) {
        showSolution.addEventListener('click', solveInitialState);
    }
}

function handlePreviousState() {
    if(previous) {
        previous.addEventListener('click', previousState);
    }
}

function handleNextState() {
    if(next) {
        next.addEventListener('click', nextState);
    }
}

function handleInstructionsButton() {
    if(instructionsButton) {
        instructionsButton.addEventListener('click', instructionsDisplay);
    }
}

function handleInstructionsClose() {
    if(instructionsCloseButton) {
        instructionsCloseButton.addEventListener('click', instructionsClose);
    }
}

function handlePlayAgain() {
    if(playAgainButton) {
        playAgainButton.addEventListener('click', playAgain);
    }
}

function handleViewSolution() {
    if(viewSolutionButton) {
        viewSolutionButton.addEventListener('click', viewSolution);
    }
}

function handleCongratulationsClose() {
    if(congratulationsCloseButton) {
        congratulationsCloseButton.addEventListener('click', congratulationsClose);
    }
}

function moveUp() {
    if(getRow(empty) == 0) {return;}

    totalUserMoves++;
    let temp = currentState[empty - 1 - 3].value;
    currentState[empty - 1 - 3].value = size*size;
    currentState[empty - 1].value = temp;
    empty -= 3;
}

function moveRight() {
    if(getCol(empty) == size - 1) {return;}
    
    totalUserMoves++;
    let temp = currentState[empty - 1 + 1].value;
    currentState[empty - 1 + 1].value = size*size;
    currentState[empty - 1].value = temp;
    empty += 1;
}

function moveDown() {
    if(getRow(empty) == size - 1) {return;}    

    totalUserMoves++;
    let temp = currentState[empty - 1 + 3].value;
    currentState[empty - 1 + 3].value = size*size;
    currentState[empty - 1].value = temp;
    empty += 3;
}

function moveLeft() {
    if(getCol(empty) == 0) {return;}

    totalUserMoves++;
    let temp = currentState[empty - 1 - 1].value;
    currentState[empty - 1 - 1].value = size*size;
    currentState[empty - 1].value = temp;
    empty -= 1;
}

function shufflePuzzle() {

    let x;

    do {
        totalUserMoves = 0;

        while(totalUserMoves < 35) {
            x = Math.floor((Math.random() * 4));

            switch(x) {
                case 0: {
                    moveLeft();
                    break;
                }

                case 1: {
                    moveRight();
                    break;
                }

                case 2: {
                    moveUp();
                    break;
                }

                case 3: {
                    moveDown();
                    break;
                }
            }

            solved = 0;
            display();

        }
    } while(isSolved());

    for(let i = 0; i < size*size; i++) {
        initialState[i] = currentState[i].value;

        if(currentState[i].value == size*size) {
            empty = currentState[i].position;
        }
    }

    solved = 0;
    totalUserMoves = 0;
    solution();
    display();
}

function goToInitialState() {
    for(let i = 0; i < size*size; i++) {
        currentState[i].value = initialState[i];

        if(currentState[i].value == size*size) {empty = currentState[i].position;}
    }

    totalUserMoves = 0;
    display();
}

function setInitialState() {
    for(let i = 0; i < size*size; i++) {
        initialState[i] = currentState[i].value;
    }

    totalUserMoves = 0;
    solution();
    display();
}

function solveInitialState() {
    solved = 1;
    index = 0;
    moveNumber = 0;
    for(let i = 0; i < size*size; i++) {
        currentState[i].value = initialState[i];

        if(currentState[i].value == size*size) {empty = currentState[i].position;}
    }

    display();
}

function previousState() {
    if(index <= 0) {return;}
    
    console.log(index)
    console.log(path);

    console.log(currentState);
    
    let temp = currentState[path[index] - 1].value;
    currentState[path[index] - 1].value = currentState[path[index - 1] - 1].value;
    currentState[path[index - 1] - 1].value = temp;

    empty = path[index - 1];
    index -= 1;
    moveNumber -= 1;

    display();
}

function nextState() {
    if(index >= path.length) {return;}
    
    console.log(currentState);

    let temp = currentState[path[index] - 1].value;
    currentState[path[index] - 1].value = currentState[path[index + 1] - 1].value;
    currentState[path[index + 1] - 1].value = temp;

    empty = path[index + 1];
    index += 1;
    moveNumber += 1;

    display();
}

function solution() {
    totalSolutionMoves = 0;
    path = [];

    minHeap = new MinHeap(0);
    check = 1;
    let minState;

    minHeap.insert(new Node(structuredClone(initialState), 0, structuredClone([empty]), empty));

    while(check === 1) {
        
        minState = minHeap.getMin();
        minHeap.remove();

        neighbours = [-1, -1, -1, -1];

        if(getCol(minState.empty) != 0) {neighbours[0] = minState.empty - 1;}
        if(getCol(minState.empty) != size - 1) {neighbours[1] = minState.empty + 1;}
        if(getRow(minState.empty) != 0) {neighbours[2] = minState.empty - size;}
        if(getRow(minState.empty) != size - 1) {neighbours[3] = minState.empty + size;}

        for(let blank of neighbours) {
            if(blank == -1 || (minState.moves > 0 && blank == minState.path[minState.moves - 1])) {
                continue;
            }
            else {
                [minState.board[blank - 1], minState.board[minState.empty - 1]] = [minState.board[minState.empty - 1], minState.board[blank - 1]]; 

                minState.path.push(blank);

                minHeap.insert(new Node(structuredClone(minState.board), minState.moves + 1, structuredClone(minState.path), blank));

                minState.path.pop();

                [minState.board[blank - 1], minState.board[minState.empty - 1]] = [minState.board[minState.empty - 1], minState.board[blank - 1]]; 
            }   
        }

        if(minState.manhattan - minState.moves === 0) {check = 0;}
    }
    
    path = minState.path;
    totalSolutionMoves = minState.moves;
}