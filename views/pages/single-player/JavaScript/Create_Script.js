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

  Functions: {
    OnStartup: function() {
      const customInputs = document.getElementsByClassName("customInput");

      for (const input of customInputs) {
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
    SetCustomInputCursor: function(element) {
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

        input.classList.remove("selected");
      }

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
    },
    WroteInCustomInput: function(element, event) {
      const NextInput = function(element, stopAtEnd) {
        const theNextInput = document.getElementById(element.dataset.nextinput);
        if (LCF.IsType.HTMLElement(theNextInput))
          CreateGame.Functions.SetCustomInputCursor(theNextInput);
        else if (!stopAtEnd)
          CreateGame.Functions.RemoveCustomInputCursor(element);
      }

      const PreviousInput = function(element, stopAtEnd) {
        const thePreviousInput = document.getElementById(element.dataset.previousinput);
        if (LCF.IsType.HTMLElement(thePreviousInput))
          CreateGame.Functions.SetCustomInputCursor(thePreviousInput);
        else if (!stopAtEnd)
          CreateGame.Functions.RemoveCustomInputCursor(element);
      }

      if (+event?.key || +event?.key === 0) { //0 - 9
        element.dataset.text ||= "";

        element.dataset.text += event.key;
        if (element.dataset.maxnumber) {
          const textLength = element.dataset.text.length;
          for (let numberIndex = 0;numberIndex < textLength;numberIndex++) {
            const currentNumber = +element.dataset.text[numberIndex];
            const maxNumber = +element.dataset.maxnumber[numberIndex];

            if (currentNumber < maxNumber)
              break;
            else if (currentNumber > maxNumber) {
              element.dataset.text = element.dataset.text.slice(0, -1);

              return;
            }
          }
        }

        element.innerHTML = element.dataset.text + element.children[0].outerHTML;
        if (element.dataset.text.length >= +element.dataset.maxtext)
          NextInput(element);
      } else if (event?.key === "Backspace") {
        element.dataset.text ||= "";

        element.dataset.text = element.dataset.text.slice(0, -1);
        
        element.innerHTML = element.dataset.text + element.children[0].outerHTML;
      } else if (event?.key === "Enter" || event?.key === "ArrowRight")
        NextInput(element, event?.key === "ArrowRight");
      else if (event?.key === "ArrowLeft")
        PreviousInput(element, true);
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
