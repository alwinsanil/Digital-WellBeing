//Loading background here
bg = chrome.extension.getBackgroundPage();
var fl = 1; //For block button
function startstop() {
  //inputting time
  hours = parseInt(document.getElementById("hh").value);
  if (isNaN(hours)) hours = 0;
  minutes = parseInt(document.getElementById("mm").value);
  if (isNaN(minutes)) minutes = 0;
  seconds = parseInt(document.getElementById("ss").value);
  if (isNaN(seconds)) seconds = 0;
  //time to seconds
  newtimelimit = 60 * 60 * hours + 60 * minutes + seconds;
  starttime = new Date();
  starttime = starttime.getTime();
  starttime = (starttime / 1000) | 0;
  chrome.storage.local.set({ starttime: starttime, timelimit: newtimelimit });
  if (bg.started == 1) {
    bg.clearalarm();
    $("#start").removeClass("red").addClass("green").text("Start");
    $("#pause").removeClass("green").addClass("not-active");
    clearInterval(newInterval);
  } else {
    // turn on
    if (newtimelimit > 0) {
      bg.setalarm(newtimelimit * 1000);
      $("#start").text("Pause").removeClass("green").addClass("red");
      $("#pause").removeClass("not-active").addClass("green");
      chrome.contentSettings["notifications"].set({
        primaryPattern: "<all_urls>",
        setting: "block",
      });
      startcounter();
    }
  }
}

function stop() {
  bg.clearalarm();
  clearInterval(newInterval);
  console.log(window.localStorage.getItem("diff"));
  chrome.contentSettings["notifications"].clear({});
  chrome.storage.local.set({ timelimit: 0 });
  $("#start").removeClass("red").addClass("green").text("Start");
  $("#pause").removeClass("green").addClass("not-active");
  document.getElementById("hh").value = "00";
  document.getElementById("mm").value = "00";
  document.getElementById("ss").value = "00";
}

function startcounter() {
  chrome.storage.local.get(["timelimit", "starttime"], function (result) {
    currenttime = new Date();
    currenttime = currenttime.getTime();
    currenttime = (currenttime / 1000) | 0;
    timeleft = result.timelimit - (currenttime - result.starttime);
    document.getElementById("hh").value = (
      "0" +
      ((timeleft / 60 / 60) | 0)
    ).slice(-2);
    document.getElementById("mm").value = (
      "0" +
      ((timeleft / 60) % 60 | 0)
    ).slice(-2);
    document.getElementById("ss").value = ("0" + (timeleft % 60)).slice(-2);
    newInterval = setInterval(function () {
      currenttime = new Date();
      currenttime = currenttime.getTime();
      currenttime = (currenttime / 1000) | 0;
      timeleft = result.timelimit - (currenttime - result.starttime);
      document.getElementById("hh").value = (
        "0" +
        ((timeleft / 60 / 60) | 0)
      ).slice(-2);
      document.getElementById("mm").value = (
        "0" +
        ((timeleft / 60) % 60 | 0)
      ).slice(-2);
      document.getElementById("ss").value = ("0" + (timeleft % 60)).slice(-2);
      if (timeleft < 1) {
        clearInterval(newInterval);
        document.getElementById("hh").value = "00";
        document.getElementById("mm").value = "00";
        document.getElementById("ss").value = "00";
        chrome.contentSettings["notifications"].clear({});
        $("#start").removeClass("red").addClass("green").text("Start");
        $("#pause").removeClass("green").addClass("not-active");
      }
    }, 1000);
  });
}
if (!window.localStorage.getItem("toggle")) {
  window.localStorage.setItem("toggle", fl);
}
document.addEventListener("DOMContentLoaded", function () {
  chrome.contentSettings["notifications"].clear({});
  const c = document.getElementById("always_on");
  c.addEventListener("click", function () {
    console.log("btn clicked");
    var t = window.localStorage.getItem("toggle");
    console.log(t);
    if (t == 1) {
      console.log("if");
      chrome.contentSettings["notifications"].set({
        primaryPattern: "<all_urls>",
        setting: "block",
      });
      c.value = "Unblock";

      t = 0;
      window.localStorage.setItem("toggle", t);
      console.log(t);
    } else if (t == 0) {
      console.log("else");
      chrome.contentSettings["notifications"].clear({});
      t = 1;
      window.localStorage.setItem("toggle", t);
      c.value = "Block";
    }
  });
  document.getElementById("start").addEventListener("click", startstop);
  document.getElementById("pause").addEventListener("click", stop);
  if (bg.started == 1) {
    $("#start").text("Pause").removeClass("green").addClass("red");
    $("#pause").removeClass("not-active").addClass("green");
    running = true;
    chrome.contentSettings["notifications"].set({
      primaryPattern: "<all_urls>",
      setting: "block",
    });

    startcounter();
  } else {
    $("#start").removeClass("red").addClass("green").text("Start");
    $("#pause").removeClass("green").addClass("not-active");
    running = false;
    chrome.storage.local.get({ timelimit: 0 }, function (result) {
      document.getElementById("hh").value = (
        "0" +
        ((result.timelimit / 60 / 60) | 0)
      ).slice(-2);
      document.getElementById("mm").value = (
        "0" +
        ((result.timelimit / 60) % 60 | 0)
      ).slice(-2);
      document.getElementById("ss").value = (
        "0" +
        (result.timelimit % 60)
      ).slice(-2);
    });
  }
});
