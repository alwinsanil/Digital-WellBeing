const tohide = document.getElementById("tohide");
const loginpg = document.getElementById("loginpg");
let login = document.getElementById("login");
let username = document.getElementById("usrname");
let pswd = document.getElementById("pswd");
let login_text = document.getElementById("login-text");
let unsuccessful = document.getElementById("unsuccessful");

unsuccessful.style.display = "none";

document.addEventListener("DOMContentLoaded", function () {
  tohide.style.display = "none";
});

login.addEventListener("click", function () {
  var uname = window.localStorage.getItem("uname");
  var pass = window.localStorage.getItem("pwd");
  if (username.value === uname && pswd.value === pass) {
    tohide.style.display = "inline";
    loginpg.style.display = "none";
  } else {
    login_text.style.display = "none";
    unsuccessful.style.display = "inline";
  }
});
