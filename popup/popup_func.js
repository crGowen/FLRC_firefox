class FlrcPopup {
   static init() {
      FlrcPopup.isActive = false;

      FlrcPopup.sender = browser.runtime.sendMessage({flrcReq: "requestStatus"});
      FlrcPopup.sender.then((msg) => FlrcPopup.setStatus(msg.flrcActive=="t"), () => console.error("FLRC: Send Error"));

      document.getElementById("statusIndicator").addEventListener("click", FlrcPopup.toggleStatus);
   }

   static getStatus() {
      var indicator = document.getElementById("statusIndicator");
      if (FlrcPopup.isActive) {
         indicator.style.backgroundColor = "#0f0";
         indicator.style.filter = "drop-shadow(0 0 0.3rem #0f0)";
         indicator.getElementsByTagName("h1")[0].innerText = "ON";
      } else {
         indicator.style.backgroundColor = "#f00";
         indicator.style.filter = "drop-shadow(0 0 0.3rem #f00)";
         indicator.getElementsByTagName("h1")[0].innerText = "OFF";
      }
   }

   static setStatus(status) {
      FlrcPopup.isActive = status;
      FlrcPopup.getStatus();
   }

   static toggleStatus() {
      if (FlrcPopup.isActive) {
         FlrcPopup.setStatus(false);
         browser.runtime.sendMessage({flrcUpdate: "f"});
      } else {
         FlrcPopup.setStatus(true);
         browser.runtime.sendMessage({flrcUpdate: "t"});
      }
   }
}

FlrcPopup.init();
