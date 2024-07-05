import { Maze } from "./utils.js";

function toggleCheckbox(event) {
  const checkboxes = document.querySelectorAll(
    'input[name="control_checkbox"]',
  );

  checkboxes.forEach((checkbox) => {
    if (checkbox !== event.target) {
      checkbox.checked = false;
    }
  });

  if (event.target.checked) {
    maze.selectedOption = `${event.target.value}`;
    maze.updateTileEventListeners();
  }

  console.log(maze);
}

document
  .querySelectorAll('input[name="control_checkbox"]')
  .forEach((checkbox) => {
    checkbox.addEventListener("change", toggleCheckbox);
  });

const mainDiv = document.querySelector("div.visual_main");
const solve_btn = document.getElementById("solve_button");
const reset_btn = document.getElementById("reset_button");
const show_btn = document.getElementById("show_button");
const mode_text = document.getElementById("mode_text");
const bfs_btn = document.getElementById("bfs_btn");
const dfs_btn = document.getElementById("dfs_btn");
const point_checkbox = document.getElementById("point_input");
const enumModes = {
  bfs: 0,
  dfs: 1,
};

const x_input = document.getElementById("x_size");
const y_input = document.getElementById("y_size");

let x_size = 20;
let y_size = 20;
let maze = new Maze(x_size, y_size);
maze.createMaze(mainDiv);
maze.mode = enumModes["bfs"];

bfs_btn.addEventListener("click", () => {
  mode_text.innerHTML = "Mode: Shortest Path";
  point_checkbox.style.opacity = "0";
  maze.mode = enumModes["bfs"];
});

dfs_btn.addEventListener("click", () => {
  mode_text.innerHTML = "Mode: Find All Points";
  point_checkbox.style.opacity = "1";
  maze.mode = enumModes["dfs"];
});

x_input.addEventListener("keyup", (e) => {
  x_size = e.target.value;
});

y_input.addEventListener("keyup", (e) => {
  y_size = e.target.value;
});

show_btn.addEventListener("click", () => {
  maze.col = x_size;
  maze.row = y_size;
  maze.createMaze(mainDiv);
});

solve_btn.addEventListener("click", () => {
  maze.reset();
  let isCorrect = maze.isCorrect();
  if (!isCorrect) {
    return;
  }
  maze.addTranstitions();

  let tile, time, points;
  if (maze.mode == enumModes["bfs"]) {
    [tile, time] = maze.solveBFS();

    if (tile != null) {
      maze.drawPath(tile, time);
    } else {
      alert("cannot find escape");
    }
  }

  if (maze.mode == enumModes["dfs"]) {
    [points, time] = maze.solveDFS();

    setTimeout(() => {
      alert(`points: ${points}`);
    }, time * 35);
  }
});

reset_btn.addEventListener("click", () => {
  maze = new Maze(x_size, y_size);
  maze.createMaze(mainDiv);
});
