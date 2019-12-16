// the background.js has basically one job: communication bridge between the user setting the ON/OFF button in the popup window and the extension functionality...
// (e.g. user sets the extension to OFF or ON in the popup window) - background.js here provides a simple interface for the status to be communicated to instances of the FLRC running in tabs


var bgActive = false;

function handleMsg(msg, sender, sendResponse) {
   if (msg.flrcReq) {
      if (bgActive) {
         sendResponse({flrcActive: "t"});
      } else {
         sendResponse({flrcActive: "f"});
      }
   }

   if (msg.flrcUpdate) {
      bgActive = (msg.flrcUpdate=="t");
   }
}
browser.runtime.onMessage.addListener(handleMsg);

browser.commands.onCommand.addListener(function (command) {
   if (command === "toggle-FLRC") {
      bgActive = !bgActive;
   }
});
