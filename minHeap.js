class Node {
    constructor(state, moves) {
        this.board = state;
        this.manhattan = manhattanDistance(state, moves);
        this.hamming = hammingDistance(state, moves); 

    }

    getRow(pos) {
        return Math.ceil(pos/size) - 1;
    }
    
    getCol(pos) {
        let col = pos % size;
    
        if(col == 0) {return size - 1;}
    
        return col - 1;
    }

    manhattanPriority(state, moves) {
        let m = 0;
        for(let i = 0; i < state.length; i++) {
            m += Math.abs(getRow(state[i]) - getRow(i)) + Math.abs(getCol(state[i]) - getCol(i));
        }

        m += moves;

        return m;
    }

    hammingPriority(state, moves) {
        let h = 0;
        for(let i = 0; i < state.length; i++) {
            if(state[i] != i + 1) {
                h += 1;
            }
        }

        h += moves;

        return h;
    }
}

class MinHeap {

    constructor () {
        this.heap = [null]
    }

    getMin () {
        return this.heap[1]
    }
    
    insert (node) {

        this.heap.push(node)

        if (this.heap.length > 1) {
            let current = this.heap.length - 1

            while (current > 1 && this.heap[Math.floor(current/2)] > this.heap[current]) {

                [this.heap[Math.floor(current/2)], this.heap[current]] = [this.heap[current], this.heap[Math.floor(current/2)]]
                current = Math.floor(current/2)
            }
        }
    }
    
    remove() {
        let smallest = this.heap[1]

        if (this.heap.length > 2) {
            this.heap[1] = this.heap[this.heap.length-1]
            this.heap.splice(this.heap.length - 1)

            if (this.heap.length === 3) {
                if (this.heap[1] > this.heap[2]) {
                    [this.heap[1], this.heap[2]] = [this.heap[2], this.heap[1]]
                }
                return smallest
            }

            let current = 1
            let leftChildIndex = current * 2
            let rightChildIndex = current * 2 + 1

            while (this.heap[leftChildIndex] &&
                    this.heap[rightChildIndex] &&
                    (this.heap[current] > this.heap[leftChildIndex] ||
                        this.heap[current] > this.heap[rightChildIndex])) {
                if (this.heap[leftChildIndex] < this.heap[rightChildIndex]) {
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