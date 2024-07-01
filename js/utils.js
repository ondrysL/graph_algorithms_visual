class Maze {
  #width;
  #height;
  #list_of_el;
  #isMouseDown;

  constructor(width, height) {
    this.#width = width;
    this.#height = height;
    this.#list_of_el = [];
  }

  createMaze(elementToAppend) {
    elementToAppend.innerHTML = "";

    for (let i = 0; i < this.#width * this.#height; i++) {
      const tile = document.createElement("div");
      tile.className = `tile`;
      tile.id = `tile_${i + 1}`;

      tile.addEventListener("mousedown", (e) => {
        this.#isMouseDown = true;
        tile.classList.add("selected");
      });

      tile.addEventListener("mouseover", (e) => {
        if (this.#isMouseDown) {
          tile.classList.add("selected");
        }
      });

      elementToAppend.append(tile);
    }

    document.addEventListener("mouseup", () => {
      this.#isMouseDown = false;
    });

    elementToAppend.style.gridTemplateColumns = `repeat(${this.#width}, 1fr)`;
    elementToAppend.style.gridTemplateRows = `repeat(${this.#height}, 1fr)`;
  }

  set width(width) {
    this.#width = width;
  }

  set height(height) {
    this.#height = height;
  }
}

export { Maze };
