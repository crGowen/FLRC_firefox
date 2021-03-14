// the background.js has basically one job: communication bridge between the user setting the ON/OFF button in the popup window and the extension functionality...
// (e.g. user sets the extension to OFF or ON in the popup window) - background.js here provides a simple interface for the status to be communicated to instances of the FLRC running in tabs

class FlrcBackground {
   static handleMsg(msg, sender, sendResponse) {

      if (msg.flrcReq) {
         var pendingUpdate = "f";
         var isActive = "f";
         
         if (FlrcBackground.pendingTranslitTableUpdate) {
            pendingUpdate = "t";
            FlrcBackground.pendingTranslitTableUpdate = false;
         }

         if (FlrcBackground.bgActive) {
            isActive = "t";
         }

         sendResponse({flrcActive: isActive, pendingTranslitUpdate: pendingUpdate});
      }
      
      if (msg.flrcUpdate) {
         FlrcBackground.bgActive = (msg.flrcUpdate=="t");
      }

      if (msg.translitTableUpdate) {
         FlrcBackground.pendingTranslitTableUpdate = (msg.translitTableUpdate=="update");
      }
   }

   static init() {
      FlrcBackground.bgActive = false;

      FlrcBackground.pendingTranslitTableUpdate = false;

      browser.runtime.onMessage.addListener(FlrcBackground.handleMsg);

      browser.commands.onCommand.addListener((command) => {
         if (command === "toggle-FLRC") {
            FlrcBackground.bgActive = !FlrcBackground.bgActive;
         }
      });

   }
}

FlrcBackground.init();
