// store extension ID in DOM

function insertExtensionId() {
  if (!document.body) {
    setTimeout(insertExtensionId);

    return;
  }

  const div = document.createElement("div");
  div.id = "YTD_extID__";
  div.dataset.extensionId = chrome.runtime.id;
  document.body.appendChild(div);
}

// Start the loop
insertExtensionId();
