function OnLoad() {
  Chess.Functions.OnStartup();
  LCF.Update.Call();

  LCF.Page.FadeIn();
  document.body.style.opacity = 1;
}