// store extension ID in DOM

const div = document.createElement("div");
div.id = "YTD_extID__";
div.dataset.extensionId = chrome.runtime.id;
document.body.appendChild(div);
