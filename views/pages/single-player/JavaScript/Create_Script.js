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

  Functions: {
    SetCustomInputCursor: function(element) {
      if (!element?.classList?.contains("customInput"))
        return;

      if (CreateGame.hasKeyPressEvent)
        window.removeEventListener("keypress", this.CheckKeyPressValid);
      else
        CreateGame.hasKeyPressEvent = true;

      if (CreateGame.hasFocusEvent)
        window.removeEventListener("focusout", this.CheckFocusOutValid);
      else
        CreateGame.hasFocusEvent = true;

      CreateGame.selectedCustomInput = element;

      const inputs = document.getElementsByClassName("customInput");
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
      window.addEventListener("keypress", this.CheckKeyPressValid);
      element.addEventListener("focusout", this.CheckFocusOutValid);
    },
    RemoveCustomInputCursor: function(element) {
      if (!element?.classList?.contains("customInput"))
        return;

      if (CreateGame.hasKeyPressEvent)
        window.removeEventListener("keypress", this.CheckKeyPressValid);
        
      CreateGame.hasKeyPressEvent = false;
      if (CreateGame.hasFocusEvent)
        window.removeEventListener("focusout", this.CheckFocusOutValid);
        
      CreateGame.hasFocusEvent = false;
      CreateGame.selectedCustomInput = null;

      const children = element.children;
      for (const child of children)
        child.remove();

      element.classList.remove("selected");
    },
    WroteInCustomInput: function(element, event) {
      const NextInput = function(element) {
        const theNextInput = document.getElementById(element.dataset.nextinput);
        if (LCF.IsType.HTMLElement(theNextInput))
          CreateGame.Functions.SetCustomInputCursor(theNextInput);
        else
          CreateGame.Functions.RemoveCustomInputCursor(element);
      }

      if (event?.keyCode >= 48 && event?.keyCode <= 57) { //0 - 9
        if (!element.dataset.text)
          element.dataset.text = "";

        element.dataset.text += event.keyCode - 48;

        element.innerHTML = element.dataset.text + element.children[0].outerHTML;
        if (element.dataset.text.length >= Number(element.dataset.maxtext))
          NextInput(element);
      } else if (event?.keyCode == 13) //hit enter
        NextInput(element);
    },
    CheckKeyPressValid: function(event) {
      if (LCF.IsType.HTMLElement(CreateGame.selectedCustomInput))
        CreateGame.Functions.WroteInCustomInput(CreateGame.selectedCustomInput, event);
    },
    CheckFocusOutValid: function(event) {
      if (LCF.IsType.HTMLElement(CreateGame.selectedCustomInput) && event.target === CreateGame.selectedCustomInput) {
          const theNextInput = document.getElementById(this.dataset.nextInput);
        if (LCF.IsType.HTMLElement(theNextInput))
          CreateGame.Functions.SetCustomInputCursor(theNextInput);
        else
          CreateGame.Functions.RemoveCustomInputCursor(this);
      }
    }
  }
};
