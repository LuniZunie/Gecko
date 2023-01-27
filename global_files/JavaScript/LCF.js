const LCF = { //LuniZunie's Custom Functions
  Update: {
    update: function() {
      //Update Custom Function
      const customFunctions = Object.values(LCF.data.update.customFunctions);
      for (const customFunction of customFunctions) {
        if (LCF.IsType.Function(customFunction))
          customFunction();
        else
          delete LCF.data.update.customFunctions[thisFunction.name];
      }

      //Update Timers

      const timers = LCF.data.timers;

      const nextUpdateTimers = [];
      for (const timer of timers) {
        if (timer.requestedDestruction)
          continue;

        nextUpdateTimers.push(timer);
      }

      LCF.data.timers = nextUpdateTimers;

      return;
    },
    AddFunction: function(thisFunction) {
      if (!LCF.IsType.Function(thisFunction))
        throw "Invalid data type sent to function: LCF.Update.AddFunction";

      LCF.data.update.customFunctions[thisFunction.name] = thisFunction;
    },
    RemoveFunction: function(thisFunction) {
      if (!LCF.IsType.Function(thisFunction))
        throw "Invalid data type sent to function: LCF.Update.RemoveFunction";

      delete LCF.data.update.customFunctions[thisFunction.name];
    },
    IncludesFunction: function(thisFunction) {
      if (!LCF.IsType.Function(thisFunction))
        throw "Invalid data type sent to function: LCF.Update.IncludesFunction";
      
      return (LCF.data.update.customFunctions[thisFunction.name]);
    },
    CustomFunctions: function() {
      return (LCF.data.update.customFunctions);
    },
    SetSpeed: function(speed) {
      if (!LCF.IsType.Number(speed))
        throw "Invalid data type sent to function: LCF.Update.SetSpeed";

      if (speed < 0)
        throw "Speed must be greater than -1 for function: LCF.Update.SetSpeed";

      if (speed === LCF.data.update.speed)
        return;

      if (LCF.data.update.interval)
        clearInterval(LCF.data.update.interval);

      LCF.data.update.speed = speed;

      if (LCF.data.update.running)
        LCF.data.update.interval = setInterval(LCF.Update.update, speed);
    },
    GetSpeed: function() {
      return LCF.data.update.speed;
    },
    Start: function() {
      LCF.data.update.running = true;

      LCF.data.update.interval = setInterval(LCF.Update.update, speed);
    },
    Stop: function() {
      LCF.data.update.running = false;

      clearInterval(LCF.data.update.interval);
    },
    Toggle: function() {
      LCF.data.update.running = !LCF.data.update.running;

      if (LCF.data.update.running)
        LCF.data.update.interval = setInterval(LCF.Update.update, speed);
      else
        clearInterval(LCF.data.update.interval);
    },
    Running: function() {
      return LCF.data.update.running;
    },
    Call: function() {
      LCF.Update.update();
    }
  },
  Math: {
    Add: function(...numbers) {
      if (!LCF.IsType.Array(numbers))
        throw "Invalid data type sent to function: LCF.Math.Add";

      numbers = LCF.Array.LimitValueType(numbers, "number");
      if (!numbers.length)
        throw "No values sent to function: LCF.Math.Add";

      let returnNumber = 0;

      let maxDecimals = 0;
      for (const number of numbers) {
        const numberToString = number.toString();
        if (numberToString.includes(".")) {
          const amountOfDecimals = numberToString.split(".")[1].length;
          if (maxDecimals < amountOfDecimals)
            maxDecimals = amountOfDecimals;
        }

        returnNumber += number;
      }

      return Number(returnNumber.toFixed(maxDecimals)); //remove end decimals
    },
    Subtract: function(...numbers) {
      if (!LCF.IsType.Array(numbers))
        throw "Invalid data type sent to function: LCF.Math.Subtract";

      numbers = LCF.Array.LimitValueType(numbers, "number");
      if (!numbers.length)
        throw "No values sent to function: LCF.Math.Subtract";

      let returnNumber = 0;

      let maxDecimals = 0;
      for (const number of numbers) {
        const numberToString = number.toString();
        if (numberToString.includes(".")) {
          const amountOfDecimals = numberToString.split(".")[1].length;
          if (maxDecimals < amountOfDecimals)
            maxDecimals = amountOfDecimals;
        }

        returnNumber -= number;
      }

      return Number(returnNumber.toFixed(maxDecimals)); //remove end decimals
    },
    Random: function(random = true, weights = []) { //random = min, weights = max for random number
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

          const amountOfWeights = weights.length;
          for (let weightNumber = 0;weightNumber < amountOfWeights;weightNumber++) {
            const thisWeight = weights[weightNumber];

            weightSum += thisWeight;
            if (randomNumber < weightSum)
              return random[weightNumber]; //return random array element - weighted
          }

          return random[0]; //return first element if random number not found
        } else
          return random[Math.floor(Math.random() * random.length)]; //return random array element - non weighted
      } else if (LCF.IsType.Number(Number(random)) || LCF.IsType.Number(Number(weights))) { //random number (inclusive)
        if (!LCF.IsType.Number(weights))
          return Number(random); //if no max, return min or 0 if there is no min
        else if (!LCF.IsType.Number(random))
          random = 0; //if no min, set the min to 0

        if (!random.toString().includes(".") && !weights.toString().includes("."))
          return Math.floor(Math.random() * (Number(weights) - Number(random) + 1)) + Number(random); //return random integer
        else {
          const minDecimals = (random.toString().includes(".")) ? random.toString().split(".")[1].length : 0;
          const maxDecimals = (weights.toString().includes(".")) ? weights.toString().split(".")[1].length : 0;

          const decimals = Math.max(minDecimals, maxDecimals);

          random = Number(random);
          weights = Number(weights);

          return Number((Math.floor(Math.random() * (weights - random + 1 / (10 ** decimals)) * 10 ** decimals) / 10 ** decimals + random).toFixed(decimals)); //return random float with the same amount of decimals
        }
      }
    },
    RandomCoordinates: function(dimensions = [[0, "1.0"], [0, "1.0"]]) { //all numbers inclusive
      if (!Array.isArray(dimensions) || !dimensions.length)
        throw "Invalid data type sent to function: LCF.Math.RandomCoordinates";

      const returnCoords = {};

      const dimensionLetters = ["x", "y", "z", "w"]; //W is commonly seen as the "4th" spacial dimension
      
      for (const dimensionNumber in dimensions) {
        const dimension = dimensions[dimensionNumber];

        if (!Array.isArray(dimension) || dimension.length !== 2)
          throw "Invalid data type sent to function: LCF.Math.RandomCoordinates";

        if (!LCF.IsType.Number(dimension[0]) || !LCF.IsType.Number(dimension[1]))
          throw "Invalid data type sent to function: LCF.Math.RandomCoordinates";

        const coords = LCF.Math.Random(...dimension);

        const dimensionLetter = dimensionLetters[dimensionNumber];
        if (dimensionLetter)
          returnCoords[dimensionLetter] = coords;
        else
          returnCoords[dimensionNumber] = coords;
      }

      return returnCoords;
    },
    Distance: function(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
      if (!LCF.IsType.Number(x1) || !LCF.IsType.Number(y1) || !LCF.IsType.Number(x2) || !LCF.IsType.Number(y2))
        throw "Invalid data type sent to function: LCF.Math.Distance";

      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
    CoordinatesInArea: function(x1 = 0, y1 = 0, x2 = 0, y2 = 0, range = 0, type = "square", inclusive = true) {
      if (!LCF.IsType.Number(x1) || !LCF.IsType.Number(y1) || !LCF.IsType.Number(x2) || !LCF.IsType.Number(y2) || !LCF.IsType.Number(range) || !LCF.IsType.Boolean(inclusive))
        throw "Invalid data type sent to function: LCF.Math.CoordinatesInArea";

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
        throw "Area type was not correctly defined for function: LCF.Math.CoordinatesInArea";
    },
    Slope: function(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
      if (!LCF.IsType.Number(x1) || !LCF.IsType.Number(y1) || !LCF.IsType.Number(x2) || !LCF.IsType.Number(y2))
        throw "Invalid data type sent to function: LCF.Math.Slope";

      let slope = Math.abs((y2 - y1) / (x2 - x1));

      if (!slope)
        slope = 0;

      let rise = 1;
      let run = 1;

      if (slope < 1)
        rise = slope;
      else
        run = 1 / slope;

      return {
        rise: rise * Math.sign(y2 - y1),
        run: run * Math.sign(x2 - x1)
      };
    },
    SlopeToAngle: function(rise, run, degrees = true) {
      if (!LCF.IsType.Number(rise) || !LCF.IsType.Number(run) || !LCF.IsType.Boolean(degrees))
        throw "Invalid data type sent to function: LCF.Math.SlopeToAngle";

      if (degrees)
        return Math.atan2(rise, run) * 180 / Math.PI;
      else
        return Math.atan2(rise, run);
    },
    AngleToSlope: function(angle, degrees = true) {
      if (!LCF.IsType.Number(angle) || !LCF.IsType.Boolean(degrees))
        throw "Invalid data type sent to function: LCF.Math.AngleToSlope";

      throw "Function: LCF.Math.AngleToSlope is not complete";
    },
    RadiansToDegrees: function(radians) {
      if (!LCF.IsType.Number(radians))
        throw "Invalid data type sent to function: LCF.Math.RadiansToDegrees";

      return radians * 180 / Math.PI;
    },
    DegreesToRadians: function(degrees) {
      if (!LCF.IsType.Number(degrees))
        throw "Invalid data type sent to function: LCF.Math.DegreesToRadians";

      return degrees * Math.PI / 180;
    }
  },
  IsType: {
    Function: function(thisFunction) {
      return (typeof thisFunction === "function");
    },
    Date: function(date) {
      return (date instanceof Date);
    },
    Object: function(object) {
      return (typeof object === "object" && !Array.isArray(object) && object !== null);
    },
    Array: function(array) {
      return Array.isArray(array);
    },
    String: function(string) {
      return (typeof string === "string");
    },
    Number: function(number) {
      return ((Number(number) && (!LCF.IsType.String(number) || !LCF.IsType.Boolean(number))) || number === 0);
    },
    Boolean: function(boolean) {
      return (typeof boolean === "boolean");
    },
    Null: function(nullValue) {
      return (nullValue === null);
    },
    Undefined: function(undefinedValue) {
      return (undefinedValue === undefined);
    },
    Empty: function(value) {
      return (LCF.IsType.Null(value) || LCF.IsType.Undefined(value))
    }
  },
  Array: {
    LimitValueType: function(array, types) {
      if (!(LCF.IsType.String(types) || LCF.IsType.Array(types)) || !LCF.IsType.Array(array))
        throw "Invalid data type sent to function: LCF.Array.LimitValueType";
      else if (LCF.IsType.String(types))
        types = [types];
          
      for (const type of types)
        if (!LCF.IsType.String(type))
          throw "Invalid data type sent to function: LCF.Array.LimitValueType";

      return array.filter(function(value) {
        return types.includes(typeof value);
      });
    },
    IndexesOf: function(array, values, typeSensitive = true) {
      if (!LCF.IsType.Array(array))
        throw "Invalid data type sent to function: LCF.Array.IndexesOf";
      else if (!LCF.IsType.Array(values))
        values = [values];
      
      const returnArray = [];
      for (const valuePosition in array) {
        const value = array[valuePosition];
        if (typeSensitive && values.includes(value))
          returnArray.push(valuePosition);
        else if (!typeSensitive) {
          for (const valueToCheck of values) {
            if (value == valueToCheck) {
              returnArray.push(valuePosition);

              break;
            }
          }
        }
      }

      return returnArray;
    },
    Add: function(...arrays) {
      if (!arrays.length || !arrays[0].length)
        throw "Invalid data type sent to function: LCF.Array.Add";

      const returnArray = [];

      const arrayLengths = arrays[0].length;
      for (const array of arrays)
        if (array.length !== arrayLengths)
          throw "Invalid data type sent to function: LCF.Array.Add";

      for (let index = 0;index < arrayLengths;index++) {
        let returnNumber = 0;

        for (const arrayNumber in arrays) {
          const array = arrays[arrayNumber];
          if (!arrayNumber) {
            returnNumber = arrayNumber;
            continue;
          }

          const arrayValue = array[index];
          if (!LCF.IsType.Number(arrayValue))
            throw "Invalid data type sent to function: LCF.Array.Add";

          returnNumber = LCF.Math.Add(returnNumber, arrayValue);
        }

        returnArray.push(returnNumber);
      }

      return returnArray;
    },
    Subtract: function(...arrays) {
      if (!arrays.length || !arrays[0].length)
        throw "Invalid data type sent to function: LCF.Array.Subtract";

      const returnArray = [];

      const arrayLengths = arrays[0].length;
      for (const array of arrays)
        if (array.length !== arrayLengths)
          throw "Invalid data type sent to function: LCF.Array.Subtract";

      for (let index = 0;index < arrayLengths;index++) {
        let returnNumber = 0;

        for (const arrayNumber in arrays) {
          const array = arrays[arrayNumber];
          if (!arrayNumber) {
            returnNumber = arrayNumber;
            continue;
          }

          const arrayValue = array[index];
          if (!LCF.IsType.Number(arrayValue))
            throw "Invalid data type sent to function: LCF.Array.Subtract";

          returnNumber = LCF.Math.Subtract(returnNumber, arrayValue);
        }

        returnArray.push(returnNumber);
      }

      return returnArray;
    },
    Multiply: function(...arrays) {
      if (!arrays.length || !arrays[0].length)
        throw "Invalid data type sent to function: LCF.Array.Multiply";

      const returnArray = [];

      const arrayLengths = arrays[0].length;
      for (const array of arrays)
        if (array.length !== arrayLengths)
          throw "Invalid data type sent to function: LCF.Array.Multiply";

      for (let index = 0;index < arrayLengths;index++) {
        let returnNumber = 0;

        for (const arrayNumber in arrays) {
          const array = arrays[arrayNumber];
          if (!arrayNumber) {
            returnNumber = arrayNumber;
            continue;
          }

          const arrayValue = array[index];
          if (!LCF.IsType.Number(arrayValue))
            throw "Invalid data type sent to function: LCF.Array.Multiply";

          returnNumber *= arrayValue;
        }

        returnArray.push(returnNumber);
      }

      return returnArray;
    },
    Divide: function(...arrays) {
      if (!arrays.length || !arrays[0].length)
        throw "Invalid data type sent to function: LCF.Array.Divide";

      const returnArray = [];

      const arrayLengths = arrays[0].length;
      for (const array of arrays)
        if (array.length !== arrayLengths)
          throw "Invalid data type sent to function: LCF.Array.Divide";

      for (let index = 0;index < arrayLengths;index++) {
        let returnNumber = 0;

        for (const arrayNumber in arrays) {
          const array = arrays[arrayNumber];
          if (!arrayNumber) {
            returnNumber = arrayNumber;
            continue;
          }

          const arrayValue = array[index];
          if (!LCF.IsType.Number(arrayValue))
            throw "Invalid data type sent to function: LCF.Array.Divide";

          returnNumber /= arrayValue;
        }

        returnArray.push(returnNumber);
      }

      return returnArray;
    },
    Power: function(...arrays) {
      if (!arrays.length || !arrays[0].length)
        throw "Invalid data type sent to function: LCF.Array.Power";

      const returnArray = [];

      const arrayLengths = arrays[0].length;
      for (const array of arrays)
        if (array.length !== arrayLengths)
          throw "Invalid data type sent to function: LCF.Array.Power";

      for (let index = 0;index < arrayLengths;index++) {
        let returnNumber = 0;

        for (const arrayNumber in arrays) {
          const array = arrays[arrayNumber];
          if (!arrayNumber) {
            returnNumber = arrayNumber;
            continue;
          }

          const arrayValue = array[index];
          if (!LCF.IsType.Number(arrayValue))
            throw "Invalid data type sent to function: LCF.Array.Power";

          returnNumber **= arrayValue;
        }

        returnArray.push(returnNumber);
      }

      return returnArray;
    }
  },
  Number: {
    InRange: function(numbers = [0], range = [0, 1], inclusive = [true, true], singleValue = false) {
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
        range = Number(range);

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
        numbers = Number(numbers);

        if (!LCF.IsType.Number(numbers))
          numbers = [0];
        else
          numbers = [numbers];
      } else if (!numbers.length)
        numbers = [0];

      let numbersInRange = [];
      for (const number of numbers) {
        if (inclusive[0] && number < range[0]) {
          numbersInRange.push(false);
          continue;
        } else if (!inclusive[0] && number <= range[0]) {
          numbersInRange.push(false);
          continue;
        }

        if (inclusive[1] && number > range[1]) {
          numbersInRange.push(false);
          continue;
        } else if (!inclusive[1] && number >= range[1]) {
          numbersInRange.push(false);
          continue;
        }

        numbersInRange.push(true);
      }

      if (singleValue) {
        numbersInRange = numbersInRange.reduce(function(totalBool, thisBool) {
          return (totalBool && thisBool);
        });
      }

      return numbersInRange;
    }
  },
  Gates: {
    Buffer: function(bool) { //seperate input from output
      if (!LCF.IsType.Boolean(bool))
        throw "Invalid data type sent to function: LCF.Gates.Buffer";

      return (bool);
    },
    NOT: function(bool) { //opposite input
      if (!LCF.IsType.Boolean(bool))
        throw "Invalid data type sent to function: LCF.Gates.NOT";

      return (!bool);
    },
    AND: function(...bools) { //all true inputs
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw "Invalid data type sent to function: LCF.Gates.AND";

      let trues = 0;
      let falses = 0;

      for (const bool of bools)
        if (bool)
          trues++;
        else
          falses++;

      return (falses === 0);
    },
    OR: function(...bools) { //at least one true input
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw "Invalid data type sent to function: LCF.Gates.OR";

      let trues = 0;
      let falses = 0;

      for (const bool of bools)
        if (bool)
          trues++;
        else
          falses++;

      return (trues > 0);
    },
    NAND: function(...bools) { //at least one false input
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw "Invalid data type sent to function: LCF.Gates.NAND";

      let trues = 0;
      let falses = 0;

      for (const bool of bools)
        if (bool)
          trues++;
        else
          falses++;

      return (falses > 0);
    },
    NOR: function(...bools) { //no true input
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw "Invalid data type sent to function: LCF.Gates.NOR";

      let trues = 0;
      let falses = 0;

      for (const bool of bools)
        if (bool)
          trues++;
        else
          falses++;

      return (trues === 0);
    },
    XOR: function(...bools) { //amount of trues is odd
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw "Invalid data type sent to function: LCF.Gates.XOR";

      let trues = 0;
      let falses = 0;

      for (const bool of bools)
        if (bool)
          trues++;
        else
          falses++;

      return (trues % 2);
    },
    XNOR: function(...bools) { //amount of falses is odd
      bools = LCF.Array.LimitValueType(bools, "boolean");
      if (!bools.length)
        throw "Invalid data type sent to function: LCF.Gates.XNOR";

      let trues = 0;
      let falses = 0;

      for (const bool of bools)
        if (bool)
          trues++;
        else
          falses++;

      return (falses % 2);
    }
  },
  Characters: {
    Number: function(start = 0, end = 100) {
      if (!LCF.IsType.Number(start) || !LCF.IsType.Number(end))
        throw "Invalid data type sent to function: LCF.Characters.Number";
      else if (start > end)
        throw "Invalid data sent to function: LCF.Characters.Number";

      const numbers = [];

      for (let number = start;number < end;number++)
        numbers.push(String.fromCharCode(number));

      return numbers;
    },
    Alphabet: function(start = 1, end = 26) {
      if (!LCF.IsType.Number(start) || !LCF.IsType.Number(end))
        throw "Invalid data type sent to function: LCF.Characters.Alphabet";
      else if (start < 1 || end > 26 || start > end)
        throw "Invalid data sent to function: LCF.Characters.Alphabet";

      const alphabet = [];

      for (let letter = 65 + start - 1;letter < 65 + end;letter++)
        alphabet.push(String.fromCharCode(letter));

      return alphabet;
    },
    Ascii: function(start = 0, end = 127) {
      if (!LCF.IsType.Number(start) || !LCF.IsType.Number(end))
        throw "Invalid data type sent to function: LCF.Characters.Ascii";
      else if (start < 0 || end > 127 || start > end)
        throw "Invalid data sent to function: LCF.Characters.Ascii";

      const ascii = [];

      for (let character = start;character <= end;character++)
        ascii.push(String.fromCharCode(character));

      return ascii;
    },
    ExtendedAscii: function(start = 0, end = 255) {
      if (!LCF.IsType.Number(start) || !LCF.IsType.Number(end))
        throw "Invalid data type sent to function: LCF.Characters.ExtendedAscii";
      else if (start < 0 || end > 255 || start > end)
        throw "Invalid data sent to function: LCF.Characters.ExtendedAscii";

      const extendedAscii = [];

      for (let character = start;character <= end;character++)
        extendedAscii.push(String.fromCharCode(character));

      return extendedAscii;
    },
    Unicode: function(start = 0, end = 100) {
      if (!LCF.IsType.Number(start) || !LCF.IsType.Number(end))
        throw "Invalid data type sent to function: LCF.Characters.Unicode";
      else if (start < 0 || end > 149186 || start > end)
        throw "Invalid data sent to function: LCF.Characters.Unicode";

      const unicode = [];

      for (let character = start;character <= end;character++)
        unicode.push(String.fromCharCode(character));

      return unicode;
    }
  },
  Timer: {
    Create: function(stopwatch) {
      if (stopwatch && !LCF.IsType.Boolean(stopwatch))
        throw "Invalid data type sent to function: LCF.Timer.Create";

      const newTimer = new Timer(stopwatch);

      LCF.data.timers.push(newTimer);

      return newTimer
    }
  },
  Sleep: function(milliseconds) {
    if (!LCF.IsType.Number(milliseconds))
      throw "Invalid data type sent to function: LCF.Sleep";

    return new Promise(resolve => setTimeout(resolve, milliseconds));
  },
  data: {
    update: {
      start: true,
      interval: null,
      speed: 100,
      running: false,
      customFunctions: {}
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
      throw "Invalid data type sent to class: Timer";
    
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
  addTime(time) {
    if (!LCF.IsType.Number(time))
      throw "Invalid data type sent to class: Timer";
    
    if (this._stopwatch)
      this._clock -= time;
    else
      this._clock += time;
  }
  removeTime(time) {
    if (!LCF.IsType.Number(time))
      throw "Invalid data type sent to class: Timer";
    
    if (this._stopwatch)
      this._clock += time;
    else
      this._clock -= time;
  }
  play() {
    if (this._pauseStart) {
      this.addTime(new Date().getTime() - this._pauseStart);

      this._lastPause = new Date().getTime();
    }

    this._paused = false;
    this._pauseStart = null;
  }
  pause() {
    this._paused = true;
    this._pauseStart = new Date().getTime();
  }
  toggle() {
    this._paused = !this._paused;

    if (this._paused)
      this._pauseStart = new Date().getTime();
    else if (this._pauseStart) {
      this.addTime(new Date().getTime() - this._pauseStart);

      this._lastPause = new Date().getTime();
    }
  }
  destroy() {
    this._requestedDestruction = true;
  }
}

if (LCF.data.update.start) {
  LCF.data.update.start = false;
  LCF.data.update.running = true;

  LCF.data.update.interval = setInterval(LCF.Update.update, LCF.data.update.speed);
}