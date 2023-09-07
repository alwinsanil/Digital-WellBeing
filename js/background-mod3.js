// Interval (in seconds) to update timer
var UPDATE_INTERVAL = 3;
// Types to view data
var TYPE = {
  today: "today",
  average: "average",
  all: "all",
  limit: 86400,
};
// Current viewing mode
var mode = TYPE.today;

setDefaults();
// Set default settings
function setDefaults() {
  // Set username and password
  if (!window.localStorage.getItem("uname")) {
    window.localStorage.setItem("uname", "admin");
  }
  if (!window.localStorage.getItem("pwd")) {
    window.localStorage.setItem("pwd", "123");
  }
  //set blacklist
  if (!localStorage["blacklist"]) {
    localStorage["blacklist"] = JSON.stringify(["example.com"]);
  }
  //set restrictionlist and time
  if (!localStorage["restrictionlist"]) {
    localStorage["restrictionlist"] = JSON.stringify(["example.com"]);
  }
  if (!localStorage["restrictiontime"]) {
    localStorage["restrictiontime"] = JSON.stringify(["00:00:00"]);
  }
  // Set number of days Web Timer has been used
  if (!localStorage["num_days"]) {
    localStorage["num_days"] = 1;
  }
  // Set date
  if (!localStorage["date"]) {
    localStorage["date"] = new Date().toLocaleDateString();
  }
  // Set domains seen before
  if (!localStorage["domains"]) {
    localStorage["domains"] = JSON.stringify({});
  }
  // Set total time spent
  if (!localStorage["total"]) {
    localStorage["total"] = JSON.stringify({
      today: 0,
      all: 0,
    });
  }
  // Limit how many sites the chart shows
  if (!localStorage["chart_limit"]) {
    localStorage["chart_limit"] = 7;
  }

  if (!localStorage["pwd"]) {
    localStorage["pwd"] = JSON.stringify(["pswd"]);
  }
  // Set "other" category
  // NOTE: other.today is not currently used
  if (!localStorage["other"]) {
    localStorage["other"] = JSON.stringify({
      today: 0,
      all: 0,
    });
  }
}

// Add sites which are not in the top threshold sites to "other" category
function combineEntries(threshold) {
  var domains = JSON.parse(localStorage["domains"]);
  var other = JSON.parse(localStorage["other"]);
  if (Object.keys(domains).length <= threshold) {
    return;
  }
  // Sort the domains by decreasing "all" time
  var data = [];
  for (var domain in domains) {
    var domain_data = JSON.parse(localStorage[domain]);
    data.push({
      domain: domain,
      all: domain_data.all,
    });
  }
  data.sort(function (a, b) {
    return b.all - a.all;
  });
  // Delete data after top threshold and add it to other
  for (var i = threshold; i < data.length; i++) {
    other.all += data[i].all;
    var domain = data[i].domain;
    delete localStorage[domain];
    delete domains[domain];
  }
  localStorage["other"] = JSON.stringify(other);
  localStorage["domains"] = JSON.stringify(domains);
}

// Check to make sure data is kept for the same day
function checkDate() {
  var todayStr = new Date().toLocaleDateString();
  var saved_day = localStorage["date"];
  if (saved_day !== todayStr) {
    // Reset today's data
    var domains = JSON.parse(localStorage["domains"]);
    for (var domain in domains) {
      var domain_data = JSON.parse(localStorage[domain]);
      domain_data.today = 0;
      localStorage[domain] = JSON.stringify(domain_data);
    }
    // Reset total for today
    var total = JSON.parse(localStorage["total"]);
    total.today = 0;
    localStorage["total"] = JSON.stringify(total);
    // Combine entries that are not part of top 500 sites
    combineEntries(500);
    // Keep track of number of days web timer has been used
    localStorage["num_days"] = parseInt(localStorage["num_days"]) + 1;
    // Update date
    localStorage["date"] = todayStr;
  }
}

// Extract the domain from the url
function extractDomain(url) {
  var re = /:\/\/(www\.)?(.+?)\//;
  return url.match(re)[2];
}

//check if url in blacklist
function inBlacklist(url) {
  if (!url.match(/^http/)) {
    return true;
  }
  var blacklist = JSON.parse(localStorage["blacklist"]);
  for (var i = 0; i < blacklist.length; i++) {
    if (url.match(blacklist[i])) {
      return true;
    }
  }
  return false;
}

//check if url in restrictionlist
function inRestrictlist(url) {
  if (!url.match(/^http/)) {
    return true;
  }
  var restrictionlist = JSON.parse(localStorage["restrictionlist"]);
  for (var i = 0; i < restrictionlist.length; i++) {
    if (url.match(restrictionlist[i])) {
      return i;
    }
  }
  return -1;
}

// Update the data
function updateData() {
  // Only count time if system has not been idle for 30 seconds
  chrome.idle.queryState(30, function (state) {
    if (state === "active") {
      // Select single active tab from focused window
      chrome.tabs.query(
        { lastFocusedWindow: true, active: true },
        function (tabs) {
          if (tabs.length === 0) {
            return;
          }
          var tab = tabs[0];
          // Make sure 'today' is up-to-date
          checkDate();
          if (!inBlacklist(tab.url)) {
            var domain = extractDomain(tab.url);
            // Add domain to domain list if not already present
            var domains = JSON.parse(localStorage["domains"]);
            if (!(domain in domains)) {
              domains[domain] = 1;
              localStorage["domains"] = JSON.stringify(domains);
            }
            var domain_data;
            if (localStorage[domain]) {
              domain_data = JSON.parse(localStorage[domain]);
            } else {
              domain_data = {
                today: 0,
                all: 0,
                limit: 86000,
              };
            }
            if (inRestrictlist(tab.url) != -1) {
              var restime = JSON.parse(localStorage["restrictiontime"]);
              var domno = inRestrictlist(tab.url);
              if (domain_data.today >= restime[domno])
                chrome.tabs.update(undefined, { url: "blocked.html" });
            }
            domain_data.today += UPDATE_INTERVAL;
            domain_data.all += UPDATE_INTERVAL;
            localStorage[domain] = JSON.stringify(domain_data);
            // Update total time
            var total = JSON.parse(localStorage["total"]);
            total.today += UPDATE_INTERVAL;
            total.all += UPDATE_INTERVAL;
            localStorage["total"] = JSON.stringify(total);
            // Update badge with number of minutes spent on
            // current site
            var num_min = Math.floor(domain_data.today / 60).toString();
          }
        }
      );
    }
  });
}
// Update timer data every UPDATE_INTERVAL seconds
setInterval(updateData, UPDATE_INTERVAL * 1000);
