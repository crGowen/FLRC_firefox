class Flrc {
   // a "tick" is just a 1.2 second interval, once per tick get the status of the extension (communication with background) and deal with the response in handleResponse(msg) function
   static tickInterval() {
      Flrc.sender = browser.runtime.sendMessage({flrcReq: "requestStatus"});
      Flrc.sender.then(Flrc.handleResponse, (msg) => console.error(msg));
      Flrc.tick = setTimeout(Flrc.tickInterval, 1200);
   }

   // function for communication with the background, in short it checks if the user has the extension set to ON or OFF in the popup
   static handleResponse(msg) {
      if(msg.flrcActive=="t"){
         Flrc.monitorText();
      } else if(Flrc.indicator){
         Flrc.removeIndicator();
      }
   }

   // add the indicator icon the textbox
   static addIndicator() {
      if (Flrc.indicator) return;

      var pos = document.activeElement.getBoundingClientRect();   
      var ind = document.createElement("img");

      ind.id = "flrcIndicatorIcon";
      ind.style.display = "block";
      ind.style.position = "absolute";
      ind.style.top = pos.top + 5 + window.scrollY + "px";
      ind.style.left = pos.right - 20 + window.scrollX + "px";
      ind.style.width = "15px";
      ind.style.height = "15px";
      ind.style.borderRadius = "2px";
      ind.style.zIndex = 900000000;
      ind.style.opacity = 0.4;
   
      document.body.appendChild(ind);

      Flrc.indicator = true;
   }

   // remove the indicator icon the textbox
   static removeIndicator(){
      if (!Flrc.indicator) return;

      var ind = document.getElementById("flrcIndicatorIcon");
      ind.parentNode.removeChild(ind);

      Flrc.indicator = false;
   }

   // each tick, if the user background reports the extension is active, and if the current active element in the DOM is a valid text field,
   // then the indicator icon should be displayed in the top-right of the text field, and call the function checkTextForChange()
   static monitorText(){
      if (document.activeElement.nodeName=="BODY") {
         Flrc.removeIndicator();
         return;
      }

      if (document.activeElement.nodeName=="INPUT") {
         if (document.activeElement.type!="text" && document.activeElement.type!="search") {
            Flrc.removeIndicator();
            return;
         }
      } else if (document.activeElement.nodeName!="TEXTAREA" && !document.activeElement.contentEditable == "true") {
         Flrc.removeIndicator();
         return;
      }
      
      Flrc.addIndicator();
      Flrc.checkTextForChange();
   }

   static updateText() {
      if (document.activeElement.nodeName=="TEXTAREA" || document.activeElement.nodeName=="INPUT") {
         document.activeElement.value = Flrc.parseText(document.activeElement.value);
      } else {
         document.activeElement.innerText = Flrc.parseText(document.activeElement.innerText);
      }
   }

   static getText() {
      if (document.activeElement.nodeName=="TEXTAREA" || document.activeElement.nodeName=="INPUT") {
         return document.activeElement.value;
      } else {
         return document.activeElement.innerText;
      }
   }

   // if the text has changed since the previous parse, but the text has not changed since the last two ticks (indicating the user has typed out some characters and now paused) then parse the text
   // if the text has changed since the previous parse, as well as changed since the last tick (indicating the user is currently typing out some characters), set the indicator to orange and do nothing else
   // in short: do NOT intrude on the user while they are typing, wait for them to pause before parsing the text to Russian characters
   static checkTextForChange() {
      if (Flrc.getText()!=Flrc.textSincePreviousParse){
         if (Flrc.getText()==Flrc.textSincePreviousTick) {
            document.getElementById("flrcIndicatorIcon").src = browser.runtime.getURL("statusIcons/FLRC_48G.png");
            Flrc.updateText();
            Flrc.textSincePreviousParse = Flrc.getText();
            let evt = new Event("input", {"bubbles":true, "cancelable":true});
            setTimeout(()=>document.activeElement.dispatchEvent(evt), 200);
         } else {
            document.getElementById("flrcIndicatorIcon").src = browser.runtime.getURL("statusIcons/FLRC_48R.png");
         }
      } else {
         document.getElementById("flrcIndicatorIcon").src = browser.runtime.getURL("statusIcons/FLRC_48G.png");
      }

      Flrc.textSincePreviousTick = Flrc.getText();
   }

   // parse latin characters to russian characters based on their phonetic
   static parseText(text) {
      var retStr = "";

   var i;
   for (i = 0; i < text.length; i++) {
      switch(text[i]) {
         case 'A':
         retStr += "А";
         break;
         case 'a':
         retStr += "а";
         break;

         case 'B':
         retStr += "Б";
         break;
         case 'b':
         retStr += "б";
         break;

         case 'V':
         retStr += "В";
         break;
         case 'v':
         retStr += "в";
         break;

         case 'G':
         retStr += "Г";
         break;
         case 'g':
         retStr += "г";
         break;

         case 'D':
         retStr += "Д";
         break;
         case 'd':
         retStr += "д";
         break;

         case 'Y':
         case 'J':
         if (i+1<text.length) {
            if (text[i+1] == 'E') {
               retStr += "Е";
               i++;
            } else if (text[i+1] == 'O'){
               retStr += "Ё";
               i++;
            } else if (text[i+1] == 'U'){
               retStr += "Ю";
               i++;
            } else if (text[i+1] == 'A'){
               retStr += "Я";
               i++;
            } else {
               retStr += "Й";
            }
         } else {
            retStr += "Й";
         }
         break;
         case 'y':
         case 'j':
         if (i+1<text.length) {
            if (text[i+1] == 'e') {
               retStr += "е";
               i++;
            } else if (text[i+1] == 'o'){
               retStr += "ё";
               i++;
            } else if (text[i+1] == 'u'){
               retStr += "ю";
               i++;
            } else if (text[i+1] == 'a'){
               retStr += "я";
               i++;
            } else {
               retStr += "й";
            }
         } else {
            retStr += "й";
         }
         break;

         case 'Z':
         if (i+1<text.length) {
            if (text[i+1] == "H") {
               retStr += "Ж";
               i++;
            } else {
               retStr += "З";
            }
         } else {
            retStr += "З";
         }
         break;
         case 'z':
         if (i+1<text.length) {
            if (text[i+1] == 'h') {
               retStr += "ж";
               i++;
            } else {
               retStr += "з";
            }
         } else {
            retStr += "з";
         }
         break;

         case 'E':
         if (i+1<text.length) {
            if (text[i+1] == "E") {
               retStr += "И";
               i++;
            } else {
               retStr += "Е";
            }
         } else {
            retStr += "Е";
         }
         break;
         case 'e':
         if (i+1<text.length) {
            if (text[i+1] == 'e') {
               retStr += "и";
               i++;
            } else {
               retStr += "е";
            }
         } else {
            retStr += "е";
         }
         break;

         case 'K':
            retStr += "К";
         break;
         case 'k':
            retStr += "к";
         break;

         case 'L':
         retStr += "Л";
         break;
         case 'l':
         retStr += "л";
         break;

         case 'M':
         retStr += "М";
         break;
         case 'm':
         retStr += "м";
         break;

         case 'N':
         retStr += "Н";
         break;
         case 'n':
         retStr += "н";
         break;

         case 'O':
         retStr += "О";
         break;
         case 'o':
         retStr += "о";
         break;

         case 'P':
         retStr += "П";
         break;
         case 'p':
         retStr += "п";
         break;

         case 'R':
         retStr += "Р";
         break;
         case 'r':
         retStr += "р";
         break;

         case 'S':
         if (i+2<text.length) {
            if (text[i+1] == "C" && text[i+2] == "H") {
               retStr += "Щ";
               i += 2;
            } else if (text[i+1] == "H") {
               retStr += "Ш";
               i++;
            } else {
               retStr += "С";
            }
         } else if (i+1<text.length) {
            if (text[i+1] == "H") {
               retStr += "Ш";
               i++;
            } else {
               retStr += "С";
            }
         } else {
            retStr += "С";
         }
         break;
         case 's':
         if (i+2<text.length) {
            if (text[i+1] == "c" && text[i+2] == "h") {
               retStr += "щ";
               i += 2;
            } else if (text[i+1] == "h") {
               retStr += "ш";
               i++;
            } else {
               retStr += "с";
            }
         } else if (i+1<text.length) {
            if (text[i+1] == "h") {
               retStr += "ш";
               i++;
            } else {
               retStr += "с";
            }
         } else {
            retStr += "с";
         }
         break;


         case 'T':
         if (i+1<text.length) {
            if (text[i+1] == "S") {
               retStr += "Ц";
               i++;
            } else {
               retStr += "Т";
            }
         } else {
            retStr += "Т";
         }
         break;
         case 't':
         if (i+1<text.length) {
            if (text[i+1] == 's') {
               retStr += "ц";
               i++;
            } else {
               retStr += "т";
            }
         } else {
            retStr += "т";
         }
         break;

         case 'U':
         retStr += "У";
         break;
         case 'u':
         retStr += "у";
         break;

         case 'F':
         retStr += "Ф";
         break;
         case 'f':
         retStr += "ф";
         break;

         case 'H':
         case 'X':
         retStr += "Х";
         break;
         case 'h':
         case 'x':
         retStr += "х";
         break;

         case 'C':
         if (i+1<text.length) {
            if (text[i+1] == "H") {
               retStr += "Ч";
               i++;
            } else {
               retStr += "К";
            }
         } else {
            retStr += "К";
         }
         break;
         case 'c':
         if (i+1<text.length) {
            if (text[i+1] == "h") {
               retStr += "ч";
               i++;
            } else {
               retStr += "к";
            }
         } else {
            retStr += "к";
         }
         break;

         case 'I':
         retStr += "И";
         break;
         case 'i':
         retStr += "и";
         break;

         case '\'':
         if (i+1<text.length) {
            if (text[i+1] == "\'") {
               retStr += "Ь";
               i++;
            } else if (text[i+1] == "I") {
               retStr += "Ы";
               i++;
            } else if (text[i+1] == "i") {
               retStr += "ы";
               i++;
            } else {
               retStr += "ь";
            }
         } else {
            retStr += "ь";
         }
         break;

         case '#':
         if (i+1<text.length) {
            if (text[i+1] == "#") {
               retStr += "Ъ";
               i++;
            } else if (text[i+1] == "E") {
               retStr += "Э";
               i++;
            } else if (text[i+1] == "e") {
               retStr += "э";
               i++;
            } else {
               retStr += "ъ";
            }
         } else {
            retStr += "ъ";
         }
         break;

         default:
         retStr += text[i];
      }
   }
   return retStr;
   }

   static init() {
      Flrc.textSincePreviousParse = "";
      Flrc.textSincePreviousTick = "";

      // check if there is an existing indicator icon
      if (document.getElementById("flrcIndicatorIcon")) {
         Flrc.indicator = true;
      } else {
         Flrc.indicator = false;
      }

      Flrc.tickInterval();
   }
}

Flrc.init();