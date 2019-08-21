var indicator;

// check if there is an existing indicator icon
if (document.getElementById("flrcIndicatorIcon")) {
   indicator = true;
} else {
   indicator = false;
}

var textSincePreviousParse = "";
var textSincePreviousTick = "";

// a "tick" is just a 1.2 second interval, once per tick get the status of the extension (communication with background) and deal with the response in handleResponse(msg) function
var tick = setInterval(function() {
   var sender = browser.runtime.sendMessage({flrcReq: "requestStatus"});
   sender.then(handleResponse, function(msg) {
      console.log("error");
      console.log(msg);
   });
}, 1200);

// function for communication with the background, in short it checks if the user has the extension set to ON or OFF in the popup
function handleResponse(msg){
   if(msg.flrcActive=="t"){
      monitorText();
   } else if(indicator){
      removeIndicator();
      indicator = false;
   }
}

// each tick, if the user background reports the extension is active, and if the current active element in the DOM is a valid text field,
// then the indicator icon should be displayed in the top-right of the text field, and call the function checkTextForChange()
function monitorText(){
   if(document.activeElement.nodeName=="INPUT") {
      if (document.activeElement.type=="text") {
         if (!indicator) {
            addIndicator();
         }
         checkTextForChange();
         indicator = true;
      } else {
         if(indicator) {
            removeIndicator();
         }
         indicator = false;
      }
   } else if (document.activeElement.nodeName=="TEXTAREA") {
      if (!indicator) {
         addIndicator();
      }
      checkTextForChange();
      indicator = true;
   } else {
      if(indicator) {
         removeIndicator();
      }
      indicator = false;
   }
}

// if the text has changed since the previous parse, but the text has not changed since the last two ticks (indicating the user has typed out some characters and now paused) then parse the text
// if the text has changed since the previous parse, as well as changed since the last tick (indicating the user is currently typing out some characters), set the indicator to orange and do nothing else
// in short: do NOT intrude on the user while they are typing, wait for them to pause before parsing the text to Russian characters
function checkTextForChange(){
   if (document.activeElement.value!=textSincePreviousParse){
      if (document.activeElement.value==textSincePreviousTick) {
         document.getElementById("flrcIndicatorIcon").src = browser.runtime.getURL("statusIcons/FLRC_48G.png");
         document.activeElement.value = parseText(document.activeElement.value);
         textSincePreviousParse = document.activeElement.value;
      } else {
         document.getElementById("flrcIndicatorIcon").src = browser.runtime.getURL("statusIcons/FLRC_48R.png");
      }
   } else {
      document.getElementById("flrcIndicatorIcon").src = browser.runtime.getURL("statusIcons/FLRC_48G.png");
   }
   textSincePreviousTick = document.activeElement.value;
}

// parse latin characters to russian characters based on their phonetic
function parseText(text) {
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
               retStr += "Э";
            }
         } else {
            retStr += "Э";
         }
         break;
         case 'e':
         if (i+1<text.length) {
            if (text[i+1] == 'e') {
               retStr += "и";
               i++;
            } else {
               retStr += "э";
            }
         } else {
            retStr += "э";
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
               retStr += "C";
            }
         } else {
            retStr += "C";
         }
         break;
         case 'c':
         if (i+1<text.length) {
            if (text[i+1] == "h") {
               retStr += "ч";
               i++;
            } else {
               retStr += "с";
            }
         } else {
            retStr += "с";
         }
         break;

         case 'I':
         retStr += "Ы";
         break;
         case 'i':
         retStr += "ы";
         break;

         case '\'':
         if (i+1<text.length) {
            if (text[i+1] == "\'") {
               retStr += "Ь";
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

// add the indicator icon the textbox
function addIndicator() {
   var pos = document.activeElement.getBoundingClientRect();

   var ind = document.createElement("img");
   ind.id = "flrcIndicatorIcon";
   ind.style.display = "block";
   ind.style.position = "absolute";
   ind.style.top = pos.top + 5 + "px";
   ind.style.left = pos.right - 20 + "px";
   ind.style.width = "15px";
   ind.style.height = "15px";
   ind.style.borderRadius = "2px";
   ind.style.zIndex = 800;
   ind.style.opacity = 0.4;

   document.body.appendChild(ind);
}

// remove the indicator icon the textbox
function removeIndicator(){
   var ind = document.getElementById("flrcIndicatorIcon");
   ind.parentNode.removeChild(ind);
}
