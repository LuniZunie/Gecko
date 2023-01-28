function OnLoad() {
  if (document.getElementById("GamePage").style.opacity === 1) {
    Chess.Functions.OnStartup();
    LCF.Update.Call();
  } else if (document.getElementById("CreatePage").style.opacity === 1)
    CreateGame.Functions.OnStartup();

  LCF.Page.FadeIn();
  document.body.style.opacity = 1;
}