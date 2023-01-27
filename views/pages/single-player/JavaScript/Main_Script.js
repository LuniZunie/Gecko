const Chess = {
  //Global Variables
  game: true,
  tileSize: 0,

  gameOver: false,

  gameDiv: null,

  board: null,
  canvas: null,
  context: null,

  blankImage: null,
  pieceImages: {},

  whitesTurn: true,
  white: true,

  capturedPieceSize: 0,
  capturedPieceLeftOffset: 0,
  capturedPieceTopOffset: 0,
  whiteCapturedPieces: [],
  blackCapturedPieces: [],

  clickedPiece: false,
  legalMoves: {},
  clickedPieceLegalMoves: {},

  promotionTileOffsetHeight: null,
  promotionOptions: ["x1", "x2", "x3", "x4"],
  waitingForPromotion: false,
  promotionChose: "",

  whiteFirstMove: true,
  blackFirstMove: true,

  whiteFirstMoveTimeout: null,
  blackFirstMoveTimeout: null,

  whiteTimer: null,
  blackTimer: null,

  whiteTimerElement: null,
  blackTimerElement: null,

  lastWhiteTimerUpdate: null,
  lastBlackTimerUpdate: null,

  whiteClockColor: "Green",
  blackClockColor: "Green",

  timeDetails: {
    startTime: 600000, //5 minutes - 300000
    increment: 1000 //1 second
  },

  whiteKingPosition: [4, 7],
  blackKingPosition: [4, 0],

  enPassantablePawns: [],

  currentClickedPiece: [null, null],

  materialDiffrencesMax: 0,
  materialDiffrences: [],

  threefoldCache: [],
  fiftyMoveRuleCount: 0,

  material: { //no king
    total: {
      x5: 0,
      x4: 0,
      x3: 0,
      x2: 0,
      x1: 0
    },
    white: {
      x5: 0,
      x4: 0,
      x3: 0,
      x2: 0,
      x1: 0
    },
    black: {
      x5: 0,
      x4: 0,
      x3: 0,
      x2: 0,
      x1: 0
    }
  },

  StartPosition: [
    ["1x2.0","1x4","1x3","1x1","1x0.0","1x3","1x4","1x2.0"],
    ["1x5.0","1x5.0","1x5.0","1x5.0","1x5.0","1x5.0","1x5.0","1x5.0"],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ["0x5.0","0x5.0","0x5.0","0x5.0","0x5.0","0x5.0","0x5.0","0x5.0"],
    ["0x2.0","0x4","0x3","0x1","0x0.0","0x3","0x4","0x2.0"]
  ],
  Position: [
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null]
  ],
  PositionDebug: [
    ["1x2.0","1x4","1x3","1x1","1x0.0","1x3","1x4","1x2.0"],
    ["1x1","1x1","1x1","1x1","1x1","1x1","1x1","1x1"],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ["0x5.0","0x5.0","0x5.0","0x5.0","0x5.0","0x5.0","0x5.0","0x5.0"],
    ["0x2.0","0x4","0x3","0x1","0x0.0","0x3","0x4","0x2.0"]
  ],

  //Functions

  Functions: {
    //Function variables

    whiteOnBottom: true,

    //Functions

    OnStartup: function() {
      Chess.gameDiv = document.getElementById("Game");

      Chess.board = document.getElementById("ChessBoard");

      Chess.whiteTimerElement = document.getElementById("WhiteTimer");
      Chess.blackTimerElement = document.getElementById("BlackTimer");

      Chess.gameOver = false;
      Chess.fiftyMoveRuleCount = 0;

      ResizeElements();
      this.SetupPosition();
    },

    SetupPosition: function() {//working on
      Chess.Position = structuredClone(Chess.StartPosition);
      //Chess.Position = structuredClone(Chess.PositionDebug);
      //Chess.Position = this.ConvertCodeToGame("rnbqkbnr/ppp1pppp/3p4/8/4P3/5N2/PPPP1PPP/RNBQKB1R");

      Chess.threefoldCache = [this.ConvertGameToCode(Chess.Position)];

      Chess.whitesTurn = true;

      for (const y in Chess.Position) {
        if (Chess.Position[y] === [null,null,null,null,null,null,null,null])
          continue;

        for (const x in Chess.Position[y]) {
          const piece = Chess.Position[y][x];
          if (piece) {
            if (piece[2] === "0") {
              if (piece[0] === "0")
                Chess.whiteKingPosition = [x, y];
              else
                Chess.blackKingPosition = [x, y];
            } else { //everything except king
              Chess.material.total[`x${piece[2]}`]++;

              if (piece[0] === "0")
                Chess.material.white[`x${piece[2]}`]++;
              else
                Chess.material.black[`x${piece[2]}`]++;
            }
          }
        }
      }

      this.GetLegalMoves();

      if (Chess.game) {
        if (Chess.timeDetails.startTime > 0) {
          Chess.whiteTimer = LCF.Timer.Create(false);
          Chess.whiteTimer.time = Chess.timeDetails.startTime;

          Chess.blackTimer = LCF.Timer.Create(false);
          Chess.blackTimer.time = Chess.timeDetails.startTime;

          Chess.whiteFirstMove = false;
          Chess.blackFirstMove = true;

          Chess.whiteFirstMoveTimeout = setTimeout(this.StartTimer, 10000);

          Chess.whiteTimerElement.style.animation = `timerOn${Chess.whiteClockColor} 1s ease-in-out 0s 1 normal forwards`;

          Chess.board.style.animation = "whitesTurn 0s linear 0s 1 normal forwards";

          LCF.Update.AddFunction(this.UpdateTimers);
          LCF.Update.SetSpeed(50);
        }

        this.whiteOnBottom = Chess.white;

        this.DrawBoard();
      }
    },

    DrawBoard: function() {
      const canvas = document.getElementById("DrawPieceCanvas");
      const context = canvas.getContext("2d");

      canvas.width = Chess.tileSize;
      canvas.height = Chess.tileSize;

      Chess.blankImage = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

      let startDrawPosition = [-1, -1];
      let everyOtherRow = true;

      for (let tileNumber = 0;tileNumber < 64;tileNumber++) {
        startDrawPosition[0]++;

        if (!(tileNumber % 8)) {
          startDrawPosition = [0, startDrawPosition[1] + 1];

          everyOtherRow = !everyOtherRow;
        }

        let tileId = startDrawPosition.join("-");

        const newTile = document.createElement("img");
        newTile.classList.add("no-select", "tile");

        newTile.id = `tile_${tileId}`;
        newTile.src = Chess.blankImage;

        newTile.addEventListener("click", function(event) {
          const [x, y] = this.id.replace("tile_","").split("-");

          Chess.Functions.ClickedBoard(event, [Number(x), Number(y)]);
        });

        Chess.board.appendChild(newTile);

        newTile.width = Chess.tileSize;
        newTile.height = Chess.tileSize;

        newTile.style.left = startDrawPosition[0] * Chess.tileSize + "px";
        newTile.style.top = startDrawPosition[1] * Chess.tileSize + "px";

        if ((tileNumber + this.whiteOnBottom + everyOtherRow) % 2)
          newTile.classList.add("light");
        else
          newTile.classList.add("dark");
      }

      this.CreatePieces();
      this.PlacePieces();
    },

    CreatePieces: function() {
      const canvas = document.getElementById("DrawPieceCanvas");
      const context = canvas.getContext("2d");

      const tileSize = Chess.tileSize;

      canvas.width = tileSize;
      canvas.height = tileSize;

      context.lineWidth = tileSize * 0.02;
      for (let color = 0;color < 2;color++) {
        for (let [piece, layersObject] of Object.entries(Chess.DrawInstructions)) {
          context.clearRect(0, 0, tileSize, tileSize);

          let layers = structuredClone(layersObject);
          for (const drawInstructionsObject of layers) {
            let drawInstructions = structuredClone(drawInstructionsObject);

            context.beginPath();

            if (((color + drawInstructions[0].sameColor) % 2)) {
              context.strokeStyle = "#171717"; //very dark gray
              context.fillStyle = "#e1e1e1"; //very light gray
            } else {
              context.strokeStyle = "#e1e1e1"; //very light gray
              context.fillStyle = "#171717"; //very dark gray
            }

            let readOptions = false;

            let mirror = false;

            let mirroring = false;
            for (let index = 0;index < mirror + 1;index++) {
              if (mirroring)
                drawInstructions = drawInstructions.reverse();

              for (const instruction of drawInstructions) {
                if (!readOptions) {
                  mirror = instruction.mirror;
                  readOptions = true;

                  continue;
                }

                const path = instruction.path;
                if (!path)
                  continue;

                if (instruction.overrideMirror)
                  if (!mirroring && instruction.overrideMirror === -1)
                    continue;
                  else if (mirroring && instruction.overrideMirror === 1)
                    continue;

                if (mirroring)
                  path[0] = 100 - path[0];

                switch (instruction.action) {
                  default:
                  case "move":
                    context.moveTo(path[0] / 100 * tileSize, path[1] / 100 * tileSize);
                    break;
                  case "line":
                    context.lineTo(path[0] / 100 * tileSize, path[1] / 100 * tileSize);
                    break;
                }
              }

              mirroring = true;
            }

            context.fill();
            context.stroke();
          }

          const data = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

          Chess.pieceImages[color + piece] = data;
        }
      }
    },

    PlacePieces: function() {
      let localPosition = structuredClone(Chess.Position);
      if (!this.whiteOnBottom)
        localPosition = localPosition.reverse();

      for (const rowNumber in localPosition) {
        const row = localPosition[rowNumber];
        if (row === [null,null,null,null,null,null,null,null])
          continue;

        for (const tileNumber in row) {
          const tile = row[tileNumber];
          const tileId = `${tileNumber}-${rowNumber}`;
          if (!tile || document.getElementById(tileId))
            continue;

          const pieceColor = tile[0];

          const newPiece = document.createElement("img");
          newPiece.classList.add("no-select", "piece");

          newPiece.id = `piece_${tileId}`;
          newPiece.src = Chess.pieceImages[`${pieceColor}x${tile[2]}`];

          Chess.board.appendChild(newPiece);

          newPiece.width = Chess.tileSize;
          newPiece.height = Chess.tileSize;

          newPiece.style.top = Chess.tileSize * rowNumber + "px";
          newPiece.style.left = Chess.tileSize * tileNumber + "px";

          if (pieceColor === "0")
            document.getElementById(`tile_${tileId}`).classList.add("containsWhitePiece", "can-click");
          else
            document.getElementById(`tile_${tileId}`).classList.add("containsBlackPiece");
        }
      }
    },

    DrawPromoteCanvas: function(whitesTurn) {
      const canvas = document.getElementById("PromoteCanvas");

      const context = canvas.getContext("2d");
      const tileSize = Chess.tileSize;

      let drawOrder = structuredClone(Chess.promotionOptions);
      if (this.whiteOnBottom != whitesTurn)
        drawOrder = drawOrder.reverse();

      context.fillStyle = "#EBEBEB";
      context.fillRect(0, 0, canvas.width, canvas.height);

      let offsetHeight = 0;
      if (this.whiteOnBottom != whitesTurn) {
        offsetHeight = tileSize / 2 - 8;

        context.fillStyle = "#DD000066";
        context.fillRect(0, 0, tileSize + 12, offsetHeight);
      }

      Chess.promotionTileOffsetHeight = offsetHeight;

      context.lineWidth = tileSize * 0.02;
      for (const pieceNumber in drawOrder) {
        const piece = drawOrder[pieceNumber];

        let layers = structuredClone(Chess.DrawInstructions[piece]);
        if (!layers)
          continue;

        for (let drawInstructions of layers) {
          if (((!whitesTurn + drawInstructions[0].sameColor) % 2)) {
            context.strokeStyle = "#171717"; //very dark gray
            context.fillStyle = "#e1e1e1"; //very light gray
          } else {
            context.strokeStyle = "#e1e1e1"; //very light gray
            context.fillStyle = "#171717"; //very dark gray
          }

          context.beginPath();

          let readOptions = false;

          let mirror = false;

          let mirroring = false;
          for (let index = 0;index < mirror + 1;index++) {
            if (mirroring)
              drawInstructions = drawInstructions.reverse();

            for (const instruction of drawInstructions) {
              if (!readOptions) {
                mirror = instruction.mirror;
                readOptions = true;

                continue;
              }

              const path = instruction.path;
              if (!path)
                continue;

              if (instruction.overrideMirror)
                if (!mirroring && instruction.overrideMirror === -1)
                  continue;
                else if (mirroring && instruction.overrideMirror === 1)
                  continue;
              if (mirroring)
                path[0] = 100 - path[0];

              if (instruction.action === "move")
                context.moveTo((path[0] / 100 * tileSize) + 4, (path[1] / 100 * tileSize) + pieceNumber * tileSize + 4 + offsetHeight);
              else
                context.lineTo((path[0] / 100 * tileSize) + 4, (path[1] / 100 * tileSize) + pieceNumber * tileSize + 4 + offsetHeight);
            }

            mirroring = true;
          }

          context.fill();
          context.stroke();
        }
      }

      if (this.whiteOnBottom == whitesTurn) {
        context.fillStyle = "#DD000066";
        context.fillRect(0, drawOrder.length * tileSize + 16, tileSize + 12, tileSize / 2 - 8);
      }

      context.lineWidth = 1;
    },

    MovePiece: async function(newX, newY, oldX, oldY, piece, capture, specialMove, simulate = false) { //working on
      if (Chess.gameOver)
        return;

      if (!simulate) {
        if (piece[2] === "5" || capture) {
          Chess.fiftyMoveRuleCount = 0;

          Chess.threefoldCache = [];
        } else {
          Chess.fiftyMoveRuleCount++;
          if (Chess.fiftyMoveRuleCount >= 50) {
            const code = this.IsGameOver(Infinity);
            if (code) {
              const materialDiffrences = this.GetMaterial(true) - this.GetMaterial(false);
              if (Math.abs(materialDiffrences) > Chess.materialDiffrencesMax)
                Chess.materialDiffrencesMax = Math.abs(materialDiffrences);

              Chess.materialDiffrences.push(materialDiffrences);

              this.GameOver(code);
            }
          }
        }

        const pieces = Chess.board.children;
        for (const thisPiece of pieces) {
          if (thisPiece.nodeName === "IMG") {
            thisPiece.style.animation = "";

            const thisPieceLocation = thisPiece.id.split("_")[1].split("-");

            thisPiece.style.left = `${Number(thisPieceLocation[0]) * Chess.tileSize}px`;
            thisPiece.style.top = `${Number(thisPieceLocation[1]) * Chess.tileSize}px`;
          }
        }
      }

      const newPieceId = `piece_${newX}-${newY}`;
      const oldPieceId = `piece_${oldX}-${oldY}`;

      const newTileId = `tile_${newX}-${newY}`;
      const oldTileId = `tile_${oldX}-${oldY}`;

      const pieceClassName = (Chess.whitesTurn) ? "containsWhitePiece" : "containsBlackPiece";
      const captureClassName = (Chess.whitesTurn) ? "containsBlackPiece" : "containsWhitePiece";

      if (!simulate) {
        for (const enPassantablePawn of Chess.enPassantablePawns) {
          const [x, y] = enPassantablePawn;
        
          Chess.Position[y][x] = `${Chess.Position[y][x][0]}x5.1-0`; //no longer en passantable
        }

        Chess.enPassantablePawns = [];
      }

      if (!simulate) {
        if (piece[2] === "0") {
          if (piece[0] === "0")
            Chess.whiteKingPosition = [newX, newY];
          else
            Chess.blackKingPosition = [newX, newY];
        }

        if (piece === `${piece[0]}x5.1-1`)
          Chess.enPassantablePawns.push([newX, newY]);

        if (piece[2] === "5" && (newY === 7 || newY === 0)) { //need to test if (newY % 7 === 0) is faster
          piece = await this.Promote(newX, newY, 1 - Number(piece[0]));
          if (piece === -1)
            return -1;

          document.getElementById(oldPieceId).src = Chess.pieceImages[`${piece[0]}x${piece[2]}`];
          document.getElementById(oldPieceId).dataset.promoted = true;
        }

        if (capture) {
          Chess.material.total[capture]--;

          if (piece[0] === "0")
            Chess.material.black[capture]--;
          else
            Chess.material.white[capture]--;
        }
      }

      Chess.Position[oldY][oldX] = null;

      if (Chess.game && !simulate) {
        const pieceElement = document.getElementById(oldPieceId);

        document.documentElement.style.setProperty("--startX", `${oldX * Chess.tileSize}px`);
        document.documentElement.style.setProperty("--startY", `${oldY * Chess.tileSize}px`);
        document.documentElement.style.setProperty("--endX", `${newX * Chess.tileSize}px`);
        document.documentElement.style.setProperty("--endY", `${newY * Chess.tileSize}px`);

        pieceElement.style.animation = `moveElement 0.1s ease-in-out 0s 1 normal forwards`;
        
        document.getElementById(oldTileId).classList.remove(pieceClassName);
        document.getElementById(newTileId).classList.add(pieceClassName);
        if (capture) {
          if (specialMove === "en passant") {
            //play move animation

            Chess.Position[newY][newX] = piece;

            document.getElementById(`tile_${newX}-${newY}`).classList.remove(captureClassName);

            this.Capture(newX, oldY);
          } else {
            document.getElementById(newTileId).classList.remove(captureClassName);

            this.Capture(newX, newY, piece);
          }
        } else  {
          //play move sound and play an animation
          const moveSound = new Audio("audio/move.mp3");
          moveSound.play();

          Chess.Position[newY][newX] = piece;

          let newRookId;
          let rookElement;
          if (specialMove === "queenside castle") { //rook move
            //play castle sound

            rookElement = document.getElementById(`piece_0-${newY}`);
            newRookId = `piece_3-${newY}`;

            document.getElementById(`tile_0-${newY}`).classList.remove(pieceClassName);
            document.getElementById(`tile_3-${newY}`).classList.add(pieceClassName);

            document.documentElement.style.setProperty("--startXRook", `${0 * Chess.tileSize}px`);
            document.documentElement.style.setProperty("--startYRook", `${oldY * Chess.tileSize}px`);
            document.documentElement.style.setProperty("--endXRook", `${3 * Chess.tileSize}px`);
            document.documentElement.style.setProperty("--endYRook", `${newY * Chess.tileSize}px`);

            Chess.Position[newY][3] = `${piece[0]}x2.1`;
            Chess.Position[newY][0] = null; //king

            rookElement.style.animation = `moveRookForCastle 0.1s ease-in-out 0s 1 normal forwards`;
            rookElement.id = newRookId;
          } else if (specialMove === "kingside castle") { //rook move
            //play castle sound

            rookElement = document.getElementById(`piece_7-${newY}`);
            newRookId = `piece_5-${newY}`;

            document.getElementById(`tile_7-${newY}`).classList.remove(pieceClassName);
            document.getElementById(`tile_5-${newY}`).classList.add(pieceClassName);

            document.documentElement.style.setProperty("--startXRook", `${7 * Chess.tileSize}px`);
            document.documentElement.style.setProperty("--startYRook", `${oldY * Chess.tileSize}px`);
            document.documentElement.style.setProperty("--endXRook", `${5 * Chess.tileSize}px`);
            document.documentElement.style.setProperty("--endYRook", `${newY * Chess.tileSize}px`);

            Chess.Position[newY][5] = `${piece[0]}x2.1`;
            Chess.Position[newY][7] = null;

            rookElement.style.animation = `moveRookForCastle 0.1s ease-in-out 0s 1 normal forwards`;
            rookElement.id = newRookId;
          }
        }

        pieceElement.id = newPieceId;
      } else {
        Chess.Position[newY][newX] = piece;
        Chess.Position[oldY][oldX] = null;

        if (specialMove === "en passant")
          Chess.Position[oldY][newX] = null;
        else if (specialMove === "queenside castle") { //rook move
          Chess.Position[newY][3] = `${piece[0]}x2.1`;
          Chess.Position[newY][0] = null; //king
        } else if (specialMove === "kingside castle") { //rook move
          Chess.Position[newY][5] = `${piece[0]}x2.1`;
          Chess.Position[newY][7] = null;
        }
      }

      if (!simulate) {
        Chess.whitesTurn = !Chess.whitesTurn;

        const classToCheckFor = (Chess.whitesTurn) ? "containsWhitePiece" : "containsBlackPiece";

        const tiles = document.getElementsByClassName("tile");
        for (const tile of tiles) {
          if (tile.classList.contains(classToCheckFor))
            tile.classList.add("can-click");
          else
            tile.classList.remove("can-click");
        }

        if (Chess.whiteTimer && Chess.blackTimer) {
          if (Chess.whiteFirstMoveTimeout)
            clearTimeout(Chess.whiteFirstMoveTimeout);

          if (Chess.blackFirstMoveTimeout)
            clearTimeout(Chess.blackFirstMoveTimeout);

          if (Chess.whitesTurn) {
            Chess.board.style.animation = "whitesTurn 1s ease-in-out 0s 1 normal forwards";

            if (!Chess.blackTimer.paused)
              Chess.blackTimer.pause();

            Chess.whiteTimer.play();

            Chess.whiteTimerElement.style.animation = `timerOn${Chess.whiteClockColor} 1s ease-in-out 0s 1 normal forwards`;
            Chess.blackTimerElement.style.animation = `timerOff${Chess.blackClockColor} 1s ease-in-out 0s 1 normal forwards`;
          } else {
            Chess.board.style.animation = "blacksTurn 1s ease-in-out 0s 1 normal forwards";

            if (!Chess.whiteTimer.paused)
              Chess.whiteTimer.pause();

            if (Chess.blackFirstMove) {
              Chess.blackFirstMove = false;

              Chess.blackFirstMoveTimeout = setTimeout(this.StartTimer, 10000);
            } else
              Chess.blackTimer.play();

            Chess.whiteTimerElement.style.animation = `timerOff${Chess.whiteClockColor} 1s ease-in-out 0s 1 normal forwards`;
            Chess.blackTimerElement.style.animation = `timerOn${Chess.blackClockColor} 1s ease-in-out 0s 1 normal forwards`;
          }
        }

        const materialDiffrences = this.GetMaterial(true) - this.GetMaterial(false);
        if (Math.abs(materialDiffrences) > Chess.materialDiffrencesMax)
          Chess.materialDiffrencesMax = Math.abs(materialDiffrences);

        Chess.materialDiffrences.push(materialDiffrences);

        const positionCode = this.ConvertGameToCode(Chess.Position);
        Chess.threefoldCache.push(positionCode);
        if (LCF.Array.IndexesOf(Chess.threefoldCache, positionCode).length >= 3) {
          const code = this.IsGameOver(Infinity);
          if (code)
            this.GameOver(code);
        }

        if (Chess.gameOver)
          return;

        this.GetLegalMoves();

        return 1;
      }
    },

    Capture: function(x, y, pieceCapturing) {
      const piece = Chess.Position[y][x];
      const white = (piece[0] === "0");

      const promotedPiece = document.getElementById(`piece_${x}-${y}`).dataset.promoted;

      if (!promotedPiece) {
        if (white)
          Chess.whiteCapturedPieces.push(`0x${piece[2]}`);
        else
          Chess.blackCapturedPieces.push(`1x${piece[2]}`);
      }

      const moveSound = new Audio("audio/capture.mp3");
      moveSound.play();

      document.getElementById(`piece_${x}-${y}`).remove();

      if (!pieceCapturing) //en passant
        Chess.Position[y][x] = null;
      else {
        //play capture animation

        Chess.Position[y][x] = pieceCapturing;
      }

      //Material Bar

      const materialBar = document.getElementById("MaterialBar");
      const materialBarPercentage = document.getElementById("MaterialBarPercentage");

      const whiteMaterial = this.GetMaterial(true);
      const blackMaterial = this.GetMaterial(false);

      const width = materialBar.clientWidth * (0.5 + (whiteMaterial - blackMaterial) / 78);

      materialBarPercentage.style.width = width + "px";

      const materialDiffrence = whiteMaterial - blackMaterial;
      if (materialDiffrence > 0) {
        document.getElementById("WhiteMaterialDiffrence").innerHTML = `+${materialDiffrence}`;
        document.getElementById("BlackMaterialDiffrence").innerHTML = "";
      } else if (materialDiffrence < 0) {
        document.getElementById("WhiteMaterialDiffrence").innerHTML = "";
        document.getElementById("BlackMaterialDiffrence").innerHTML = `+${-materialDiffrence}`;
      } else {
        document.getElementById("WhiteMaterialDiffrence").innerHTML = "0";
        document.getElementById("BlackMaterialDiffrence").innerHTML = "0";
      }

      if (!promotedPiece)
        this.OrganizeCapturedPieces(white);
    },

    OrganizeCapturedPieces: function(white) {
      if (white) {
        Chess.whiteCapturedPieces = Chess.whiteCapturedPieces.sort();

        const whiteCapturedPiecesDiv = document.getElementById("WhiteCapturedPieces");
        whiteCapturedPiecesDiv.innerHTML = "";

        let x = 0;
        let y = 0;
        for (const capturedPiece of Chess.whiteCapturedPieces) {
          const newCapturedPieceElement = document.createElement("img");
          newCapturedPieceElement.classList.add("no-select", "capturedPiece");

          newCapturedPieceElement.src = Chess.pieceImages[capturedPiece];

          whiteCapturedPiecesDiv.appendChild(newCapturedPieceElement);

          newCapturedPieceElement.width = Chess.capturedPieceSize;
          newCapturedPieceElement.height = Chess.capturedPieceSize;

          newCapturedPieceElement.style.top = y * Chess.capturedPieceSize + Chess.capturedPieceTopOffset + "px";
          newCapturedPieceElement.style.left = x * Chess.capturedPieceSize + Chess.capturedPieceLeftOffset + "px";

          x++;
          if (x >= 5) {
            x = 0;
            y++;
          }
        }
      } else {
        Chess.blackCapturedPieces = Chess.blackCapturedPieces.sort();

        const blackCapturedPiecesDiv = document.getElementById("BlackCapturedPieces");
        blackCapturedPiecesDiv.innerHTML = "";

        let x = 0;
        let y = 0;
        for (const capturedPiece of Chess.blackCapturedPieces) {
          const newCapturedPieceElement = document.createElement("img");
          newCapturedPieceElement.classList.add("no-select", "capturedPiece");

          newCapturedPieceElement.src = Chess.pieceImages[capturedPiece];

          blackCapturedPiecesDiv.appendChild(newCapturedPieceElement);

          newCapturedPieceElement.width = Chess.capturedPieceSize;
          newCapturedPieceElement.height = Chess.capturedPieceSize;

          newCapturedPieceElement.style.top = y * Chess.capturedPieceSize + Chess.capturedPieceTopOffset + "px";
          newCapturedPieceElement.style.left = x * Chess.capturedPieceSize + Chess.capturedPieceLeftOffset + "px";

          x++;
          if (x >= 5) {
            x = 0;
            y++;
          }
        }
      }
    },

    GetMaterial: function(white) {
      let material;
      if (white)
        material = Chess.material.white;
      else
        material = Chess.material.black;

      return material.x1 * 9 + material.x2 * 5 + (material.x3 + material.x4) * 3 + material.x5;
    },

    Promote: async function(x, y, whitesTurn) {
      const canvas = document.getElementById("PromoteCanvas");

      const offsetHeight = Number(Chess.board.style.top.replace("px",""));

      const width = Chess.tileSize + 8;
      const height = Chess.tileSize * (Chess.promotionOptions.length + 0.5) + 8;

      canvas.width = width;
      canvas.height = height;

      const borderRadius = 15;
      const trueBorderRadius = `${borderRadius}% / ${borderRadius * (width / height)}%`;

      canvas.style.borderRadius = trueBorderRadius;

      canvas.style.left = x * Chess.tileSize + Chess.board.offsetLeft - 6 + "px";
      if (this.whiteOnBottom == whitesTurn)
        canvas.style.top = y * Chess.tileSize + offsetHeight + "px";
      else
        canvas.style.top = Chess.gameDiv.offsetHeight - ((7 - y) * Chess.tileSize + offsetHeight + height) + "px";

      this.DrawPromoteCanvas(whitesTurn);

      canvas.hidden = false;
      canvas.classList.add("active");

      canvas.style.animation = "unrollPromoteMenu 1s ease-in-out 0s 1 normal forward";

      Chess.promotionChose = "";
      Chess.waitingForPromotion = true;

      while (Chess.waitingForPromotion && !Chess.gameOver)
        await LCF.Sleep(50);

      if (Chess.promotionChose) {
        canvas.hidden = true;
        canvas.classList.remove("active");

        if (this.whiteOnBottom != whitesTurn)
          Chess.promotionChose = `x${Chess.promotionOptions.length + 1 - Number(Chess.promotionChose[1])}`;

        Chess.material.total.x5--;
        Chess.material.total[Chess.promotionChose]++;

        if (whitesTurn) {
          Chess.material.white.x5--;
          Chess.material.white[Chess.promotionChose]++;
        } else {
          Chess.material.black.x5--;
          Chess.material.black[Chess.promotionChose]++;
        }

        switch (Chess.promotionChose) {
          case "x1":
            return `${1 - Number(whitesTurn)}x1`;
          case "x2":
            return `${1 - Number(whitesTurn)}x2.1-0`;
          case "x3":
            return `${1 - Number(whitesTurn)}x3`;
          case "x4":
            return `${1 - Number(whitesTurn)}x4`;
        }
      } else {
        canvas.hidden = true;
        canvas.classList.remove("active");

        return -1;
      }
    },

    InCheck: function(whitesTurn, specificPosition, singleValue) {
      const checkFromArray = [];

      let kingTileId;
      if (specificPosition) {
        kingTileId = specificPosition.join("-");
      } else {
        if (whitesTurn)
          kingTileId = Chess.whiteKingPosition.join("-");
        else
          kingTileId = Chess.blackKingPosition.join("-");
      }

      for (const [piecesLegalMovesKey, pieceLegalMoves] of Object.entries(Chess.legalMoves)) {
        if (!Chess.Position[piecesLegalMovesKey[2]][piecesLegalMovesKey[0]])
          continue;

        if (Chess.Position[piecesLegalMovesKey[2]][piecesLegalMovesKey[0]][0] == Number(!whitesTurn))
          continue;

        if (Object.keys(pieceLegalMoves).includes(kingTileId)) {
          if (singleValue)
            return true;
          else
            checkFromArray.push(piecesLegalMovesKey);
        }
      }

      if (singleValue)
        return false;
      else
        return checkFromArray;
    },

    PutsOwnKingInCheck: function(startX, startY, moveX, moveY, checkLegalMove) {
      const startTileId = `${startX}-${startY}`;

      [startX, startY, moveX, moveY] = [Number(startX), Number(startY), Number(moveX), Number(moveY)];

      let kingTileId;
      if (Chess.whitesTurn)
        kingTileId = Chess.whiteKingPosition.join("-");
      else
        kingTileId = Chess.blackKingPosition.join("-");

      if (checkLegalMove)

      for (const [piecesLegalMovesKey, pieceLegalMoves] of Object.entries(Chess.legalMoves)) {
        if (piecesLegalMovesKey === startTileId)
          continue;

          let minIndex = Object.keys(pieceLegalMoves).indexOf(startTileId);

          if (minIndex > -1) {
            let index = 0;

            for (const [legalMoveKey, legalMove] of Object.entries(pieceLegalMoves)) {
              index++;

              if (index <= minIndex)
                continue;

              const positionSave = structuredClone(Chess.Position);

              this.MovePiece(moveX, moveY, startX, startY, checkLegalMove.piece, checkLegalMove.capture, checkLegalMove.specialMove, true);

              const newLegalMoves = this.GetLegalMoves(...piecesLegalMovesKey.split("-"));

              Chess.Position = structuredClone(positionSave);

              if (Object.keys(newLegalMoves[piecesLegalMovesKey]).includes(kingTileId))
                return true;
            }
          }
      }


      return false;
    },

    GetsOutOfCheck: function(startX, startY, moveX, moveY, checkLegalMove, checksFrom) {
      const moveTileId = `${moveX}-${moveY}`;

      [startX, startY, moveX, moveY] = [Number(startX), Number(startY), Number(moveX), Number(moveY)];

      const kingMove = (Chess.Position[startY][startX][2] === "0");

      let kingTileId;
      if (Chess.whitesTurn)
        kingTileId = Chess.whiteKingPosition.join("-");
      else
        kingTileId = Chess.blackKingPosition.join("-");

      let gotOutOfChecks = 0;

      if (kingMove) {
        for (const [piecesLegalMovesKey, piecesLegalMoves] of Object.entries(Chess.legalMoves)) {
          const piecePosition = piecesLegalMovesKey.split("-");
          if (Chess.Position[Number(piecePosition[1])][Number(piecePosition[0])][0] != Chess.whitesTurn)
            continue;

          const positionSave = structuredClone(Chess.Position);

          this.MovePiece(moveX, moveY, startX, startY, checkLegalMove.piece, checkLegalMove.capture, checkLegalMove.specialMove, true);

          const newLegalMoves = this.GetLegalMoves(...piecePosition);

          Chess.Position = structuredClone(positionSave);

          if (Object.keys(newLegalMoves[piecesLegalMovesKey]).includes(moveTileId))
            return false;
        }

        return true;
      }

      for (const pieceCheckFrom of checksFrom) {
        let moveMightWork = false;
        if (pieceCheckFrom === moveTileId)
          moveMightWork = true;
        else if (Object.keys(Chess.legalMoves[pieceCheckFrom]).includes(moveTileId))
          moveMightWork = true;

        if (moveMightWork) {
          const positionSave = structuredClone(Chess.Position);

          this.MovePiece(moveX, moveY, startX, startY, checkLegalMove.piece, checkLegalMove.capture, checkLegalMove.specialMove, true);

          const newLegalMoves = this.GetLegalMoves(...pieceCheckFrom.split("-"));

          Chess.Position = structuredClone(positionSave);

          if (newLegalMoves[pieceCheckFrom])
            if (Object.keys(newLegalMoves[pieceCheckFrom]).includes(kingTileId))
              return false;
            else
              gotOutOfChecks++;
        }
      }


      return (gotOutOfChecks === checksFrom.length);
    },

    GetLegalMoves: function(onlyX, onlyY) { //working on
      const legalMoves = {};

      let onePieceCheck = false;
      if (onlyX && onlyY) {
        [onlyX, onlyY] = [Number(onlyX), Number(onlyY)];

        onePieceCheck = true;
      }

      const castleMoves = {};

      for (let y in Chess.Position) {
        for (let x in Chess.Position[y]) {
          if (onePieceCheck)
            [x, y] = [onlyX, onlyY];

          [x, y] = [Number(x), Number(y)];

          const piece = Chess.Position[y][x];
          if (!piece)
            continue;

          const tileId = `${x}-${y}`;

          legalMoves[tileId] = {};

          let color, type, extraInfo, extraExtraInfo;

          [color, type] = piece.split("x");
          if (type.includes(".")) {
            [type, extraInfo] = type.split(".");

            if (extraInfo.includes("-"))
              [extraInfo, extraExtraInfo] = extraInfo.split("-");
          }

          let newPiece;
          switch (`x${type.split(".")[0]}`) {
            case "x0":
              const kingNormalMoves = [
                [0, 1],
                [1, 0],
                [0, -1],
                [-1, 0],
                [1, 1],
                [-1, 1],
                [-1, -1],
                [1, -1]
              ];

              for (const kingNormalMove of kingNormalMoves) {
                const [moveX, moveY] = LCF.Array.Add([x, y], kingNormalMove);
                if (LCF.Number.InRange([moveX, moveY], [0, 8], [true, false], true)) {
                  const tile = Chess.Position[moveY][moveX];
                  if (!tile)
                    legalMoves[tileId][`${moveX}-${moveY}`] = {piece: `${color}x0.1`};
                  else if (tile[0] !== color)
                    legalMoves[tileId][`${moveX}-${moveY}`] = {piece: `${color}x0.1`, capture: `x${tile[2]}`};
                }
              }

              if (extraInfo === "0") {
                castleMoves[tileId] = {};

                if (color === "0") {
                  if (Chess.Position[7][0] === "0x2.0") //queenside
                    if (!Chess.Position[7][1] && !Chess.Position[7][2] && !Chess.Position[7][3])
                      castleMoves[tileId]["2-7"] = {piece: "0x0.1", specialMove: "queenside castle"};

                  if (Chess.Position[7][7] === "0x2.0") //kingside
                    if (!Chess.Position[7][5] && !Chess.Position[7][6])
                      castleMoves[tileId]["6-7"] = {piece: "0x0.1", specialMove: "kingside castle"};
                } else {
                  if (Chess.Position[0][0] === "1x2.0") //queenside
                    if (!Chess.Position[0][1] && !Chess.Position[0][2] && !Chess.Position[0][3])
                      castleMoves[tileId]["2-0"] = {piece: "1x0.1", specialMove: "queenside castle"};

                  if (Chess.Position[0][7] === "1x2.0") //kingside
                    if (!Chess.Position[0][5] && !Chess.Position[0][6])
                      castleMoves[tileId]["6-0"] = {piece: "1x0.1", specialMove: "kingside castle"};
                }
              }
              break;
            case "x1": //queen
              const queenMoves = [
                [0, 1],
                [1, 0],
                [0, -1],
                [-1, 0],
                [1, 1],
                [-1, 1],
                [-1, -1],
                [1, -1]
              ];

              for (const queenMove of queenMoves) {
                let [moveX, moveY] = [x, y];
                for (let distance = 0;distance < 8;distance++) {//max queen can move in 1 move
                  [moveX, moveY] = LCF.Array.Add([moveX, moveY], queenMove);
                  if (LCF.Number.InRange([moveX, moveY], [0, 8], [true, false], true)) {
                    const tile = Chess.Position[moveY][moveX];
                    if (!tile)
                      legalMoves[tileId][`${moveX}-${moveY}`] = {piece: piece};
                    else if (tile[0] !== color) {
                      legalMoves[tileId][`${moveX}-${moveY}`] = {piece: piece, capture: `x${tile[2]}`};
                      break;
                    } else
                      break;
                  } else
                    break;
                }
              }
              break;
            case "x2": //rook
              const rookMoves = [
                [0, 1],
                [1, 0],
                [0, -1],
                [-1, 0]
              ];

              newPiece = piece;
              if (extraInfo === "0")
                newPiece = `${color}x2.1`;

              for (const rookMove of rookMoves) {
                let [moveX, moveY] = [x, y];
                for (let distance = 0;distance < 8;distance++) {//max rook can move in 1 move
                  [moveX, moveY] = LCF.Array.Add([moveX, moveY], rookMove);
                  if (LCF.Number.InRange([moveX, moveY], [0, 8], [true, false], true)) {
                    const tile = Chess.Position[moveY][moveX];
                    if (!tile)
                      legalMoves[tileId][`${moveX}-${moveY}`] = {piece: newPiece};
                    else if (tile[0] !== color) {
                      legalMoves[tileId][`${moveX}-${moveY}`] = {piece: newPiece, capture: `x${tile[2]}`};
                      break;
                    } else
                      break;
                  } else
                    break;
                }
              }
              break;
            case "x3": //bishop
              const bishopMoves = [
                [1, 1],
                [-1, 1],
                [-1, -1],
                [1, -1]
              ];

              for (const bishopMove of bishopMoves) {
                let [moveX, moveY] = [x, y];
                for (let distance = 0;distance < 8;distance++) {//max bishop can move in 1 move
                  [moveX, moveY] = LCF.Array.Add([moveX, moveY], bishopMove);
                  if (LCF.Number.InRange([moveX, moveY], [0, 8], [true, false], true)) {
                    const tile = Chess.Position[moveY][moveX];
                    if (!tile)
                      legalMoves[tileId][`${moveX}-${moveY}`] = {piece: piece};
                    else if (tile[0] !== color) {
                      legalMoves[tileId][`${moveX}-${moveY}`] = {piece: piece, capture: `x${tile[2]}`};
                      break;
                    } else
                      break;
                  } else
                    break;
                }
              }
              break;
            case "x4": //knight
              const knightMoves = [
                [1, 2],
                [2, 1],
                [2, -1],
                [1, -2],
                [-1, -2],
                [-2, -1],
                [-2, 1],
                [-1, 2]
              ];

              for (const knightMove of knightMoves) {
                const [moveX, moveY] = LCF.Array.Add([x, y], knightMove);
                if (LCF.Number.InRange([moveX, moveY], [0, 8], [true, false], true)) {
                  const tile = Chess.Position[moveY][moveX];
                  if (!tile)
                    legalMoves[tileId][`${moveX}-${moveY}`] = {piece: piece};
                  else if (tile[0] !== color)
                    legalMoves[tileId][`${moveX}-${moveY}`] = {piece: piece, capture: `x${tile[2]}`};
                }
              }
              break;
            case "x5": //pawn
              const direction = (Number(color)) ? 1 : -1; //white up, black down (1 = down, -1 = up)
              newPiece = `${color}x5.1-0`;

              if (y + direction < 0 || y + direction > 7)
                break;

              if (!Chess.Position[y + direction][x]) {//move 1
                legalMoves[tileId][`${x}-${y + direction}`] = {piece: newPiece};

                if (extraInfo === "0" && Chess.Position[y + direction * 2] && !Chess.Position[y + direction * 2][x]) //start move 2
                  legalMoves[tileId][`${x}-${y + direction * 2}`] = {piece: `${color}x5.1-1`};
              }

              const upAndLeft = Chess.Position[y + direction][x - 1];
              if (upAndLeft && upAndLeft[0] !== color) //take left
                legalMoves[tileId][`${x - 1}-${y + direction}`] = {piece: newPiece, capture: `x${upAndLeft[2]}`};

              const upAndRight = Chess.Position[y + direction][x + 1];
              if (upAndRight && upAndRight[0] !== color) //take right
                legalMoves[tileId][`${x + 1}-${y + direction}`] = {piece: newPiece, capture: `x${upAndRight[2]}`};

              if (Chess.Position[y][x - 1] === `${1 - color}x5.1-1`) //en passant left
                legalMoves[tileId][`${x - 1}-${y + direction}`] = {piece: newPiece, capture: "x5", specialMove: "en passant"};

              if (Chess.Position[y][x + 1] === `${1 - color}x5.1-1`) //en passant right
                legalMoves[tileId][`${x + 1}-${y + direction}`] = {piece: newPiece, capture: "x5", specialMove: "en passant"};
              break;
          }

          if (onePieceCheck)
            break;
        }

        if (onePieceCheck)
          break;
      }

      if (!onePieceCheck) {
        Chess.legalMoves = structuredClone(legalMoves);

        let totalTrueLegalMoves = 0;

        let trueLegalMoves = {};

        for (const [kingTileId, kingCastleMoves] of Object.entries(castleMoves)) {
          for (const [castleTileId, castleMove] of Object.entries(kingCastleMoves)) {
            let [x, y] = kingTileId.split("-");
            [x, y] = [Number(x), Number(y)];

            const piece = Chess.Position[y][x];

            const whiteKing = (piece[0] === "0");

            if (whiteKing != Chess.whitesTurn)
              continue;
            
            if (!trueLegalMoves[kingTileId])
              trueLegalMoves[kingTileId] = {};

            if (!this.InCheck(whiteKing, null, true)) {
              if (castleMove.specialMove === "queenside castle") {
                if (!this.InCheck(whiteKing, [2, y], true) && !this.InCheck(whiteKing, [3, y], true)) {
                  trueLegalMoves[kingTileId][castleTileId] = castleMove;

                  totalTrueLegalMoves++;
                }
              } else if (castleMove.specialMove === "kingside castle") {
                if (!this.InCheck(whiteKing, [5, y], true) && !this.InCheck(whiteKing, [6, y], true)) {
                  trueLegalMoves[kingTileId][castleTileId] = castleMove;

                  totalTrueLegalMoves++;
                }
              }
            }
          }
        }

        for (const y in Chess.Position) {
          for (const x in Chess.Position[y]) {
            const tile = Chess.Position[y][x];
            const tileId = `${x}-${y}`;

            const kingInCheckFrom = this.InCheck(Chess.whitesTurn);
            const kingInCheck = kingInCheckFrom.length;

            if (tile && tile[0] != Chess.whitesTurn) {
              if (!trueLegalMoves[tileId])
                trueLegalMoves[tileId] = {};

              for (const [legalMovesKey, currentLegalMove] of Object.entries(legalMoves[tileId])) {
                if (tile[2] === "0") {
                  if (this.GetsOutOfCheck(x, y, ...legalMovesKey.split("-"), currentLegalMove, kingInCheckFrom))
                    trueLegalMoves[tileId][legalMovesKey] = currentLegalMove;

                  continue;
                }

                if (!this.PutsOwnKingInCheck(x, y, ...legalMovesKey.split("-"), currentLegalMove)) {
                  if (kingInCheck) {
                    if (this.GetsOutOfCheck(x, y, ...legalMovesKey.split("-"), currentLegalMove, kingInCheckFrom)) {
                      trueLegalMoves[tileId][legalMovesKey] = currentLegalMove;
                    }
                  } else
                    trueLegalMoves[tileId][legalMovesKey] = currentLegalMove;
                }
              }

              totalTrueLegalMoves += Object.keys(trueLegalMoves[tileId]).length;
            } else if (tile)
              trueLegalMoves[tileId] = structuredClone(legalMoves[tileId]);
          }
        }

        Chess.legalMoves = structuredClone(trueLegalMoves);

        const code = this.IsGameOver(totalTrueLegalMoves);
        if (code)
          this.GameOver(code);
      } else
        return legalMoves;
    },

    ShowLegalMoves: function() {
      for (const move of Object.keys(Chess.clickedPieceLegalMoves))
        this.HighlightSquare(Number(move.split("-")[0]), Number(move.split("-")[1]));
    },

    ClearLegalMoves: function() {
      for (const move of Object.keys(Chess.clickedPieceLegalMoves))
        this.UnHighlightSquare(Number(move.split("-")[0]), Number(move.split("-")[1]));
    },

    HighlightSquare: function(x, y) {
      document.getElementById(`tile_${x}-${y}`).classList.add("highlighted");
    },

    UnHighlightSquare: function(x, y) {
      document.getElementById(`tile_${x}-${y}`).classList.remove("highlighted");
    },

    ChoosePromotion: function(event) {
      if (Chess.gameOver)
        return;

      if (!Chess.waitingForPromotion)
        return;

      const x = event.offsetX;
      const y = event.offsetY - Chess.promotionTileOffsetHeight;

      const piece = Chess.promotionOptions[Math.max(-1, Math.min(Math.floor((y - 4) / Chess.tileSize), Chess.promotionOptions.length))];

      Chess.promotionChose = piece;
      Chess.waitingForPromotion = false;
    },

    ClickedBoard: async function(event, clickCoords) {
      if (Chess.gameOver)
        return;

      if (Chess.waitingForPromotion) {
        Chess.promotionChose = null;
        Chess.waitingForPromotion = false;

        return;
      }

      const x = clickCoords[0];
      const y = (this.whiteOnBottom) ? clickCoords[1] : 7 - clickCoords[1];
      const tileCoords = [x, y];

      const thePieceClicked = Chess.Position[y][x];

      if (Chess.clickedPiece) {
        const legalMove = Chess.clickedPieceLegalMoves[tileCoords.join("-")];
        if (legalMove) {
          this.UnHighlightSquare(...Chess.currentClickedPiece);
          this.ClearLegalMoves();

          const legalMovesHold = structuredClone(Chess.legalMoves);
          Chess.legalMoves = {};

          const pieceReturn = await this.MovePiece(...tileCoords, ...Chess.currentClickedPiece, legalMove.piece, legalMove.capture, legalMove.specialMove);

          Chess.clickedPiece = false;
          Chess.currentClickedPiece = [null, null];

          if (pieceReturn === -1)
            Chess.legalMoves = structuredClone(legalMovesHold);
        } else if (thePieceClicked && Number(thePieceClicked[0]) === Chess.white - Chess.whitesTurn) {
          if (Chess.currentClickedPiece.toString() === tileCoords.toString()) {
            this.UnHighlightSquare(...tileCoords);
            this.ClearLegalMoves();

            Chess.clickedPieceLegalMoves = {};

            Chess.clickedPiece = false;
            Chess.currentClickedPiece = [null, null];
          } else {
            this.UnHighlightSquare(...Chess.currentClickedPiece);
            this.ClearLegalMoves();

            this.HighlightSquare(...tileCoords);

            Chess.clickedPieceLegalMoves = structuredClone(Chess.legalMoves[tileCoords.join("-")]);
            this.ShowLegalMoves();

            Chess.clickedPiece = true;
            Chess.currentClickedPiece = tileCoords;
          }
        } else {
          this.UnHighlightSquare(...Chess.currentClickedPiece);
          this.ClearLegalMoves();

          Chess.clickedPieceLegalMoves = {};

          Chess.clickedPiece = false;
          Chess.currentClickedPiece = [null, null];
        }
      } else if (thePieceClicked && Number(thePieceClicked[0]) === Chess.white - Chess.whitesTurn) {
        this.HighlightSquare(...tileCoords);

        Chess.clickedPieceLegalMoves = structuredClone(Chess.legalMoves[tileCoords.join("-")]);

        this.ShowLegalMoves();

        Chess.clickedPiece = true;
        Chess.currentClickedPiece = tileCoords;
      }
    },

    UpdateTimers: function() {
      if (!Chess.whiteTimer || !Chess.blackTimer)
        return;

      let whiteTime = Chess.whiteTimer.time;
      let blackTime = Chess.blackTimer.time;

      if (whiteTime <= 0) {
        whiteTime = 0;
        
        const code = Chess.Functions.IsGameOver(Infinity);
        if (code)
          Chess.Functions.GameOver(code);
      } else if (blackTime <= 0) {
        blackTime = 0;

        const code = Chess.Functions.IsGameOver(Infinity);
        if (code)
          Chess.Functions.GameOver(code);
      }

      let whiteMinutes = Math.floor(whiteTime / 1000 / 60);
      let whiteSeconds = Math.floor(whiteTime / 1000) % 60;
      let whiteMilliseconds = Math.ceil(whiteTime / 100) % 10;

      let blackMinutes = Math.floor(blackTime / 1000 / 60);
      let blackSeconds = Math.floor(blackTime / 1000) % 60;
      let blackMilliseconds = Math.ceil(blackTime / 100) % 10;

      if (whiteSeconds < 10 && whiteMinutes)
        whiteSeconds = `0${whiteSeconds}`;

      let whiteTimeFormatted = "";
      if (whiteMinutes)
        whiteTimeFormatted += `${whiteMinutes}:`;
      
      whiteTimeFormatted += whiteSeconds;
      if (whiteSeconds < 10 && !whiteMinutes)
        whiteTimeFormatted += `.${whiteMilliseconds}`;

      Chess.whiteTimerElement.firstElementChild.innerHTML = whiteTimeFormatted;
      if (Chess.lastWhiteTimerUpdate !== whiteTimeFormatted.length) {
        Chess.Functions.SetTimerFontSize(Chess.whiteTimerElement, whiteTimeFormatted);

        Chess.lastWhiteTimerUpdate = whiteTimeFormatted.length;
      }

      if (blackSeconds < 10 && blackMinutes)
        blackSeconds = `0${blackSeconds}`;

      let blackTimeFormatted = "";
      if (blackMinutes)
        blackTimeFormatted += `${blackMinutes}:`;
      
      blackTimeFormatted += blackSeconds;
      if (blackSeconds < 10 && !blackMinutes)
        blackTimeFormatted += `.${blackMilliseconds}`;

      Chess.blackTimerElement.firstElementChild.innerHTML = blackTimeFormatted;
      if (Chess.lastBlackTimerUpdate !== blackTimeFormatted.length) {
        Chess.Functions.SetTimerFontSize(Chess.blackTimerElement, blackTimeFormatted);

        Chess.lastBlackTimerUpdate = blackTimeFormatted.length;
      }

      const startTime = Chess.timeDetails.startTime;
      if (Chess.whiteClockColor === "Green" && whiteTime <= startTime * (2/5) + 1000) {
        if (Chess.whiteTimer.lastPause > 1000) {
          Chess.whiteTimerElement.style.animation = "timerGreenToYellow 1s ease-in-out 0s 1 normal forwards";

          Chess.whiteClockColor = "Yellow";
        }
      } else if (Chess.whiteClockColor === "Yellow" && whiteTime <= startTime * (1/4) + 1000) {
        if (Chess.whiteTimer.lastPause > 1000) {
          Chess.whiteTimerElement.style.animation = "timerYellowToRed 1s ease-in-out 0s 1 normal forwards";

          Chess.whiteClockColor = "Red";
        }
      }

      if (Chess.blackClockColor === "Green" && blackTime <= startTime * (2/5) + 1000) {
        if (Chess.blackTimer.lastPause > 1000) {
          Chess.blackTimerElement.style.animation = "timerGreenToYellow 1s ease-in-out 0s 1 normal forwards";

          Chess.blackClockColor = "Yellow";
        }
      } else if (Chess.blackClockColor === "Yellow" && blackTime <= startTime * (1/4) + 1000) {
        if (Chess.blackTimer.lastPause > 1000) {
          Chess.blackTimerElement.style.animation = "timerYellowToRed 1s ease-in-out 0s 1 normal forwards";

          Chess.blackClockColor = "Red";
        }
      }
    },

    StartTimer: function() {
      if (Chess.whitesTurn)
        Chess.whiteTimer.play();
      else
        Chess.blackTimer.play();
    },

    IsGameOver: function(totalLegalMoves = Object.keys(Chess.legalMoves).length) {
      const whitesTurn = Chess.whitesTurn;
      const inCheck = this.InCheck(whitesTurn, null, true);

      const material = Chess.material.total;
      const whiteMaterial = Chess.material.white;
      const blackMaterial = Chess.material.black;

      const whiteTime = (Chess.whiteTimer) ? Chess.whiteTimer.time : Infinity;
      const blackTime = (Chess.blackTimer) ? Chess.blackTimer.time : Infinity;

      if (totalLegalMoves === 0) {
        if (inCheck) {
          if (whitesTurn)
            return "0x0.1"; //black won by checkmate
          else
            return "0x0.0"; //white won by checkmate
        } else
          return "1x0"; //stalemate
      }

      if (whiteTime <= 0) {
        if (!this.GetMaterial(false) && this.GetMaterial(true) === 39)
          return "1x1.5";
        else
          return "0x1.1";
      } else if (blackTime <= 0) {
        if (!this.GetMaterial(true) && this.GetMaterial(false) === 39)
          return "1x1.5";
        else
          return "0x1.0";
      } else if (LCF.Array.IndexesOf(Chess.threefoldCache, this.ConvertGameToCode(Chess.Position)).length >= 3)
        return "1x2";
      else if (Chess.fiftyMoveRuleCount >= 50)
        return "1x3";
      else if (!material.x1 && !material.x2 && !material.x5) { //no queens, rooks, or pawns
        if (!material.x3 && !material.x4)
          return "1x1.0";  //king vs king insufficient material
        else if (material.x3 + material.x4 === 1)
          return "1x1.1"; //king + minor piece vs king insufficient material
        else if (whiteMaterial.x3 + whiteMaterial.x4 === 1 && blackMaterial.x3 + blackMaterial.x4 === 1)
          return "1x1.2"; //king + minor piece vs king + minor piece insufficient material
        else if (material.x3 === 0 && material.x4 === 2 && !(whiteMaterial.x4 && blackMaterial.x4))
          return "1x1.3"; //king + 2 knights vs king insufficient material
        else if ((whiteMaterial.x4 === 2 && blackMaterial.x3 + blackMaterial.x4 === 1) || (blackMaterial.x4 === 2 && whiteMaterial.x3 + whiteMaterial.x4 === 1))
          return "1x1.4"; //king + 2 knights vs king + minor piece insufficient material
      }

      return false;
    },

    GameOver: function(code) {
      const gameOver = new Audio("audio/game_over.mp3");
      gameOver.play();

      Chess.gameOver = true;

      const gameOverElement = document.getElementById("GameOver");
      const gaemOverText = document.getElementById("GameOverTopBar");

      switch (code) {
        case "0x0.0":
          gaemOverText.innerHTML = "White Won by<br>Checkmate";
          break;
        case "0x0.1":
          gaemOverText.innerHTML = "Black Won by<br>Checkmate";
          break;
        case "0x1.0":
          gaemOverText.innerHTML = "White Won by<br>Timeout";
          break;
        case "0x1.1":
          gaemOverText.innerHTML = "Black Won by<br>Timeout";
          break;
        case "0x2.0":
          gaemOverText.innerHTML = "White Won by<br>Resignation";
          break;
        case "0x2.1":
          gaemOverText.innerHTML = "Black Won by<br>Resignation";
          break;
        default:
        case "1x0":
          gaemOverText.innerHTML = "Stalemate";
          break;
        case "1x1.0":
        case "1x1.1":
        case "1x1.2":
        case "1x1.3":
        case "1x1.4":
          gaemOverText.innerHTML = "Draw by<br>Insufficient Material";
          break;
        case "1x1.5":
          gaemOverText.innerHTML = "Insufficient Material<br>vs Timeout";
          break;
        case "1x2":
          gaemOverText.innerHTML = "Draw by Repitition";
          break;
        case "1x3":
          gaemOverText.innerHTML = "Draw by 50-Move Rule";
          break;
        case "1x4":
          gaemOverText.innerHTML = "Draw by Agreement";
          break;
      }

      gaemOverText.classList.remove("white");
      gaemOverText.classList.remove("drew");
      gaemOverText.classList.remove("black");

      if (code[0] === "0") {
        if (code[4] === "0")
          gaemOverText.classList.add("white");
        else if (code[4] === "1")
          gaemOverText.classList.add("black");
      } else
        gaemOverText.classList.add("drew");

      gameOverElement.style.opacity = 0;
      gameOverElement.hidden = false;

      gameOverElement.classList.add("show");

      LCF.Update.RemoveFunction(this.UpdateTimers);
      LCF.Update.SetSpeed(100);

      Chess.whiteTimer.destroy();
      Chess.blackTimer.destroy();

      const boardChildren = Chess.board.children;
      for (const child of boardChildren) {
        if (child.tagName !== "IMG")
          continue;

        child.classList.remove("highlighted", "can-click");
      }

      this.DrawGameGraph();
    },

    DrawGameGraph: function() {
      const gameOverGraphDiv = document.getElementById("GameGraphDiv");

      let graphCanvas;
      const gameOverGraphDivChildren = gameOverGraphDiv.children;
      for (const child of gameOverGraphDivChildren) {
        if (child.tagName !== "DIV") {
          graphCanvas = child;
          break;
        }
      }

      gameOverGraphDiv.innerHTML = graphCanvas.outerHTML;

      const canvas = document.getElementById("GameGraph");
      const context = canvas.getContext("2d");

      const height = canvas.clientHeight;
      const width = canvas.clientWidth;

      canvas.height = height;
      canvas.width = width;

      const materialDiffrences = Chess.materialDiffrences;
      const materialDiffrencesMax = Chess.materialDiffrencesMax + 2;

      context.clearRect(0, 0, width, height);

      context.strokeStyle = "#FF0000";

      context.fillStyle = "#FFFF00";

      context.lineWidth = 1;

      context.beginPath();
      context.moveTo(0, height / 2);
      for (const diffrenceNumber in materialDiffrences) {
        const diffrence = materialDiffrences[diffrenceNumber];

        const pointX = width * 0.9 * (diffrenceNumber / (materialDiffrences.length - 1) + 0.05);
        const pointY = height * (0.5 + diffrence / materialDiffrencesMax / 2);

        context.lineTo(pointX, pointY);

        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip", "no-select");

        tooltip.innerHTML = `.<span class="tooltipText">${-diffrence}</span>`;

        tooltip.style.left = `${pointX}px`;
        tooltip.style.top = `${pointY}px`;

        gameOverGraphDiv.appendChild(tooltip);
      }

      context.lineTo(width, height / 2);
      context.lineTo(0, height / 2);

      context.fill();
      context.stroke();

      let imageData = context.getImageData(0, 0, width, height / 2);
      for (let index = 0;index < imageData.data.length;index += 4) {
        if (index / 4 / width >= height / 2) {
          imageData.data[index] = 0;
          imageData.data[index + 1] = 0;
          imageData.data[index + 2] = 0;
          imageData.data[index + 3] = 255;
        } else if (imageData.data[index] === 255) {
          imageData.data[index] = 57;
          imageData.data[index + 1] = 57;
          imageData.data[index + 2] = 57;
        } else {
          imageData.data[index] = 211;
          imageData.data[index + 1] = 211;
          imageData.data[index + 2] = 211;
          imageData.data[index + 3] = 255;
        }
      }
      context.putImageData(imageData, 0, 0);

      imageData = context.getImageData(0, height / 2, width, height);
      for (let index = 0;index < imageData.data.length;index += 4) {
        if (index / 4 / width <= 1) {
          imageData.data[index] = 0;
          imageData.data[index + 1] = 0;
          imageData.data[index + 2] = 0;
          imageData.data[index + 3] = 255;
        } else if (imageData.data[index] === 255 && imageData.data[index + 1] === 255) {
          imageData.data[index] = 211;
          imageData.data[index + 1] = 211;
          imageData.data[index + 2] = 211;
        } else {
          imageData.data[index] = 57;
          imageData.data[index + 1] = 57;
          imageData.data[index + 2] = 57;
          imageData.data[index + 3] = 255;
        }
      }

      context.putImageData(imageData, 0, height / 2);
    },

    SetTimerFontSize: function(timerElement, text) {
      const timerText = timerElement.firstElementChild;

      let fontSize = timerElement.clientHeight;
      const timerWidth = timerElement.clientWidth;

      const timerMaxWidth = LCF.Elements.GetTextWidth(text, document.body.style.fontFamily, fontSize + "px") + 50;
      if (timerMaxWidth > timerWidth)
        fontSize = fontSize * (timerWidth / timerMaxWidth);

      timerElement.firstElementChild.style.fontSize = fontSize + "px";

      return;
    },

    ConvertGameToCode: function(game) {
      let gameCode = "";

      for (const rowNumber in game) {
        const row = game[rowNumber];

        if (rowNumber > 0)
          gameCode += "/";

        let gapSize = 0;
        for (const tile of row) {
          if (!tile) {
            gapSize++;

            continue;
          } else if (gapSize > 0) {
            gameCode += gapSize;

            gapSize = 0;
          }

          switch(`x${tile[2]}`) {
            case "x0":
              if (tile[0] === "0")
                gameCode += "K";
              else
                gameCode += "k";
              break;
            case "x1":
              if (tile[0] === "0")
                gameCode += "Q";
              else
                gameCode += "q";
              break;
            case "x2":
              if (tile[0] === "0")
                gameCode += "R";
              else
                gameCode += "r";
              break;
            case "x3":
              if (tile[0] === "0")
                gameCode += "B";
              else
                gameCode += "b";
              break;
            case "x4":
              if (tile[0] === "0")
                gameCode += "N";
              else
                gameCode += "n";
              break;
            case "x5":
              if (tile[0] === "0")
                gameCode += "P";
              else
                gameCode += "p";
              break;
          }
        }

        if (gapSize > 0)
          gameCode += gapSize;
      }

      return gameCode;
    },

    ConvertCodeToGame: function(code) {
      const newBoard = [[]];

      let rowNumber = 0;
      for (const character of code) {
        const number = Number(character);
        if (number)
          for (let index = 0;index < number;index++)
            newBoard[rowNumber].push(null);
        else {
          if (character === "/") {
            rowNumber++;
            newBoard.push([]);

            continue;
          }
          
          const upperCaseCharacter = character.toUpperCase();

          let piece = (character === upperCaseCharacter) ? "0" : "1";
          switch(upperCaseCharacter) {
            case "K":
              piece += "x0";
              break;
            case "Q":
              piece += "x1";
              break;
            case "R":
              piece += "x2";
              break;
            case "B":
              piece += "x3";
              break;
            case "N":
              piece += "x4";
              break;
            case "P":
              piece += "x5";
              break;
          }

          newBoard[rowNumber].push(piece);
        }
      }

      return newBoard;
    }
  },

  Codes: {
    Pieces: [
      //Neutral
      ["x0", "King"],
      ["x0.0", "King Not Moved"],
      ["x0.1", "King Moved"],
      ["x1", "Queen"],
      ["x2", "Rook"],
      ["x2.0", "Rook Not Moved"],
      ["x2.1", "Rook Moved"],
      ["x3", "Bishop"],
      ["x4", "Knight"],
      ["x5", "Pawn"],
      ["x5.0", "Pawn Not Moved"],
      ["x5.1", "Pawn Moved"],
      ["x5.1-0", "Pawn Moved No En Passant"],
      ["x5.1-1", "Pawn Moved En Passant"],

      //White
      ["0x0", "White King"],
      ["0x0.0", "White King Not Moved"],
      ["0x0.1", "White King Moved"],
      ["0x1", "White Queen"],
      ["0x2", "White Rook"],
      ["0x2.0", "White Rook Not Moved"],
      ["0x2.1", "White Rook Moved"],
      ["0x3", "White Bishop"],
      ["0x4", "White Knight"],
      ["0x5", "White Pawn"],
      ["0x5.0", "White Pawn Not Moved"],
      ["0x5.1", "White Pawn Moved"],
      ["0x5.1-0", "White Pawn Moved No En Passant"],
      ["0x5.1-1", "White Pawn Moved En Passant"],

      //Black
      ["1x0", "Black King"],
      ["1x0.0", "Black King Not Moved"],
      ["1x0.1", "Black King Moved"],
      ["1x1", "Black Queen"],
      ["1x2", "Black Rook"],
      ["1x2.0", "Black Rook Not Moved"],
      ["1x2.1", "Black Rook Moved"],
      ["1x3", "Black Bishop"],
      ["1x4", "Black Knight"],
      ["1x5", "Black Pawn"],
      ["1x5.0", "Black Pawn Not Moved"],
      ["1x5.1", "Black Pawn Moved"],
      ["1x5.1-0", "Black Pawn Moved No En Passant"],
      ["1x5.1-1", "Black Pawn Moved En Passant"]
    ],
    GameResult: [
      //Win / Loss
      ["0x0.0", "White won by checkmate"],
      ["0x0.1", "Black won by checkmate"],
      ["0x1.0", "White won by timeout"],
      ["0x1.1", "Black won by timeout"],
      ["0x2.0", "White won by resignation"],
      ["0x2.1", "Black won by resignation"],

      //Draw
      ["1x0", "Stalemate"],//working 2 on
      ["1x1", "Insufficient Material"],
      ["1x1.0", "Insufficient Material: King vs King"],
      ["1x1.1", "Insufficient Material: King + Minor Piece vs King"],
      ["1x1.2", "Insufficient Material: King + Minor Piece vs King + Minor Piece"],
      ["1x1.3", "Insufficient Material: King + 2 Knights vs King"],
      ["1x1.4", "Insufficient Material: King + 2 Knights vs King + Minor Piece"],
      ["1x1.5", "Insufficient Material vs Timeout"],
      ["1x2", "Threefold Repitition"],
      ["1x3", "50-Move Rule"],
      ["1x4", "Agreement"]
    ]
  },

  DrawInstructions: {
    x0: [ //king
      [ //layer 1
        {mirror: true, sameColor: true},

        //base
        {action:"move", path:[10, 95]},
        {action:"line", path:[90, 95]},
        {action:"line", path:[85, 84]},
        {action:"line", path:[84, 82]},
        {action:"line", path:[83, 81]},
        {action:"line", path:[81, 80]},
        {action:"line", path:[75, 80]}
      ],
      [ //layer 2
        {mirror: true, sameColor: true}, //options

        //body
        {action:"line", path:[75, 80]},
        {action:"line", path:[90, 35]},

        //top
        {action:"line", path:[80, 31]},
        {action:"line", path:[70, 28]},
        {action:"line", path:[54, 28]},

        //cross
        {action:"line", path:[54, 20]},
        {action:"line", path:[62, 20]},
        {action:"line", path:[62, 12]},
        {action:"line", path:[54, 12]},
        {action:"line", path:[54, 4]}
      ]
    ],
    x1: [ //queen
      [ //layer 1
        {mirror: true, sameColor: true},

        //base
        {action:"move", path:[10, 95]},
        {action:"line", path:[90, 95]},
        {action:"line", path:[85, 84]},
        {action:"line", path:[84, 82]},
        {action:"line", path:[83, 81]},
        {action:"line", path:[81, 80]},
        {action:"line", path:[75, 80]}
      ],
      [ //layer 2
        {mirror: true, sameColor: true}, //options

        //point 1
        {action:"move", path:[81, 80]},
        {action:"line", path:[70, 80]},
        {action:"line", path:[87, 37]},

        //ball lower right
        {action:"line", path:[88.5, 36.5]},
        {action:"line", path:[90, 35.5]},
        {action:"line", path:[91, 34.5]},
        {action:"line", path:[92, 33]},
        {action:"line", path:[92.5, 31.5]},
        {action:"line", path:[92.5, 30.5]},

        //ball upper right
        {action:"line", path:[92.5, 30.5]},
        {action:"line", path:[92.5, 29.5]},
        {action:"line", path:[92, 28]},
        {action:"line", path:[91, 26.5]},
        {action:"line", path:[90, 25.5]},
        {action:"line", path:[88.5, 24.5]},
        {action:"line", path:[87, 24]},
        {action:"line", path:[86, 24]},

        //ball upper left
        {action:"line", path:[86, 24]},
        {action:"line", path:[85, 24]},
        {action:"line", path:[83.5, 24.5]},
        {action:"line", path:[82, 25.5]},
        {action:"line", path:[81, 26.5]},
        {action:"line", path:[80, 28]},
        {action:"line", path:[79.5, 29.5]},
        {action:"line", path:[79.5, 30.5]},

        //ball lower left
        {action:"line", path:[79.5, 30.5]},
        {action:"line", path:[79.5, 31.5]},
        {action:"line", path:[80, 33]},
        {action:"line", path:[81, 34.5]},
        {action:"line", path:[82, 35.5]},
        {action:"line", path:[83.5, 36.5]},
        {action:"line", path:[85, 37]},
        {action:"line", path:[86, 37]},
        {action:"line", path:[87, 37]},

        //end point
        {action:"line", path:[87, 37]},
        {action:"line", path:[86, 37]},
        {action:"line", path:[85, 37]},
        {action:"line", path:[83.5, 36.5]},
        {action:"line", path:[82, 35.5]},
        {action:"line", path:[81, 34.5]},
        {action:"line", path:[71, 42]},

        //point 2
        {action:"line", path:[63, 22]},

        //ball lower right
        {action:"line", path:[64.5, 21.5]},
        {action:"line", path:[66, 20.5]},
        {action:"line", path:[67, 19.5]},
        {action:"line", path:[68, 18]},
        {action:"line", path:[68.5, 16.5]},
        {action:"line", path:[68.5, 15.5]},

        //ball upper right
        {action:"line", path:[68.5, 15.5]},
        {action:"line", path:[68.5, 14.5]},
        {action:"line", path:[68, 13]},
        {action:"line", path:[67, 11.5]},
        {action:"line", path:[66, 10.5]},
        {action:"line", path:[64.5, 9.5]},
        {action:"line", path:[63, 9]},
        {action:"line", path:[62, 9]},

        //ball upper left
        {action:"line", path:[62, 9]},
        {action:"line", path:[61, 9]},
        {action:"line", path:[59.5, 9.5]},
        {action:"line", path:[58, 10.5]},
        {action:"line", path:[57, 11.5]},
        {action:"line", path:[56, 13]},
        {action:"line", path:[55.5, 14.5]},
        {action:"line", path:[55.5, 15.5]},

        //ball lower left
        {action:"line", path:[55.5, 15.5]},
        {action:"line", path:[55.5, 16.5]},
        {action:"line", path:[56, 18]},
        {action:"line", path:[57, 19.5]},
        {action:"line", path:[58, 20.5]},
        {action:"line", path:[59.5, 21.5]},
        {action:"line", path:[61, 22]},
        {action:"line", path:[62, 22]},
        {action:"line", path:[63, 22]},

        //end point
        {action:"line", path:[63, 22]},
        {action:"line", path:[62, 22]},
        {action:"line", path:[61, 22]},
        {action:"line", path:[59.5, 21.5]},

        //center
        {action:"line", path:[50, 38]}
      ]
    ],
    x2: [ //rook
      [ //layer 1
        {mirror: true, sameColor: true},

        //base
        {action:"line", path:[10, 95]},
        {action:"line", path:[90, 95]},
        {action:"line", path:[85, 84]},
        {action:"line", path:[84, 82]},
        {action:"line", path:[83, 81]},
        {action:"line", path:[81, 80]}
      ],
      [ //layer 2
        {mirror: true, sameColor: true}, //options

        //pillar
        {action:"line", path:[79, 80]},
        {action:"line", path:[73, 69]},
        {action:"line", path:[72, 68]},
        {action:"line", path:[70, 65]},
        {action:"line", path:[68, 55]},
        {action:"line", path:[68, 45]},
        {action:"line", path:[70, 35]},
        {action:"line", path:[72, 32]},
        {action:"line", path:[78, 25]},

        //merlon 1
        {action:"line", path:[78, 10]},
        {action:"line", path:[61.5, 10]},

        //crenel 1
        {action:"line", path:[61.5, 20]},
        {action:"line", path:[57.75, 20]},

        //merlon 2
        {action:"line", path:[57.75, 10]},
        {action:"line", path:[50, 10]}
      ]
    ],
    x3: [ //bishop
      [ //layer 1
        {mirror: true, sameColor: true}, //options

        //base
        {action:"line", path:[10, 95]},
        {action:"line", path:[90, 95]},
        {action:"line", path:[85, 84]},
        {action:"line", path:[84, 82]},
        {action:"line", path:[83, 81]},
        {action:"line", path:[81, 80]},
        {action:"line", path:[70, 80]}
      ],
      [ //layer 2
        {mirror: true, sameColor: true},
        
        //curve bottom
        {action:"line", path:[70, 80]},
        {action:"line", path:[74, 74]},
        {action:"line", path:[77, 65]},
        {action:"line", path:[79, 58]},
        {action:"line", path:[80, 53]},
        {action:"line", path:[80, 50]},

        //curve top - bottom section
        {action:"line", path:[80, 50]},
        {action:"line", path:[80, 44]},
        {action:"line", path:[79, 39]},
        {action:"line", path:[77, 32]},

        //curve top - top section
        {action:"line", path:[74, 26]},
        {action:"line", path:[72, 23]},
        {action:"line", path:[70, 21]},
        {action:"line", path:[69, 20]},
        {action:"line", path:[68, 19]},
        {action:"line", path:[66, 18]},
        {action:"line", path:[63, 16]},
        {action:"line", path:[60, 15]},
        {action:"line", path:[56, 14]},
        {action:"line", path:[50, 14]},

        //top ball lower
        {action:"line", path:[51, 14]}, //3-1
        {action:"line", path:[52.5, 13.5]}, //3-1
        {action:"line", path:[54, 12.5]}, //3-2
        {action:"line", path:[55, 11.5]}, //2-2
        {action:"line", path:[56, 10]}, //2-3
        {action:"line", path:[56.5, 8.5]}, //1-3
        {action:"line", path:[56.5, 7.5]}, //0-2

        //top ball upper
        {action:"line", path:[56.5, 7.5]}, //0-2
        {action:"line", path:[56.5, 6.5]}, //1-3
        {action:"line", path:[56, 5]}, //2-3
        {action:"line", path:[55, 3.5]}, //2-2
        {action:"line", path:[54, 2.5]}, //3-2
        {action:"line", path:[52.5, 1.5]}, //3-1
        {action:"line", path:[51, 1.5]}, //3-1
      ],
      [ //layer 3
        {mirror: true, sameColor: false},

        //plus in center
        {action:"line", path:[50, 30]},
        {action:"line", path:[55, 30]},
        {action:"line", path:[55, 40]},
        {action:"line", path:[65, 40]},
        {action:"line", path:[65, 50]},
        {action:"line", path:[55, 50]},
        {action:"line", path:[55, 60]}
      ]
    ],
    x4: [ //knight
      [ //layer 1
        {mirror: true, sameColor: true},

        //base
        {action:"line", path:[10, 95]},
        {action:"line", path:[90, 95]},
        {action:"line", path:[85, 84]},
        {action:"line", path:[84, 82]},
        {action:"line", path:[83, 81]},
        {action:"line", path:[81, 80]},
        {action:"line", path:[75, 80]}
      ],
      [ //layer 2
        {mirror: false, sameColor: true},

        //back - bottom
        {action:"line", path:[75, 80]},
        {action:"line", path:[79, 74]},
        {action:"line", path:[82, 65]},
        {action:"line", path:[84, 58]},
        {action:"line", path:[85, 53]},
        {action:"line", path:[85, 50]},

        //back - top - bottom section
        {action:"line", path:[85, 50]},
        {action:"line", path:[85, 44]},
        {action:"line", path:[84, 39]},
        {action:"line", path:[82, 32]},

        //top of head
        {action:"line", path:[79, 26]},
        {action:"line", path:[77, 23]},
        {action:"line", path:[75, 21]},
        {action:"line", path:[74, 20]},
        {action:"line", path:[73, 19]},
        {action:"line", path:[71, 17]},
        {action:"line", path:[68, 15]},
        {action:"line", path:[66, 14]},

        //ear
        {action:"line", path:[55, 4]},
        {action:"line", path:[54, 15]},

        //mouth - upper left
        {action:"line", path:[23, 27]}, //3-2
        {action:"line", path:[21, 29]}, //2-2
        {action:"line", path:[19, 32]}, //2-3
        {action:"line", path:[18, 35]}, //1-3
        {action:"line", path:[18, 37]}, //0-2

        //mouth - lower left
        {action:"line", path:[18, 37]}, //0-2
        {action:"line", path:[19, 40]}, //1-3

        //mouth
        {action:"line", path:[29, 37]},
        {action:"line", path:[30, 39]},

        //mouth - lower left
        {action:"line", path:[21, 43]}, //2-3
        {action:"line", path:[23, 45]}, //2-2
        {action:"line", path:[26, 47]}, //3-2
        {action:"line", path:[29, 48]}, //3-1
        {action:"line", path:[31, 48]}, //2-0

        //under mouth
        {action:"line", path:[31, 48]}, //2-0
        {action:"line", path:[34, 47]}, //3-1
        {action:"line", path:[37, 45]}, //3-2
        {action:"line", path:[39, 44]}, //2-2
        {action:"line", path:[41, 42.5]}, //2-3
        {action:"line", path:[42, 41]}, //1-3
        {action:"line", path:[49, 45]}, //5-3

        //front of body - upper
        {action:"line", path:[50, 46]}, //2-3
        {action:"line", path:[49, 48]}, //2-2
        {action:"line", path:[46.5, 49]}, //3-2
        {action:"line", path:[45, 49.5]}, //3-1

        //front of body - lower
        {action:"line", path:[41.5, 51]}, //3-1
        {action:"line", path:[40, 52]}, //3-2
        {action:"line", path:[38, 54]}, //2-2
        {action:"line", path:[36, 57]}, //2-3
        {action:"line", path:[34, 63]}, //1-3
        {action:"line", path:[31, 72]},

        //front of body ground connection
        {action:"line", path:[31, 72]},
        {action:"line", path:[30, 75]}, //1-3
        {action:"line", path:[28, 78]}, //2-3
        {action:"line", path:[27, 79]}, //2-2
        {action:"line", path:[25, 80]} //3-2
      ],
      [ //layer 2
        {mirror: false, sameColor: false},

        //eye
        {action:"line", path:[40, 25]},
        {action:"line", path:[50, 22]},
        {action:"line", path:[55, 29]},
        {action:"line", path:[40, 29]},
        {action:"line", path:[40, 25]}
      ]
    ],
    x5: [ //pawn
      [ //layer 1
        {mirror: true, sameColor: true},

        //base
        {action:"line", path:[15, 95]},
        {action:"line", path:[85, 95]},
        {action:"line", path:[80, 80]},
        {action:"line", path:[78, 77]},
        {action:"line", path:[76, 75]},
        {action:"line", path:[73, 73]},

        //pillar
        {action:"line", path:[70, 72]},
        {action:"line", path:[68, 70]},
        {action:"line", path:[67, 69]},
        {action:"line", path:[66, 67]},
        {action:"line", path:[65, 66]},
        {action:"line", path:[64, 63]},
        {action:"line", path:[60, 50]},

        //ring
        {action:"line", path:[65, 50]},
        {action:"line", path:[67, 49]},
        {action:"line", path:[68, 48]},
        {action:"line", path:[70, 47]},
        {action:"line", path:[71, 46]},
        {action:"line", path:[71, 43]},
        {action:"line", path:[70, 42]},
        {action:"line", path:[69, 41]},
        {action:"line", path:[68, 40]},
        {action:"line", path:[60, 40]},

        //top ball
        {action:"line", path:[60, 40]},
        {action:"line", path:[65, 35]},
        {action:"line", path:[66, 33]},
        {action:"line", path:[67, 30]},
        {action:"line", path:[67, 22]},
        {action:"line", path:[66, 19]},
        {action:"line", path:[65, 16]},
        {action:"line", path:[64, 15]},
        {action:"line", path:[62, 14]},
        {action:"line", path:[61, 13]},
        {action:"line", path:[59, 12]},
        {action:"line", path:[55, 11]},
        {action:"line", path:[52, 10.5]}
      ]
    ]
  }
};