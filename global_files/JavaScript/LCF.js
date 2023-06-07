/*
TODO:
Fix secondary spelling functions not returning correct function name in error
*/

const LCF = { //LuniZunie's Custom Functions
  Startup: () => {
    if (LCF.data.update.start) {
      LCF.data.update.start = false;
      LCF.data.update.running = true;

      LCF.data.update.interval = setInterval(LCF.Update.update, LCF.data.update.speed);
    }

    if (!LCF.data.type.allSupported)
      Object.entries(LCF.data.type.allSupported).forEach(([key, value]) => LCF.data.type.supported.concat([key], value));
  },
  Update: {
    update: () => {
      //British Spelling Change
      if (LCF.options.britishReturnValues !== lastBritishSpellingState) {
        if (LCF.options.britishReturnValues)
          LCF.data.type.function_return.CSS_Color = "css_colour";
        else
          LCF.data.type.function_return.CSS_Color = "css_color";

        lastBritishSpellingState = LCF.options.britishReturnValues;
      }

      //Update Custom Function
      const customFunctions = Object.values(LCF.data.update.customFunctions);
      customFunctions.forEach(customFunction => {
        if (LCF.Type.Function(customFunction))
          customFunction();
        else
          delete LCF.data.update.customFunctions[thisFunction.name];
      });

      //Update Text Fit Elements
      const textFitElements = Object.entries(LCF.data.update.textFitElements);
      textFitElements.forEach(([key, textFitElement]) => {
        const element = textFitElement.element;
        const padding = textFitElement.padding;
        if (LCF.Type.HTML_Element(element)) {
          const originalHiddenValue = element.hidden,
                originalDisplayValue = element.style.display;

          element.hidden &&= false;
          element.style.display = (element.style.display === "none") ? "block" : element.style.display;

          const fontSize = element.clientHeight - padding.vertical * 2,
                maxTextWidth = LCF.Element.GetTextWidth(element.innerHTML, element.style.fontFamily ?? "'Times New Roman', serif", `${fontSize}px`) + padding.horizontal * 2;

          element.style.fontFamily ??= "'Times New Roman', serif";

          const textWidthRatio = element.clientWidth / maxTextWidth;
          element.style.fontSize = `${fontSize * textWidthRatio}px`;
          element.style.lineHeight = `${element.clientHeight - textWidthRatio / 2}px`

          element.hidden ||= originalHiddenValue;
          element.style.display = originalDisplayValue;
        } else
          delete LCF.data.update.textFitElements[key];
      });

      //Update Timers
      const timers = LCF.data.timers,
            nextUpdateTimers = [];

      timers.forEach(timer => {
        if (timer.requestedDestruction)
          return;

        nextUpdateTimers.push(timer);
      });

      LCF.data.timers = nextUpdateTimers;

      return;
    },
    AddFunction: thisFunction => {
      if (!LCF.Type.Function(thisFunction))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.AddFunction".\n\nERROR: parameter_1 (function) must be a Function! Parameter passed: "${thisFunction}" (TYPE: "${LCF.Type.Get(thisFunction)}")`;

      LCF.data.update.customFunctions[thisFunction.name] = thisFunction;

      return thisFunction.name;
    },
    RemoveFunction: thisFunction => {
      if (!LCF.Type.Function(thisFunction))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.RemoveFunction".\n\nERROR: parameter_1 (function) must be a Function! Parameter passed: "${thisFunction}" (TYPE: "${LCF.Type.Get(thisFunction)}")`;

      delete LCF.data.update.customFunctions[thisFunction.name];
    },
    IncludesFunction: thisFunction => {
      if (!LCF.Type.Function(thisFunction))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.IncludesFunction".\n\nERROR: parameter_1 (function) must be a Function! Parameter passed: "${thisFunction}" (TYPE: "${LCF.Type.Get(thisFunction)}")`;

      return Boolean(LCF.data.update.customFunctions[thisFunction.name]);
    },
    CustomFunctions: () => {
      return LCF.data.update.customFunctions;
    },
    AddTextFitElement: (element, padding) => {
      if (!LCF.Type.HTML_Element(element))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.AddTextFitElement".\n\nERROR: parameter_1 (element) must be an HTML Element! Parameter passed: "${element}" (TYPE: "${LCF.Type.Get(element)}")`;

      if (LCF.Type.Number(padding))
        padding = {padding: padding};
      else if (!LCF.Type.Object(padding))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.AddTextFitElement".\n\nERROR: parameter_2 (padding) must be a Number OR an Object! Parameter passed: "${padding}" (TYPE: "${LCF.Type.Get(padding)}")`;

      const possibleKeys = ["top", "right", "bottom", "left", "vertical", "horizontal", "padding"],
            alreadyContainsKey = [];
      Object.entries(padding).every(([key, value]) => {
        if (!LCF.Type.Number(value))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Update.AddTextFitElement".\n\nERROR: parameter_2 (padding) can only contain Numbers as object values! Parameter passed: "${padding}" (KEY: "${key}") (TYPE: "${LCF.Type.Get(value)}")`;

        if (!possibleKeys.includes(key))
          throw `USER ERROR: Invalid data sent to function: "LCF.Update.AddTextFitElement".\n\nERROR: parameter_2 (padding) can only contain the following keys: "${possibleKeys.join("\", \"")}"! Key sent: "${key}"`;
        else if (alreadyContainsKey.includes(key))
          throw `USER ERROR: Invalid data sent to function: "LCF.Update.AddTextFitElement".\n\nERROR: parameter_2 (padding) cannot contain duplicate keys! Duplicate key: "${key}"`;
        else {
          alreadyContainsKey.push("padding");
          switch(key) {
            case "padding":
              alreadyContainsKey.concat(["vertical", "up", "down", "horizontal", "left", "right"]);
              break;
            case "vertical":
              alreadyContainsKey.concat(["vertical", "up", "down"]);
              break;
            case "up":
            case "down":
              alreadyContainsKey.concat([key, "vertical"]);
              break;
            case "horizontal":
              alreadyContainsKey.concat(["horizontal", "left", "right"]);
              break;
            case "left":
            case "right":
              alreadyContainsKey.concat([key, "horizontal"]);
              break;
            default:
              alreadyContainsKey.push(key);
          }
        }
      });


      let id = element.id ?? `0x${LCF.Math.DecimalToHex(new Date().now())}`;

      LCF.data.update.textFitElements[id] = {
        element: element,
        padding: {
          top: padding.padding ?? padding.vertical ?? padding.top ?? 0,
          right: padding.padding ?? padding.horizontal ?? padding.right ?? 0,
          bottom: padding.padding ?? padding.vertical ?? padding.bottom ?? 0,
          left: padding.padding ?? padding.horizontal ?? padding.left ?? 0
        }
      };

      return id;
    },
    ChangeTextFitElement: (id, padding) => {
      if (!LCF.Type.String(id))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.ChangeTextFitElement".\n\nERROR: parameter_1 (id) must be a String! Parameter passed: "${id}" (TYPE: "${LCF.Type.Get(id)}")`;

      if (LCF.Type.Number(padding))
        padding = {
          padding: padding
        };
      else if (!LCF.Type.Object(padding))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.ChangeTextFitElement".\n\nERROR: parameter_2 (padding) must be a Number OR an Object! Parameter passed: "${padding}" (TYPE: "${LCF.Type.Get(padding)}")`;


      const possibleKeys = ["top", "right", "bottom", "left", "vertical", "horizontal", "padding"],
            alreadyContainsKey = [];
      Object.entries(padding).every(([key, value]) => {
        if (!LCF.Type.Number(value))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Update.ChangeTextFitElement".\n\nERROR: parameter_2 (padding) can only contain Numbers as object values! Parameter passed: "${padding}" (KEY: "${key}") (TYPE: "${LCF.Type.Get(value)}")`;

        if (!possibleKeys.includes(key))
          throw `USER ERROR: Invalid data sent to function: "LCF.Update.ChangeTextFitElement".\n\nERROR: parameter_2 (padding) can only contain the following keys: "${possibleKeys.join("\", \"")}"! Key sent: "${key}"`;
        else if (alreadyContainsKey.includes(key))
          throw `USER ERROR: Invalid data sent to function: "LCF.Update.ChangeTextFitElement".\n\nERROR: parameter_2 (padding) cannot contain duplicate keys! Duplicate key: "${key}"`;
        else {
          alreadyContainsKey.push("padding");
          switch(key) {
            case "padding":
              alreadyContainsKey.concat(["vertical", "up", "down", "horizontal", "left", "right"]);
              break;
            case "vertical":
              alreadyContainsKey.concat(["vertical", "up", "down"]);
              break;
            case "up":
            case "down":
              alreadyContainsKey.concat([key, "vertical"]);
              break;
            case "horizontal":
              alreadyContainsKey.concat(["horizontal", "left", "right"]);
              break;
            case "left":
            case "right":
              alreadyContainsKey.concat([key, "horizontal"]);
              break;
            default:
              alreadyContainsKey.push(key);
          }
        }
      });

      LCF.data.update.textFitElements[id].padding = {
        top: padding.padding ?? padding.vertical ?? padding.top ?? 0,
        right: padding.padding ?? padding.horizontal ?? padding.right ?? 0,
        bottom: padding.padding ?? padding.vertical ?? padding.bottom ?? 0,
        left: padding.padding ?? padding.horizontal ?? padding.left ?? 0
      };
    },
    RemoveTextFitElement: id => {
      if (!LCF.Type.String(id))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.RemoveTextFitElement".\n\nERROR: parameter_1 (id) must be a String! Parameter passed: "${id}" (TYPE: "${LCF.Type.Get(id)}")`;

      if (!LCF.data.update.textFitElements[id])
        throw `USER ERROR: Unknown "Text Fit Object" id ("${id}") sent to function: "LCF.Update.RemoveTextFitElement".\n\nERROR: A "Text Fit Object" with id: "${id}" could not be found.`;

      delete LCF.data.update.textFitElements[id];
    },
    IncludesTextFitElement: id => {
      if (!LCF.Type.String(id))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.IncludesTextFitElement".\n\nERROR: parameter_1 (id) must be a String! Parameter passed: "${id}" (TYPE: "${LCF.Type.Get(id)}")`;

      return Boolean(LCF.data.update.textFitElements[id]);
    },
    TextFitElements: () => {
      return LCF.data.update.textFitElements;
    },
    SetSpeed: speed => {
      if (!LCF.Type.Number(speed))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.SetSpeed".\n\nERROR: parameter_1 (speed) must be a Number! Parameter passed: "${speed}" (TYPE: "${LCF.Type.Get(speed)}")`;

      if (speed < 0)
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.SetSpeed".\n\nERROR: parameter_1 (speed) must be in the range [0, Infinity)! Number sent: "${speed}"`;

      if (speed === LCF.data.update.speed)
        return;

      if (LCF.data.update.interval)
        clearInterval(LCF.data.update.interval);

      LCF.data.update.speed = speed;

      if (LCF.data.update.running)
        LCF.data.update.interval = setInterval(LCF.Update.update, speed);
    },
    GetSpeed: () => {
      return LCF.data.update.speed;
    },
    Start: () => {
      LCF.data.update.running = true;

      LCF.data.update.interval = setInterval(LCF.Update.update, speed);
    },
    Stop: () => {
      LCF.data.update.running = false;

      clearInterval(LCF.data.update.interval);
    },
    Toggle: () => {
      LCF.data.update.running = !LCF.data.update.running;

      if (LCF.data.update.running)
        LCF.data.update.interval = setInterval(LCF.Update.update, speed);
      else
        clearInterval(LCF.data.update.interval);
    },
    Running: () => {
      return LCF.data.update.running;
    },
    Call: () => {
      LCF.Update.update();
    }
  },
  Window: {
    //  OR  template, title, message
    Alert: (title, message, colors, horizontalPadding = null, verticalPadding = null, location = null, timeout = null) => {
      let alertDiv = document.createElement("DIV");
          alertDiv.classList.add("custom-alert");

      if (!title.split("$template:")[0].length) {
        if (horizontalPadding || verticalPadding || location || timeout)
          throw `USER ERROR: Invalid data sent to function: "LCF.Window.Alert".\n\nERROR: Too many parameters passed! Only pass three parameters when using a template!`;

        switch(title) {
          case "$template:light":
            title = message;
            message = colors;

            colors = {background:"#aaaaaa",title:"#333333",message:"#333333"};
            horizontalPadding = "3%";
            verticalPadding = "0.25%";
            location = "top";
            timeout = 2000;
            break;
          case "$template:dark":
            title = message;
            message = colors;

            colors = {background:"#cccccc",title:"#111111",message:"#111111"};
            horizontalPadding = "3%";
            verticalPadding = "0.25%";
            location = "top";
            timeout = 2000;
            break;
          case "$template:error_light":
            title = message;
            message = colors;

            colors = {background:"#cccccc",title:"#c94c4c",message:"#c94c4c"};
            horizontalPadding = "3%";
            verticalPadding = "0.25%";
            location = "top";
            timeout = 2000;
            break;
          case "$template:error_dark":
            title = message;
            message = colors;

            colors = {background:"#333333",title:"red",message:"red"};
            horizontalPadding = "3%";
            verticalPadding = "0.25%";
            location = "top";
            timeout = 2000;
            break;
        }
      } else
        title.replace(/\\$/g,"$");

      if (!LCF.Type.String(title))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_1 (title) must be a String! Parameter passed: "${title}" (TYPE: "${LCF.Type.Get(title)}")`;
      if (!LCF.Type.String(message))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_1 (message) must be a String! Parameter passed: "${message}" (TYPE: "${LCF.Type.Get(message)}")`;

      if (!LCF.Type.Object(colors))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_1 (colors) must be an Object! Parameter passed: "${colors}" (TYPE: "${LCF.Type.Get(colors)}")`;

      let backgroundColor = "default",
          titleColor = "default",
          messageColor = "default";

      const alreadyContainsKey = [];
      Object.entries(colors).forEach(([key, value]) => {
        if (value === "default")
          return;
        else if (!LCF.Type.CSS_Color(value))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_3 (colors) can only contain CSS Colors as values OR the String: "default"! Parameter passed: "${colors}" (KEY: "${key}") (TYPE: "${LCF.Type.Get(value)}")`;

        if (alreadyContainsKey.includes(key))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_3 (colors) cannot contain duplicate keys! Duplicate key: "${key}"`;

        switch(key) {
          case "background":
          case "bg":
            alreadyContainsKey.concat(["background", "bg"]);
            backgroundColor = value;
            break;
          case "title":
          case "t":
            alreadyContainsKey.concat(["title", "t"]);
            titleColor = value;
            break;
          case "message":
          case "msg":
            alreadyContainsKey.concat(["message", "msg"]);
            messageColor = value;
            break;
          default:
            throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_3 (colors) can only contain the following keys: "background", "bg", "title", "t", "message", "msg"! Key sent: "${key}"`;
        }
      });

      if (backgroundColor === "default")
        backgroundColor = "white";
      if (titleColor === "default")
        titleColor = "black";
      if (messageColor === "default")
        messageColor = "black";

      if (horizontalPadding === "default")
        horizontalPadding = "0px";
      else if (!LCF.Type.CSS_Position(horizontalPadding))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_4 (horizontal_padding) must be a CSS Position! Parameter passed: "${horizontalPadding}" (TYPE: "${LCF.Type.Get(horizontalPadding)}")`;

      if (verticalPadding === "default")
        verticalPadding = "0px";
      else if (!LCF.Type.CSS_Position(verticalPadding))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_5 (vertical_padding) must be a CSS Position! Parameter passed: "${verticalPadding}" (TYPE: "${LCF.Type.Get(verticalPadding)}")`;

      const possibleStrings = ["top","top-right","right","bottom-right","bottom","bottom-left","left","top-left","center","centre","default"];
      if (location === "default")
        location = "top";
      else if (!possibleStrings.includes(location))
        throw `USER ERROR: Invalid data sent to function: "LCF.Window.Alert".\n\nERROR: parameter_6 (location) must be one of the following Strings: "${possibleStrings.join("\", \"")}"! Parameter passed: "${location}"`;

      if (!LCF.Type.Number(timeout))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_7 (timeout) must be a Number! Parameter passed: "${timeout}" (TYPE: "${LCF.Type.Get(timeout)}")`;

      alertDiv.style.backgroundColor = backgroundColor;
      alertDiv.style.padding = `${verticalPadding} ${horizontalPadding}`;

      let alertTitle = document.createElement("H2");
          alertTitle.style.textAlign = "center";
          alertTitle.style.color = titleColor;
          alertTitle.innerHTML = title;

      alertDiv.appendChild(alertTitle);

      let alertMessage = document.createElement("P");
          alertMessage.style.color = messageColor;
          alertMessage.innerHTML = message;

      alertDiv.appendChild(alertMessage);

      document.body.appendChild(alertDiv);

      alertDiv.style.borderRadius = LCF.Element.GetBorderRadius(alertDiv, 5);

      if (location.includes("-"))
        alertDiv.classList.add(...location.split("-"));
      else {
        switch (location) {
          case "center":
          case "centre":
            alertDiv.style.left = `${50 - alertDiv.offsetWidth / window.innerWidth * 50}%`;
            alertDiv.style.top = `${50 - alertDiv.offsetHeight / window.innerHeight * 50}%`;
            break;
          case "bottom":
          case "top":
            alertDiv.style.left = `${50 - alertDiv.offsetWidth / window.innerWidth * 50}%`;
            break;
          case "right":
          case "left":
            alertDiv.style.top = `${50 - alertDiv.offsetHeight / window.innerHeight * 50}%`;
            break;
        }

        if (!["center","centre"].includes(location));
          eval(`alertDiv.style.${location} = "10px";`);
      }

      alertDiv.style.animation = "fadeIn 250ms ease-in 0s 1 normal forwards";
      if (timeout >= 0) {
        setTimeout(async() => {
          await LCF.Sleep(250);
          alertDiv.style.animation = "fadeOut 750ms ease-in 0s 1 normal forwards";
          await LCF.Sleep(750);

          alertDiv.remove();
        }, timeout);
      }

      return;
    },
    Sleep: milliseconds => {
      if (!LCF.Type.Number(milliseconds))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Sleep".\n\nERROR: parameter_1 (milliseconds) must be a Number! Parameter passed: "${milliseconds}" (TYPE: "${LCF.Type.Get(milliseconds)}")`;

      return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
  },
  Math: {
    //TODO: fix Add-Subtract data type check
    Add: (...passedNumbers) => {
      const numbers = LCF.Array.LimitValueType(passedNumbers, "number");
      if (!numbers.length)
        throw `USER ERROR: Invalid data sent to function: "LCF.Math.Add".\n\nERROR: At least one parameter must be a Number! Parameters passed: "${passedNumbers.join("\", \"")}"`;

      let returnNumber = 0,
          maxDecimals = 0;

      numbers.forEach(number => {
        const numberToString = number.toString();
        if (numberToString.includes(".")) {
          const amountOfDecimals = numberToString.split(".")[1].length;
          if (maxDecimals < amountOfDecimals)
            maxDecimals = amountOfDecimals;
        }

        returnNumber += number;
      });

      return +returnNumber.toFixed(maxDecimals); //remove end decimals
    },
    Subtract: (...passedNumbers) => {
      const numbers = LCF.Array.LimitValueType(passedNumbers, "number");
      if (!numbers.length)
        throw `USER ERROR: Invalid data sent to function: "LCF.Math.Subtract".\n\nERROR: At least one parameter must be a Number! Parameters passed: "${passedNumbers.join("\", \"")}"`;

      let returnNumber = 0,
          maxDecimals = 0;

      numbers.forEach(number => {
        const numberToString = number.toString();
        if (numberToString.includes(".")) {
          const amountOfDecimals = numberToString.split(".")[1].length;
          if (maxDecimals < amountOfDecimals)
            maxDecimals = amountOfDecimals;
        }

        returnNumber -= number;
      });

      return +returnNumber.toFixed(maxDecimals); //remove end decimals
    },
    Random: {
      Pseudo: function*(seed) {
        let index = 1;
	      while(true) {
		      yield Math.abs(Math.sin(index + seed)) % 0.0001 * 10000;
          index++;
          while(index + seed === 0 || !((index + seed) % Math.PI))
            index++;
        }
      },
      Array: function(array) {
        if (!LCF.Type.Array(array))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Array".\n\nERROR: parameter_1 (array) must be an Array! Parameter passed: "${array}" (TYPE: "${LCF.Type.Get(array)}")`;

        return array[Math.floor(Math.random() * array.length)];
      },
      Object: function(object) {
        if (!LCF.Type.Object(object))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Object".\n\nERROR: parameter_1 (object) must be an Object! Parameter passed: "${object}" (TYPE: "${LCF.Type.Get(object)}")`;

        return Object.entries(object)[Math.floor(Math.random() * Object.keys(object).length)];
      },
      Weighted: (points, returnAmounts, mergeAlgorithm = "average", negativeAlgorithm = "zero") => { //prob doesn't work
        switch(false) {
          case LCF.Type.Array(points):
            throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_1 (points) must be an Array! Parameter passed: "${points}" (TYPE: "${LCF.Type.Get(points)}")`;
          case LCF.Type.Number(returnAmounts):
            throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_2 (returnAmounts) must be a Number! Parameter passed: "${returnAmounts}" (TYPE: "${LCF.Type.Get(returnAmounts)}")`;
          case LCF.Type.String(mergeAlgorithm):
            throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_3 (mergeAlgorithm) must be a String! Parameter passed: "${mergeAlgorithm}" (TYPE: "${LCF.Type.Get(mergeAlgorithm)}")`;
          case LCF.Type.String(negativeAlgorithm):
            throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_4 (negativeAlgorithm) must be a String! Parameter passed: "${negativeAlgorithm}" (TYPE: "${LCF.Type.Get(negativeAlgorithm)}")`;
          case ["average, min, max, add, subtract, multiply, divide"].includes(mergeAlgorithm):
            throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_3 (mergeAlgorithm) must be one of the following strings: "average, min, max, add, subtract, multiply, divide"! Parameter passed: "${mergeAlgorithm}"`;
          case ["zero, remove, absolute, shift"].includes(negativeAlgorithm):
            throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_4 (negativeAlgorithm) must be one of the following strings: "zero, remove, absolute, shift"! Parameter passed: "${negativeAlgorithm}"`;
        }

        const extremes = {
          min: Math.min(points.forEach(point => {
            if (LCF.Type.Number(point?.min))
              return point.min;

            return Infinity;
          })),
          max: Math.max(points.forEach(point => {
            if (LCF.Type.Number(point?.max))
              return point.max;

            return -Infinity;
          }))
        };
        const increment = (extremes.max - extremes.min) / returnAmounts;

        const pointWeights = [];
        points.forEach((point, index) => {
          if (!LCF.Type.Object(point))
            throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_1 (points) can only contain Objects as values! Parameter passed: "${points}" (INDEX: "${index}") (TYPE: "${LCF.Type.Get(point)}")`;

          const min = point.min,
            max = point.max,
            mean = point.mean,
            standardDeviation = point.standardDeviation,
            inverse = point.inverse ?? false;

          const pointKeys = Object.keys(points);
          switch(false) {
            case [4, 5].includes(pointKeys.length):
              throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_1 (points) must contain 4 or 5 values! Parameter passed: "${points}" (OBJECT_LENGTH: "${Object.keys(points).length}")`;
            case pointKeys.includes("min"):
              throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_1 (points) must contain Objects with the key: "min"! Parameter passed: "${points}" (INDEX: "${index}")`;
            case pointKeys.includes("max"):
              throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_1 (points) must contain Objects with the key: "max"! Parameter passed: "${points}" (INDEX: "${index}")`;
            case pointKeys.includes("mean"):
              throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_1 (points) must contain Objects with the key: "mean"! Parameter passed: "${points}" (INDEX: "${index}")`;
            case pointKeys.includes("standardDeviation"):
              throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Weighted".\n\nERROR: parameter_1 (points) must contain Objects with the key: "standardDeviation"! Parameter passed: "${points}" (INDEX: "${index}")`;

            case LCF.Type.Number(min):
              throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Weighted".\n\nERROR: Value of min in Object in parameter_1 (points) must be a Number! Parameter passed: "${min}" (TYPE: "${LCF.Type.Get(min)}")`;
            case LCF.Type.Number(max):
              throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Weighted".\n\nERROR: Value of max in Object in parameter_1 (points) must be a Number! Parameter passed: "${max}" (TYPE: "${LCF.Type.Get(max)}")`;
            case min < max:
              throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Weighted".\n\nERROR: Value of min in Object in parameter_1 (points) cannot be greater than value of max in Object in parameter_3 (points)! Parameter passed: "${points}" (INDEX: "${index}")`;
            case LCF.Type.Number(mean):
              throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Weighted".\n\nERROR: Value of mean in Object in parameter_1 (points) must be a Number! Parameter passed: "${points}" (INDEX: "${index}") (TYPE: "${LCF.Type.Get(mean)}")`;
            case LCF.Type.Number(standardDeviation):
              throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Weighted".\n\nERROR: Value of standardDeviation in Object in parameter_1 (points) must be a Number! Parameter passed: "${points}" (INDEX: "${index}") (TYPE: "${LCF.Type.Get(standardDeviation)}")`;
          }

          if (pointKeys.length === 5) {
            switch(false) {
              case pointKeys.includes("inverse"):
                throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Weighted".\n\nERROR: Unknown key in Object in parameter_1 (points)! Parameter passed: "${points}" (INDEX: "${index}") (KEY: "${pointKeys.filter(key => !["standardDeviation","mean","inverse"].includes(key))}")`;
              case LCF.Type.Boolean(inverse):
                throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Weighted".\n\nERROR: Value of inverse in Object in parameter_1 (points) must be a Boolean! Parameter passed: "${points}" (INDEX: "${index}") (TYPE: "${LCF.Type.Get(inverse)}")`;
            }
          }

          pointWeights[index] = [];
          for (let x = extremes.min;x < extremes.max;x += increment) {
            if (x < min)
              pointWeights[index].push(undefined);
            else if (x < max)
              pointWeights[index].push(1/(standardDeviation*(2*Math.PI)**(1/2))*Math.E**(((x-mean)/standardDeviation)**2/-2));
            else
              pointWeights[index].push(undefined);
          }

          const maxWeight = Math.max(...pointWeights);
          if (inverse)
            pointWeights[index] = pointWeights[index].forEach(value => maxWeight - value);
        });

        let weights = [];
        const innerLoopAmount = pointWeights.length,
              outerLoopAmount = pointWeights[0].length;

        for (let i = 0;i < outerLoopAmount;i++) {
          let sum,
              iterations,
              lowest,
              highest;

          switch(mergeAlgorithm) {
            case "average":
            case "add":
              sum = 0;
              iterations = 0;

              for (let k = 0;k < innerLoopAmount;k++) {
                if (pointWeights[innerLoopAmount][outerLoopAmount]) {
                  sum += pointWeights[innerLoopAmount][outerLoopAmount];
                  iterations++;
                }
              }

              switch(mergeAlgorithm) {
                case "average":
                  weights.push(sum / iterations);
                  break;
                case "add":
                  weights.push(sum);
                  break;
              }
              break;
            case "min":
              lowest = Infinity;
              for (let k = 0;k < innerLoopAmount;k++)
                lowest = Math.min(pointWeights[innerLoopAmount][outerLoopAmount] ?? Infinity, lowest);

              weights.push(lowest);
              break;
            case "max":
              highest = -Infinity;
              for (let k = 0;k < innerLoopAmount;k++)
                highest = Math.max(pointWeights[innerLoopAmount][outerLoopAmount] ?? -Infinity, highest);

              weights.push(highest);
              break;
            case "subtract":
              sum = 0;
              for (let k = 0;k < innerLoopAmount;k++)
                sum -= pointWeights[innerLoopAmount][outerLoopAmount] ?? 0;

              weights.push(sum);
              break;
            case "multiply":
              sum = 0;
              for (let k = 0;k < innerLoopAmount;k++)
                sum *= pointWeights[innerLoopAmount][outerLoopAmount] ?? 1;

              weights.push(sum);
              break;
            case "divide":
              sum = 0;
              for (let k = 0;k < innerLoopAmount;k++) {
                if (pointWeights[innerLoopAmount][outerLoopAmount] === 0) {
                  sum = 0;
                  break;
                }

                sum /= pointWeights[innerLoopAmount][outerLoopAmount] ?? 1;
              }

              weights.push(sum);
              break;
          }
        }

        const lowestValue = Infinity;
        weights = weights.forEach(weight => {
          if (weight < 0) {
            switch (negativeAlgorithm) {
              case "zero":
              case "remove":
                return 0;
              case "absolute":
                return Math.abs(weight);
              case "shift":
                lowestValue = Math.min(weight, lowestValue);
                break;
            }
          }
        });

        if (negativeAlgorithm === "shift")
          weights = weights.forEach(weight => weight + lowestValue);

        const totalWeight = weights.reduce((total, value) => total + value);

        let unweightedRandom = Math.random() * totalWeight,
            weightedRandom,
            threshold = 0;

        const weightsLength = weights.length;
        for (let i = 0;i < weightsLength;i++) {
	        threshold += weights[i];

          if (unweightedRandom <= threshold) {
    	      weightedRandom = i + extremes.min;
            break;
          }
        }

        return weightedRandom;
      },
      Integer: (min, max, inclusive = [true, false]) => {
        switch(false) {
          case LCF.Type.Integer(min):
            throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Integer".\n\nERROR: parameter_1 (min) must be an Integer! Parameter passed: "${min}" (TYPE: "${LCF.Type.Get(min)}")`;
          case LCF.Type.Integer(max):
            throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Integer".\n\nERROR: parameter_2 (max) must be an Integer! Parameter passed: "${max}" (TYPE: "${LCF.Type.Get(max)}")`;
          case min < max:
            throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Integer".\n\nERROR: parameter_1 (min) can not be greater than parameter_2 (max)! Parameters passed: "${min}" (min), "${max}" (max)`;
          case inclusive.length === 2:
            throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Integer".\n\nERROR: parameter_3 (inclusive) must contain 2 boolean values! Parameter passed: "${inclusive}" (ARRAY_LENGTH: "${inclusive.length}")`;
        }

        switch (inclusive) {
          case [false, false]:
            return Math.floor(Math.random() * (max - min - 1) + min + 1);
          case [true, false]:
            return Math.floor(Math.random() * (max - min) + min);
          case [false, true]:
            return Math.floor(Math.random() * (max - min) + min + 1);
          case [true, true]:
            return Math.floor(Math.random() * (max - min + 1) + min);
          default:
            throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Integer".\n\nERROR: parameter_3 (inclusive) must contain 2 Boolean values! Parameter passed: "${inclusive}"`;
        }
      },
      Float: (min, max, inclusive = [true, false]) => {
        switch(false) {
          case LCF.Type.Float(min):
            throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Float".\n\nERROR: parameter_1 (min) must be a Float! Parameter passed: "${min}" (TYPE: "${LCF.Type.Get(min)}")`;
          case LCF.Type.Float(max):
            throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Random.Float".\n\nERROR: parameter_2 (max) must be a Float! Parameter passed: "${max}" (TYPE: "${LCF.Type.Get(max)}")`;
          case min < max:
            throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Float".\n\nERROR: parameter_1 (min) can not be greater than parameter_2 (max)! Parameters passed: "${min}" (min), "${max}" (max)`;
          case inclusive.length === 2:
            throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Float".\n\nERROR: parameter_3 (inclusive) must contain 2 boolean values! Parameter passed: "${inclusive}" (ARRAY_LENGTH: "${inclusive.length}")`;
        }

        const modifier = 0.1**18;
        switch (inclusive) {
          case [false, false]:
            return Math.random() * (max - min - modifier) + min + modifier;
          case [true, false]:
            return Math.random() * (max - min) + min;
          case [false, true]:
            return Math.random() * (max - min) + min + modifier;
          case [true, true]:
            return Math.random() * (max - min + modifier) + min;
          default:
            throw `USER ERROR: Invalid data sent to function: "LCF.Math.Random.Float".\n\nERROR: parameter_3 (inclusive) must contain 2 Boolean values! Parameter passed: "${inclusive}"`;
        }
      }
    },
    Random: (random = true, weights = []) => { //random = min, weights = max for random number
      if (LCF.Type.Boolean(random)) {
        const totalWeight = weights.reduce((sum, value) => sum + value, 0);
        if (LCF.Type.Array(weights) && weights.length === 2 && LCF.Type.Number(totalWeight))
          return (Math.floor(Math.random() * totalWeight) < weights[0]); //return random boolean - weighted
        else
          return (Math.floor(Math.random() * 2)); //return random boolean - non weighted
      } else if (LCF.Type.Array(random) && random.length) {
        const totalWeight = weights.reduce((sum, value) => sum + value, 0);
        if (LCF.Type.Array(weights) && weights.length === random.length && LCF.Type.Number(totalWeight)) {
          if (totalWeight <= 0)
            return random[0]; //return random array element - weighted

          const randomNumber = Math.floor(Math.random() * totalWeight);
          let weightSum = 0;

          weights.forEach((weight, index) => {
            weightSum += weight;
            if (randomNumber < weightSum)
              return random[index]; //return random array element - weighted
          });

          return random[0]; //return first element if random number not found
        } else
          return random[Math.floor(Math.random() * random.length)]; //return random array element - non weighted
      } else if (LCF.Type.Number(+random) || LCF.Type.Number(+weights)) { //random number (inclusive)
        if (!LCF.Type.Number(weights))
          return +random; //if no max, return min or 0 if there is no min
        else if (!LCF.Type.Number(random))
          random = 0; //if no min, set the min to 0

        if (!random.toString().includes(".") && !weights.toString().includes("."))
          return Math.floor(Math.random() * (+weights - +random + 1)) + +random; //return random integer
        else {
          const minDecimals = (random.toString().includes(".")) ? random.toString().split(".")[1].length : 0,
                maxDecimals = (weights.toString().includes(".")) ? weights.toString().split(".")[1].length : 0,
                decimals = Math.max(minDecimals, maxDecimals);

          random = +random;
          weights = +weights;

          return +((Math.floor(Math.random() * (weights - random + 1 / (10 ** decimals)) * 10 ** decimals) / 10 ** decimals + random).toFixed(decimals)); //return random float with the same amount of decimals
        }
      }
    },
    RandomCoordinates: (dimensions = [[0, "1.0"], [0, "1.0"]]) => { //all numbers inclusive

      /*TODO: Check if can use binary to detect floating value*/

      if (!LCF.Type.Array(dimensions))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.RandomCoordinates".\n\nERROR: parameter_1 (dimensions) must be an Array! Parameter passed: "${dimensions}" (TYPE: "${LCF.Type.Get(dimensions)}")`;
      else if (!dimensions.length)
        throw `USER ERROR: Invalid data to function: "LCF.Math.RandomCoordinates".\n\nERROR: parameter_1 (dimensions) cannot be an empty array! Parameter passed: "${dimensions}" (ARRAY_LENGTH: "${dimensions.length}")`;

      const returnCoords = {},
            dimensionLetters = ["x", "y", "z", "w"]; //W is commonly seen as the "4th" spacial dimension

      dimensions.forEach((dimension, index) => {
        if (!LCF.Type.Array(dimension))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.RandomCoordinates".\n\nERROR: parameter_1 (dimensions) can only contain Arrays with 2 Number values! Parameter passed: "${dimensions}" (INDEX: "${index}") (TYPE: "${LCF.Type.Get(dimensions)}")`;
        else if (dimension.length !== 2)
          throw `USER ERROR: Invalid data to function: "LCF.Math.RandomCoordinates".\n\nERROR: parameter_1 (dimensions) can only contain Arrays with 2 Number values! Parameter passed: "${dimensions}" (INDEX: "${index}") (ARRAY_LENGTH: "${dimension.length}")`;

        if (!LCF.Type.Number(+dimension[0], +dimension[1]))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.RandomCoordinates".\n\nERROR: parameter_1 (dimensions) can only contain Arrays with 2 Number values! Parameter passed: "${dimensions}" (INDEX: "${index}") (TYPE: "${LCF.Type.Get(dimensions)}")`;

        returnCoords[dimensionLetters[index] ?? index] = LCF.Math.Random(...dimension);
      });

      return returnCoords;
    },
    Distance: (firstCoordinate, secondCoordinate) => {
      if (!LCF.Type.Array(firstCoordinate))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Distance".\n\nERROR: parameter_1 (first_coordinate) must be an Array! Parameter passed: "${firstCoordinate}" (TYPE: "${LCF.Type.Get(firstCoordinate)}")`;
      else if (!LCF.Type.Array(secondCoordinate))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Distance".\n\nERROR: parameter_2 (second_coordinate) must be an Array! Parameter passed: "${secondCoordinate}" (TYPE: "${LCF.Type.Get(secondCoordinate)}")`;

      if (firstCoordinate.length !== 2)
        throw `USER ERROR: Invalid data sent to function: "LCF.Math.Distance".\n\nERROR: parameter_1 (first_coordinate) must contain 2 values! Parameter passed: "${firstCoordinate} (ARRAY_LENGTH: "${firstCoordinate.length}")"`;
      else if (secondCoordinate.length !== 2)
        throw `USER ERROR: Invalid data sent to function: "LCF.Math.Distance".\n\nERROR: parameter_2 (second_coordinate) must contain 2 values! Parameter passed: "${secondCoordinate} (ARRAY_LENGTH: "${secondCoordinate.length}")"`;

      const [x1, y1] = firstCoordinate,
            [x2, y2] = secondCoordinate;

      switch(false) {
        case LCF.Type.Number(x1):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Distance".\n\nERROR: parameter_1 (first_coordinate) can only contain Numbers as Array values! Parameter passed: "${firstCoordinate}" (INDEX: 0) (TYPE: "${LCF.Type.Get(x1)}")`;
        case LCF.Type.Number(y1):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Distance".\n\nERROR: parameter_1 (first_coordinate) can only contain Numbers as Array values! Parameter passed: "${firstCoordinate}" (INDEX: 1) (TYPE: "${LCF.Type.Get(y1)}")`;
        case LCF.Type.Number(x2):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Distance".\n\nERROR: parameter_2 (second_coordinate) can only contain Numbers as Array values! Parameter passed: "${secondCoordinate}" (INDEX: 0) (TYPE: "${LCF.Type.Get(x2)}")`;
        case LCF.Type.Number(y2):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Distance".\n\nERROR: parameter_2 (second_coordinate) can only contain Numbers as Array values! Parameter passed: "${secondCoordinate}" (INDEX: 1) (TYPE: "${LCF.Type.Get(y2)}")`;
      }

      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    CoordinatesInArea: (firstCoordinate, secondCoordinate, range = 0, type = "square", inclusive = true) => {
      if (!LCF.Type.Array(firstCoordinate))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_1 (first_coordinate) must be an Array! Parameter passed: "${firstCoordinate}" (TYPE: "${LCF.Type.Get(firstCoordinate)}")`;
      else if (!LCF.Type.Array(secondCoordinate))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_2 (second_coordinate) must be an Array! Parameter passed: "${secondCoordinate}" (TYPE: "${LCF.Type.Get(secondCoordinate)}")`;

        if (firstCoordinate.length !== 2)
        throw `USER ERROR: Invalid data sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_1 (first_coordinate) must contain 2 values! Parameter passed: "${firstCoordinate} (ARRAY_LENGTH: "${firstCoordinate.length}")"`;
      else if (secondCoordinate.length !== 2)
        throw `USER ERROR: Invalid data sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_2 (second_coordinate) must contain 2 values! Parameter passed: "${secondCoordinate} (ARRAY_LENGTH: "${secondCoordinate.length}")"`;

      const [x1, y1] = firstCoordinate,
            [x2, y2] = secondCoordinate;

      switch(false) {
        case LCF.Type.Number(x1):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_1 (first_coordinate) can only contain Numbers as Array values! Parameter passed: "${firstCoordinate}" (INDEX: "0") (TYPE: "${LCF.Type.Get(x1)}")`;
        case LCF.Type.Number(y1):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_1 (first_coordinate) can only contain Numbers as Array values! Parameter passed: "${firstCoordinate}" (INDEX: "1") (TYPE: "${LCF.Type.Get(y1)}")`;
        case LCF.Type.Number(x2):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_2 (second_coordinate) can only contain Numbers as Array values! Parameter passed: "${secondCoordinate}" (INDEX: "0") (TYPE: "${LCF.Type.Get(x2)}")`;
        case LCF.Type.Number(y2):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_2 (second_coordinate) can only contain Numbers as Array values! Parameter passed: "${secondCoordinate}" (INDEX: "1") (TYPE: "${LCF.Type.Get(y2)}")`;
        case LCF.Type.Number(range):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_3 (range) must be a Number! Parameter passed: "${range}" (TYPE: "${LCF.Type.Get(range)}")`;
        case LCF.Type.String(type):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_4 (type) must be a String! Parameter passed: "${type}" (TYPE: "${LCF.Type.Get(type)}")`;
        case LCF.Type.Boolean(inclusive):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_5 (inclusive) must be a Boolean! Parameter passed: "${inclusive}" (TYPE: "${LCF.Type.Get(inclusive)}")`;
      }

      switch(type) {
        case "square":
        case "sq":
          if (inclusive)
            return (Math.abs(x2 - x1) <= range && Math.abs(y2 - y1) <= range);
          else
            return (Math.abs(x2 - x1) < range && Math.abs(y2 - y1) < range);
        case "circle":
          if (inclusive)
            return (LCF.Math.Distance([x1, y1], [x2, y2]) <= range);
          else
            return (LCF.Math.Distance([x1, y1], [x2, y2]) < range);
       default:
          throw `USER ERROR: Invalid data sent to function: "LCF.Math.CoordinatesInArea".\n\nERROR: parameter_4 (type) must be one of the following Strings: "sqaure", "sq", "circle"! Parameter passed: "${type}"`;
      }
    },
    Slope: (firstCoordinate, secondCoordinate) => {
      if (!LCF.Type.Array(firstCoordinate))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Slope".\n\nERROR: parameter_1 (first_coordinate) must be an Array! Parameter passed: "${firstCoordinate}" (TYPE: "${LCF.Type.Get(firstCoordinate)}")`;
      else if (!LCF.Type.Array(secondCoordinate))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Slope".\n\nERROR: parameter_2 (second_coordinate) must be an Array! Parameter passed: "${secondCoordinate}" (TYPE: "${LCF.Type.Get(secondCoordinate)}")`;

      if (firstCoordinate.length !== 2)
        throw `USER ERROR: Invalid data sent to function: "LCF.Math.Slope".\n\nERROR: parameter_1 (first_coordinate) must contain 2 values! Parameter passed: "${firstCoordinate} (ARRAY_LENGTH: "${firstCoordinate.length}")"`;
      else if (secondCoordinate.length !== 2)
        throw `USER ERROR: Invalid data sent to function: "LCF.Math.Slope".\n\nERROR: parameter_2 (second_coordinate) must contain 2 values! Parameter passed: "${secondCoordinate} (ARRAY_LENGTH: "${secondCoordinate.length}")"`;

      const [x1, y1] = firstCoordinate,
            [x2, y2] = secondCoordinate;

      switch(false) {
        case LCF.Type.Number(x1):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Slope".\n\nERROR: parameter_1 (first_coordinate) can only contain Numbers as Array values! Parameter passed: "${firstCoordinate}" (INDEX: "0") (TYPE: "${LCF.Type.Get(x1)}")`;
        case LCF.Type.Number(y1):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Slope".\n\nERROR: parameter_1 (first_coordinate) can only contain Numbers as Array values! Parameter passed: "${firstCoordinate}" (INDEX: "1") (TYPE: "${LCF.Type.Get(y1)}")`;
        case LCF.Type.Number(x2):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Slope".\n\nERROR: parameter_2 (second_coordinate) can only contain Numbers as Array values! Parameter passed: "${secondCoordinate}" (INDEX: "0") (TYPE: "${LCF.Type.Get(x2)}")`;
        case LCF.Type.Number(y2):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Slope".\n\nERROR: parameter_2 (second_coordinate) can only contain Numbers as Array values! Parameter passed: "${secondCoordinate}" (INDEX: "1") (TYPE: "${LCF.Type.Get(y2)}")`;
      }

      let slope = Math.abs((y2 - y1) / (x2 - x1)) || 0;

      let rise = 1,
          run = 1;

      if (slope < 1)
        rise = slope;
      else
        run = 1 / slope;

      return {
        rise: rise * Math.sign(y2 - y1),
        run: run * Math.sign(x2 - x1)
      };
    },
    SlopeToAngle: (rise, run, degrees = true) => {
      switch(false) {
        case LCF.Type.Number(rise):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.SlopeToAngle".\n\nERROR: parameter_1 (rise) must be a Number! Parameter passed: "${rise}" (TYPE: "${LCF.Type.Get(rise)}")`;
        case LCF.Type.Number(run):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.SlopeToAngle".\n\nERROR: parameter_2 (run) must be a Number! Parameter passed: "${run}" (TYPE: "${LCF.Type.Get(run)}")`;
        case LCF.Type.Boolean(degrees):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.SlopeToAngle".\n\nERROR: parameter_3 (degrees) must be a Boolean! Parameter passed: "${degrees}" (TYPE: "${LCF.Type.Get(degrees)}")`;
      }

      if (degrees)
        return -Math.atan2(rise, run) * 180 / Math.PI;
      else
        return -Math.atan2(rise, run);
    },
    AngleToSlope: (angle, degrees = true) => {
      switch(false) {
        case LCF.Type.Number(angle):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.AngleToSlope".\n\nERROR: parameter_1 (angle) must be a Number! Parameter passed: "${angle}" (TYPE: "${LCF.Type.Get(angle)}")`;
        case LCF.Type.Boolean(degrees):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.AngleToSlope".\n\nERROR: parameter_2 (degrees) must be a Boolean! Parameter passed: "${degrees}" (TYPE: "${LCF.Type.Get(degrees)}")`;
      }

      if (!degrees)
        angle *= 180 / Math.PI;

      angle %= 360;

      let rise = 1,
          run = 1;

      const slopeAngle = 45 - Math.abs(45 - (angle % 90)),
            slope = Math.tan(slopeAngle * Math.PI / 180);

      switch(Math.ceil(angle / 45)) { //if angle = 0 or between (305, 360), default is called
        case 1: //(0, 45]
          rise *= -slope;
          break;
        case 2: //(45, 90]
          run *= slope;
          rise *= -1;
          break;
        case 3: //(90, 135]
          run *= -slope;
          rise *= -1;
          break;
        case 4: //(135, 180]
          run *= -1;
          rise *= -slope;
          break;
        case 5: //(180, 225]
          run *= -1;
          rise *= slope;
          break;
        case 6: //(225, 270]
          run *= -slope;
          break;
        case 7: //(270, 305]
          run *= slope;
          break;
        default: //0 U (305, 360)
          rise *= slope;
          break;
      }

      return {
        rise: rise,
        run: run
      };
    },
    RadiansToDegrees: radians => {
      if (!LCF.Type.Number(radians))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.RadiansToDegrees".\n\nERROR: parameter_1 (radians) must be a number! Parameter passed: "${radians}" (TYPE: "${LCF.Type.Get(radians)}")`;

      return radians * 180 / Math.PI;
    },
    Rad_Deg: LCF.Math.RadiansToDegrees,
    DegreesToRadians: degrees => {
      if (!LCF.Type.Number(degrees))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.DegreesToRadians".\n\nERROR: parameter_1 (degrees) must be a number! Parameter passed: "${degrees}" (TYPE: "${LCF.Type.Get(degrees)}")`;

      return degrees * Math.PI / 180;
    },
    Deg_Rad: LCF.Math.DegreesToRadians,
    DecimalToBinary: decimal => {
      if (!LCF.Type.Number(decimal))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.DecimalToBinary".\n\nERROR: parameter_1 (decimal) must be a number! Parameter passed: "${decimal}" (TYPE: "${LCF.Type.Get(decimal)}")`;

      return decimal.toString(16);
    },
    Dec_Bin: LCF.Math.DecimalToBinary,
    BinaryToDecimal: binary => {
      if (!LCF.Type.Number(binary) && !LCF.Type.String(binary))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.BinaryToDecimal".\n\nERROR: parameter_1 (binary) must be a number! Parameter passed: "${binary}" (TYPE: "${LCF.Type.Get(binary)}")`;

      return parseInt(binary, 2);
    },
    Bin_Dec: LCF.Math.BinaryToDecimal,
    DecimalToHexadecimal: decimal => {
      if (!LCF.Type.Number(decimal))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.DecimalToHexadecimal".\n\nERROR: parameter_1 (decimal) must be a number! Parameter passed: "${decimal}" (TYPE: "${LCF.Type.Get(decimal)}")`;

      return decimal.toString(16);
    },
    Dec_Hex: LCF.Math.DecimalToHexadecimal,
    HexadecimalToDecimal: hexadecimal => {
      if (!LCF.Type.Number(hexadecimal) && !LCF.Type.String(hexadecimal))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.HexadecimalToDecimal".\n\nERROR: parameter_1 (hexadecimal) must be a number! Parameter passed: "${hexadecimal}" (TYPE: "${LCF.Type.Get(hexadecimal)}")`;

      return parseInt(hexadecimal, 16);
    },
    Hex_Dec: LCF.Math.HexadecimalToDecimal,
    BinaryToHexadecimal: binary => {
      if (!LCF.Type.Number(binary) && !LCF.Type.String(binary))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.BinaryToHexadecimal".\n\nERROR: parameter_1 (binary) must be a number! Parameter passed: "${binary}" (TYPE: "${LCF.Type.Get(binary)}")`;

      return parseInt(binary, 2).toString(16);
    },
    Bin_Hex: LCF.Math.BinaryToHexadecimal,
    HexadecimalToBinary: hexadecimal => {
      if (!LCF.Type.String(hexadecimal) && !LCF.Type.String(hexadecimal))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.HexadecimalToBinary".\n\nERROR: parameter_1 (hexadecimal) must be a number! Parameter passed: "${hexadecimal}" (TYPE: "${LCF.Type.Get(hexadecimal)}")`;

      return parseInt(hexadecimal, 16).toString(2);
    },
    Hex_Bin: LCF.Math.HexadecimalToBinary
  },
  Maths: LCF.Math,
  Physics: {
    ElasticCollision: (mass_1, velocity_initial_1, mass_2, velocity_initial_2) => {
      switch (false) {
        case LCF.Type.Number(mass_1):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_1 (mass_1) must be a Number! Parameter passed: "${mass_1}" (TYPE: "${LCF.Type.Get(mass_1)}")`;
        case LCF.Type.Number(velocity_initial_1):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_2 (velocity_initial_1) must be a Number! Parameter passed: "${velocity_initial_1}" (TYPE: "${LCF.Type.Get(velocity_initial_1)}")`;
        case LCF.Type.Number(mass_2):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_3 (mass_2) must be a Number! Parameter passed: "${mass_2}" (TYPE: "${LCF.Type.Get(mass_2)}")`;
        case LCF.Type.Number(velocity_initial_2):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_4 (velocity_initial_2) must be a Number! Parameter passed: "${velocity_initial_2}" (TYPE: "${LCF.Type.Get(velocity_initial_2)}")`;
      }

      //m1*v1i + m2*v2i = m1*v1f + m2*v2f

      //v1f = (m1-m2)/(m1+m2)v1i + (2m2/m1+m2)v2i
      //v2f = (2m1/m1+m2)v1i + (m2-m1)/(m1+m2)v2i
    }
  },
  Type: {
    Get: value => {
      const returnType = [];
      if (Object.entries(LCF.data.type.function_return).forEach(([key, type]) => {
        try {
          if (LCF.Type[key](value))
            returnType.push(type);
        } catch (error) {
          throw `SCRIPT ERROR: ${error}.\n\nThis error is not your fault! Please report this on our GitHub page by sending a screenshot of this error in an issue report!`;
        }
      }))
        return returnType;
      else
        return typeof value;
    },
    Function: (...values) => values.every(value => typeof value === "function"),
    Func: LCF.Type.Function,

    Date: (...values) => values.every(value => value instanceof Date),

    Object: (...values) => values.every(value => value === Object(value)),
    Obj: LCF.Type.Object,

    Array: (...values) => values.every(value => value instanceof Array),
    Arr: LCF.Type.Array,

    String: (...values) => values.every(value => typeof value === "string"),
    Str: LCF.Type.String,

    Number: (...values) => values.every(value => typeof value === "number"),
    Num: LCF.Type.Number,

    Integer: (...values) => values.every(value => Number.isInteger(value)),
    Int: LCF.Type.Integer,

    SafeInteger: (...values) => values.every(value => Number.isSafeInteger(value)),
    SafeInt: LCF.Type.SafeInteger,

    Float: (...values) => values.every(value => Number.isFloat(value)),

    Finite: (...values) => values.every(value => Number.isFinite(value)),

    Boolean: (...values) => values.every(value => typeof value === "boolean"),
    Bool: LCF.Type.Boolean,

    NaN: (...values) => values.every(value => Number.isNaN(value)),

    Null: (...values) => values.every(value => value === null),

    Undefined: (...values) => values.every(value => value === undefined),
    Undef: LCF.Type.Undefined,

    Empty: (...values) => values.every(value => value === null || value === undefined), //same as (LCF.Type.Null() || LCF.Type.Undefined())

    HTML_Element: (...values) => values.every(value => value instanceof HTMLElement),
    HTML_Elmt: LCF.Type.HTML_Element,

    CSS_Color: (...values) => values.every(value => {
      const style = new Option().style;
            style.color = value;

      return style.color != "";
    }),
    CSS_Colour: LCF.Type.CSS_Color,
    CSS_Clr: LCF.Type.CSS_Color,

    CSS_Position: (...values) => values.every(value => {
      const style = new Option().style;
            style.left = value;

      return style.left != "";
    }),
    CSS_Pos: LCF.Type.CSS_Position,

    CSS_FontFamily: (...values) => values.every(value => {
      const style = new Option().style;
            style.fontFamily = value;

      return style.fontFamily != "";
    }),

    CSS_FontSize: (...values) => values.every(value => {
      const style = new Option().style;
            style.fontSize = value;

      return style.fontSize != "";
    }),

    Event: (...values) => values.every(value => value instanceof Event),
    Evnt: LCF.Type.Event,

    AnimationEvent: (...values) => values.every(value => value instanceof AnimationEvent),
    AnmEvnt: LCF.Type.AnimationEvent,

    ClipboardEvent: (...values) => values.every(value => value instanceof ClipboardEvent),
    CbEvnt: LCF.Type.ClipboardEvent,

    DragEvent: (...values) => values.every(value => value instanceof DragEvent),
    DrgEvnt: LCF.Type.DragEvent,

    FocusEvent: (...values) => values.every(value => value instanceof FocusEvent),
    FcEvnt: LCF.Type.FocusEvent,

    HashChangeEvent: (...values) => values.every(value => value instanceof HashChangeEvent),
    HsChgEvnt: LCF.Type.HashChangeEvent,

    InputEvent: (...values) => values.every(value => value instanceof InputEvent),
    InptEvnt: LCF.Type.InputEvent,

    KeyboardEvent: (...values) => values.every(value => value instanceof KeyboardEvent),
    KbEvnt: LCF.Type.KeyboardEvent,

    MouseEvent: (...values) => values.every(value => value instanceof MouseEvent),
    MseEvnt: LCF.Type.MouseEvent,

    PageTransitionEvent: (...values) => values.every(value => value instanceof PageTransitionEvent),
    PgTransEvnt: LCF.Type.PageTransitionEvent,

    PopStateEvent: (...values) => values.every(value => value instanceof PopStateEvent),
    PopStEvnt: LCF.Type.PopStateEvent,

    ProgressEvent: (...values) => values.every(value => value instanceof ProgressEvent),
    PrgEvnt: LCF.Type.ProgressEvent,

    StorageEvent: (...values) => values.every(value => value instanceof StorageEvent),
    StrEvnt: LCF.Type.StorageEvent,

    TouchEvent: (...values) => values.every(value => value instanceof TouchEvent),
    TchEvnt: LCF.Type.Event,

    TransitionEvent: (...values) => values.every(value => value instanceof TransitionEvent),
    TransEvnt: LCF.Type.TransitionEvent,

    UIEvent: (...values) => values.every(value => value instanceof UIEvent),

    WheelEvent: (...values) => values.every(value => value instanceof WheelEvent),
    WhlEvnt: LCF.Type.WheelEvent,

    Error: (...values) => values.every(value => value instanceof Error),
    Err: LCF.Type.Error,

    EvalError: (...values) => values.every(value => value instanceof Error),
    EvlErr: LCF.Type.EvalError,

    RangeError: (...values) => values.every(value => value instanceof Error),
    RngeErr: LCF.Type.RangeError,

    ReferenceError: (...values) => values.every(value => value instanceof Error),
    RefErr: LCF.Type.ReferenceError,

    SyntaxError: (...values) => values.every(value => value instanceof Error),
    Syntx: LCF.Type.SyntaxError,

    TypeError: (...values) => values.every(value => value instanceof Error),
    TypErr: LCF.Type.TypeError,

    URIError: (...values) => values.every(value => value instanceof Error),
    URIErr: LCF.Type.URIError
  },
  Array: {
    ConvertTo: {
      Number: (...arrays) => {
        if (!arrays.length)
          throw `USER ERROR: Invalid data sent to function: "LCF.Array.ConvertTo.Number"! ERROR: [parameter_1, parameter_infinity) (...arrays) cannot be an empty Array! Parameters passed: "${arrays}" (ARRAY_LENGTH: "${arrays.length}")`;

        let returnArrays = [];
        arrays.forEach(array => {
          if (!LCF.Type.Array(array))
            throw `USER ERROR: Invalid data type sent to function: "LCF.Array.ConvertTo.Number"! ERROR: [parameter_1, parameter_infinity) (...arrays) passed must be an Array! Parameters passed: "${arrays}" (INDEX: "${arrays.indexOf(array)}") (TYPE: "${LCF.Type.Get(array)}")`;

          const newArray = [];
          array.forEach(value => {
            newArray.push(+value);
          });

          returnArrays.push(newArray);
        });

        return returnArrays;
      },
      Num: LCF.Array.ConvertTo.Number,
      String: (...arrays) => {
        if (!arrays.length)
          throw `USER ERROR: Invalid data sent to function: "LCF.Array.ConvertTo.String"! ERROR: [parameter_1, parameter_infinity) (...arrays) cannot be an empty Array! Parameters passed: "${arrays}" (ARRAY_LENGTH: "${arrays.length}")`;

        let returnArrays = [];
        arrays.forEach(array => {
          if (!LCF.Type.Array(array))
            throw `USER ERROR: Invalid data type sent to function: "LCF.Array.ConvertTo.String"! ERROR: [parameter_1, parameter_infinity) (...arrays) passed must be an Array! Parameters passed: "${arrays}" (INDEX: "${arrays.indexOf(array)}") (TYPE: "${LCF.Type.Get(array)}")`;

          const newArray = [];
          array.forEach(value => {
            newArray.push(value.toString());
          });

          returnArrays.push(newArray);
        });

        return returnArrays;
      },
      Str: LCF.Array.ConvertTo.String,
      Boolean: (...arrays) => {
        if (!arrays.length)
          throw `USER ERROR: Invalid data sent to function: "LCF.Array.ConvertTo.Boolean"! ERROR: [parameter_1, parameter_infinity) (...arrays) cannot be an empty Array! Parameters passed: "${arrays}" (ARRAY_LENGTH: "${arrays.length}")`;

        let returnArrays = [];
        arrays.forEach(array => {
          if (!LCF.Type.Array(array))
            throw `USER ERROR: Invalid data type sent to function: "LCF.Array.ConvertTo.Boolean"! ERROR: [parameter_1, parameter_infinity) (...arrays) passed must be an Array! Parameters passed: "${arrays}" (INDEX: "${arrays.indexOf(array)}") (TYPE: "${LCF.Type.Get(array)}")`;

          const newArray = [];
          array.forEach(value => {
            newArray.push(Boolean(value));
          });

          returnArrays.push(newArray);
        });

        return returnArrays;
      },
      Bool: LCF.Array.ConvertTo.Boolean
    },
    Math: {
      Add: (...arrays) => {
        const firstArrayLength = arrays[0].length;
        switch(false) {
          case LCF.Type.Array(arrays[0]):
            throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Add".\n\nERROR: parameter_1 (...arrays[0]) must be an Array! Parameters passed: "${arrays}" (INDEX: 0)`;
          case firstArrayLength:
            throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Add".\n\nERROR: [parameter_1, parameter_infinity) (...arrays) cannot be an empty Array! Parameters passed: "${arrays}" (INDEX: 0) (ARRAY_LENGTH: "${arrays.length}")`;
        }

        arrays.forEach(array => {
          switch(false) {
            case LCF.Type.Array(array):
              throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Add".\n\nERROR: [parameter_1, parameter_infinity) (...arrays) must be an Array! Parameters passed: "${arrays}" (INDEX: ${arrays.indexOf(array)})`;
            case (array.length === firstArrayLength):
              throw `USER ERROR: Invalid data to function: "LCF.Array.Math.Add".\n\nERROR: [parameter_2, parameter_infinity) (...arrays) must be the same length as parameter_1 (...arrays[0])! Parameters passed: "${arrays}" (INDEX: ${arrays.indexOf(array)}) (ARRAY_LENGTH: "${array.length}")`;
          }
        });

        const returnArray = [];
        arrays[0].forEach((value, valueIndex) => {
          let returnNumber = 0;

          arrays.forEach((array, arrayIndex) => {
            const arrayValue = array[valueIndex];
            if (!LCF.Type.Number(arrayValue))
              throw `USER ERROR: Invalid data type sent to function: "LCF.Array.Math.Add".\n\nERROR: [parameter_1, parameter_infinity) can only contain Numbers as Array values! Parameter passed: "${array}" (INDEX: ${valueIndex})`;

            if (!arrayIndex) {
              returnNumber = arrayValue;
              return;
            }

            returnNumber = LCF.Math.Add(returnNumber, arrayValue);
          });

          returnArray.push(returnNumber);
        });

        return returnArray;
      },
      Subtract: (...arrays) => {
        const firstArrayLength = arrays[0].length;
        switch(false) {
          case LCF.Type.Array(arrays[0]):
            throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Subtract".\n\nERROR: parameter_1 (...arrays[0]) must be an Array! Parameters passed: "${arrays}" (INDEX: 0)`;
          case firstArrayLength:
            throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Subtract".\n\nERROR: [parameter_1, parameter_infinity) (...arrays) cannot be an empty Array! Parameters passed: "${arrays}" (INDEX: 0) (ARRAY_LENGTH: "${arrays.length}")`;
        }

        arrays.forEach(array => {
          switch(false) {
            case LCF.Type.Array(array):
              throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Subtract".\n\nERROR: [parameter_1, parameter_infinity) (...arrays) must be an Array! Parameters passed: "${arrays}" (INDEX: ${arrays.indexOf(array)})`;
            case (array.length === firstArrayLength):
              throw `USER ERROR: Invalid data to function: "LCF.Array.Math.Subtract".\n\nERROR: [parameter_2, parameter_infinity) (...arrays) must be the same length as parameter_1 (...arrays[0])! Parameters passed: "${arrays}" (INDEX: ${arrays.indexOf(array)}) (ARRAY_LENGTH: "${array.length}")`;
          }
        });

        const returnArray = [];
        arrays.forEach((value, valueIndex) => {
          let returnNumber = 0;

          arrays.forEach((array, arrayIndex) => {
            const arrayValue = array[valueIndex];
            if (!LCF.Type.Number(arrayValue))
              throw `USER ERROR: Invalid data type sent to function: "LCF.Array.Math.Subtract".\n\nERROR: [parameter_1, parameter_infinity) can only contain Numbers as Array values! Parameter passed: "${array}" (INDEX: ${valueIndex})`;

            if (!arrayIndex) {
              returnNumber = arrayValue;
              return;
            }

            returnNumber = LCF.Math.Subtract(returnNumber, arrayValue);
          });

          returnArray.push(returnNumber);
        });

        return returnArray;
      },
      Multiply: (...arrays) => {
        const firstArrayLength = arrays[0].length;
        switch(false) {
          case LCF.Type.Array(arrays[0]):
            throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Multiply".\n\nERROR: parameter_1 (...arrays[0]) must be an Array! Parameters passed: "${arrays}" (INDEX: 0)`;
          case firstArrayLength:
            throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Multiply".\n\nERROR: [parameter_1, parameter_infinity) (...arrays) cannot be an empty Array! Parameters passed: "${arrays}" (INDEX: 0) (ARRAY_LENGTH: "${arrays.length}")`;
        }

        arrays.forEach(array => {
          switch(false) {
            case LCF.Type.Array(array):
              throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Multiply".\n\nERROR: [parameter_1, parameter_infinity) (...arrays) must be an Array! Parameters passed: "${arrays}" (INDEX: ${arrays.indexOf(array)})`;
            case (array.length === firstArrayLength):
              throw `USER ERROR: Invalid data to function: "LCF.Array.Math.Multiply".\n\nERROR: [parameter_2, parameter_infinity) (...arrays) must be the same length as parameter_1 (...arrays[0])! Parameters passed: "${arrays}" (INDEX: ${arrays.indexOf(array)}) (ARRAY_LENGTH: "${array.length}")`;
          }
        });

        const returnArray = [];
        arrays[0].forEach((value, valueIndex) => {
          let returnNumber = 0;

          arrays.forEach((array, arrayIndex) => {
            const arrayValue = array[valueIndex];
            if (!LCF.Type.Number(arrayValue))
              throw `USER ERROR: Invalid data type sent to function: "LCF.Array.Math.Multiply".\n\nERROR: [parameter_1, parameter_infinity) can only contain Numbers as Array values! Parameter passed: "${array}" (INDEX: ${valueIndex})`;

            if (!arrayIndex) {
              returnNumber = arrayValue;
              return;
            }

            returnNumber *= arrayValue;
          });

          returnArray.push(returnNumber);
        });

        return returnArray;
      },
      Divide: (...arrays) => {
        const firstArrayLength = arrays[0].length;
        switch(false) {
          case LCF.Type.Array(arrays[0]):
            throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Divide".\n\nERROR: parameter_1 (...arrays[0]) must be an Array! Parameters passed: "${arrays}" (INDEX: 0)`;
          case firstArrayLength:
            throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Divide".\n\nERROR: [parameter_1, parameter_infinity) (...arrays) cannot be an empty Array! Parameters passed: "${arrays}" (INDEX: 0) (ARRAY_LENGTH: "${arrays.length}")`;
        }

        arrays.forEach(array => {
          switch(false) {
            case LCF.Type.Array(array):
              throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Divide".\n\nERROR: [parameter_1, parameter_infinity) (...arrays) must be an Array! Parameters passed: "${arrays}" (INDEX: ${arrays.indexOf(array)})`;
            case (array.length === firstArrayLength):
              throw `USER ERROR: Invalid data to function: "LCF.Array.Math.Divide".\n\nERROR: [parameter_2, parameter_infinity) (...arrays) must be the same length as parameter_1 (...arrays[0])! Parameters passed: "${arrays}" (INDEX: ${arrays.indexOf(array)}) (ARRAY_LENGTH: "${array.length}")`;
          }
        });

        const returnArray = [];
        arrays[0].forEach((value, valueIndex) => {
          let returnNumber = 0;

          arrays.forEach((array, arrayIndex) => {
            const arrayValue = array[valueIndex];
            if (!LCF.Type.Number(arrayValue))
              throw `USER ERROR: Invalid data type sent to function: "LCF.Array.Math.Divide".\n\nERROR: [parameter_1, parameter_infinity) can only contain Numbers as Array values! Parameter passed: "${array}" (INDEX: ${valueIndex})`;

            if (!arrayIndex) {
              returnNumber = arrayValue;
              return;
            }

            returnNumber /= arrayValue;
          });

          returnArray.push(returnNumber);
        });

        return returnArray;
      },
      Power: (...arrays) => {
        const firstArrayLength = arrays[0].length;
        switch(false) {
          case LCF.Type.Array(arrays[0]):
            throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Power".\n\nERROR: parameter_1 (...arrays[0]) must be an Array! Parameters passed: "${arrays}" (INDEX: 0)`;
          case firstArrayLength:
            throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Power".\n\nERROR: [parameter_1, parameter_infinity) (...arrays) cannot be an empty Array! Parameters passed: "${arrays}" (INDEX: 0) (ARRAY_LENGTH: "${arrays.length}")`;
        }

        arrays.forEach(array => {
          switch(false) {
            case LCF.Type.Array(array):
              throw `USER ERROR: Invalid data sent to function: "LCF.Array.Math.Power".\n\nERROR: [parameter_1, parameter_infinity) (...arrays) must be an Array! Parameters passed: "${arrays}" (INDEX: ${arrays.indexOf(array)})`;
            case (array.length === firstArrayLength):
              throw `USER ERROR: Invalid data to function: "LCF.Array.Math.Power".\n\nERROR: [parameter_2, parameter_infinity) (...arrays) must be the same length as parameter_1 (...arrays[0])! Parameters passed: "${arrays}" (INDEX: ${arrays.indexOf(array)}) (ARRAY_LENGTH: "${array.length}")`;
          }
        });

        const returnArray = [];
        arrays[0].forEach((value, valueIndex) => {
          let returnNumber = 0;

          arrays.forEach((array, arrayIndex) => {
            const arrayValue = array[valueIndex];
            if (!LCF.Type.Number(arrayValue))
              throw `USER ERROR: Invalid data type sent to function: "LCF.Array.Math.Power".\n\nERROR: [parameter_1, parameter_infinity) can only contain Numbers as Array values! Parameter passed: "${array}" (INDEX: ${valueIndex})`;

            if (!arrayIndex) {
              returnNumber = arrayValue;
              return;
            }

            returnNumber **= arrayValue;
          });

          returnArray.push(returnNumber);
        });

        return returnArray;
      }
    },
    Maths: LCF.Array.Math,
    LimitValueType: (array, ...types) => {
      if (!LCF.Type.Array(array))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Array.LimitValueType".\n\nERROR: parameter_1 (array) must be an Array! Parameter passed: "${array}"  (TYPE: "${LCF.Type.Get(array)}")`;

      const allSupportedTypes = LCF.data.type.allSupported,
            supportedTypes = LCF.data.type.supported,

            mainTypes = [];

      types.forEach(type => {
        switch(false) {
          case LCF.Type.String(type):
            throw `USER ERROR: Invalid data type sent to function: "LCF.Array.LimitValueType".\n\nERROR: [parameter_2, parameter_infinity) (...types) must be a String! Parameters passed: "${types}" (INDEX: ${types.indexOf(type)})`;
          case allSupportedTypes.includes(type):
            throw `USER ERROR: Invalid data sent to function: "LCF.Array.LimitValueType".\n\nERROR: [parameter_2, parameter_infinity) (...types) must be one of the following Strings: "${allSupportedTypes.join(", ")}"! Parameters passed: "${types}" (INDEX: ${types.indexOf(type)})`;
          case Boolean(supportedTypes[type]):
            Object.entries(supportedTypes).some(([mainType, subTypes]) => {
              if (subTypes.includes(type)) {
                mainTypes.push(mainType);

                return true;
              }
            });
            break;
          default:
            mainTypes.push(type);
            break;
        }
      });

      return array.filter(value => {
        const valueType = LCF.Type.Get(value);
        return mainTypes.some(type => {
          return (valueType === type);
        });
      });
    },
    IndexesOf: (array, ...values) => {
      if (!LCF.Type.Array(array))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Array.IndexesOf".\n\nERROR: parameter_1 must be an Array! Parameter passed: "${array}"`;

      const returnArray = [];
      array.forEach((value, index) => {
        values.forEach((valueToCheck, returnArrayIndex) => {
          returnArrayIndex[returnArrayIndex] ??= [];
          if (value === valueToCheck)
            returnArray[returnArrayIndex].push(index);
        });
      });

      return returnArray;
    }
  },
  Object: {
    ConvertTo: {
      Number: (...objects) => {
        if (!objects.length)
          throw `USER ERROR: Invalid data sent to function: "LCF.Object.ConvertTo.Number"! ERROR: [parameter_1, parameter_infinity) (...objects) cannot be an empty Array! Parameters passed: "${objects}" (ARRAY_LENGTH: "${objects.length}")`;

        let returnObjects = [];
        objects.forEach(object => {
          if (!LCF.Type.Object(object))
            throw `USER ERROR: Invalid data type sent to function: "LCF.Object.ConvertTo.Number"! ERROR: [parameter_1, parameter_infinity) (...objects) must be an Object! Parameters passed: "${objects}" (INDEX: "${objects.indexOf(object)}") (TYPE: "${LCF.Type.Get(object)}")`;

          const newObject = {};
          Object.entries(object).forEach(([key, value]) => {
            newObject[key] = +value;
          });

          returnObjects.push(newObject);
        });

        return returnObjects;
      },
      Num: LCF.Object.ConvertTo.Number,
      String: (...objects) => {
        if (!objects.length)
          throw `USER ERROR: Invalid data sent to function: "LCF.Object.ConvertTo.String"! ERROR: [parameter_1, parameter_infinity) (...objects) cannot be an empty Array! Parameters passed: "${objects}" (ARRAY_LENGTH: "${objects.length}")`;

        let returnObjects = [];
        objects.forEach(object => {
          if (!LCF.Type.Object(object))
            throw `USER ERROR: Invalid data type sent to function: "LCF.Object.ConvertTo.String"! ERROR: [parameter_1, parameter_infinity) (...objects) must be an Object! Parameters passed: "${objects}" (INDEX: "${objects.indexOf(object)}") (TYPE: "${LCF.Type.Get(object)}")`;

          const newObject = {};
          Object.entries(object).forEach(([key, value]) => {
            newObject[key] = +value;
          });

          returnObjects.push(newObject);
        });

        return returnObjects;
      },
      Str: LCF.Object.ConvertTo.String,
      Boolean: (...objects) => {
        if (!objects.length)
          throw `USER ERROR: Invalid data sent to function: "LCF.Object.ConvertTo.Boolean"! ERROR: [parameter_1, parameter_infinity) (...objects) cannot be an empty Array! Parameters passed: "${objects}" (ARRAY_LENGTH: "${objects.length}")`;

        let returnObjects = [];
        objects.forEach(object => {
          if (!LCF.Type.Object(object))
            throw `USER ERROR: Invalid data type sent to function: "LCF.Object.ConvertTo.Boolean"! ERROR: [parameter_1, parameter_infinity) (...objects) must be an Object! Parameters passed: "${objects}" (INDEX: "${objects.indexOf(object)}") (TYPE: "${LCF.Type.Get(object)}")`;

          const newObject = {};
          Object.entries(object).forEach(([key, value]) => {
            newObject[key] = +value;
          });

          returnObjects.push(newObject);
        });

        return returnObjects;
      },
      Bool: LCF.Object.ConvertTo.Boolean
    },
    Math: {
      Add: (...objects) => {
        const firstObjectLength = Object.keys(objects[0]).length;
        switch(false) {
          case LCF.Type.Object(objects[0]):
            throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Add".\n\nERROR: parameter_1 (...objects[0]) must be an Object! Parameters passed: "${objects}" (INDEX: 0)`;
          case firstObjectLength:
            throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Add".\n\nERROR: [parameter_1, parameter_infinity) (...objects) cannot be an empty Object! Parameters passed: "${objects}" (INDEX: 0) (OBJECT_LENGTH: "${objects.length}")`;
        }

        objects.forEach(object => {
          switch(false) {
            case LCF.Type.Object(object):
              throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Add".\n\nERROR: [parameter_1, parameter_infinity) (...objects) must be an Object! Parameters passed: "${objects}" (INDEX: ${objects.indexOf(object)})`;
            case (Object.keys(object).length === firstObjectLength):
              throw `USER ERROR: Invalid data to function: "LCF.Object.Math.Add".\n\nERROR: [parameter_2, parameter_infinity) (...objects) must be the same length as parameter_1 (...objects[0])! Parameters passed: "${objects}" (INDEX: ${objects.indexOf(object)}) (OBJECT_LENGTH: "${object.length}")`;
          }
        });

        const returnObject = {};
        Object.entries(objects[0]).forEach(([value, key]) => {
          let returnNumber = 0;
          let firstObject = true;

          Object.values(objects).forEach(object => {
            const objectValue = object[key];
            if (!LCF.Type.Number(objectValue))
              throw `USER ERROR: Invalid data type sent to function: "LCF.Object.Math.Add".\n\nERROR: [parameter_1, parameter_infinity) can only contain Numbers as Object values! Parameter passed: "${object}" (KEY: ${key})`;

            if (firstObject) {
              returnNumber = objectValue;

              firstObject = false;
              return;
            }

            returnNumber = LCF.Math.Add(returnNumber, objectValue);
          });

          returnObject.push(returnNumber);
        });

        return returnObject;
      },
      Subtract: (...objects) => {
        const firstObjectLength = Object.keys(objects[0]).length;
        switch(false) {
          case LCF.Type.Object(objects[0]):
            throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Subtract".\n\nERROR: parameter_1 (...objects[0]) must be an Object! Parameters passed: "${objects}" (INDEX: 0)`;
          case firstObjectLength:
            throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Subtract".\n\nERROR: [parameter_1, parameter_infinity) (...objects) cannot be an empty Object! Parameters passed: "${objects}" (INDEX: 0) (OBJECT_LENGTH: "${objects.length}")`;
        }

        objects.forEach(object => {
          switch(false) {
            case LCF.Type.Object(object):
              throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Subtract".\n\nERROR: [parameter_1, parameter_infinity) (...objects) must be an Object! Parameters passed: "${objects}" (INDEX: ${objects.indexOf(object)})`;
            case (Object.keys(object).length === firstObjectLength):
              throw `USER ERROR: Invalid data to function: "LCF.Object.Math.Subtract".\n\nERROR: [parameter_2, parameter_infinity) (...objects) must be the same length as parameter_1 (...objects[0])! Parameters passed: "${objects}" (INDEX: ${objects.indexOf(object)}) (OBJECT_LENGTH: "${object.length}")`;
          }
        });

        const returnObject = {};
        Object.entries(objects[0]).forEach(([value, key]) => {
          let returnNumber = 0;
          let firstObject = true;

          Object.values(objects).forEach(object => {
            const objectValue = object[key];
            if (!LCF.Type.Number(objectValue))
              throw `USER ERROR: Invalid data type sent to function: "LCF.Object.Math.Subtract".\n\nERROR: [parameter_1, parameter_infinity) can only contain Numbers as Object values! Parameter passed: "${object}" (KEY: ${key})`;

            if (firstObject) {
              returnNumber = objectValue;

              firstObject = false;
              return;
            }

            returnNumber = LCF.Math.Subtract(returnNumber, objectValue);
          });

          returnObject.push(returnNumber);
        });

        return returnObject;
      },
      Multiply: (...objects) => {
        const firstObjectLength = Object.keys(objects[0]).length;
        switch(false) {
          case LCF.Type.Object(objects[0]):
            throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Multiply".\n\nERROR: parameter_1 (...objects[0]) must be an Object! Parameters passed: "${objects}" (INDEX: 0)`;
          case firstObjectLength:
            throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Multiply".\n\nERROR: [parameter_1, parameter_infinity) (...objects) cannot be an empty Object! Parameters passed: "${objects}" (INDEX: 0) (OBJECT_LENGTH: "${objects.length}")`;
        }

        objects.forEach(object => {
          switch(false) {
            case LCF.Type.Object(object):
              throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Multiply".\n\nERROR: [parameter_1, parameter_infinity) (...objects) must be an Object! Parameters passed: "${objects}" (INDEX: ${objects.indexOf(object)})`;
            case (Object.keys(object).length === firstObjectLength):
              throw `USER ERROR: Invalid data to function: "LCF.Object.Math.Multiply".\n\nERROR: [parameter_2, parameter_infinity) (...objects) must be the same length as parameter_1 (...objects[0])! Parameters passed: "${objects}" (INDEX: ${objects.indexOf(object)}) (OBJECT_LENGTH: "${object.length}")`;
          }
        });

        const returnObject = {};
        Object.entries(objects[0]).forEach(([value, key]) => {
          let returnNumber = 0;
          let firstObject = true;

          Object.values(objects).forEach(object => {
            const objectValue = object[key];
            if (!LCF.Type.Number(objectValue))
              throw `USER ERROR: Invalid data type sent to function: "LCF.Object.Math.Multiply".\n\nERROR: [parameter_1, parameter_infinity) can only contain Numbers as Object values! Parameter passed: "${object}" (KEY: ${key})`;

            if (firstObject) {
              returnNumber = objectValue;

              firstObject = false;
              return;
            }

            returnNumber *= objectValue;
          });

          returnObject.push(returnNumber);
        });

        return returnObject;
      },
      Divide: (...objects) => {
        const firstObjectLength = Object.keys(objects[0]).length;
        switch(false) {
          case LCF.Type.Object(objects[0]):
            throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Divide".\n\nERROR: parameter_1 (...objects[0]) must be an Object! Parameters passed: "${objects}" (INDEX: 0)`;
          case firstObjectLength:
            throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Divide".\n\nERROR: [parameter_1, parameter_infinity) (...objects) cannot be an empty Object! Parameters passed: "${objects}" (INDEX: 0) (OBJECT_LENGTH: "${objects.length}")`;
        }

        objects.forEach(object => {
          switch(false) {
            case LCF.Type.Object(object):
              throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Divide".\n\nERROR: [parameter_1, parameter_infinity) (...objects) must be an Object! Parameters passed: "${objects}" (INDEX: ${objects.indexOf(object)})`;
            case (Object.keys(object).length === firstObjectLength):
              throw `USER ERROR: Invalid data to function: "LCF.Object.Math.Divide".\n\nERROR: [parameter_2, parameter_infinity) (...objects) must be the same length as parameter_1 (...objects[0])! Parameters passed: "${objects}" (INDEX: ${objects.indexOf(object)}) (OBJECT_LENGTH: "${object.length}")`;
          }
        });

        const returnObject = {};
        Object.entries(objects[0]).forEach(([value, key]) => {
          let returnNumber = 0;
          let firstObject = true;

          Object.values(objects).forEach(object => {
            const objectValue = object[key];
            if (!LCF.Type.Number(objectValue))
              throw `USER ERROR: Invalid data type sent to function: "LCF.Object.Math.Divide".\n\nERROR: [parameter_1, parameter_infinity) can only contain Numbers as Object values! Parameter passed: "${object}" (KEY: ${key})`;

            if (firstObject) {
              returnNumber = objectValue;

              firstObject = false;
              return;
            }

            returnNumber /= objectValue;
          });

          returnObject.push(returnNumber);
        });

        return returnObject;
      },
      Power: (...objects) => {
        const firstObjectLength = Object.keys(objects[0]).length;
        switch(false) {
          case LCF.Type.Object(objects[0]):
            throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Power".\n\nERROR: parameter_1 (...objects[0]) must be an Object! Parameters passed: "${objects}" (INDEX: 0)`;
          case firstObjectLength:
            throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Power".\n\nERROR: [parameter_1, parameter_infinity) (...objects) cannot be an empty Object! Parameters passed: "${objects}" (INDEX: 0) (OBJECT_LENGTH: "${objects.length}")`;
        }

        objects.forEach(object => {
          switch(false) {
            case LCF.Type.Object(object):
              throw `USER ERROR: Invalid data sent to function: "LCF.Object.Math.Power".\n\nERROR: [parameter_1, parameter_infinity) (...objects) must be an Object! Parameters passed: "${objects}" (INDEX: ${objects.indexOf(object)})`;
            case (Object.keys(object).length === firstObjectLength):
              throw `USER ERROR: Invalid data to function: "LCF.Object.Math.Power".\n\nERROR: [parameter_2, parameter_infinity) (...objects) must be the same length as parameter_1 (...objects[0])! Parameters passed: "${objects}" (INDEX: ${objects.indexOf(object)}) (OBJECT_LENGTH: "${object.length}")`;
          }
        });

        const returnObject = {};
        Object.entries(objects[0]).forEach(([value, key]) => {
          let returnNumber = 0;
          let firstObject = true;

          Object.values(objects).forEach(object => {
            const objectValue = object[key];
            if (!LCF.Type.Number(objectValue))
              throw `USER ERROR: Invalid data type sent to function: "LCF.Object.Math.Power".\n\nERROR: [parameter_1, parameter_infinity) can only contain Numbers as Object values! Parameter passed: "${object}" (KEY: ${key})`;

            if (firstObject) {
              returnNumber = objectValue;

              firstObject = false;
              return;
            }

            returnNumber **= objectValue;
          });

          returnObject.push(returnNumber);
        });

        return returnObject;
      }
    },
    Maths: LCF.Object.Math,
    LimitValueType: (object, ...types) => {
      if (!LCF.Type.Object(object))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Object.LimitValueType".\n\nERROR: parameter_1 (object) must be an Object! Parameter passed: "${object}"  (TYPE: "${LCF.Type.Get(object)}")`;

      const allSupportedTypes = LCF.data.type.allSupported,
            supportedTypes = LCF.data.type.supported,

            mainTypes = [];

      types.forEach(type => {
        switch(false) {
          case LCF.Type.String(type):
            throw `USER ERROR: Invalid data type sent to function: "LCF.Object.LimitValueType".\n\nERROR: [parameter_2, parameter_infinity) (...types) must be a String! Parameters passed: "${types}" (INDEX: ${types.indexOf(type)})`;
          case allSupportedTypes.includes(type):
            throw `USER ERROR: Invalid data sent to function: "LCF.Object.LimitValueType".\n\nERROR: [parameter_2, parameter_infinity) (...types) must be one of the following Strings: "${allSupportedTypes.join(", ")}"! Parameters passed: "${types}" (INDEX: ${types.indexOf(type)})`;
          case Boolean(supportedTypes[type]):
            Object.entries(supportedTypes).some(([mainType, subTypes]) => {
              if (subTypes.includes(type)) {
                mainTypes.push(mainType);

                return true;
              }
            });
            break;
          default:
            mainTypes.push(type);
            break;
        }
      });

      const tempObject = {};
      Object.entries(object).forEach(([key, value]) => {
        const valueType = LCF.Type.Get(value);
        if (mainTypes.some(type => {
          return (valueType === type);
        }))
          tempObject[key] = value;
      });

      return tempObject;
    },
    KeysOf: (object, ...values) => {
      if (!LCF.Type.Object(object))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Object.KeysOf".\n\nERROR: parameter_1 must be an Object! Parameter passed: "${object}"`;

        const returnObject = {};
        Object.entries(object).forEach(([key, value]) => {
          values.forEach(valueToCheck => {
            returnObject[valueToCheck] ??= [];
            if (value === valueToCheck)
              returnObject[valueToCheck].push(key);
          });
        });

        return returnObject;
    }
  },
  Obj: LCF.Object,
  Number: {
    InRange: (numbers = [0], range = [0, 1], inclusive = [true, true], singleValue = true) => {
      inclusive = LCF.Array.LimitValueType(inclusive, "boolean");
      if (!LCF.Type.Array(inclusive) || !inclusive.length)
        if (!LCF.Type.Boolean(inclusive))
          inclusive = [true, true];
        else
          inclusive = [inclusive, inclusive];
      else if (inclusive.length === 1)
        if (!LCF.Type.Boolean(inclusive))
          inclusive = [true, true];
        else
          inclusive = [inclusive, true];
      else if (inclusive.length > 2)
        inclusive = [inclusive[0], inclusive[1]];

      range = LCF.Array.LimitValueType(range, "number");
      if (!LCF.Type.Array(range)) {
        range = +range;

        if (!LCF.Type.Number(range))
          range = [0, 1];
        else
          range = [range, Infinity];
      } else if (!range.length)
        range = [0, 1];
      else if (range.length > 2)
        range = [range[0], range[1]];

      numbers = LCF.Array.LimitValueType(numbers, "number");
      if (!LCF.Type.Array(numbers)) {
        numbers = +numbers;

        if (!LCF.Type.Number(numbers))
          numbers = [0];
        else
          numbers = [numbers];
      } else if (!numbers.length)
        numbers = [0];

      let numbersInRange = [];
      numbers.forEach(number => {
        if (inclusive[0] && number < range[0]) {
          numbersInRange.push(false);
          return;
        } else if (!inclusive[0] && number <= range[0]) {
          numbersInRange.push(false);
          return;
        }

        if (inclusive[1] && number > range[1]) {
          numbersInRange.push(false);
          return;
        } else if (!inclusive[1] && number >= range[1]) {
          numbersInRange.push(false);
          return;
        }

        numbersInRange.push(true);
      });

      if (singleValue) {
        numbersInRange = numbersInRange.reduce((totalBool, thisBool) => {
          return (totalBool && thisBool);
        });
      }

      return numbersInRange;
    }
  },
  Gate: {
    Buffer: bool => { //seperate input from output (no use ? )
      if (!LCF.Type.Boolean(bool))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Gates.Buffer".\n\nERROR: parameter_1 must be a Boolean! Parameter passed: "${bool}"`;

      return bool;
    },
    NOT: bool => { //opposite input
      if (!LCF.Type.Boolean(bool))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Gates.NOT".\n\nERROR: parameter_1 must be a Boolean! Parameter passed: "${bool}"`;

      return !bool;
    },
    AND: (...bools) => { //all true inputs
      return bools.every(bool => {
        if (!LCF.Type.Boolean(bool))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Gates.AND".\n\nERROR: [parameter_1, parameter_infinity) must be a Boolean! Parameters passed: "${bools}" (INDEX: ${bools.indexOf(bool)})`;

        return bool;
      });
    },
    OR: (...bools) => { //at least one true input
      return bools.some(bool => {
        if (!LCF.Type.Boolean(bool))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Gates.OR".\n\nERROR: [parameter_1, parameter_infinity) must be a Boolean! Parameters passed: "${bools}" (INDEX: ${bools.indexOf(bool)})`;

        return bool;
      });
    },
    NAND: (...bools) => { //at least one false input
      return bools.some(bool => {
        if (!LCF.Type.Boolean(bool))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Gates.NAND".\n\nERROR: [parameter_1, parameter_infinity) must be a Boolean! Parameters passed: "${bools}" (INDEX: ${bools.indexOf(bool)})`;

        return !bool;
      });
    },
    NOR: (...bools) => { //no true input
      return bools.every(bool => {
        if (!LCF.Type.Boolean(bool))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Gates.NOR".\n\nERROR: [parameter_1, parameter_infinity) must be a Boolean! Parameters passed: "${bools}" (INDEX: ${bools.indexOf(bool)})`;

        return !bool;
      });
    },
    XOR: (...bools) => { //amount of trues is odd
      return Boolean(bools.reduce((trues, bool) => {
        if (!LCF.Type.Boolean(bool))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Gates.XOR".\n\nERROR: [parameter_1, parameter_infinity) must be a Boolean! Parameters passed: "${bools}" (INDEX: ${bools.indexOf(bool)})`;

        trues += +bool;
      }) % 2);
    },
    XNOR: (...bools) => { //amount of falses is odd
      return !(bools.reduce((trues, bool) => {
        if (!LCF.Type.Boolean(bool))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Gates.XNOR".\n\nERROR: [parameter_1, parameter_infinity) must be a Boolean! Parameters passed: "${bools}" (INDEX: ${bools.indexOf(bool)})`;

        trues += +bool;
      }) % 2);
    }
  },
  Character: {
    Number: (start = 0, end = 100) => { //both inclusive
      switch(false) {
        case LCF.Type.Integer(start):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Character.Number".\n\nERROR: parameter_1 must be an Integer! Parameter passed: "${start}"`;
        case LCF.Type.Integer(end):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Character.Number".\n\nERROR: parameter_2 must be an Integer! Parameter passed: "${emd}"`;
        case (end <= start):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.Number".\n\nERROR: parameter_2 cannot be greater than parameter_1! Parameter passed: "${parameter_2}" (GREATER THAN PARAMETER_1 [${parameter_1}])`;
        case (start <= 2147483647): //31^2-1 (upper 32 bit integer limit)
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.Number".\n\nERROR: parameter_1 and parameter_2 must be an Integer between [-2147483648, 2147483648)! Parameters passed: "${parameter_1}, ${parameter_2}"`;
        case (end >= -2147483648): //-(31^2) (lower 32 bit integer limit)
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.Number".\n\nERROR: parameter_1 and parameter_2 must be an Integer between [-2147483648, 2147483648)! Parameters passed: "${parameter_1}, ${parameter_2}"`;
      }

      const numbers = [];
      for (let number = start;number < end + 1;number++)
        numbers.concat([number]); //concat is faster for some reason ?

      return numbers;
    },
    Alphabet: (start = 1, end = 26) => { //both inclusive
      switch(false) {
        case LCF.Type.Integer(start):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Character.Alphabet".\n\nERROR: parameter_1 must be a Integer! Parameter passed: "${start}"`;
        case LCF.Type.Integer(end):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Character.Alphabet".\n\nERROR: parameter_2 must be a Integer! Parameter passed: "${emd}"`;
        case (end <= start):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.Alphabet".\n\nERROR: parameter_2 cannot be greater than parameter_1! Parameter passed: "${parameter_2}" (GREATER THAN PARAMETER_1 [${parameter_1}])`;
        case (start > 0):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.Alphabet".\n\nERROR: parameter_1 and parameter_2 must be an Integer between [1, 26]! Parameters passed: "${parameter_1}, ${parameter_2}"`;
        case (end <= 26):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.Alphabet".\n\nERROR: parameter_1 and parameter_2 must be an Integer between [1, 26]! Parameters passed: "${parameter_1}, ${parameter_2}"`;
      }

      const alphabet = [];
      for (let letter = 65 + start - 1;letter < 65 + end;letter++)
        alphabet.concat([String.fromCharCode(letter)]); //concat is faster for some reason ?

      return alphabet;
    },
    Ascii: (start = 0, end = 127) => { //both inclusive
      switch(false) {
        case LCF.Type.Integer(start):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Character.Ascii".\n\nERROR: parameter_1 must be a Integer! Parameter passed: "${start}"`;
        case LCF.Type.Integer(end):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Character.Ascii".\n\nERROR: parameter_2 must be a Integer! Parameter passed: "${emd}"`;
        case (end <= start):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.Ascii".\n\nERROR: parameter_2 cannot be greater than parameter_1! Parameter passed: "${parameter_2}" (GREATER THAN PARAMETER_1 [${parameter_1}])`;
        case (start > 0):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.Ascii".\n\nERROR: parameter_1 and parameter_2 must be an Integer between [0, 128)! Parameters passed: "${parameter_1}, ${parameter_2}"`;
        case (end <= 26):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.Ascii".\n\nERROR: parameter_1 and parameter_2 must be an Integer between [0, 128)! Parameters passed: "${parameter_1}, ${parameter_2}"`;
      }

      const ascii = [];
      for (let character = start;character <= end;character++)
        ascii.concat([String.fromCharCode(character)]); //concat is faster for some reason ?

      return ascii;
    },
    ExtendedAscii: (start = 0, end = 255) => { //both inclusive
      switch(false) {
        case LCF.Type.Integer(start):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Character.ExtendedAscii".\n\nERROR: parameter_1 must be a Integer! Parameter passed: "${start}"`;
        case LCF.Type.Integer(end):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Character.ExtendedAscii".\n\nERROR: parameter_2 must be a Integer! Parameter passed: "${emd}"`;
        case (end <= start):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.ExtendedAscii".\n\nERROR: parameter_2 cannot be greater than parameter_1! Parameter passed: "${parameter_2}" (GREATER THAN PARAMETER_1 [${parameter_1}])`;
        case (start > 0):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.ExtendedAscii".\n\nERROR: parameter_1 and parameter_2 must be an Integer between [0, 256)! Parameters passed: "${parameter_1}, ${parameter_2}"`;
        case (end < 256):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.ExtendedAscii".\n\nERROR: parameter_1 and parameter_2 must be an Integer between [0, 256)! Parameters passed: "${parameter_1}, ${parameter_2}"`;
      }

      const extendedAscii = [];
      for (let character = start;character <= end;character++)
        extendedAscii.concat([String.fromCharCode(character)]); //concat is faster for some reason ?

      return extendedAscii;
    },
    Unicode: (start = 0, end = 100) => { //both inclusive
      switch(false) {
        case LCF.Type.Integer(start):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Character.ExtendedAscii".\n\nERROR: parameter_1 must be a Integer! Parameter passed: "${start}"`;
        case LCF.Type.Integer(end):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Character.ExtendedAscii".\n\nERROR: parameter_2 must be a Integer! Parameter passed: "${emd}"`;
        case (end <= start):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.ExtendedAscii".\n\nERROR: parameter_2 cannot be greater than parameter_1! Parameter passed: "${parameter_2}" (GREATER THAN PARAMETER_1 [${parameter_1}])`;
        case (start > 0):
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.ExtendedAscii".\n\nERROR: parameter_1 and parameter_2 must be an Integer between [0, 149186)! Parameters passed: "${parameter_1}, ${parameter_2}"`;
        case (end < 149186): //max number of unicode characters **as of Unicode V15.0
          throw `USER ERROR: Invalid data sent to function: "LCF.Character.ExtendedAscii".\n\nERROR: parameter_1 and parameter_2 must be an Integer between [0, 149186)! Parameters passed: "${parameter_1}, ${parameter_2}"`;
      }

      const unicode = [];
      for (let character = start;character <= end;character++)
        unicode.concat([String.fromCharCode(character)]); //concat is faster for some reason ?

      return unicode;
    }
  },
  Char: LCF.Character,
  Element: {
    GetBorderRadius: (element, borderRadius) => {
      switch(false) {
        case LCF.Type.HTML_Element(element):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Element.GetBorderRadius".\n\nERROR: parameter_1 must be an HTML Element! Parameter passed: "${element}"`;
        case LCF.Type.Number(borderRadius):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Element.GetBorderRadius".\n\nERROR: parameter_2 must be a Number! Parameter passed: "${number}"`;
      }

      return `${borderRadius}% / ${borderRadius * (element.clientWidth / element.clientHeight)}%`;
    },
    GetTextWidth: (text, fontFamily, fontSize) => {
      switch(false) {
        case LCF.Type.String(text):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Element.GetTextWidth".\n\nERROR: parameter_1 must be a String! Parameter passed: "${text}"`;
        case LCF.Type.CSS_FontFamily(fontFamily):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Element.GetTextWidth".\n\nERROR: parameter_2 must be a CSS Font Family! Parameter passed: "${fontFamily}"`;
        case LCF.Type.CSS_FontSize(fontSize):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Element.GetTextWidth".\n\nERROR: parameter_3 must be a CSS Font Size! Parameter passed: "${fontSize}"`;
      }

      const span = document.createElement("span");
            span.innerHTML = text;

            span.classList.add("textWidth");

            span.style.fontFamily = fontFamily;
            span.style.fontSize = fontSize;

      document.body.appendChild(span);

      const textWidth = span.clientWidth;
      document.body.removeChild(span);

      return textWidth;
    },
    Move: (element, newParent) => {
      switch (false) {
        case LCF.Type.HTML_Element(element):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Element.Move".\n\nERROR: parameter_1 must be an HTML Element! Parameter passed: "${element}"`;
        case LCF.Type.HTML_Element(newParent):
          throw `USER ERROR: Invalid data type sent to function: "LCF.Element.Move".\n\nERROR: parameter_2 must be an HTML Element! Parameter passed: "${newParent}"`;
      }

      newParent.appendChild(structuredClone(element));
      element.remove();
    }
  },
  Elmt: LCF.Element,
  Page: {
    Fade: {
      To: (newLocation, speed = 0.25) => {
        if (!LCF.Type.Number(speed))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Page.Fade.To".\n\nERROR: parameter_2 must be a Number! Parameter passed: "${speed}"`;

        const screen = document.createElement("screen");
              screen.classList.add("screen");

        document.body.appendChild(screen);

        screen.style.animation = `fadeIn ${speed}s linear 0s 1 normal forwards`;
        screen.onanimationend = event => {
          if (screen === event.target)
            location.href = newLocation;
        }
      },
      Out: (speed = 0.25) => {
        if (!LCF.Type.Number(speed))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Page.Fade.Out".\n\nERROR: parameter_1 must be a Number! Parameter passed: "${speed}"`;

        const screen = document.createElement("screen");
              screen.classList.add("screen");

        document.body.appendChild(screen);

        screen.style.animation = `fadeIn ${speed}s linear 0s 1 normal forwards`;
        screen.onanimationend = event => {
          if (screen === event.target)
            screen.remove();
        }
      },
      In: (speed = 0.25) => {
        if (!LCF.Type.Number(speed))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Page.Fade.In".\n\nERROR: parameter_1 must be a Number! Parameter passed: "${speed}"`;

        const screen = document.createElement("screen");
              screen.classList.add("screen");

        document.body.appendChild(screen);

        screen.style.animation = `fadeOut ${speed}s linear 0s 1 normal forwards`;
        screen.onanimationend = event => {
          if (screen === event.target)
            screen.remove();
        };
      }
    }
  },
  Timer: {
    Create: (stopwatch = true) => {
      if (!LCF.Type.Boolean(stopwatch))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Timer.Create".\n\nERROR: parameter_1 must be a Boolean! Parameter passed: "${stopwatch}"`;

      const newTimer = new Timer(stopwatch);

      LCF.data.timers.push(newTimer);

      return newTimer;
    }
  },
  data: {
    update: {
      start: true,
      interval: null,
      speed: 100,
      running: false,
      customFunctions: {},
      textFitElements: {},
      lastBritishSpellingState: false
    },
    type: {
      allSupported: null,
      supported: {
        function: ["func"],
        date: [],
        object: ["obj"],
        array: ["arr"],
        string: ["str"],
        number: ["num"],
        integer: ["int"],
        safe_integer: ["safe_int"],
        float: [],
        finite: [],
        boolean: ["bool"],
        null: [],
        undefined: ["undef"],
        empty: [],
        html_element: ["html_elmt"],
        css_color: ["css_colour", "css_clr"],
        css_position: ["css_pos"],
        event: ["evnt"],
        animation_event: ["anm_evnt"],
        clipboard_event: ["cb_evnt"],
        drag_event: ["drg_evnt"],
        focus_event: ["fc_evnt"],
        hash_change_event: ["hs_chg_evnt"],
        input_event: ["inpt_evnt"],
        keyboard_event: ["kb_evnt"],
        mouse_event: ["mse_evnt"],
        page_transition_event: ["pg_trans_evnt"],
        pop_state_event: ["pop_st_evnt"],
        progress_event: ["prg_evnt"],
        storage_event: ["str_evnt"],
        touch_event: ["tch_evnt"],
        transition_event: ["trans_evnt"],
        ui_event: ["ui_evnt"],
        wheel_event: ["whl_evnt"],
        error: ["err"],
        eval_error: ["evl_err"],
        range_error: ["rnge_err"],
        reference_error: ["ref_err"],
        syntax_error: ["syntx_err"],
        type_error: ["typ_err"],
        URI_error: ["URI_err"]
      },
      function_return: { //{ function to call, return value }
        Function: "function",
        Date: "date",
        Object: "object",
        Array: "array",
        String: "string",
        Number: "number",
        Integer: "integer",
        Float: "float",
        Boolean: "boolean",
        Null: "null",
        Undefined: "undefined",
        Empty: "empty",
        HTML_Element: "html_element",
        CSS_Color: (LCF.options.britishReturnValues) ? "css_colour" : "css_color",
        CSS_Position: "css_position",
        CSS_FontFamily: "css_fontFamily",
        CSS_FontSize: "css_fontSize",
        Event: "event",
        AnimationEvent: "animation_event",
        ClipboardEvent: "clipboard_event",
        DragEvent: "drag_event",
        FocusEvent: "focus_event",
        HashChangeEvent: "hash_change_event",
        InputEvent: "input_event",
        KeyboardEvent: "keyboard_event",
        MouseEvent: "mouse_event",
        PageTransitionEvent: "page_transition_event",
        PopStateEvent: "pop_state_event",
        ProgressEvent: "progress_event",
        StorageEvent: "storage_event",
        TouchEvent: "touch_event",
        TransitionEvent: "transition_event",
        UIEvent: "ui_event",
        WheelEvent: "wheel_event",
        Error: "error",
        EvalError: "eval_error",
        RangeError: "range_error",
        ReferenceError: "refrence_error",
        SyntaxError: "syntax_error",
        TypeError: "type_error",
        URIError: "URI_error",
      }
    },
    timers: []
  },
  options: {
    britishReturnValues: false, //does not effect parameters passed, or functions called, only values returned.
  }
};

class Timer {
  constructor(stopwatch) {
    this._stopwatch = stopwatch;
    this._clock = new Date().getTime();
    this._paused = true;
    this._pauseStart = new Date().getTime();
    this._lastPause = new Date().getTime();
    this._requestedDestruction = false;
  }
  get time() {
    if (this._stopwatch) {
      if (this._paused)
        return new Date().getTime() - (new Date().getTime() - this._pauseStart) - this._clock;
      else
        return new Date().getTime() - this._clock;
    } else {
      if (this._paused)
        return this._clock - new Date().getTime() + (new Date().getTime() - this._pauseStart);
      else
        return this._clock - new Date().getTime();
    }
  }
  set time(time) {
    if (!LCF.Type.Number(time))
      throw `USER ERROR: Invalid data type sent to variable: "time", in class: "Timer".\n\nERROR: Value passed must be a Number! Value passed: "${time}"`;

    if (this.stopwatch)
      this._clock = new Date().getTime() - time;
    else
      this._clock = new Date().getTime() + time;
  }
  get paused() {
    return this._paused;
  }
  get pauseStart() {
    return this._pauseStart;
  }
  get lastPause() {
    if (this._paused)
      return 0;
    else
      return new Date().getTime() - this._lastPause;
  }
  get isStopwatch() {
    return this._stopwatch;
  }
  get requestedDestruction() {
    return this._requestedDestruction;
  }
  addTime = time => {
    if (!LCF.Type.Number(time))
      throw `USER ERROR: Invalid data type sent to function: "addTime", in class: "Timer".\n\nERROR: parameter_1 must be a Number! Parameter passed: "${time}"`;

    if (this._stopwatch)
      this._clock -= time;
    else
      this._clock += time;
  }
  removeTime = time => {
    if (!LCF.Type.Number(time))
      throw `USER ERROR: Invalid data type sent to function: "removeTime", in class: "Timer".\n\nERROR: parameter_1 must be a Number! Parameter passed: "${time}"`;

    if (this._stopwatch)
      this._clock += time;
    else
      this._clock -= time;
  }
  play = () => {
    if (this._pauseStart) {
      this.addTime(new Date().getTime() - this._pauseStart);

      this._lastPause = new Date().getTime();
    }

    this._paused = false;
    this._pauseStart = null;
  }
  pause = () => {
    this._paused = true;
    this._pauseStart = new Date().getTime();
  }
  toggle = () => {
    this._paused = !this._paused;

    if (this._paused)
      this._pauseStart = new Date().getTime();
    else if (this._pauseStart) {
      this.addTime(new Date().getTime() - this._pauseStart);

      this._lastPause = new Date().getTime();
    }
  }
  destroy = () => {
    this._requestedDestruction = true;
  }
}

LCF.Startup();