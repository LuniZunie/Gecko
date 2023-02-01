const CreateGame = {
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
      element.addEventListener("click", function(event) {
        CreateGame.Functions.WroteInCustomInput(this, event);
      });
      element.addEventListener("focusout", function(event) {
        const theNextInput = document.getElementById(this.dataset.nextInput);
        if (LCF.IsType.HTMLElement(theNextInput))
          CreateGame.Functions.SetCustomInputCursor(theNextInput);
        else
          CreateGame.Functions.RemoveCustomInputCursor(this);
      });
    },
    RemoveCustomInputCursor: function(element) {
      if (!element?.classList?.contains("customInput"))
        return;

      const children = element.children;
      for (const child of children)
        child.remove();

      element.classList.remove("selected");
    },
    WroteInCustomInput: function(element, event) {
      if (event?.keyCode >= 48 && event?.keycode <= 57) { //0 - 9
        if (!element.dataset.text)
          element.dataset.text = "";

        element.dataset.text += `"${event.keyCode - 48}"`;

        element.innerHTML = element.children[0].outerHTML + element.dataset.text;
        if (element.dataset.text.length >= Number(element.dataset.maxText))
          NextInput();
      } else if (event?.keyCode == 13) //hit enter
        NextInput();

      const NextInput = function() {
        const theNextInput = document.getElementById(element.dataset.nextInput);
        if (LCF.IsType.HTMLElement(theNextInput))
          this.SetCustomInputCursor(theNextInput);
        else
          this.RemoveCustomInputCursor(element);
      }
    }
  }
};