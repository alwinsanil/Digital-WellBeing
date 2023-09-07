let homebtn = document.getElementById("home-btn");
let btn1 = document.getElementById("btn-mod-1");
let btn2 = document.getElementById("btn-mod-2");
let btn3 = document.getElementById("btn-mod-3");
let btn4 = document.getElementById("btn-mod-4");
let navarea = document.getElementById("navarea");

let home = document.getElementById("home");
const nav1 = document.getElementById("nav1");
const nav2 = document.getElementById("nav2");
const nav3 = document.getElementById("nav3");
const nav4 = document.getElementById("nav4");

nav1.style.display = "none";
nav2.style.display = "none";
nav3.style.display = "none";
nav4.style.display = "none";

homebtn.addEventListener("click", function () {
  console.log("home-btn");
  nav1.style.display = "none";
  nav2.style.display = "none";
  nav3.style.display = "none";
  nav4.style.display = "none";
  home.style.display = "inline";
});

btn1.addEventListener("click", function () {
  console.log("btn-1-dif");
  nav1.style.display = "inline";
  nav2.style.display = "none";
  nav3.style.display = "none";
  nav4.style.display = "none";
  home.style.display = "none";
});

btn2.addEventListener("click", function () {
  console.log("btn-2");
  nav1.style.display = "none";
  nav2.style.display = "inline";
  nav3.style.display = "none";
  nav4.style.display = "none";
  home.style.display = "none";
});

btn3.addEventListener("click", function () {
  console.log("btn-3");
  nav1.style.display = "none";
  nav2.style.display = "none";
  nav3.style.display = "block";
  nav4.style.display = "none";
  home.style.display = "none";
  document.getElementsByTagName("svg")[0].style.overflow = "visible";
});

btn4.addEventListener("click", function () {
  console.log("btn-4");
  nav1.style.display = "none";
  nav2.style.display = "none";
  nav3.style.display = "none";
  nav4.style.display = "inline";
  home.style.display = "none";
});
