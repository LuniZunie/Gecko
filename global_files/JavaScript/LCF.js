const LCF = { //LuniZunie's Custom Functions
  Update: {
    update: () => {
      //Update Custom Function
      const customFunctions = Object.values(LCF.data.update.customFunctions);
      customFunctions.forEach(customFunction => {
        if (LCF.IsType.Function(customFunction))
          customFunction();
        else
          delete LCF.data.update.customFunctions[thisFunction.name];
      });

      //Update Text Fit Elements
      const textFitElements = Object.entries(LCF.data.update.textFitElements);
      textFitElements.forEach(([key, textFitElement]) => {
        const element = textFitElement.element;
        const padding = textFitElement.padding;
        if (LCF.IsType.HTMLElement(element)) {
          const originalHiddenValue = element.hidden,
                originalDisplayValue = element.style.display;

          element.hidden &&= false;
          element.style.display = (element.style.display === "none") ? "block" : element.style.display;

          const fontSize = element.clientHeight - padding.vertical * 2,
                maxTextWidth = LCF.Elements.GetTextWidth(element.innerHTML, element.style.fontFamily ?? "'Times New Roman', serif", `${fontSize}px`) + padding.horizontal * 2;

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
      if (!LCF.IsType.Function(thisFunction))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.AddFunction".\n\nERROR: parameter_1 must be a Function! Parameter passed: "${thisFunction}"`;

      LCF.data.update.customFunctions[thisFunction.name] = thisFunction;

      return thisFunction.name;
    },
    RemoveFunction: thisFunction => {
      if (!LCF.IsType.Function(thisFunction))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.RemoveFunction".\n\nERROR: parameter_1 must be a Function! Parameter passed: "${thisFunction}"`;

      delete LCF.data.update.customFunctions[thisFunction.name];
    },
    IncludesFunction: thisFunction => {
      if (!LCF.IsType.Function(thisFunction))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.IncludesFunction".\n\nERROR: parameter_1 must be a Function! Parameter passed: "${thisFunction}"`;

      return Boolean(LCF.data.update.customFunctions[thisFunction.name]);
    },
    CustomFunctions: () => {
      return LCF.data.update.customFunctions;
    },
    AddTextFitElement: (element, padding) => {
      if (!LCF.IsType.HTMLElement(element))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.AddTextFitElement".\n\nERROR: parameter_1 must be an HTML Element! Parameter passed: "${element}"`;

      if (LCF.IsType.Number(padding))
        padding = {
          padding: padding
        };
      else if (!LCF.IsType.Object(padding))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.AddTextFitElement".\n\nERROR: parameter_2 must be a Number OR an Object! Parameter passed: "${padding}"`;

      const possibleKeys = ["top", "right", "bottom", "left", "vertical", "horizontal", "padding"],
            alreadyContainsKey = [];
      Object.entries(padding).every(([key, value]) => {
        if (!LCF.IsType.Number(value))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Update.AddTextFitElement".\n\nERROR: parameter_2 can only contain Numbers as object values! Parameter passed: "${padding}" (KEY: ${key})`;

        if (!possibleKeys.includes(key))
          throw `USER ERROR: Invalid data sent to function: "LCF.Update.AddTextFitElement".\n\nERROR: parameter_2 can only contain the following keys: "${possibleKeys.join("\", \"")}"! Key sent: "${key}"`;
        else if (alreadyContainsKey.includes(key))
          throw `USER ERROR: Invalid data sent to function: "LCF.Update.AddTextFitElement".\n\nERROR: parameter_2 cannot contain duplicate keys! Duplicate key: "${key}"`;
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
      if (!LCF.IsType.String(id))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.ChangeTextFitElement".\n\nERROR: parameter_1 must be a String! Parameter passed: "${id}"`;

      if (LCF.IsType.Number(padding))
        padding = {
          padding: padding
        };
      else if (!LCF.IsType.Object(padding))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.ChangeTextFitElement".\n\nERROR: parameter_2 must be a Number OR an Object! Parameter passed: "${padding}"`;


      const possibleKeys = ["top", "right", "bottom", "left", "vertical", "horizontal", "padding"],
            alreadyContainsKey = [];
      Object.entries(padding).every(([key, value]) => {
        if (!LCF.IsType.Number(value))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Update.ChangeTextFitElement".\n\nERROR: parameter_2 can only contain Numbers as object values! Parameter passed: "${padding}" (KEY: ${key})`;

        if (!possibleKeys.includes(key))
          throw `USER ERROR: Invalid data sent to function: "LCF.Update.ChangeTextFitElement".\n\nERROR: parameter_2 can only contain the following keys: "${possibleKeys.join("\", \"")}"! Key sent: "${key}"`;
        else if (alreadyContainsKey.includes(key))
          throw `USER ERROR: Invalid data sent to function: "LCF.Update.ChangeTextFitElement".\n\nERROR: parameter_2 cannot contain duplicate keys! Duplicate key: "${key}"`;
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
      if (!LCF.IsType.String(id))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.RemoveTextFitElement".\n\nERROR: parameter_1 must be a String! Parameter passed: "${id}"`;

      if (!LCF.data.update.textFitElements[id])
        throw `USER ERROR: Unknown "Text Fit Object" id ("${id}") sent to function: "LCF.Update.RemoveTextFitElement".\n\nERROR: A "Text Fit Object" with id: "${id}" could not be found.`;

      delete LCF.data.update.textFitElements[id];
    },
    IncludesTextFitElement: id => {
      if (!LCF.IsType.String(id))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.IncludesTextFitElement".\n\nERROR: parameter_1 must be a String! Parameter passed: "${id}"`;

      return Boolean(LCF.data.update.textFitElements[id]);
    },
    TextFitElements: () => {
      return LCF.data.update.textFitElements;
    },
    SetSpeed: speed => {
      if (!LCF.IsType.Number(speed))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.SetSpeed".\n\nERROR: parameter_1 must be a Number! Parameter passed: "${speed}"`;

      if (speed < 0)
        throw `USER ERROR: Invalid data type sent to function: "LCF.Update.SetSpeed".\n\nERROR: parameter_1 must be in the range [0, Infinity)! Number sent: "${speed}"`;

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

      if (!LCF.IsType.String(title))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_1 must be a String! Parameter passed: "${title}"`;
      if (!LCF.IsType.String(message))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_1 must be a String! Parameter passed: "${message}"`;

      if (!LCF.IsType.Object(colors))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_1 must be an Object! Parameter passed: "${colors}"`;

      let backgroundColor = "default",
          titleColor = "default",
          messageColor = "default";

      const alreadyContainsKey = [];
      Object.entries(colors).forEach(([key, value]) => {
        if (value === "default")
          return;
        else if (!LCF.IsType.CSSColor(value))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_3 can only contain CSS Colors as values OR the String: "default"! Parameter passed: "${colors}" (KEY: ${key})`;

        if (alreadyContainsKey.includes(key))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_3 cannot contain duplicate keys! Duplicate key: "${key}"`;

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
            throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_3 can only contain the following keys: "background", "bg", "title", "t", "message", "msg"! Key sent: "${key}"`;
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
      else if (!LCF.IsType.CSSPosition(horizontalPadding))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_4 must be a CSS Position! Parameter passed: "${horizontalPadding}"`;

      if (verticalPadding === "default")
        verticalPadding = "0px";
      else if (!LCF.IsType.CSSPosition(verticalPadding))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_5 must be a CSS Position! Parameter passed: "${verticalPadding}"`;

      const possibleStrings = ["top","top-right","right","bottom-right","bottom","bottom-left","left","top-left","center","default"];
      if (location === "default")
        location = "top";
      else if (!possibleStrings.includes(location))
        throw `USER ERROR: Invalid data sent to function: "LCF.Window.Alert".\n\nERROR: parameter_6 must be one of the following Strings: "${possibleStrings.join("\", \"")}"! Parameter passed: "${location}"`;

      if (!LCF.IsType.Number(timeout))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Window.Alert".\n\nERROR: parameter_7 must be a Number! Parameter passed: "${timeout}"`;

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

      alertDiv.style.borderRadius = LCF.Elements.GetBorderRadius(alertDiv, 5);

      if (location.includes("-"))
        alertDiv.classList.add(...location.split("-"));
      else {
        switch (location) {
          case "center":
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

        if (location !== "center");
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
    }
  },
  Math: {
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
    Random: (random = true, weights = []) => { //random = min, weights = max for random number
      if (LCF.IsType.Boolean(random)) {
        const totalWeight = weights.reduce((sum, value) => sum + value, 0);
        if (LCF.IsType.Array(weights) && weights.length === 2 && LCF.IsType.Number(totalWeight))
          return (Math.floor(Math.random() * totalWeight) < weights[0]); //return random boolean - weighted
        else
          return (Math.floor(Math.random() * 2)); //return random boolean - non weighted
      } else if (LCF.IsType.Array(random) && random.length) {
        const totalWeight = weights.reduce((sum, value) => sum + value, 0);
        if (LCF.IsType.Array(weights) && weights.length === random.length && LCF.IsType.Number(totalWeight)) {
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
      } else if (LCF.IsType.Number(+random) || LCF.IsType.Number(+weights)) { //random number (inclusive)
        if (!LCF.IsType.Number(weights))
          return +random; //if no max, return min or 0 if there is no min
        else if (!LCF.IsType.Number(random))
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
      if (!LCF.IsType.Array(dimensions))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.RandomCoordinates".\n\nERROR: parameter_1 must be an Array! Parameter passed: "${dimensions}"`;
      else if (!dimensions.length)
        throw `USER ERROR: Invalid data to function: "LCF.Math.RandomCoordinates".\n\nERROR: parameter_1 cannot be an empty array! Parameter passed: "${dimensions}"`;

      const returnCoords = {},
            dimensionLetters = ["x", "y", "z", "w"]; //W is commonly seen as the "4th" spacial dimension

      dimensions.forEach((dimension, index) => {
        if (!LCF.IsType.Array(dimension))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.RandomCoordinates".\n\nERROR: parameter_1 can only contain Arrays with 2 Number values! Parameter passed: "${dimensions}" (INDEX: ${index})`;
        else if (dimension.length !== 2)
          throw `USER ERROR: Invalid data to function: "LCF.Math.RandomCoordinates".\n\nERROR: parameter_1 can only contain Arrays with 2 Number values! Parameter passed: "${dimensions}" (INDEX: ${index})`;

        if (!LCF.IsType.Number(+dimension[0], +dimension[1]))
          throw `USER ERROR: Invalid data type sent to function: "LCF.Math.RandomCoordinates".\n\nERROR: parameter_1 can only contain Arrays with 2 Number values! Parameter passed: "${dimensions}" (INDEX: ${index})`;

        returnCoords[dimensionLetters[index] ?? index] = LCF.Math.Random(...dimension);
      });

      return returnCoords;
    },
    Distance: (x1 = 0, y1 = 0, x2 = 0, y2 = 0) => {
      if (!LCF.IsType.Number(x1, y1, x2, y2))
        throw `USER ERROR: Invalid data type sent to function: "LCF.Math.Distance".\n\nERROR: All parameters passed must be a Number! Parameters passed: "${[x1, y1, x2, y2].join("\", \"")}"`;

      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    CoordinatesInArea: (x1 = 0, y1 = 0, x2 = 0, y2 = 0, range = 0, type = "square", inclusive = true) => {
      if (!LCF.IsType.Number(x1, y1, x2, y2, range) || !LCF.IsType.Boolean(inclusive))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      if (type === "square")
        if (inclusive)
          return (Math.abs(x2 - x1) <= range && Math.abs(y2 - y1) <= range);
        else
          return (Math.abs(x2 - x1) < range && Math.abs(y2 - y1) < range);
      else if (type === "circle")
        if (inclusive)
          return (LCF.Math.distance(x1, y1, x2, y2) <= range);
        else
          return (LCF.Math.distance(x1, y1, x2, y2) < range);
      else
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
    },
    Slope: (x1 = 0, y1 = 0, x2 = 0, y2 = 0) => {
      if (!LCF.IsType.Number(x1, y1, x2, y2))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      let slope = Math.abs((y2 - y1) / (x2 - x1));
          slope ||= 0;

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
      if (!LCF.IsType.Number(rise, rise) || !LCF.IsType.Boolean(degrees))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      if (degrees)
        return -Math.atan2(rise, run) * 180 / Math.PI;
      else
        return -Math.atan2(rise, run);
    },
    AngleToSlope: (angle, degrees = true) => {
      if (!LCF.IsType.Number(angle) || !LCF.IsType.Boolean(degrees))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      if (!degrees)
        angle *= 180 / Math.PI;

      angle %= 360;

      let rise = 1,
          run = 1;

      const slopeAngle = 45 - Math.abs(45 - (angle % 90)),
            slope = Math.tan(slopeAngle * Math.PI / 180);


      if (angle <= 45)
        rise *= -slope;
      else if (angle <= 90) {
        run *= slope;
        rise *= -1;
      } else if (angle <= 135) {
        run *= -slope;
        rise *= -1;
      } else if (angle <= 180) {
        run *= -1;
        rise *= -slope;
      } else if (angle <= 225) {
        run *= -1;
        rise *= slope;
      } else if (angle <= 270)
        run *= -slope;
      else if (angle <= 305)
        run *= slope;
      else
        rise *= slope;

      return {
        rise: rise,
        run: run
      };
    },
    RadiansToDegrees: radians => {
      if (!LCF.IsType.Number(radians))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return radians * 180 / Math.PI;
    },
    DegreesToRadians: degrees => {
      if (!LCF.IsType.Number(degrees))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return degrees * Math.PI / 180;
    },
    DecimalToBinary: decimal => {
      if (!LCF.IsType.Number(decimal))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return decimal.toString(16);
    },
    BinaryToDecimal: binary => {
      if (!LCF.IsType.Number(binary) && !LCF.IsType.String(binary))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return parseInt(binary, 2);
    },
    DecimalToHex: decimal => {
      if (!LCF.IsType.Number(decimal))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return decimal.toString(16);
    },
    HexToDecimal: hex => {
      if (!LCF.IsType.Number(hex) && !LCF.IsType.String(hex))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return parseInt(hex, 16);
    },
    BinaryToHex: binary => {
      if (!LCF.IsType.Number(binary) && !LCF.IsType.String(binary))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return parseInt(binary, 2).toString(16);
    },
    HexToBinary: hex => {
      if (!LCF.IsType.String(hex) && !LCF.IsType.String(hex))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return parseInt(hex, 16).toString(2);
    }
  },
  IsType: {
    Function: (...values) => {
      return values.every(value => {
        return (typeof value === "function");
      });
    },
    Date: (...values) => {
      return values.every(value => {
        return (value instanceof Date);
      });
    },
    Object: (...values) => {
      return values.every(value => {
        return (value === Object(value));
      });
    },
    Array: (...values) => {
      return values.every(value => {
        return (value instanceof Array);
      });
    },
    String: (...values) => {
      return values.every(value => {
        return (typeof value === "string");
      });
    },
    Number: (...values) => {
      return values.every(value => {
        return (typeof value === "number");
      });
    },
    Boolean: (...values) => {
      return values.every(value => {
        return (typeof value === "boolean");
      });
    },
    Null: (...values) => {
      return values.every(value => {
        return (value === null);
      });
    },
    Undefined: (...values) => {
      return values.every(value => {
        return (typeof value === undefined);
      });
    },
    Empty: (...values) => {
      return values.every(value => {
        return (LCF.IsType.Null(value) || LCF.IsType.Undefined(value));
      });
    },
    HTMLElement: (...values) => {
      return values.every(value => {
        return (value instanceof HTMLElement);
      });
    },
    CSSColor: (...colors) => {
      return values.every(value => {
        const style = new Option().style;
              style.color = value;

        return (style.color != "");
      });
    },
    CSSPosition: (...positions) => {
      return values.every(value => {
        const style = new Option().style;
              style.left = value;

        return (style.left != "");
      });
    }
  },
  Array: {
    ConvertTo: {
      Number: (...arrays) => {
        if (!arrays.length)
          return "Invalid data type sent to function: LCF.ConvertTo.Number";

        let returnArrays = [];
        arrays.forEach(array => {
          if (!(array instanceof Array) || !array.length)
            return;

          const newArray = [];
          array.forEach(value => {
            newArray.push(+value);
          });

          if (newArray.length === 1)
            returnArrays.push(newArray[0]);
          else
            returnArrays.concat(newArray);
        });

        switch(returnArrays.length) {
          case 0:
            return "Invalid data type sent to function: LCF.ConvertTo.Number";
          case 1:
            return returnArrays[0];
          default:
            return returnArrays;
        }
      },
      String: (...arrays) => {
        if (!arrays.length)
          return "Invalid data type sent to function: LCF.ConvertTo.String";

        let returnArrays = [];
        arrays.forEach(array => {
          if (!(array instanceof Array) || !array.length)
            return;

          const newArray = [];
          array.forEach(value => {
            newArray.push(value.toString());
          });

          if (newArray.length === 1)
            returnArrays.push(newArray[0]);
          else
            returnArrays.concat(newArray);
        });

        switch(returnArrays.length) {
          case 0:
            return "Invalid data type sent to function: LCF.ConvertTo.String";
          case 1:
            return returnArrays[0];
          default:
            return returnArrays;
        }
      },
      Boolean: (...arrays) => {
        if (!arrays.length)
          return "Invalid data type sent to function: LCF.ConvertTo.Boolean";

        let returnArrays = [];
        arrays.forEach(array => {
          if (!(array instanceof Array) || !array.length)
            return;

          const newArray = [];
          array.forEach(value => {
            newArray.push(Boolean(value));
          });

          if (newArray.length === 1)
            returnArrays.push(newArray[0]);
          else
            returnArrays.concat(newArray);
        });

        switch(returnArrays.length) {
          case 0:
            return "Invalid data type sent to function: LCF.ConvertTo.Boolean";
          case 1:
            return returnArrays[0];
          default:
            return returnArrays;
        }
      }
    },
    LimitValueType: (array, types) => {
      if (!(LCF.IsType.String(types) || LCF.IsType.Array(types)) || !LCF.IsType.Array(array))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      else if (LCF.IsType.String(types))
        types = [types];

      types.forEach(type => {
        if (!LCF.IsType.String(type))
          throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      });

      return array.filter(value => {
        return types.includes(typeof value);
      });
    },
    IndexesOf: (array, values, typeSensitive = true) => {
      if (!LCF.IsType.Array(array))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      else if (!LCF.IsType.Array(values))
        values = [values];

      const returnArray = [];
      array.forEach((value, index) => {
        if (typeSensitive && values.includes(value))
          returnArray.push(index);
        else if (!typeSensitive) {
          values.every(valueToCheck => {
            if (value == valueToCheck) {
              returnArray.push(index);

              return;
            }

            return true;
          });
        }
      });

      return returnArray;
    },
    Add: (...arrays) => {
      if (!arrays.length || !arrays[0].length)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      arrays.forEach(array => {
        if (array.length !== arrays[0].length)
          throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      });

      const returnArray = [];
      arrays.forEach((value, valueIndex) => {
        let returnNumber = 0;

        arrays.forEach((array, arrayIndex) => {
          if (!arrayIndex) {
            returnNumber = arrayIndex;
            return;
          }

          const arrayValue = array[valueIndex];
          if (!LCF.IsType.Number(arrayValue))
            throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

          returnNumber = LCF.Math.Add(returnNumber, arrayValue);
        });

        returnArray.push(returnNumber);
      });

      return returnArray;
    },
    Subtract: (...arrays) => {
      if (!arrays.length || !arrays[0].length)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      arrays.forEach(array => {
        if (array.length !== arrays[0].length)
          throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      });

      const returnArray = [];
      arrays.forEach((value, valueIndex) => {
        let returnNumber = 0;

        arrays.forEach((array, arrayIndex) => {
          if (!arrayIndex) {
            returnNumber = arrayIndex;
            return;
          }

          const arrayValue = array[valueIndex];
          if (!LCF.IsType.Number(arrayValue))
            throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

          returnNumber = LCF.Math.Subtract(returnNumber, arrayValue);
        });

        returnArray.push(returnNumber);
      });

      return returnArray;
    },
    Multiply: (...arrays) => {
      if (!arrays.length || !arrays[0].length)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      arrays.forEach(array => {
        if (array.length !== arrays[0].length)
          throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      });

      const returnArray = [];
      arrays.forEach((value, valueIndex) => {
        let returnNumber = 0;

        arrays.forEach((array, arrayIndex) => {
          if (!arrayIndex) {
            returnNumber = arrayIndex;
            return;
          }

          const arrayValue = array[valueIndex];
          if (!LCF.IsType.Number(arrayValue))
            throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

          returnNumber *= arrayValue;
        });

        returnArray.push(returnNumber);
      });

      return returnArray;
    },
    Divide: (...arrays) => {
      if (!arrays.length || !arrays[0].length)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      arrays.forEach(array => {
        if (array.length !== arrays[0].length)
          throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      });

      const returnArray = [];
      arrays.forEach((value, valueIndex) => {
        let returnNumber = 0;

        arrays.forEach((array, arrayIndex) => {
          if (!arrayIndex) {
            returnNumber = arrayIndex;
            return;
          }

          const arrayValue = array[valueIndex];
          if (!LCF.IsType.Number(arrayValue))
            throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

          returnNumber /= arrayValue;
        });

        returnArray.push(returnNumber);
      });

      return returnArray;
    },
    Power: (...arrays) => {
      if (!arrays.length || !arrays[0].length)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      arrays.forEach(array => {
        if (array.length !== arrays[0].length)
          throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      });

      const returnArray = [];
      arrays.forEach((value, valueIndex) => {
        let returnNumber = 0;

        arrays.forEach((array, arrayIndex) => {
          if (!arrayIndex) {
            returnNumber = arrayIndex;
            return;
          }

          const arrayValue = array[valueIndex];
          if (!LCF.IsType.Number(arrayValue))
            throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

          returnNumber **= arrayValue;
        });

        returnArray.push(returnNumber);
      });

      return returnArray;
    }
  },
  Number: {
    InRange: (numbers = [0], range = [0, 1], inclusive = [true, true], singleValue = true) => {
      inclusive = LCF.Array.LimitValueType(inclusive, "boolean");
      if (!LCF.IsType.Array(inclusive) || !inclusive.length)
        if (!LCF.IsType.Boolean(inclusive))
          inclusive = [true, true];
        else
          inclusive = [inclusive, inclusive];
      else if (inclusive.length === 1)
        if (!LCF.IsType.Boolean(inclusive))
          inclusive = [true, true];
        else
          inclusive = [inclusive, true];
      else if (inclusive.length > 2)
        inclusive = [inclusive[0], inclusive[1]];

      range = LCF.Array.LimitValueType(range, "number");
      if (!LCF.IsType.Array(range)) {
        range = +range;

        if (!LCF.IsType.Number(range))
          range = [0, 1];
        else
          range = [range, Infinity];
      } else if (!range.length)
        range = [0, 1];
      else if (range.length > 2)
        range = [range[0], range[1]];

      numbers = LCF.Array.LimitValueType(numbers, "number");
      if (!LCF.IsType.Array(numbers)) {
        numbers = +numbers;

        if (!LCF.IsType.Number(numbers))
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
  Gates: {
    Buffer: bool => { //seperate input from output
      if (!LCF.IsType.Boolean(bool))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return bool;
    },
    NOT: bool => { //opposite input
      if (!LCF.IsType.Boolean(bool))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return !bool;
    },
    AND: (...bools) => { //all true inputs
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return bools.every(bool => {
        return bool;
      });
    },
    OR: (...bools) => { //at least one true input
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return !(bools.every(bool => {
        return !bool;
      }));
    },
    NAND: (...bools) => { //at least one false input
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return !(bools.every(bool => {
        return bool;
      }));
    },
    NOR: (...bools) => { //no true input
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return bools.every(bool => {
        return !bool;
      });
    },
    XOR: (...bools) => { //amount of trues is odd
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      let trues = 0;
      bools.forEach(bool => {
        trues += +bool;
      });

      return Boolean(trues % 2);
    },
    XNOR: (...bools) => { //amount of falses is odd
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      let falses = 0;
      bools.forEach(bool => {
        falses += +!bool;
      });

      return Boolean(falses % 2);
    }
  },
  Characters: {
    Number: (start = 0, end = 100) => {
      if (!LCF.IsType.Number(start, end))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      else if (start > end)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      const numbers = [];
      for (let number = start;number < end + 1;number++)
        numbers.push(number);

      return numbers;
    },
    Alphabet: (start = 1, end = 26) => {
      if (!LCF.IsType.Number(start, end))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      else if (start < 1 || end > 26 || start > end)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      const alphabet = [];
      for (let letter = 65 + start - 1;letter < 65 + end;letter++)
        alphabet.push(String.fromCharCode(letter));

      return alphabet;
    },
    Ascii: (start = 0, end = 127) => {
      if (!LCF.IsType.Number(start, end))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      else if (start < 0 || end > 127 || start > end)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      const ascii = [];
      for (let character = start;character <= end;character++)
        ascii.push(String.fromCharCode(character));

      return ascii;
    },
    ExtendedAscii: (start = 0, end = 255) => {
      if (!LCF.IsType.Number(start, end))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      else if (start < 0 || end > 255 || start > end)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      const extendedAscii = [];
      for (let character = start;character <= end;character++)
        extendedAscii.push(String.fromCharCode(character));

      return extendedAscii;
    },
    Unicode: (start = 0, end = 100) => {
      if (!LCF.IsType.Number(start, end))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;
      else if (start < 0 || end > 149186 || start > end)
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      const unicode = [];
      for (let character = start;character <= end;character++)
        unicode.push(String.fromCharCode(character));

      return unicode;
    }
  },
  Elements: {
    GetBorderRadius: (element, borderRadius) => {
      if (!LCF.IsType.Number(borderRadius))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      return `${borderRadius}% / ${borderRadius * (element.clientWidth / element.clientHeight)}%`;
    },
    GetTextWidth: (text, font, size) => {
      if (!LCF.IsType.String(text))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      const span = document.createElement("span");
            span.innerHTML = text;

            span.classList.add("textWidth");

            span.style.fontFamily = font;
            span.style.fontSize = size;

      document.body.appendChild(span);

      const textWidth = span.clientWidth;
      document.body.removeChild(span);

      return textWidth;
    },
    Move: (element, newParent) => {
      if (!LCF.IsType.HTMLElement(element, newParent))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      newParent.appendChild(structuredClone(element));
      element.remove();
    }
  },
  Page: {
    FadeTo: (newLocation, speed = 0.25) => {
      const screen = document.createElement("screen");
            screen.classList.add("screen");

      document.body.appendChild(screen);

      screen.style.animation = `fadeIn ${speed}s linear 0s 1 normal forwards`;
      screen.onanimationend = event => {
        if (screen === event.target)
          location.href = newLocation;
      }
    },

    FadeOut: (speed = 0.25) => {
      const screen = document.createElement("screen");
            screen.classList.add("screen");

      document.body.appendChild(screen);

      screen.style.animation = `fadeIn ${speed}s linear 0s 1 normal forwards`;
      screen.onanimationend = event => {
        if (screen === event.target)
          screen.remove();
      }
    },

    FadeIn: (speed = 0.25) => {
      const screen = document.createElement("screen");
            screen.classList.add("screen");

      document.body.appendChild(screen);

      screen.style.animation = `fadeOut ${speed}s linear 0s 1 normal forwards`;
      screen.onanimationend = event => {
        if (screen === event.target)
          screen.remove();
      };
    }
  },
  Timer: {
    Create: stopwatch => {
      if (stopwatch && !LCF.IsType.Boolean(stopwatch))
        throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

      const newTimer = new Timer(stopwatch);

      LCF.data.timers.push(newTimer);

      return newTimer;
    }
  },
  Sleep: milliseconds => {
    if (!LCF.IsType.Number(milliseconds))
      throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

    return new Promise(resolve => setTimeout(resolve, milliseconds));
  },
  data: {
    update: {
      start: true,
      interval: null,
      speed: 100,
      running: false,
      customFunctions: {},
      textFitElements: {}
    },
    timers: []
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
    if (!LCF.IsType.Number(time))
      throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

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
    if (!LCF.IsType.Number(time))
      throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

    if (this._stopwatch)
      this._clock -= time;
    else
      this._clock += time;
  }
  removeTime = time => {
    if (!LCF.IsType.Number(time))
      throw `USER ERROR: Invalid data type sent to function: "LCF.".\n\nERROR: `;

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

if (LCF.data.update.start) {
  LCF.data.update.start = false;
  LCF.data.update.running = true;

  LCF.data.update.interval = setInterval(LCF.Update.update, LCF.data.update.speed);
}