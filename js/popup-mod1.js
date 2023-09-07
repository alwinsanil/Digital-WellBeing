storageName = "tabSessions";

function saveNewSession() {
  if ($("#newSessionName").val() !== "") {
    chrome.tabs.query({ currentWindow: true }, function (activeTabs) {
      var sessions = JSON.parse(localStorage.getItem(storageName));
      activeTabs.splice(0, 0, $("#newSessionName").val());//save and arrange  array with new session name
      sessions.push(activeTabs);
      localStorage.setItem(storageName, JSON.stringify(sessions));
      let name = $("#newSessionName").val();
      chrome.notifications.create({//create notification while saving
        type: "basic",
        title: "Saved",
        message: "Your session " + name + " is saved.",
        iconUrl: "assets/icons/icon128.png",
      });
      $("#newSessionName").val("");
      printSessions();
    });
  } else {
    alert("Enter a name for the session.");
    chrome.notifications.create({
      type: "basic",
      title: "Error",
      message: "Please enter a name. ",
      iconUrl: "assets/icons/icon128.png",
    });
  }
  $("#newSessionName").focus();
}

function printSessions() {//display sessions
  if (localStorage.getItem(storageName) === null)
    localStorage.setItem(storageName, JSON.stringify(new Array()));
  try {
    var sessions = JSON.parse(localStorage.getItem(storageName));
  } catch (e) {
    localStorage.setItem(storageName, JSON.stringify(new Array()));
    var sessions = JSON.parse(localStorage.getItem(storageName));
  }
  $("#mid").empty();
  if (sessions.length == 0) {
    $("#mid").append($("<p>").text("You have no saved sessions."));
  } else {
    $("#mid").append($("<p>").text("Your saved sessions:"));
    for (var i = 0; i < sessions.length; i++) {
      $("#mid").append($("<div>").html(getSessionLine(sessions[i], i)));
      $("#loadSession" + i).click({ index: i }, loadSession);
      $("#deleteSession" + i).click({ index: i }, deleteSession);
    }
  }

  function getSessionLine(tabsArray, id) {//
    var output =
      '<div class="seslist"><div class="savedname" >' + tabsArray[0] + "</div>";
    var output =
      output +
      " " +
      '<span class="controls"><button id="deleteSession' +
      id +
      '" class="dlt-btn">Delete</button><button id="loadSession' +
      id +
      '" class="ld-btn">Load</button></span></div>';
    console.log(output);
    return output;
  }
}

function loadSession(event) {//load the sessions
  var session = JSON.parse(localStorage.getItem(storageName))[event.data.index];
  session.splice(0, 1); // Remove title from array
  chrome.tabs.query({ currentWindow: true }, function (activeTabs) {
    var tab;//Active tabs less than saved sessions tabs
    if (session.length >= activeTabs.length) {
      for (tab = 0; tab < activeTabs.length; tab++) {
        chrome.tabs.update(activeTabs[tab].id, { url: session[tab].url });
      }
      for (; tab < session.length; tab++) {
        chrome.tabs.create({ url: session[tab].url, active: false });
      }
      retrieveActiveTab();
    } else {//Active tabs more
      for (tab = 0; tab < session.length; tab++) {
        chrome.tabs.update(activeTabs[tab].id, { url: session[tab].url });
      }
      for (; tab < activeTabs.length; tab++) {
        chrome.tabs.remove(activeTabs[tab].id);
      }
      retrieveActiveTab();
    }
  });

  function retrieveActiveTab() {//while loading, retrieve the same active tab
    chrome.tabs.query({ currentWindow: true }, function (newTabs) {
      var activeId = -1;
      for (var tabId = 0; activeId == -1; tabId++) {
        if (session[tabId].active) activeId = tabId;
      }
      chrome.tabs.update(newTabs[activeId].id, { active: true });
    });
  }
}

function deleteSession(event) {//while clicking on delete button
  var sessions = JSON.parse(localStorage.getItem(storageName));
  sessions.splice(event.data.index, 1);
  localStorage.setItem(storageName, JSON.stringify(sessions));
  printSessions();
  $("#newSessionName").focus();
}

//on submit button clicked.
$(document).ready(function () {
  $("#newSessionForm").on("submit", function (event) {
    event.preventDefault();
    saveNewSession();
  });
  printSessions();
});
