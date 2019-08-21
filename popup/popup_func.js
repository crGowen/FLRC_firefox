var isActive = false;

var sender = browser.runtime.sendMessage({flrcReq: "requestStatus"});
sender.then(function (msg) {setStatus(msg.flrcActive=="t");}, function() {console.log("FLRC: Send Error");});

// communication with background, get the current ON/OFF status from the background.js
function getStatus() {
   var indicator = document.getElementById("statusIndicator");
   if (isActive) {
      indicator.style.backgroundColor = "#0f0";
      indicator.style.filter = "drop-shadow(0 0 0.3rem #0f0)";
      indicator.getElementsByTagName("h1")[0].innerText = "ON";
   } else {
      indicator.style.backgroundColor = "#f00";
      indicator.style.filter = "drop-shadow(0 0 0.3rem #f00)";
      indicator.getElementsByTagName("h1")[0].innerText = "OFF";
   }
}

// communication with background, SET the current ON/OFF status to the background.js
function setStatus(inputStatus){
   isActive = inputStatus;
   getStatus();
}

// call this when the user mouse clicks the ON/OFF button
function toggleStatus() {
   if (isActive) {
      setStatus(false);
      browser.runtime.sendMessage({flrcUpdate: "f"});
   } else {
      setStatus(true);
      browser.runtime.sendMessage({flrcUpdate: "t"});
   }
}

document.getElementById("statusIndicator").addEventListener("click", toggleStatus);
getStatus();
