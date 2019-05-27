chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { schemes: ["http", "https"] }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});

let socket = io.connect("https://versions-sg5.herokuapp.com");
socket.on("versions", function(data) {
  updateVersion(data);
  validateShowNotification(data);
});

socket.on("reset", function(data) {
  chrome.storage.sync.clear(() => {
    chrome.storage.sync.set({ versions: data });
    chrome.runtime.sendMessage({ versions: data });
  });
});

const updateVersion = data => {
  chrome.storage.sync.get(["versions"], result => {
    if (!result.versions) {
      chrome.storage.sync.set({ versions: data });
      return;
    }
    let newVersions = result.versions;
    const ids = newVersions.map(version => version.id);
    data.forEach(version => {
      let isUpdated = ids.includes(version.id);
      if (!isUpdated) {
        newVersions.push(version);
      } else {
        let index = ids.indexOf(version.id);
        newVersions[index] = version;
      }
    });
    chrome.storage.sync.set({ versions: newVersions });
    chrome.runtime.sendMessage({ versions: newVersions });
  });
};

const dateOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
  timeZone: "UTC"
};

const validateShowNotification = data => {
  chrome.storage.sync.get(["options"], result => {
    if (!result.options) return;
    if (!result.options.showNotification) return;
    showNotificationVersion(data);
  });
};

const showNotificationVersion = versions => {
  if (!versions) return;
  if (!versions.length) return;

  let options = {
    type: "list",
    title: "Versões SG5",
    message: "Houve uma alteração nas versões agendadas.",
    iconUrl: "images/icon_128.png",
    items: []
  };

  versions.forEach(version => {
    options.items.push({
      title: version.name,
      message: version.text
    });
  });

  chrome.notifications.clear("VersionsSG5", () => {
    chrome.notifications.create("VersionsSG5", options);
  });
};

const onNotificationClick = () => {
  chrome.tabs.create({ url: "https://trello.com/b/Vv8R8xWZ/vers%C3%B5es-sg5" });
};

chrome.notifications.onClicked.addListener(onNotificationClick);

const onPingServer = alarm => {
  if (alarm.name !== "VersionsSG5") return;
  fetch("https://versions-sg5.herokuapp.com/health").then(response => {
    response.json().then(data => {
      chrome.storage.sync.set({ health: data });
    });
  });
};

chrome.alarms.onAlarm.addListener(onPingServer);
chrome.alarms.create("VersionsSG5", { periodInMinutes: 30 });
