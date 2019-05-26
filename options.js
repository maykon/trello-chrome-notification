function post_configuration(data) {
  const { name, email, showEmail, showNotification } = data.options;
  fetch("https://versions-sg5.herokuapp.com/options", {
    method: "post",
    headers: {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    body: `name=${name}&email=${email}&showEmail=${showEmail}&showNotification=${showNotification}`
  })
    .then(data => {})
    .catch(function(error) {
      update_status_options(error.message, true);
    });
}

function update_status_options(msg, error = false) {
  var status = document.getElementById("status");
  status.textContent = msg;
  if (error) status.className = "msgError";
  setTimeout(function() {
    status.textContent = "";
    status.className = "";
  }, 750);
}

function save_options() {
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let showEmail = document.getElementById("showEmail").checked;
  let showNotification = document.getElementById("showNotification").checked;
  const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!regexEmail.test(email)) {
    update_status_options("E-mail inválido.", true);
    return;
  }
  const options = {
    options: {
      name,
      email,
      showEmail,
      showNotification
    }
  };

  post_configuration(options);
  chrome.storage.sync.set(options, update_status_options("Opções salvas."));
}

function reset_options(e) {
  chrome.storage.sync.clear();
  update_view();
}

function update_view(
  name = "",
  email = "",
  showEmail = "",
  showNotification = ""
) {
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
  document.getElementById("showEmail").checked = showEmail;
  document.getElementById("showNotification").checked = showNotification;
}

function restore_options() {
  chrome.storage.sync.get(["options"], result => {
    if (!result.options) return;
    const { name, email, showEmail, showNotification } = result.options;
    update_view(name, email, showEmail, showNotification);
  });
}
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
document.getElementById("reset").addEventListener("click", reset_options);
