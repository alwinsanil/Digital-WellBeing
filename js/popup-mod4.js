if (typeof browser === "undefined") {
  browser = typeof chrome !== "undefined" ? chrome : null;
}

// Some global constants.
const HTML = document.documentElement;
const SETTINGS_LIST = {
  auto_skip_ads: { defaultValue: false, eventType: "click" },
  remove_entire_sidebar: { defaultValue: false, eventType: "click" },
  remove_comments: { defaultValue: false, eventType: "click" },
};
const VALID_SETTINGS = Object.keys(SETTINGS_LIST);

// Load the options menu with our settings.
document.addEventListener("DOMContentLoaded", () => {
  // Defaults.
  Object.entries(SETTINGS_LIST).forEach(([key, { defaultValue: value }]) => {
    const settingButton = document.getElementById(key);
    if (settingButton) settingButton.checked = value;
    HTML.setAttribute(key, value);
    const button = document.getElementById(key);
    if (button && "checked" in button) button.checked = value;
  });

  // Sync with local settings.
  browser &&
    browser.storage.local.get((localSettings) => {
      Object.entries(localSettings).forEach(([key, value]) => {
        if (!VALID_SETTINGS.includes(key)) return;
        HTML.setAttribute(key, value);
        const button = document.getElementById(key);
        if (button && "checked" in button) button.checked = value;
      });
    });
});

// Change settings with the menu.
Object.entries(SETTINGS_LIST).forEach(([key, { eventType }]) => {
  const settingElements = Array.from(document.getElementsByClassName(key));
  settingElements.forEach((button) =>
    button.addEventListener(eventType, async (e) => {
      // Toggle on click: new value is opposite of old value.
      const value = !(String(HTML.getAttribute(key)).toLowerCase() === "true");

      // Communicate changes (to local settings, content-script.js, etc.)
      let saveObj = { [key]: value };

      // Update options page.
      Object.entries(saveObj).forEach(([key, value]) =>
        HTML.setAttribute(key, value)
      );
      if ("checked" in button) button.checked = value;

      if (browser) {
        // Update local storage.
        browser.storage.local.set(saveObj);
        const messageObj = Object.entries(saveObj).map(([key, value]) => {
          return { key, value };
        });

        // Update running tabs.
        if (messageObj) {
          browser.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              browser.tabs.sendMessage(tab.id, { settingChanges: messageObj });
            });
          });
        }
      }
    })
  );
});
