const container = document.querySelector('#puzzleContainer');

const numberOfMoves = document.querySelector('#numberOfMoves');

const shuffle = document.querySelector('#shuffle');

const initial = document.querySelector('#initial');
const set = document.querySelector('#set');
const solve = document.querySelector('#solve');

const previous = document.querySelector('#previous');
const next = document.querySelector('#next');

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


let initialState = [];
let state = []; 
let size = 3;
let empty = size*size;
let moves = 0;
let moveNumber = 0;
let userMoves = 0;
let solved = -1;
let neighbours = [];
let minHeap = new MinHeap(0);
let path = [];
let index = 0;

generate();

display();

handleShuffle();

handleInitial();

handleSet();

handleSolve();

handlePrevious();

handleNext();

handleInput(); 


function getRow(pos) {
    return Math.ceil(pos/size) - 1;
}

function getCol(pos) {
    let col = pos % size;

    if(col == 0) {return size - 1;}

    return col - 1;
}

function generate(){
    for(let i = 1; i <= size*size; i++) {
        state.push({
            value: i,
            position: i,
            x: getRow(i),
            y: getCol(i),
        });

        initialState.push(state[i - 1].value);
    }
}

/*
       function getRandomValues() {
    const values = [];
    for(let i = 1; i <= size*size; i++)
        values.push(i);

    const randomValues = values.sort(() => Math.random() - 0.5);
    return randomValues;
}
*/

function shufflePuzzle() {
    /* const randomValues = getRandomValues();

    for(let i = 0; i < size*size; i++) {
        state[i].value = randomValues[i];

        initialState[i] = state[i].value;

        if(state[i].value == size*size) {
            empty = state[i].position;
        }
    }
    */

    let x;

    do {
        userMoves = 0;

        while(userMoves < 30) {
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
        initialState[i] = state[i].value;

        if(state[i].value == size*size) {
            empty = state[i].position;
        }
    }

    solved = 0;
    userMoves = 0;
    solution();
    display();
}

function handleShuffle() {
    shuffle.addEventListener('click', shufflePuzzle);
}

function isSolved() {
    
    for(let tile of state) {
        if(tile.value != tile.position) {return 0;}
    }

    return 2;
}

function handleInput() {
    document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(e) {

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

function moveLeft() {
    if(getCol(empty) == 0) {return;}

    userMoves++;
    let temp = state[empty - 1 - 1].value;
    state[empty - 1 - 1].value = size*size;
    state[empty - 1].value = temp;
    empty -= 1;
}

function moveRight() {
    if(getCol(empty) == size - 1) {return;}
    
    userMoves++;
    let temp = state[empty - 1 + 1].value;
    state[empty - 1 + 1].value = size*size;
    state[empty - 1].value = temp;
    empty += 1;
}

function moveUp() {
    if(getRow(empty) == 0) {return;}

    userMoves++;
    let temp = state[empty - 1 - 3].value;
    state[empty - 1 - 3].value = size*size;
    state[empty - 1].value = temp;
    empty -= 3;
}

function moveDown() {
    if(getRow(empty) == size - 1) {return;}    

    userMoves++;
    let temp = state[empty - 1 + 3].value;
    state[empty - 1 + 3].value = size*size;
    state[empty - 1].value = temp;
    empty += 3;
}

function revertToInitialState() {
    for(let i = 0; i < size*size; i++) {
        state[i].value = initialState[i];

        if(state[i].value == size*size) {empty = state[i].position;}
    }

    userMoves = 0;
    display();
}

function handleInitial() {
    initial.addEventListener('click', revertToInitialState);
}

function setInitial() {
    for(let i = 0; i < size*size; i++) {
        initialState[i] = state[i].value;
    }

    userMoves = 0;
    solution();
}

function handleSet() {
    set.addEventListener('click', setInitial);
}

function solveInitalState() {
    solved = 1;
    index = 0;
    moveNumber = 0;
    for(let i = 0; i < size*size; i++) {
        state[i].value = initialState[i];

        if(state[i].value == size*size) {empty = state[i].position;}
    }

    display();
}

function handleSolve() {
    solve.addEventListener('click', solveInitalState);
}


function solution() {
    moves = 0;
    path = [];

    minHeap = new MinHeap(0);
    check = true;
    let current;

    minHeap.insert(new Node(structuredClone(initialState), 0, structuredClone([empty]), empty));

    while(check) {
        
        current = minHeap.getMin();
        minHeap.remove();

        neighbours = [-1, -1, -1, -1];

        if(getCol(current.empty) != 0) {neighbours[0] = current.empty - 1;}
        if(getCol(current.empty) != size - 1) {neighbours[1] = current.empty + 1;}
        if(getRow(current.empty) != 0) {neighbours[2] = current.empty - size;}
        if(getRow(current.empty) != size - 1) {neighbours[3] = current.empty + size;}

        for(let blank of neighbours) {
            if(blank == -1 || (current.moves > 0 && blank == current.path[current.moves - 1])) {
                continue;
            }
            else {
                [current.board[blank - 1], current.board[current.empty - 1]] = [current.board[current.empty - 1], current.board[blank - 1]]; 

                current.path.push(blank);

                minHeap.insert(new Node(structuredClone(current.board), current.moves + 1, structuredClone(current.path), blank));

                current.path.pop();

                [current.board[blank - 1], current.board[current.empty - 1]] = [current.board[current.empty - 1], current.board[blank - 1]]; 
            }
            
            if(current.manhattan - current.moves == 0) {check = false;}
        }
    }
    
    path = current.path;
    moves = current.moves;
}


function previousState() {
    if(index <= 0) {return;}
    
    let temp = state[path[index] - 1].value;
    state[path[index] - 1].value = state[path[index - 1] - 1].value;
    state[path[index - 1] - 1].value = temp;

    index -= 1;
    moveNumber -= 1;

    display();
}

function handlePrevious() {
    previous.addEventListener('click', previousState);
}

function nextState() {
    if(index >= path.length) {return;}
    
    let temp = state[path[index] - 1].value;
    state[path[index] - 1].value = state[path[index + 1] - 1].value;
    state[path[index + 1] - 1].value = temp;

    index += 1;
    moveNumber += 1;

    display();
}

function handleNext() {
    next.addEventListener('click', nextState);
}

function display() {
    // console.log(solved);

    container.innerHTML = '';
    for(let tile of state) {
        
        if(tile.value == size*size) {continue;}

        container.innerHTML += `
        <div class = 'tile', style = "
        width: ${600/size}px; 
        height: ${600/size}px;
        border: 1px solid;
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2em;
        background-color: #ddd;
        opacity: 0.9;
        
        top: ${tile.x*(600/size)}px; left: ${tile.y*(600/size)}px;">
            ${tile.value}
        
        </div>
        `;
    }

    if(solved == -1) {
        initial.innerHTML = '';
        solve.innerHTML = '';
        previous.innerHTML = '';
        next.innerHTML = '';

        set.innerHTML = '';
        set.innerHTML += `<input type = "button" value = "Set initial state to current state">`;
        
        message.innerHTML = '';
        message.innerHTML += `<p>Click "Shuffle" to shuffle the board or shuffle using arrow keys</p>`;
        message.innerHTML += `<p>Try solving the puzzle in the least number of moves using arrow keys</p>`;
        message.innerHTML += `<p>Use arrow keys to move adjacent tiles into the empty space</p>`;
        message.innerHTML += `<p>Refresh the page to unshuffle the puzzle</p>`;

    }

    if(solved == 0) {
        previous.innerHTML = '';
        next.innerHTML = '';

        initial.innerHTML = '';
        initial.innerHTML += `<input type = "button" value = "Start again from the initial state">`;

        set.innerHTML = '';
        set.innerHTML += `<input type = "button" value = "Set initial state to current state">`;
        
        solve.innerHTML = '';
        solve.innerHTML += `<input type = "button" value = "View the solution">`;

        message.innerHTML = '';
        message.innerHTML += `<p>Click "Shuffle" to shuffle the board or shuffle using arrow keys</p>`;
        message.innerHTML += `<p>Try solving the puzzle in the least number of moves using arrow keys</p>`;
        message.innerHTML += `<p>Use arrow keys to move adjacent tiles into the empty space</p>`;
        message.innerHTML += `<p>Refresh the page to unshuffle the puzzle</p>`;

    }

    if(solved == 1) {
        initial.innerHTML = '';
        solve.innerHTML = '';
        set.innerHTML = '';

        numberOfMoves.innerHTML = 'Move number ';
        numberOfMoves.innerHTML += `${moveNumber}`;
    
        previous.innerHTML = '';
        previous.innerHTML += `<input type = "button" value = "Previous">`;

        next.innerHTML = '';
        next.innerHTML += `<input type = "button" value = "Next">`;

        message.innerHTML = '';
        message.innerHTML += `<p>Here's the quickest solution.</p>`;
        message.innerHTML += `<p>It takes ${moves} moves.</p>`;
        message.innerHTML += `<p>Click "Next" to have a look at the next move.</p>`;
        message.innerHTML += `<p>Click "Previous" to have a look at the previous move.</p>`;
    }

    if(solved == 2) {

        initial.innerHTML = '';
        next.innerHTML = '';
        previous.innerHTML = '';
        set.innerHTML = '';

        solve.innerHTML = '';
        solve.innerHTML += `<input type = "button" value = "View the solution">`;

        message.innerHTML = '';
        message.innerHTML += `<p>Congratulations! You have solved the puzzle.</p>`;
        message.innerHTML += `<p>You solved it in ${userMoves} moves.</p>`;
        message.innerHTML += `<p>The quickest solution takes ${moves} moves.</p>`;
        message.innerHTML += `<p>Click "View solution" to have a look at the solution.</p>`;

    }
}

/*
const undo = document.querySelector('#undo');
const complete = document.querySelector('#complete');

<input type = "button" value = "Undo my move">
<input type = "button" value = "Return to initial state">
<input type = "button" value = "Solve from initial state">
<input type = "button" value = "Show all moves from here">
<input type = "button" value = "Previous">
<input type = "button" value = "Next">

function undoMove() {}

function showAllMoves() {}
*/