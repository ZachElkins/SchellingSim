class Sim {
    constructor(gridSize, emptyPercentage, populations, unbiasedPopulation) {
        // 2d array that is size gridsize x gridsize
        this.grid = [];
        this.gridSize = gridSize;
        this.color = ["#B80031", "#227396", "#201E50", "#FFB30F", "#7EC8BC"];
        this.cellSize = canvas.width/gridSize;
        this.unbiasedPopulation = unbiasedPopulation;
        let options = Array.apply(null, {length: populations}).map(Number.call, Number);
        
        // Make sure the unbiased populaton is smaller than the other populations
        if (unbiasedPopulation) {
            for (let i = 1; i < populations.length; i++) {
                options = options.concat([i, i, i, i, i]);
            }
        }

        for (let i = 0; i < gridSize; i++) {
            this.grid[i] = [];
            for (let j = 0; j < gridSize; j++) {
                if (Math.random() <= emptyPercentage) {
                    this.grid[i][j] = -1;
                } else {
                    this.grid[i][j] = options[Math.floor(Math.random() * options.length)];
                }
            }
        }
    }

    drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] == -1) {
                    ctx.fillStyle = "#aaa";
                } else {
                    ctx.fillStyle = this.color[this.grid[i][j]];
                }
                ctx.fillRect(i * this.cellSize, j * this.cellSize, this.cellSize, this.cellSize);
            }
        }
    }

    drawFinal() {
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawGrid();
        ctx.strokeStyle = "rgb(200, 250, 200)";

        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                // Add a line in between each cell that does not match
                if (this.unbiasedPopulation && this.grid[i][j] == 2) {
                    // In the future change to have unbiased group only draw lines if adjacent to empty cell
                    continue;
                }
                if (i < this.gridSize-1) {
                    if (this.grid[i][j] != this.grid[(i + 1)][j]) {
                        ctx.strokeWeight = 2;
                        ctx.beginPath();
                        ctx.moveTo((i+1) * this.cellSize, j * this.cellSize);
                        ctx.lineTo((i+1) * this.cellSize, (j+1) * this.cellSize);
                        ctx.stroke();
                    }
                }

                if (j < this.gridSize-1) {
                    if (this.grid[i][j] != this.grid[(i)][j+1]) {
                        ctx.strokeWeight = 2;
                        ctx.beginPath();
                        ctx.moveTo(i * this.cellSize, (j+1) * this.cellSize);
                        ctx.lineTo((i+1) * this.cellSize, (j+1) * this.cellSize);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    iterate() {
        // Iterate grid state using schelling's model
        let newGrid = [];
        
        let toReplace = [];

        for (let i = 0; i < this.gridSize; i++) {
            newGrid[i] = [];
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] == -1) {
                    newGrid[i][j] = -1;
                } else {
                    let numSame = 0;
                    let neighbors = this.neighbors(i, j);
                    
                    if (this.unbiasedPopulation) {
                        // With unbiased group
                        if (this.grid[i][j] == 2) {
                            for (let neighbor of neighbors) {
                                if (neighbor != -1) {
                                    numSame++;
                                }
                            }
                        } else {
                            for (let neighbor of neighbors) {
                                if (neighbor == this.grid[i][j] || neighbor == 2) {
                                    numSame++;
                                }
                            }
                        }
                    } else {
                        // Without unbiased group
                        for (let neighbor of neighbors) {
                            if (neighbor == this.grid[i][j]) {
                                numSame++;
                            }
                        }
                    }

                    if (numSame < 4) {
                        newGrid[i][j] = -1;
                        toReplace.push(this.grid[i][j]);
                        if (this.grid[i][j] > 2) {
                            console.log(`${numSame}} Replacing ` + this.grid[i][j] + " with -1");
                        }
                    } else {
                        newGrid[i][j] = this.grid[i][j];
                        if (this.grid[i][j] > 2) {
                            console.log(`${numSame}} Keeping ` + this.grid[i][j]);
                        }
                    }
                }
            }
        }

        if (toReplace.length <= 0) {
            return false;
        }

        // Possible optimization, choose a random sub-grid to replace in
        // console.log(toReplace);
        while (toReplace.length > 0) {
            let i = Math.floor(Math.random() * this.gridSize);
            let j = Math.floor(Math.random() * this.gridSize);

            if (newGrid[i][j] == -1) {
                let replaceWith = toReplace.splice([Math.floor(Math.random() * toReplace.length)], 1);

                newGrid[i][j] = replaceWith[0];
                // console.log(replaceWith);
            }
        }
        
        this.grid = newGrid;
        return true;
    }

    neighbors(i, j) {
        // get all the neighbors of this.grid[i][j]
        let neighbors = [];

        // Check wrap around neighbors
        if (i == 0) {
            if (j == 0) {
                neighbors.push(this.grid[this.gridSize - 1][this.gridSize - 1]);
                neighbors.push(this.grid[this.gridSize - 1][j]);
                neighbors.push(this.grid[i][this.gridSize - 1]);
            } else if (j == this.gridSize - 1) {
                neighbors.push(this.grid[this.gridSize - 1][j - 1]);
                neighbors.push(this.grid[this.gridSize - 1][j]);
                neighbors.push(this.grid[i][0]);
            } else {
                neighbors.push(this.grid[this.gridSize - 1][j - 1]);
                neighbors.push(this.grid[this.gridSize - 1][j]);
                neighbors.push(this.grid[this.gridSize - 1][j + 1]);
                neighbors.push(this.grid[i][j - 1]);
                neighbors.push(this.grid[i][j + 1]);
                neighbors.push(this.grid[i][0]);
            }
        } else if (i == this.gridSize - 1) {
            if (j == 0) {
                neighbors.push(this.grid[i - 1][this.gridSize - 1]);
                neighbors.push(this.grid[i - 1][j]);
                neighbors.push(this.grid[i][this.gridSize - 1]);
            } else if (j == this.gridSize - 1) {
                neighbors.push(this.grid[i - 1][j - 1]);
                neighbors.push(this.grid[i - 1][j]);
                neighbors.push(this.grid[i][0]);
            } else {
                neighbors.push(this.grid[i - 1][j - 1]);
                neighbors.push(this.grid[i - 1][j]);
                neighbors.push(this.grid[i - 1][j + 1]);
                neighbors.push(this.grid[i][j - 1]);
                neighbors.push(this.grid[i][j + 1]);
                neighbors.push(this.grid[i][0]);
            }
        } else {
            if (j == 0) {
                neighbors.push(this.grid[i - 1][this.gridSize - 1]);
                neighbors.push(this.grid[i - 1][j]);
                neighbors.push(this.grid[i][this.gridSize - 1]);
                neighbors.push(this.grid[i + 1][this.gridSize - 1]);
                neighbors.push(this.grid[i + 1][j]);
                neighbors.push(this.grid[i][0]);
            } else if (j == this.gridSize - 1) {
                neighbors.push(this.grid[i - 1][j - 1]);
                neighbors.push(this.grid[i - 1][j]);
                neighbors.push(this.grid[i][0]);
                neighbors.push(this.grid[i + 1][j - 1]);
                neighbors.push(this.grid[i + 1][j]);
                neighbors.push(this.grid[i + 1][0]);
            } else {
                neighbors.push(this.grid[i - 1][j - 1]);
                neighbors.push(this.grid[i - 1][j]);
                neighbors.push(this.grid[i - 1][j + 1]);
                neighbors.push(this.grid[i][j - 1]);
                neighbors.push(this.grid[i][j + 1]);
                neighbors.push(this.grid[i][0]);
                neighbors.push(this.grid[i + 1][j - 1]);
                neighbors.push(this.grid[i + 1][j]);
                neighbors.push(this.grid[i + 1][j + 1]);
            }
        }

        return neighbors;
    }

    total(n, grid) {
        // total number of instances of the number i in this.grid
        let total = 0;
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (grid[i][j] == n) {
                    total++;
                }
            }
        }

        return total;
    }
}