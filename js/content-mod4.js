if (typeof browser === "undefined") {
  browser = typeof chrome !== "undefined" ? chrome : null;
}

// Some global constants.
const HTML = document.documentElement;
const SETTINGS_LIST = {
  auto_skip_ads: { defaultValue: false, eventType: "change" },
  remove_entire_sidebar: { defaultValue: false, eventType: "change" },
  remove_comments: { defaultValue: false, eventType: "change" },
};

// Initialize HTML attributes with local settings, or default.
const cache = {};
try {
  browser.storage.local.get((localSettings) => {
    Object.entries(SETTINGS_LIST).forEach(([key, { defaultValue }]) => {
      HTML.setAttribute(key, localSettings[key] ?? defaultValue);
      cache[key] = localSettings[key] ?? defaultValue;
    });
  });
} catch (e) {
  console.log(e);
}
//   receive messages from popup-mod4.js
browser.runtime.onMessage.addListener((data, sender) => {
  const { settingChanges, urlChange } = data;
  if (settingChanges) {
    settingChanges.forEach(({ key, value }) => {
      HTML.setAttribute(key, value);
      cache[key] = value;
    });
  }

  return true;
});
let counter = 0,
  hyper = false,
  originalPlayback;
document.addEventListener("DOMContentLoaded", (event) => {
  const observer = new MutationObserver((mutations) => {
    // Give the browser time to breathe
    if (counter++ % 2 === 0) return;

    // Skip through ads
    if (cache["auto_skip_ads"] === true) {
      // Close overlay ads.
      Array.from(
        document.querySelectorAll(".ytp-ad-overlay-close-button")
      )?.forEach((e) => e?.click());

      // Click on "Skip ad" button
      const skippableAd = document.querySelectorAll(
        ".ytp-ad-skip-button"
      ).length;
      if (skippableAd) {
        document.querySelectorAll(".ytp-ad-skip-button")?.[0]?.click();
        return;
      }

      // Speed through ads that can't be skipped (yet).
      const adElement = document.querySelectorAll(
        ".video-ads.ytp-ad-module"
      )[0];
      const adActive =
        adElement && window.getComputedStyle(adElement).display !== "none";
      if (adActive) {
        if (!hyper) {
          originalPlayback =
            document.getElementsByTagName("video")[0].playbackRate;
          hyper = true;
        }
        document.getElementsByTagName("video")[0].playbackRate = 5;
      } else {
        if (hyper) {
          document.getElementsByTagName("video")[0].playbackRate =
            originalPlayback;
          hyper = false;
        }
      }
    }
  });
  observer.observe(document.body, { subtree: true, childList: true });
});
