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
// const borderInput = document.getElementById("border_input");
// const entryInput = document.getElementById("entry_input");
// const pointInput = document.getElementById("point_input");

const x_input = document.getElementById("x_size");
const y_input = document.getElementById("y_size");

let x_size = 20;
let y_size = 20;
let maze = new Maze(x_size, y_size);
maze.createMaze(mainDiv);

x_input.addEventListener("keyup", (e) => {
  x_size = e.target.value;
});

y_input.addEventListener("keyup", (e) => {
  y_size = e.target.value;
});

show_btn.addEventListener("click", (e) => {
  maze.col = x_size;
  maze.row = y_size;
  maze.createMaze(mainDiv);
});

solve_btn.addEventListener("click", (e) => {
  maze.reset();
  let isCorrect = maze.isCorrect();
  if (!isCorrect) {
    return;
  }
  maze.addTranstitions();
  let [tile, time] = maze.solveBFS();
  if (tile != null) {
    maze.drawPath(tile, time);
  } else {
    alert("cannot find escape");
  }
  // console.log(x_size, y_size);
});

reset_btn.addEventListener("click", (e) => {
  maze = new Maze(x_size, y_size);
  maze.createMaze(mainDiv);
});
