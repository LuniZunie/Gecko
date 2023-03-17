const CreateGame = {
  selectedCustomInput: null,
  hasKeyPressEvent: false,
  hasFocusEvent: false,
  
  timeDetails: {
    white: {
      startTime: 600000, //5 minutes - 300000
      increment: 1000 //1 second
    },
    black: {
      startTime: 600000, //5 minutes - 300000
      increment: 1000 //1 second
    }
  },

  customInputClasses: {},

  CustomPosition: {
    Position: [
      [`1x2.0`, `1x4`, `1x3`, `1x1`, `1x0.0`, `1x3`, `1x4`, `1x2.0`],
      [`1x5.0`, `1x5.0`, `1x5.0`, `1x5.0`, `1x5.0`, `1x5.0`, `1x5.0`, `1x5.0`],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [`0x5.0`, `0x5.0`, `0x5.0`, `0x5.0`, `0x5.0`, `0x5.0`, `0x5.0`, `0x5.0`],
      [`0x2.0`, `0x4`, `0x3`, `0x1`, `0x0.0`, `0x3`, `0x4`, `0x2.0`]
    ],
  },

  Functions: {
    OnStartup: function() {
      const customInputs = document.getElementsByClassName("customInput");

      for (const input of customInputs) {
        const currentText = (input.children[0]) ? input.innerHTML.replace(input.children[0].outerHTML, "") : input.innerHTML;
        if (currentText.length)
          input.dataset.text = currentText;
        else if (input.dataset.placeholder)
          input.innerHTML = input.dataset.placeholder + ((input.children[0]) ? input.children[0].outerHTML : "");

        const inputClass = input.dataset.custominputclass;

        CreateGame.customInputClasses[inputClass] ||= [];

        const row = input.dataset.row;
        const column = input.dataset.column;

        if (!CreateGame.customInputClasses[inputClass][row]) {
          const newArray = [];
          newArray[column] = input;

          CreateGame.customInputClasses[inputClass][row] = newArray;
        } else
          CreateGame.customInputClasses[inputClass][row][column] = input;
      }
    },
    OnSubmit: async function() {
      const selectedValue = CreateGame.selectedCustomInput.innerHTML;

      this.SetCustomInputCursor(CreateGame.selectedCustomInput, true);

      if (selectedValue !== CreateGame.selectedCustomInput.innerHTML)
        return;

      this.RemoveCustomInputCursor(CreateGame.selectedCustomInput);

      let whiteMinute = document.getElementById("WhiteTimerMinuteInput").innerHTML;
      let whiteSecond = document.getElementById("WhiteTimerSecondInput").innerHTML;
      let whiteIncrement = document.getElementById("WhiteTimerIncrementInput").innerHTML;

      let blackMinute = document.getElementById("BlackTimerMinuteInput").innerHTML;
      let blackSecond = document.getElementById("BlackTimerSecondInput").innerHTML;
      let blackIncrement = document.getElementById("BlackTimerIncrementInput").innerHTML;

      if (!whiteMinute || whiteMinute === "--")
        whiteMinute = 0;
      if (!whiteSecond || whiteSecond === "--")
        whiteSecond = 0;
      if (!whiteIncrement || whiteIncrement === "--")
        whiteIncrement = 0;

      if (!blackMinute || blackMinute === "--")
        blackMinute = 0;
      if (!blackSecond || blackSecond === "--")
        blackSecond = 0;
      if (!blackIncrement || blackIncrement === "--")
        blackIncrement = 0;

      CreateGame.timeDetails.white.startTime = +whiteMinute * 60000 + +whiteSecond * 1000;
      CreateGame.timeDetails.white.increment = +whiteIncrement * 1000;

      CreateGame.timeDetails.black.startTime = +blackMinute * 60000 + +blackSecond * 1000;
      CreateGame.timeDetails.black.increment = +blackIncrement * 1000;

      LCF.Page.FadeOut();
      await LCF.Sleep(250);

      document.getElementById("CreatePage").style.opacity = 0;
      document.getElementById("CreatePage").hidden = true;
      document.body.style.opacity = 0;

      document.getElementById("GamePage").style.opacity = 1;
      document.getElementById("GamePage").hidden = false;

      window.history.replaceState("SinglePlayer", "Single Player", "/singleplayer/play");

      Chess.timeDetails = structuredClone(CreateGame.timeDetails);
      Chess.StartPosition = structuredClone(CreateGame.CustomPosition.Position);
      OnLoad();
    },
    SetCustomInputCursor: function(element, noZero = false) {
      if (!element?.classList?.contains("customNumberInput"))
        return;

      if (CreateGame.hasKeyPressEvent)
        window.removeEventListener("keypress", this.CheckKeyPressValid);
      else
        CreateGame.hasKeyPressEvent = true;

      if (CreateGame.hasClickEvent)
        window.removeEventListener("click", this.CheckClickValid);
      else
        CreateGame.hasClickEvent = true;

      CreateGame.selectedCustomInput = element;

      const inputs = document.getElementsByClassName("customNumberInput");
      for (const input of inputs) {
        const children = input.children;
        for (const child of children)
          child.remove();

        if (!input.dataset.text && input.dataset.placeholder)
          input.innerHTML = input.dataset.placeholder;
        else {
          if (input.dataset.maxnumber && input.dataset.minnumber) {
            if (+input.dataset.text > input.dataset.maxnumber || +input.dataset.text < input.dataset.minnumber) {
              LCF.Window.Alert("Error", `<b>Number must be between ${input.dataset.minnumber} and ${input.dataset.maxnumber} (inclusive)</b>`, {background:"#333333",title:"red",message:"red"}, "3%", "0.25%", "top", 2000);

              if (input.dataset.lastvalidnumber)
                input.dataset.text = input.dataset.lastvalidnumber;
              else if (input.dataset.placeholder) {
                input.dataset.text = "";
                input.innerHTML = input.dataset.placeholder;

                continue;
              } else {
                input.dataset.text = "";
                input.innerHTML = "--";

                continue;
              }
            } else
              input.dataset.lastvalidnumber = input.dataset.text;
          } else if (input.dataset.maxnumber) {
            if (+input.dataset.text > input.dataset.maxnumber) {
              LCF.Window.Alert("Error", `<b>Number can not be greater than ${input.dataset.maxnumber}</b>`, {background:"#333333",title:"red",message:"red"}, "3%", "0.25%", "top", 2000);

              if (input.dataset.lastvalidnumber)
                input.dataset.text = input.dataset.lastvalidnumber;
              else if (input.dataset.placeholder) {
                input.dataset.text = "";
                input.innerHTML = input.dataset.placeholder;

                continue;
              } else {
                input.dataset.text = "";
                input.innerHTML = "--";

                continue;
              }
            } else
              input.dataset.lastvalidnumber = input.dataset.text;
          } else if (input.dataset.minnumber) {
            if (+input.dataset.text < input.dataset.minnumber) {
              LCF.Window.Alert("Error", `<b>Number can not be less than ${input.dataset.minnumber}</b>`, {background:"#333333",title:"red",message:"red"}, "3%", "0.25%", "top", 2000);

              if (input.dataset.lastvalidnumber)
                input.dataset.text = input.dataset.lastvalidnumber;
              else if (input.dataset.placeholder) {
                input.dataset.text = "";
                input.innerHTML = input.dataset.placeholder;

                continue;
              } else {
                input.dataset.text = "";
                input.innerHTML = "--";

                continue;
              }
            } else
              input.dataset.lastvalidnumber = input.dataset.text;
          }

          if (!noZero) {
            const lengthDiffrence = +input.dataset.maxtext - input.dataset.text.length;
            if (lengthDiffrence > 0)
              for (let index = 0;index < lengthDiffrence;index++)
                input.dataset.text = `0${input.dataset.text}`;
          }

          input.innerHTML = input.dataset.text;
        }

        input.classList.remove("selected");
      }

      if (!element.dataset.text && element.innerHTML.length)
        element.innerHTML = "";

      const cursor = document.createElement("DIV");
      cursor.classList.add("cursor", "no-select");
      element.appendChild(cursor);

      element.classList.add("selected");
      element.focus();
      window.addEventListener("keydown", this.CheckKeyPressValid);
      window.addEventListener("click", this.CheckClickValid);
    },
    RemoveCustomInputCursor: function(element) {
      if (!element?.classList?.contains("customNumberInput"))
        return;

      if (CreateGame.hasKeyPressEvent)
        window.removeEventListener("keydown", this.CheckKeyPressValid);
        
      CreateGame.hasKeyPressEvent = false;
      CreateGame.selectedCustomInput = null;

      const children = element.children;
      for (const child of children)
        child.remove();

      element.classList.remove("selected");

      if (!element.dataset.text && element.dataset.placeholder)
        element.innerHTML = element.dataset.placeholder;
    },
    WroteInCustomInput: function(element, event) {
      const NextInput = function(element) {
        let newInput;

        if (CreateGame.customInputClasses[element.dataset.custominputclass][element.dataset.row].length > +element.dataset.column + 1)
          newInput = CreateGame.customInputClasses[element.dataset.custominputclass][element.dataset.row][+element.dataset.column + 1];
        else if (CreateGame.customInputClasses[element.dataset.custominputclass].length > +element.dataset.row + 1)
          newInput = CreateGame.customInputClasses[element.dataset.custominputclass][+element.dataset.row + 1][0];

        if (LCF.IsType.HTMLElement(newInput))
          CreateGame.Functions.SetCustomInputCursor(newInput);
      }
      const InputRight = function(element, event) {
        if (!event?.ctrlKey && element.children[0]) {
          const cursorSplit = element.innerHTML.split(element.children[0].outerHTML);
          if (cursorSplit[1].length > 0) {
            const cutLetter = cursorSplit[1].slice(0, 1);
            element.innerHTML = cursorSplit[0] + cutLetter + element.children[0].outerHTML + cursorSplit[1].slice(1, cursorSplit[1].length);

            return;
          }
        }

        const newInput = CreateGame.customInputClasses[element.dataset.custominputclass][element.dataset.row][+element.dataset.column + 1];
        if (LCF.IsType.HTMLElement(newInput))
          CreateGame.Functions.SetCustomInputCursor(newInput);
      }
      const InputLeft = function(element, event) {
        if (!event?.ctrlKey && element.children[0]) {
          const cursorSplit = element.innerHTML.split(element.children[0].outerHTML);
          if (cursorSplit[0].length > 0) {
            const cutLetter = cursorSplit[0].slice(-1);
            element.innerHTML = cursorSplit[0].slice(0, cursorSplit[0].length - 1) + element.children[0].outerHTML + cutLetter + cursorSplit[1];

            return;
          }
        }

        const newInput = CreateGame.customInputClasses[element.dataset.custominputclass][element.dataset.row][+element.dataset.column - 1];
        if (LCF.IsType.HTMLElement(newInput))
          CreateGame.Functions.SetCustomInputCursor(newInput);
      }
      const InputUp = function(element, event) {
        if (+element.dataset.row > 0) {
          const newInput = CreateGame.customInputClasses[element.dataset.custominputclass][+element.dataset.row - 1][+element.dataset.column];
          if (LCF.IsType.HTMLElement(newInput))
            CreateGame.Functions.SetCustomInputCursor(newInput);
        }
      }

      const InputDown = function(element, event) {
        if (+element.dataset.row + 1 < CreateGame.customInputClasses[element.dataset.custominputclass].length) {
          const newInput = CreateGame.customInputClasses[element.dataset.custominputclass][+element.dataset.row + 1][+element.dataset.column];
          if (LCF.IsType.HTMLElement(newInput))
            CreateGame.Functions.SetCustomInputCursor(newInput);
        }
      }

      if (+event?.key || +event?.key === 0) { //0 - 9
        element.dataset.text ||= "";

        if (element.dataset.text.length >= +element.dataset.maxtext)
          return;

        if (element.children[0]) {
          const cursorSplit = element.innerHTML.split(element.children[0].outerHTML);
          if (!cursorSplit[1].length)
            element.dataset.text += event.key;
          else
            element.dataset.text = cursorSplit[0] + event?.key + element.children[0].outerHTML + cursorSplit[1];
        } else
          element.dataset.text += event.key;

        element.innerHTML = element.dataset.text + ((element.dataset.text.includes(element.children[0].outerHTML)) ? "" : element.children[0].outerHTML);

        element.dataset.text = element.dataset.text.replace(element.children[0].outerHTML, "");
      } else if (event?.key === "Backspace" || event?.key === "Delete") {
        const key = (event?.altKey) ? ["Backspace", "Delete"][1 - ["Backspace", "Delete"].indexOf(event?.key)] : event?.key;
        if (key === "Backspace") {
          element.dataset.text ||= "";

          if (!event?.ctrlKey && element.children[0]) {
            const cursorSplit = element.innerHTML.split(element.children[0].outerHTML);
            if (cursorSplit[0].length > 0)
              element.dataset.text = cursorSplit[0].slice(0, cursorSplit[0].length - 1) + element.children[0].outerHTML + cursorSplit[1];
            else
              return;
          } else if (event?.ctrlKey)
            element.dataset.text = "";
          else
            element.dataset.text = element.dataset.text.slice(0, -1);
        
          element.innerHTML = element.dataset.text + ((element.dataset.text.includes(element.children[0].outerHTML)) ? "" : element.children[0].outerHTML);

          element.dataset.text = element.dataset.text.replace(element.children[0].outerHTML, "");
        } else if (key === "Delete") {
          element.dataset.text ||= "";

          if (!event?.ctrlKey && element.children[0]) {
            const cursorSplit = element.innerHTML.split(element.children[0].outerHTML);
            if (cursorSplit[1].length > 0)
              element.dataset.text = cursorSplit[0] + element.children[0].outerHTML + cursorSplit[1].slice(1, cursorSplit[1].length);
            else
              return;
          } else if (event?.ctrlKey)
            element.dataset.text = "";
          else
            element.dataset.text = element.dataset.text.slice(1, element.dataset.text.length);
        
          element.innerHTML = element.dataset.text + ((element.dataset.text.includes(element.children[0].outerHTML)) ? "" : element.children[0].outerHTML);

          element.dataset.text = element.dataset.text.replace(element.children[0].outerHTML, "");
        }
      } else if (event?.key === "Enter")
        NextInput(element);
      else if (event?.key.includes("Arrow"))
        eval(`Input${event?.key.replace("Arrow","")}(element, event);`);
    },
    CheckKeyPressValid: function(event) {
      if (LCF.IsType.HTMLElement(CreateGame.selectedCustomInput))
        CreateGame.Functions.WroteInCustomInput(CreateGame.selectedCustomInput, event);
    },
    CheckClickValid: function(event) {
      if (event.target !== CreateGame.selectedCustomInput) {
        if (event?.target?.classList?.contains("customNumberInput"))
          CreateGame.Functions.SetCustomInputCursor(event.target);
        else
          CreateGame.Functions.RemoveCustomInputCursor(CreateGame.selectedCustomInput);
      }
    }
  }
};
