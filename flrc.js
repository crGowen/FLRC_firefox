class Flrc {
   // a "tick" is just a 1.2 second interval, once per tick get the status of the extension (communication with background) and deal with the response in handleResponse(msg) function
   static tickInterval() {
      Flrc.sender = browser.runtime.sendMessage({flrcReq: "requestStatus"});
      Flrc.sender.then(Flrc.handleResponse, (msg) => console.error(`error: ${msg}`));
      Flrc.tick = setTimeout(Flrc.tickInterval, 1200);
   }

   // function for communication with the background, in short it checks if the user has the extension set to ON or OFF in the popup
   static handleResponse(msg) {
      if(msg.flrcActive=="t"){
         Flrc.monitorText();
      } else if(Flrc.indicator){
         Flrc.removeIndicator();
      }

      if(msg.pendingTranslitUpdate=="t") {
         // check storage for existing table
      var storageRequest = browser.storage.local.get();
      storageRequest.then(data => {
         if (data.transliterations) {
            Flrc.translitTable = data.transliterations;
         } else {
            console.log("FLRC cannot find update, resetting to default");
            Flrc.setDefaultTranslitTable();
         }
      },
         msg => {console.error(msg);});
         Flrc.textSincePreviousParse = "";
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
         if (document.activeElement.type=="text" || document.activeElement.type=="search") {
            Flrc.addIndicator();
            Flrc.checkTextForChange();
            return;
         }
      } else if (document.activeElement.nodeName=="TEXTAREA" || document.activeElement.contentEditable == "true") {
         Flrc.addIndicator();
         Flrc.checkTextForChange();
         return;
      }
      else {
         Flrc.removeIndicator();
      }
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
      if (text.length > Flrc.charLim) {
         window.alert(`For performance reasons, FLRC will not parse texts longer than ${Flrc.charLim} characters.`);
         return text;
      }

      let retStr = "";
      let replacingStr;
      let pattern;

      for (let i = 0; i < text.length; i++) {
         replacingStr = text[i];

         for (let j = 0; j < Flrc.translitTable.length; j++) {
            if (text.length - i >= Flrc.translitTable[j].from.length) {
               // fits within length, so try to match
               pattern = text.substr(i, Flrc.translitTable[j].from.length);

               if (pattern === Flrc.translitTable[j].from) {
                  replacingStr = Flrc.translitTable[j].toLower;
                  i += Flrc.translitTable[j].from.length - 1;
                  break;
               } else if (pattern === Flrc.translitTable[j].from.toUpperCase()) {
                  replacingStr = Flrc.translitTable[j].toUpper;
                  i += Flrc.translitTable[j].from.length - 1;
                  break;
               }
            }
         }

         retStr += replacingStr;
      }

   return retStr;
   }

   static init() {
      console.log("FLRC init");
      Flrc.textSincePreviousParse = "";
      Flrc.textSincePreviousTick = "";
      Flrc.charLim = 12000;

      // check storage for existing table
      var storageRequest = browser.storage.local.get();
      storageRequest.then(data => {
         if (data.transliterations) {
            Flrc.translitTable = data.transliterations;
            Flrc.finaliseInit();
         } else {
            console.log("FLRC set to default transliterations");
            Flrc.setDefaultTranslitTable();
            Flrc.finaliseInit();
         }
      },
         msg => {console.error(msg);});
   }

   static finaliseInit() {
      // check if there is an existing indicator icon
      if (document.getElementById("flrcIndicatorIcon")) {
         Flrc.indicator = true;
      } else {
         Flrc.indicator = false;
      }

      Flrc.tickInterval();
   }
   
   static setDefaultTranslitTable() {
      // note that, to avoid unicode-related issues, the correct version of each character should be used
      // (e.g. the cyrillic 'a' is from a from a different unicode block as a regular 'a' but looks exactly the same)
      Flrc.translitTable = [
         {from: "sch", toUpper: "Щ", toLower: "щ"},
         {from: "sh", toUpper: "Ш", toLower: "ш"},

         {from: "ye", toUpper: "Е", toLower: "е"},
         {from: "yo", toUpper: "Ё", toLower: "ё"},
         {from: "yu", toUpper: "Ю", toLower: "ю"},
         {from: "ya", toUpper: "Я", toLower: "я"},

         {from: "je", toUpper: "Е", toLower: "е"},
         {from: "jo", toUpper: "Ё", toLower: "ё"},
         {from: "ju", toUpper: "Ю", toLower: "ю"},
         {from: "ja", toUpper: "Я", toLower: "я"},

         {from: "ch", toUpper: "Ч", toLower: "ч"},
         {from: "zh", toUpper: "Ж", toLower: "ж"},
         {from: "ts", toUpper: "Ц", toLower: "ц"},
         {from: "ee", toUpper: "И", toLower: "и"},

         {from: "'i", toUpper: "Ы", toLower: "ы"},
         {from: "#e", toUpper: "Э", toLower: "э"},

         {from: "##", toUpper: "Ъ", toLower: "Ъ"},
         {from: "''", toUpper: "Ь", toLower: "Ь"},
         {from: "#", toUpper: "ъ", toLower: "ъ"},
         {from: "'", toUpper: "ь", toLower: "ь"},

         {from: "a", toUpper: "А", toLower: "а"},
         {from: "b", toUpper: "Б", toLower: "б"},
         {from: "v", toUpper: "В", toLower: "в"},
         {from: "g", toUpper: "Г", toLower: "г"},
         {from: "d", toUpper: "Д", toLower: "д"},
         {from: "y", toUpper: "Й", toLower: "й"},
         {from: "j", toUpper: "Й", toLower: "й"},

         {from: "z", toUpper: "З", toLower: "з"},
         {from: "e", toUpper: "Е", toLower: "е"},

         {from: "k", toUpper: "К", toLower: "к"},
         {from: "c", toUpper: "К", toLower: "к"},

         {from: "l", toUpper: "Л", toLower: "л"},
         {from: "m", toUpper: "М", toLower: "м"},
         {from: "n", toUpper: "Н", toLower: "н"},
         {from: "o", toUpper: "О", toLower: "о"},
         {from: "p", toUpper: "П", toLower: "п"},
         {from: "r", toUpper: "Р", toLower: "р"},
         {from: "s", toUpper: "С", toLower: "с"},
         {from: "t", toUpper: "Т", toLower: "т"},
         {from: "u", toUpper: "У", toLower: "у"},
         {from: "f", toUpper: "Ф", toLower: "ф"},
         {from: "i", toUpper: "И", toLower: "и"},
         {from: "h", toUpper: "Х", toLower: "х"}
      ];

      /*
      // tests, check for implicit type conversions too! ONLY PERFORM IF DEFAULT TRANSLIT
      var testTable = [
         {"input": "Pozhaluysta", "correctOutput": "Пожалуйста"},
         {"input": "poZhaluytsa", "correctOutput": "поЗхалуйца"},
         {"input": "korotsky", "correctOutput": "короцкй"},
         {"input": "skiy", "correctOutput": "ский"},
         {"input": "skij", "correctOutput": "ский"},
         {"input": "xolos1", "correctOutput": "xолос1"},
         {"input": "kost", "correctOutput": "кост"},
         {"input": "dmitri", "correctOutput": "дмитри"},
         {"input": "Dostoyevskiy", "correctOutput": "Достоевский"},
         {"input": "v'it#eb", "correctOutput": "вытэб"},
         {"input": "True", "correctOutput": "Труе"},
         {"input": "False", "correctOutput": "Фалсе"},
         {"input": "null", "correctOutput": "нулл"},
         {"input": "{}", "correctOutput": "{}"},
         {"input": "", "correctOutput": ""},
         {"input": "12", "correctOutput": "12"},
         {"input": "undefined", "correctOutput": "ундефинед"}
      ];

      var testsCompletedNoErrors = true;
      testTable.forEach(test => {
         if (Flrc.parseText(test.input) !== test.correctOutput) {
            console.error(`Failed test:\n\tINPUT = ${test.input}\n\tOUT = ${Flrc.parseText(test.input)}\n\tEXPECTED = ${test.correctOutput}`);
            testsCompletedNoErrors = false;
         }
      });

      if (testsCompletedNoErrors)  {
         console.log("Tests completed. No errors!");
         browser.storage.local.set({transliterations: Flrc.translitTable});
      }
      // end of tests
      */

   }
}

Flrc.init();