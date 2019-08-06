var indicator;

if (document.getElementById("indicatorIcon")) {
   indicator = true;
} else {
   indicator = false;
}

var textSincePreviousParse = "";
var textSincePreviousTick = "";

var tick = setInterval(function() {
   var sender = browser.runtime.sendMessage({flrcReq: "requestStatus"});
   sender.then(handleResponse, function(msg) {
      console.log("error");
      console.log(msg);
   });
}, 1200);

function handleResponse(msg){
   if(msg.flrcActive=="t"){
      monitorText();
   } else if(indicator){
      removeIndicator();
      indicator = false;
   }
}

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

function checkTextForChange(){
   if (document.activeElement.value!=textSincePreviousParse){
      if (document.activeElement.value==textSincePreviousTick) {
         document.getElementById("indicatorIcon").src = browser.runtime.getURL("statusIcons/FLRC_48G.png");
         document.activeElement.value = parseText(document.activeElement.value);
         textSincePreviousParse = document.activeElement.value;
      } else {
         document.getElementById("indicatorIcon").src = browser.runtime.getURL("statusIcons/FLRC_48R.png");
      }
   } else {
      document.getElementById("indicatorIcon").src = browser.runtime.getURL("statusIcons/FLRC_48G.png");
   }
   textSincePreviousTick = document.activeElement.value;
}

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
         retStr += "Х";
         break;
         case 'h':
         retStr += "х";
         break;

         case 'C':
         if (i+1<text.length) {
            if (text[i+1] == "H") {
               retStr += "Ч";
               i++;
            } else {
               retStr += "Ц";
            }
         } else {
            retStr += "Ц";
         }
         break;
         case 'c':
         if (i+1<text.length) {
            if (text[i+1] == "h") {
               retStr += "ч";
               i++;
            } else {
               retStr += "ц";
            }
         } else {
            retStr += "ц";
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

function addIndicator() {
   var pos = document.activeElement.getBoundingClientRect();

   var ind = document.createElement("img");
   ind.id = "indicatorIcon";
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

function removeIndicator(){
   var ind = document.getElementById("indicatorIcon");
   ind.parentNode.removeChild(ind);
}
