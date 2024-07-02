import { Maze } from "./utils.js";

const mainDiv = document.querySelector("div.visual_main");
const solve_btn = document.getElementById("solve_button");
const show_btn = document.getElementById("show_button");
const x_input = document.getElementById("x_size");
const y_input = document.getElementById("y_size");

let x_size = 10;
let y_size = 10;
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
  maze.isCorrect();
  // console.log(x_size, y_size);
});
