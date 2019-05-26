const changeEmptyVersion = (msg = "") => {
  document.getElementById("status").innerHTML = msg;
};

const insertVersions = data => {
  changeEmptyVersion("<h1>Nenhuma versão agendada até o momento.</h1>");
  if (!data) return;
  if (!data.length) return;
  changeEmptyVersion();
  let versions = "<ul>";
  data.forEach(version => {
    versions += `<li id="${version.id}">${version.text}</li>`;
  });
  versions += "</ul>";
  changeVersionContent(versions);
};

const loadVersion = () => {
  fetch("https://versions-sg5.herokuapp.com/versions").then(response => {
    response.json().then(data => {
      chrome.storage.sync.set({ versions: data }, () => {
        insertVersions(data);
      });
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["versions"], result => {
    if (!result.versions) {
      loadVersion();
      return;
    }
    insertVersions(result.versions);
  });
});

const changeVersionContent = versions => {
  document.getElementById("versions").innerHTML = versions;
};

const onStorageChanged = (changes, namespace) => {
  if (changes.versions) {
    insertVersions(changes.versions);
  } else {
  }
};

chrome.runtime.onMessage.addListener(msg => {
  if (!msg.versions) return;
  insertVersions(msg.versions);
});

chrome.storage.onChanged.addListener(onStorageChanged);
