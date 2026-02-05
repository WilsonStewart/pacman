/// <reference lib="dom" />

import { Pacman } from "./game-engine";

let pacman = new Pacman({
  size: 64,
  mountingElement: document.getElementById("pacman")!,
});
let pacman2 = new Pacman({
  size: 64,
  baseColor: "brown",
  mountingElement: document.getElementById("pacman2")!,
});

// @ts-ignore
window.pacman = pacman;
// @ts-ignore
window.pacman2 = pacman2;
