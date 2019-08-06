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
