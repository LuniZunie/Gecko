function OnLoad() {
  if (document.getElementById("GamePage").style.opacity == 1) {
    Chess.Functions.OnStartup();
    LCF.Update.Call();
  } else if (document.getElementById("CreatePage").style.opacity == 1) {
    ResizeElements();
    AddAutoResizeElements();
    CreateGame.Functions.OnStartup();
    CreateGame.Functions.SetCustomInputCursor(document.getElementById("WhiteTimerMinuteInput"));
  }

  LCF.Page.Fade.In();
  document.body.style.opacity = 1;
}