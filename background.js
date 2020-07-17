// the background.js has basically one job: communication bridge between the user setting the ON/OFF button in the popup window and the extension functionality...
// (e.g. user sets the extension to OFF or ON in the popup window) - background.js here provides a simple interface for the status to be communicated to instances of the FLRC running in tabs

class FlrcBackground {
   static handleMsg(msg, sender, sendResponse) {
      if (msg.flrcReq) {
         if (FlrcBackground.bgActive) {
            sendResponse({flrcActive: "t"});
         } else {
            sendResponse({flrcActive: "f"});
         }
      }

      if (msg.flrcUpdate) {
         FlrcBackground.bgActive = (msg.flrcUpdate=="t");
      }
   }

   static init() {
      FlrcBackground.bgActive = false;

      browser.runtime.onMessage.addListener(FlrcBackground.handleMsg);

      browser.commands.onCommand.addListener((command) => {
         if (command === "toggle-FLRC") {
            FlrcBackground.bgActive = !FlrcBackground.bgActive;
         }
      });

   }
}

FlrcBackground.init();
