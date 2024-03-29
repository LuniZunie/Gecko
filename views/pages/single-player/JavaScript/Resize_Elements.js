AddAutoResizeElements = () => {
  const createPage = document.getElementById("CreatePage");
  const gamePage = document.getElementById("GamePage");

  LCF.Update.AddTextFitElement(document.getElementById("HomeButton"), 25, 10);

  //createPage
  if (createPage.style.opacity == 1) {
    const whiteTimerInputs = document.getElementById("WhiteTimerInputContainer");
    const blackTimerInputs = document.getElementById("BlackTimerInputContainer");

    const timerInputs = [...whiteTimerInputs.children, ...blackTimerInputs.children];
    for (const child of timerInputs)
      LCF.Update.AddTextFitElement(child, 25, 10);
  }
}

ResizeElements = () => {
  const createPage = document.getElementById("CreatePage");
  const gamePage = document.getElementById("GamePage");

  //Home Button
  const homeButtonContainer = document.getElementById("HomeButtonContainer");
  homeButtonContainer.style.borderRadius = LCF.Element.GetBorderRadius(homeButtonContainer, 10);

  //Create Page
  if (createPage.style.opacity == 1) {
    //Timer Containers
    const whiteTimerContainer = document.getElementById("WhiteTimerInputContainer");
    const blackTimerContainer = document.getElementById("BlackTimerInputContainer");

    const timerContainerBorderRadius = LCF.Element.GetBorderRadius(whiteTimerContainer, 10);

    whiteTimerContainer.style.borderRadius = timerContainerBorderRadius;
    blackTimerContainer.style.borderRadius = timerContainerBorderRadius;

    //Timer Inputs
    const whiteTimerInputs = whiteTimerContainer.children;
    const blackTimerInputs = blackTimerContainer.children;

    const timerInputs = [...whiteTimerInputs, ...blackTimerInputs];

    const timerInputBorderRadius = LCF.Element.GetBorderRadius(timerInputs[0], 15);
    for (const child of timerInputs)
      child.style.borderRadius = timerInputBorderRadius;

    const [timerInputWidth, timerInputHeight] = [timerInputs[0].offsetHeight, timerInputs[0].offsetWidth];

    const timerInputMaxWidth = LCF.Element.GetTextWidth("00", document.body.style.fontFamily, timerInputHeight + "px") + 50;

    let timerInputFontSize = timerInputHeight;
    if (timerInputMaxWidth > timerInputWidth)
      timerInputFontSize = timerInputFontSize * (timerInputWidth / timerInputMaxWidth);

    const timerInputPadding = (timerInputHeight - timerInputFontSize) / 2;

    for (const child of timerInputs) {
      child.style.fontSize = `${timerInputFontSize}px`;

      child.style.paddingTop = `${timerInputPadding}px`;
      child.style.paddingBottom = `${timerInputPadding}px`;

      child.style.height = `${timerInputHeight - timerInputPadding * 1.5}px`;
    }

    //Submit Button

    const submitButtonContainer = document.getElementById("SubmitButtonContainer");
    submitButtonContainer.style.borderRadius = LCF.Element.GetBorderRadius(submitButtonContainer, 10);

    const submitButton = document.getElementById("SubmitButton");

    let submitButtonFontSize = submitButton.clientHeight;

    const submitButtonMaxWidth = LCF.Element.GetTextWidth("Gecko", document.body.style.fontFamily, `${submitButtonFontSize}px`) + 50;
    if (submitButtonMaxWidth > submitButton.clientWidth)
      submitButtonFontSize = submitButtonFontSize * (submitButton.clientWidth / submitButtonMaxWidth);

    submitButton.style.fontSize = `${submitButtonFontSize}px`;
    submitButton.style.lineHeight = `${submitButton.clientHeight}px`;
  }

  //Game Page
  if (gamePage.style.opacity == 1) {
    const sideDiv = document.getElementById("SideDiv");

    const board = Chess.board;
    const gameDiv = Chess.gameDiv;

    const whiteTimerElement = Chess.whiteTimerElement;
    const blackTimerElement = Chess.blackTimerElement;

    const whiteTimerText = whiteTimerElement.firstElementChild;
    const blackTimerText = blackTimerElement.firstElementChild;

    //Board
    const twoThirdsWidth = Math.floor(gameDiv.clientWidth * (2 / 3) / 8) * 8;
    const nineTenthHeight = Math.floor(gameDiv.clientHeight * (9 / 10) / 8) * 8;

    if (twoThirdsWidth > nineTenthHeight) {
      board.style.width = nineTenthHeight + "px";
      board.style.height = nineTenthHeight + "px";

      board.style.top = nineTenthHeight / 16 + "px";

      Chess.tileSize = nineTenthHeight / 8;
    } else {
      board.style.height = twoThirdsWidth + "px";
      board.style.width = twoThirdsWidth + "px";

      board.style.top = (gameDiv.clientHeight - twoThirdsWidth) / 2 + "px";

      Chess.tileSize = twoThirdsWidth / 8;
    }

    Chess.Functions.CreatePieces();

    //Timer
    const timerPositionLeft = board.clientWidth + board.offsetLeft + gameDiv.clientWidth * 0.02;
    let timerWidth = (gameDiv.clientWidth * 0.98 - timerPositionLeft);
    let timerHeight = Chess.tileSize * 1;

    if (timerWidth > Chess.tileSize * 4)
      timerWidth = Chess.tileSize * 4;

    sideDiv.style.left = timerPositionLeft + "px";
    sideDiv.style.width = timerWidth + "px";

    whiteTimerElement.style.height = timerHeight + "px";
    blackTimerElement.style.height = timerHeight + "px";

    const timerPosition = 32;

    const timerPositionPixels = timerPosition * board.offsetHeight / 100 + board.offsetTop;
    const trueTimerPosition = timerPositionPixels / sideDiv.offsetHeight * 100;

    let trueTimerTop;
    let distanceBetweenTimers;
    if (Chess.Functions.whiteOnBottom) {
      whiteTimerElement.style.bottom = `${trueTimerPosition}%`;
      blackTimerElement.style.top = `${trueTimerPosition}%`;

      trueTimerTop = blackTimerElement.offsetTop;
      distanceBetweenTimers = sideDiv.offsetHeight * ((whiteTimerElement.offsetTop / sideDiv.offsetHeight - 0.5) * 2);
    } else {
      whiteTimerElement.style.top = `${trueTimerPosition}%`;
      blackTimerElement.style.bottom = `${trueTimerPosition}%`;

      trueTimerTop = whiteTimerElement.offsetTop;
      distanceBetweenTimers = sideDiv.offsetHeight * ((blackTimerElement.offsetTop / sideDiv.offsetHeight - 0.5) * 2);
    }

    whiteTimerText.style.lineHeight = timerHeight + "px";
    blackTimerText.style.lineHeight = timerHeight + "px";

    const timerBorderRadius = LCF.Element.GetBorderRadius(whiteTimerElement, 10);

    whiteTimerElement.style.borderRadius = timerBorderRadius;
    blackTimerElement.style.borderRadius = timerBorderRadius;

    const timerMaxWidth = LCF.Element.GetTextWidth("00:00.0", document.body.style.fontFamily, timerHeight + "px") + 50;

    let timerFontSize = timerHeight;
    if (timerMaxWidth > timerWidth)
      timerFontSize = timerFontSize * (timerWidth / timerMaxWidth);

    whiteTimerText.style.fontSize = timerFontSize + "px";
    blackTimerText.style.fontSize = timerFontSize + "px";

    //Captured Pieces
    const whiteCapturedPiecesDiv = document.getElementById("WhiteCapturedPieces");
    const blackCapturedPiecesDiv = document.getElementById("BlackCapturedPieces");

    const offsetHeight = Number(board.style.top.replace("px", ""));

    if (Chess.Functions.whiteOnBottom) {
      whiteCapturedPiecesDiv.style.top = `${offsetHeight}px`;
      blackCapturedPiecesDiv.style.bottom = `${offsetHeight}px`;
    } else {
      whiteCapturedPiecesDiv.style.bottom = `${offsetHeight}px`;
      blackCapturedPiecesDiv.style.top = `${offsetHeight}px`;
    }

    whiteCapturedPiecesDiv.style.width = timerWidth + "px";
    blackCapturedPiecesDiv.style.width = timerWidth + "px";

    const capturedPiecesDivHeight = trueTimerTop - 15 - offsetHeight;

    whiteCapturedPiecesDiv.style.height = capturedPiecesDivHeight + "px";
    blackCapturedPiecesDiv.style.height = capturedPiecesDivHeight + "px";

    const capturedPiecesBorderRadius = LCF.Element.GetBorderRadius(whiteCapturedPiecesDiv, 10);

    whiteCapturedPiecesDiv.style.borderRadius = capturedPiecesBorderRadius;
    blackCapturedPiecesDiv.style.borderRadius = capturedPiecesBorderRadius;

    const capturedPieceWidth = timerWidth * 0.9 / 5;
    const capturedPieceHeight = capturedPiecesDivHeight * 0.9 / 3;

    Chess.capturedPieceLeftOffset = timerWidth * 0.05;
    Chess.capturedPieceTopOffset = capturedPiecesDivHeight * 0.05;

    if (capturedPieceWidth > capturedPieceHeight) {
      Chess.capturedPieceSize = capturedPieceHeight;
      Chess.capturedPieceLeftOffset = (timerWidth - capturedPieceHeight * 5) / 2;
    } else
      Chess.capturedPieceSize = capturedPieceWidth;

    //Material Bar
    const materialBar = document.getElementById("MaterialBar");
    const materialBarPercentage = document.getElementById("MaterialBarPercentage");

    const barHeight = 0.5;
    const trueBarHeight = distanceBetweenTimers * barHeight;

    materialBar.style.height = trueBarHeight + "px";
    materialBar.style.width = timerWidth + "px";

    materialBar.style.top = sideDiv.offsetHeight * 0.5 - (trueBarHeight / 2) + "px";

    materialBar.style.borderRadius = LCF.Element.GetBorderRadius(materialBar, 5);

    materialBarPercentage.style.width = timerWidth / 2 + "px";

    const materialMaxWidth = LCF.Element.GetTextWidth("+00", document.body.style.fontFamily, trueBarHeight + "px");

    let materialFontSize = trueBarHeight;
    if (materialMaxWidth > timerWidth)
      materialFontSize = materialFontSize * (timerWidth / materialMaxWidth);

    materialBar.style.lineHeight = trueBarHeight + "px";
    materialBar.style.fontSize = materialFontSize + "px";

    //Game Over Section
    const gameOverElement = document.getElementById("GameOver");
    const gameOverTopBar = document.getElementById("GameOverTopBar");
    const gameOverGraphDiv = document.getElementById("GameGraphDiv");

    const gameOverElementHidden = gameOverElement.hidden;

    gameOverElement.style.opacity = Number(!gameOverElementHidden);
    gameOverElement.hidden = false;

    gameOverElement.style.borderRadius = LCF.Element.GetBorderRadius(gameOverElement, 10);

    let gameOverFontSize = gameOverTopBar.clientHeight;

    const gameOverMaxWidth = LCF.Element.GetTextWidth("Draw: Insufficient Material", document.body.style.fontFamily, `${gameOverFontSize}px`) + 25;
    if (gameOverMaxWidth > gameOverTopBar.clientWidth)
      gameOverFontSize = gameOverFontSize * (gameOverTopBar.clientWidth / gameOverMaxWidth);

    gameOverTopBar.style.fontSize = `${gameOverFontSize}px`;

    gameOverGraphDiv.style.borderRadius = LCF.Element.GetBorderRadius(gameOverGraphDiv, 5);

    //Game Over Buttons
    const gameOverButtons = document.getElementById("GameOverButtons");
    const buttonsWidth = gameOverButtons.clientWidth * 0.4;

    let gameOverButtonFontSize = gameOverButtons.clientHeight;

    const gameOverButtonsMaxWidth = LCF.Element.GetTextWidth("Rematch (1)", document.body.style.fontFamily, `${gameOverButtonFontSize}px`);
    if (gameOverButtonsMaxWidth > buttonsWidth)
      gameOverButtonFontSize = gameOverButtonFontSize * (buttonsWidth / gameOverButtonsMaxWidth);

    gameOverButtons.style.fontSize = `${gameOverButtonFontSize}px`;
    gameOverButtons.style.lineHeight = `${gameOverButtons.clientHeight}px`;

    const gameOverButtonsChildren = gameOverButtons.children;
    for (const button of gameOverButtonsChildren)
      button.style.borderRadius = LCF.Element.GetBorderRadius(button, 10);

    gameOverElement.style.opacity = 1;
    gameOverElement.hidden = gameOverElementHidden;

    //Chess Board Images
    const boardChildren = Chess.board.children;
    for (const child of boardChildren) {
      if (child.tagName !== "IMG")
        continue;

      const position = child.id.replace("tile_", "").replace("piece_", "").split("-");
      const [x, y] = [Number(position[0]), Number(position[1])];

      const piece = Chess.Position[y][x];

      child.width = Chess.tileSize;
      child.height = Chess.tileSize;

      child.style.animation = "";

      child.style.top = `${y * Chess.tileSize}px`;
      child.style.left = `${x * Chess.tileSize}px`;

      if (piece && child.id.includes("piece_"))
        child.src = Chess.pieceImages[`${piece[0]}x${piece[2]}`];
    }

    if (!gameOverElementHidden)
      Chess.Functions.DrawGameGraph();
  }
}