import { Queue } from "./queue.js";

const enumTileType = {
  Border: 0,
  Entry: 1,
  Empty: 2,
};

class Tile {
  #positionCol;
  #positionRow;
  #htmlElement;
  #type;
  #visited;
  #isBorder;

  constructor(row, col) {
    this.#positionCol = col;
    this.#positionRow = row;
    this.#visited = false;
    this.#isBorder = false;
    this.#type = enumTileType["Empty"];
    this.#htmlElement = document.createElement("div");
    this.#htmlElement.className = "tile";
    this.#htmlElement.id = `tile_${col}_${row}`;
  }

  setEventListeners(maze) {
    this.#htmlElement.addEventListener("mousedown", () => {
      let css_style;
      let type;

      if (maze.isShiftDown) {
        css_style = "#FF6969";
        type = enumTileType["Entry"];
      } else {
        maze.isMouseDown = true;
        css_style = "#0C1844";
        type = enumTileType["Border"];
      }

      this.#htmlElement.style.backgroundColor = css_style;
      maze.setTile(this.#positionRow, this.#positionCol, type);
      // maze.printList();
    });

    this.#htmlElement.addEventListener("mouseover", () => {
      if (maze.isMouseDown) {
        this.#htmlElement.classList.add("selected");
        maze.setTile(this.#positionRow, this.#positionCol, 0);
        // maze.printList();
      }
    });
  }

  get htmlElement() {
    return this.#htmlElement;
  }

  get positionCol() {
    return this.#positionCol;
  }

  get positionRow() {
    return this.#positionRow;
  }

  set type(type) {
    this.#type = type;
  }

  get type() {
    return this.#type;
  }

  set visited(value) {
    this.#visited = value;
  }

  get visited() {
    return this.#visited;
  }

  set isBorder(value) {
    this.#isBorder = value;
  }

  get isBorder() {
    return this.#isBorder;
  }
}

class Maze {
  #col;
  #row;
  #listOfEl;
  #isMouseDown;
  #isShiftDown;
  #entryCount;

  constructor(row, col) {
    this.#col = col;
    this.#row = row;
    this.#entryCount = 0;
    this.#listOfEl = [];
  }

  createMaze(elementToAppend) {
    elementToAppend.innerHTML = "";
    this.#listOfEl = [];

    document.addEventListener("mouseup", () => {
      this.#isMouseDown = false;
    });

    document.addEventListener("keydown", (e) => {
      if (e.key == "Shift") {
        this.#isShiftDown = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key == "Shift") {
        this.#isShiftDown = false;
      }
    });

    for (let i = 0; i < this.#row; i++) {
      let row = [];
      for (let j = 0; j < this.#col; j++) {
        let tile = new Tile(i, j);
        tile.setEventListeners(this);
        tile.type = enumTileType["Empty"];
        elementToAppend.append(tile.htmlElement);

        row.push(tile);
      }
      this.#listOfEl.push(row);
    }

    // console.log(this.#listOfEl);
    elementToAppend.style.gridTemplateColumns = `repeat(${this.#col}, 1fr)`;
    elementToAppend.style.gridTemplateRows = `repeat(${this.#row}, 1fr)`;
  }

  #findFirstBorder() {
    for (let i = 0; i < this.#row; i++) {
      for (let j = 0; j < this.#col; j++) {
        if (this.#listOfEl[i][j].type == enumTileType["Border"]) {
          return [i, j];
        }
      }
    }
  }

  #isOutOfBounds(row, col) {
    return col < 0 || row < 0 || col >= this.#col || row >= this.#row;
  }

  #getNeighbours(row, col) {
    // 0 = UP, 1 = RIGHT, 2 = DOWN, 3 = LEFT
    const neigh = [
      this.getTile(row - 1, col),
      this.getTile(row, col + 1),
      this.getTile(row + 1, col),
      this.getTile(row, col - 1),
    ];

    return neigh.map((item) => {
      if (item == null) {
        return null;
      } else {
        return item.type != enumTileType["Empty"] ? item : null;
      }
    });
  }

  #changeDir(row, col, dir) {
    switch (dir) {
      case 0:
        return [row - 1, col];
      case 1:
        return [row, col + 1];
      case 2:
        return [row + 1, col];
      case 3:
        return [row, col - 1];
    }
  }

  #traversalMaze(firstRow, firstCol, row, col, actDir, tiles) {
    if (this.#listOfEl[row][col].visited && this.#listOfEl[row][col].isBorder) {
      return false;
    }

    this.#listOfEl[row][col].visited = true;
    this.#listOfEl[row][col].isBorder = true;
    this.#listOfEl[row][col].isInside = true;
    this.#listOfEl[row][col].htmlElement.style.backgroundColor = "red";

    if (firstRow + 1 == row && firstCol == col) {
      return this.#entryCount == 2;
    }

    let [inRow, inCol] = this.#changeDir(row, col, (actDir + 1) % 4);
    console.log("act:", row, col, "new: ", inRow, inCol);
    tiles.enqueue(this.getTile(inRow, inCol));

    if (this.#listOfEl[row][col].type == enumTileType["Entry"]) {
      this.#entryCount += 1;
    }

    const neighbours = this.#getNeighbours(row, col);

    // if is possible turn left
    let newDir = actDir == 0 ? 3 : actDir - 1;
    let [newRow, newCol] = [null, null];

    if (neighbours[newDir] != null) {
      [newRow, newCol] = this.#changeDir(row, col, newDir);
      return this.#traversalMaze(
        firstRow,
        firstCol,
        newRow,
        newCol,
        newDir,
        tiles,
      );
    }

    newDir = actDir;
    while (neighbours[newDir] == null) {
      newDir = (newDir + 1) % 4;

      if (newDir == actDir) {
        return false;
      }
    }

    [newRow, newCol] = this.#changeDir(row, col, newDir);
    return this.#traversalMaze(
      firstRow,
      firstCol,
      newRow,
      newCol,
      newDir,
      tiles,
    );
  }

  #fillMaze(tiles) {
    while (tiles.count != 0) {
      const tile = tiles.dequeue();

      if (tile == null || tile.isBorder) {
        continue;
      }

      const neigh = [
        this.getTile(tile.positionRow - 1, tile.positionCol),
        this.getTile(tile.positionRow, tile.positionCol + 1),
        this.getTile(tile.positionRow + 1, tile.positionCol),
        this.getTile(tile.positionRow, tile.positionCol - 1),
      ];

      neigh.forEach((item) => {
        if (item != null && !item.visited && !item.isBorder) {
          item.visited = true;
          item.isInside = true;
          console.log(item);
          tiles.enqueue(item);
        }
      });
    }
  }

  #checkFullBoard() {
    for (let i = 0; i < this.#row; i++) {
      for (let j = 0; j < this.#col; j++) {
        const tile = this.getTile(i, j);

        if (tile.type != enumTileType["Empty"] && !tile.isInside) {
          console.log(i, j);
          return false;
        }
      }
    }

    return true;
  }

  isCorrect() {
    let [firstRow, firstCol] = this.#findFirstBorder();
    const neigh = this.#getNeighbours(firstRow, firstCol);
    const tiles = new Queue();

    if (neigh[1] == null) {
      alert("bad border");
      return false;
    }

    let isBorderCorrect = this.#traversalMaze(
      firstRow,
      firstCol,
      firstRow,
      firstCol,
      1,
      tiles,
    );

    if (!isBorderCorrect) {
      alert("bad border");
      return false;
    }

    tiles.printAllObject();
    this.#fillMaze(tiles);

    let checkFullBoard = this.#checkFullBoard();

    if (!checkFullBoard) {
      alert("bad outer");
      return false;
    }
  }

  solveBFS() {}

  printList() {
    console.log(this.#listOfEl);
  }

  setTile(row, col, type) {
    this.#listOfEl[row][col].type = type;
  }

  getTile(row, col) {
    if (this.#isOutOfBounds(row, col)) {
      return null;
    }

    return this.#listOfEl[row][col];
  }

  set col(col) {
    this.#col = col;
  }

  set row(row) {
    this.#row = row;
  }

  set isMouseDown(isMouseDown) {
    this.#isMouseDown = isMouseDown;
  }

  get isMouseDown() {
    return this.#isMouseDown;
  }

  get isShiftDown() {
    return this.#isShiftDown;
  }
}

export { Maze };
