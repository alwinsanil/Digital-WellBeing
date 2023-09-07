var bg = chrome.extension.getBackgroundPage();

// Saves options to localStorage.
function save_options() {
  // Save blacklist domains
  var blackListEl = document.getElementById("blacklist");
  var blacklist_domains = blackListEl.value.split(/\r?\n/);
  var blacklist = [];
  // Get rid of empty lines
  for (var i = 0; i < blacklist_domains.length; i++) {
    var domain = blacklist_domains[i];
    if (domain) {
      blacklist.push(domain);
    }
  }
  blackListEl.value = blacklist.join("\n");
  localStorage["blacklist"] = JSON.stringify(blacklist);

  // Remove data for sites that have been added to the blacklist
  var domains = JSON.parse(localStorage["domains"]);
  for (var domain in domains) {
    for (var i = 0; i < blacklist.length; i++) {
      if (domain.match(blacklist[i])) {
        // Remove data for any domain on the blacklist
        delete domains[domain];
        delete localStorage[domain];
        localStorage["domains"] = JSON.stringify(domains);
      }
    }
  }

  function timetosecs(times) {
    var a = times.split(":");
    var sum = 0;
    sum = parseInt(a[0]) * 3600 + parseInt(a[1]) * 60 + parseInt(a[2]);
    if (sum > 86400) return 86400;
    return sum;
  }

  //Save Restricted Domains
  var restrictionlist1 = document.getElementById("restrictionlist");
  var restrictionlist_domains = restrictionlist1.value.split(/\r?\n/);
  var restrictiontime1 = document.getElementById("restrictiontime");
  var restrictiontimes = restrictiontime1.value.split(/\r?\n/);
  var restrictiontime = [];
  var restrictionlist = [];
  for (var i = 0; i < restrictiontimes.length; i++) {
    var times = restrictiontimes[i];
    if (times) {
      var secs = timetosecs(times);
      var seconds = secs.toString();
      restrictiontime.push(seconds);
    }
  }
  // Get rid of empty lines
  for (var i = 0; i < restrictionlist_domains.length; i++) {
    var domain = restrictionlist_domains[i];
    if (domain) {
      restrictionlist.push(domain);
    }
  }
  restrictionlist1.value = restrictionlist.join("\n");
  localStorage["restrictionlist"] = JSON.stringify(restrictionlist);
  localStorage["restrictiontime"] = JSON.stringify(restrictiontime);
  var times = JSON.parse(localStorage["restrictiontime"]);
  var restrictiontimel = document.getElementById("restrictiontime");
  var restrictiontime = [];
  for (var i = 0; i < times.length; i++) {
    var n = times[i];
    var m = secstotime(n);
    restrictiontime.push(m);
  }
  restrictiontimel.value = restrictiontime.join("\n");

  // Check limit data
  var limit_data = document.getElementById("chart_limit");
  var limit = parseInt(limit_data.value);
  if (limit) {
    localStorage["chart_limit"] = limit;
    limit_data.value = limit;
  } else {
    limit_data.value = localStorage["chart_limit"];
  }

  const uname = document.getElementById("username");
  if (uname) {
    localStorage["uname"] = uname.value;
    uname.value = localStorage["uname"];
  } else {
    uname.value = localStorage["uname"];
  }

  const pass = document.getElementById("passwd");
  if (pass) {
    localStorage["pwd"] = pass.value;
    pass.value = localStorage["pwd"];
  } else {
    pass.value = localStorage["pwd"];
  }

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "<div class='options-saved' >Options Saved.</div>";
  status.className = "success";
  setTimeout(function () {
    status.innerHTML = "";
    status.className = "";
  }, 750);
}

function secstotime(times) {
  var a = parseInt(times);
  var h = 0;
  var m = 0;
  while (a > 0) {
    if (a >= 3600) {
      a -= 3600;
      h += 1;
    } else if (a >= 60) {
      a -= 60;
      m += 1;
    } else break;
  }
  var hr = h.toString();
  var mt = m.toString();
  var s = a.toString();
  var res = hr.concat(":", mt, ":", s);
  return res;
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var blacklist = JSON.parse(localStorage["blacklist"]);
  var blackListEl = document.getElementById("blacklist");
  blackListEl.value = blacklist.join("\n");
  var restrictionlist = JSON.parse(localStorage["restrictionlist"]);
  var restrictionlistl = document.getElementById("restrictionlist");
  restrictionlistl.value = restrictionlist.join("\n");
  var times = JSON.parse(localStorage["restrictiontime"]);
  var restrictiontimel = document.getElementById("restrictiontime");
  var restrictiontime = [];
  for (var i = 0; i < times.length; i++) {
    var n = times[i];
    var m = secstotime(n);
    restrictiontime.push(m);
  }
  restrictiontimel.value = restrictiontime.join("\n");
  var limitEl = document.getElementById("chart_limit");
  limitEl.value = localStorage["chart_limit"];

  var uname1 = window.localStorage.getItem("uname");
  var uname = document.getElementById("username");
  uname.value = uname1;
  var uname1 = window.localStorage.getItem("pwd");
  var uname = document.getElementById("passwd");
  uname.value = uname1;
}

// Clear all data except for blacklist
function clearData() {
  // Clear everything except for blacklist
  var blacklist = localStorage["blacklist"];
  localStorage.clear();
  localStorage["blacklist"] = blacklist;
  bg.setDefaults();
  location.reload();
}

document.addEventListener("DOMContentLoaded", function () {
  // Restore options
  restore_options();

  // Set handlers for option descriptions
  document
    .querySelector("#save-button")
    .addEventListener("click", save_options);
  document.querySelector("#clear-data").addEventListener("click", clearData);
  var rows = document.querySelectorAll("tr");
});
