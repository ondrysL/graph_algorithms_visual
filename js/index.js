import { Maze } from "./utils.js";

const mainDiv = document.querySelector("div.visual_main");
const solve_btn = document.getElementById("solve_button");
const x_input = document.getElementById("x_size");
const y_input = document.getElementById("y_size");

let x_size = 20;
let y_size = 20;
let maze = new Maze(20, 20);
maze.createMaze(mainDiv);

x_input.addEventListener("keyup", (e) => {
  x_size = e.target.value;
});

y_input.addEventListener("keyup", (e) => {
  y_size = e.target.value;
});

solve_btn.addEventListener("click", (e) => {
  maze.width = x_size;
  maze.height = y_size;
  maze.createMaze(mainDiv);
  console.log(x_size, y_size);
});
