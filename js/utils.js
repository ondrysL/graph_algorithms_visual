import { Queue } from "./queue.js";

const enumTileType = {
  Border: 0,
  Entry: 1,
  Empty: 2,
};

class Entry {
  positionRow;
  positionCol;
  dir;

  constructor(row, col, dir) {
    this.positionRow = row;
    this.positionCol = col;
    this.dir = dir;
  }
}

class Tile {
  #positionCol;
  #positionRow;
  #htmlElement;
  #type;
  #visited;
  #isBorder;
  #pred;

  constructor(row, col) {
    this.#positionCol = col;
    this.#positionRow = row;
    this.#visited = false;
    this.#isBorder = false;
    this.#type = enumTileType["Empty"];
    this.#pred = null;
    this.#htmlElement = document.createElement("div");
    this.#htmlElement.className = "tile";
    this.#htmlElement.id = `tile_${col}_${row}`;
  }

  setEventListeners(maze) {
    this.htmlElement.addEventListener("mousedown", () => {
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

    this.htmlElement.addEventListener("mouseover", () => {
      if (maze.isMouseDown) {
        this.#htmlElement.style.backgroundColor = "#0C1844";
        maze.setTile(this.#positionRow, this.#positionCol, 0);
        // maze.printList();
      }
    });

    this.#htmlElement.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this.#htmlElement.style.backgroundColor = "white";
      maze.setTile(this.#positionRow, this.#positionCol, 2);
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

  get pred() {
    return this.#pred;
  }

  set pred(value) {
    this.#pred = value;
  }
}

class Maze {
  #col;
  #row;
  #listOfEl;
  #isMouseDown;
  #isShiftDown;
  #entryCount;
  #entry;
  selectedOption;

  constructor(row, col) {
    this.#col = col;
    this.#row = row;
    this.#entryCount = 0;
    this.#listOfEl = [];
    this.#entry = null;
    this.#isShiftDown = false;
    this.selectedOption = "border";
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

  #checkEntry(neigh) {
    let count = 0;

    for (let i = 0; i < neigh.length; i++) {
      let item = neigh[i];
      if (item != null && item.type == enumTileType["Border"]) {
        let opossiteDir = (i + 2) % 4;

        if (
          neigh[opossiteDir] == null ||
          neigh[opossiteDir].type != enumTileType["Border"]
        ) {
          return false;
        }

        break;
      }
    }

    for (let i = 0; i < neigh.length; i++) {
      let item = neigh[i];

      if (item != null && item.type == enumTileType["Border"]) {
        count++;
      }
    }

    return count == 2;
  }

  #traversalMaze(firstRow, firstCol, row, col, actDir, tiles) {
    if (this.#listOfEl[row][col].visited) {
      return false;
    }

    this.#listOfEl[row][col].visited = true;
    this.#listOfEl[row][col].isBorder = true;
    this.#listOfEl[row][col].isInside = true;
    const neighbours = this.#getNeighbours(row, col);

    if (this.#listOfEl[row][col].type == enumTileType["Entry"]) {
      if (!this.#checkEntry(neighbours)) {
        console.log("bad entry");
        return false;
      }

      if (this.#entry == null) {
        this.#entry = new Entry(row, col, actDir);
      }

      this.#entryCount += 1;
    }

    if (firstRow + 1 == row && firstCol == col) {
      return this.#entryCount == 2;
    }

    let [inRow, inCol] = this.#changeDir(row, col, (actDir + 1) % 4);
    tiles.enqueue(this.getTile(inRow, inCol));

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
        break;
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
          return false;
        }

        tile.visited = false;
      }
    }

    return true;
  }

  isCorrect() {
    let [firstRow, firstCol] = this.#findFirstBorder();
    const neigh = this.#getNeighbours(firstRow, firstCol);
    const tiles = new Queue();

    if (neigh[1] == null) {
      alert("bad border 1");
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
      alert("bad border 2");
      return false;
    }

    this.#fillMaze(tiles);

    let checkFullBoard = this.#checkFullBoard();

    if (!checkFullBoard) {
      alert("bad outer");
      return false;
    }

    return true;
  }

  solveBFS() {
    const queue = new Queue();
    const [firstTileRow, firstTileCol] = this.#changeDir(
      this.entry.positionRow,
      this.entry.positionCol,
      (this.entry.dir + 1) % 4,
    );
    this.#listOfEl[this.entry.positionRow][this.entry.positionCol].visited =
      true;
    const firstTile = this.getTile(firstTileRow, firstTileCol);
    firstTile.pred = this.getTile(
      this.entry.positionRow,
      this.entry.positionCol,
    );
    firstTile.visited = true;
    let lastTile = null;
    let time = 1;

    queue.enqueue(firstTile);

    while (queue.count != 0) {
      const tile = queue.dequeue();

      if (tile.type == enumTileType["Entry"]) {
        lastTile = tile;
        return [lastTile, time];
      }

      const neigh = [
        this.getTile(tile.positionRow - 1, tile.positionCol),
        this.getTile(tile.positionRow, tile.positionCol + 1),
        this.getTile(tile.positionRow + 1, tile.positionCol),
        this.getTile(tile.positionRow, tile.positionCol - 1),
      ];

      for (let i = 0; i < neigh.length; i++) {
        const item = neigh[i];

        if (
          item == null ||
          item.visited ||
          item.border ||
          item.type == enumTileType["Border"]
        ) {
          continue;
        }

        neigh[i].pred = tile;

        (function (item) {
          setTimeout(() => {
            item.htmlElement.style.backgroundColor = "#C80036";
          }, time * 10);

          setTimeout(() => {
            item.htmlElement.style.backgroundColor = "white";
          }, time * 30);
        })(item);

        time++;
        item.visited = true;
        queue.enqueue(item);
      }
    }

    // this is ugly, I know
    return [null, null];
  }

  drawPath(tile, time) {
    while (tile != null) {
      (function (tile) {
        setTimeout(() => {
          tile.htmlElement.style.backgroundColor = "#FF6969";
        }, time * 30);
      })(tile);

      time++;
      tile = tile.pred;
    }
    return;
  }

  addTranstitions() {
    for (let i = 0; i < this.#row; i++) {
      for (let j = 0; j < this.#col; j++) {
        this.#listOfEl[i][j].htmlElement.style.transition = "all 0.6s";
      }
    }
  }
  reset() {
    this.#entry = null;
    this.#entryCount = 0;

    for (let i = 0; i < this.#row; i++) {
      for (let j = 0; j < this.#col; j++) {
        let tile = this.#listOfEl[i][j];
        tile.isInside = false;
        tile.visited = false;
        tile.pred = null;
        if (tile.type == enumTileType["Empty"]) {
          tile.htmlElement.style.background = "white";
        }
      }
    }
  }

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

  get entry() {
    return this.#entry;
  }

  set entry(entry) {
    this.#entry = entry;
  }
}

export { Maze };
