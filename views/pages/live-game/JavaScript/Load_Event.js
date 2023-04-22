function OnLoad() {
  Chess.Functions.OnStartup();
  LCF.Update.Call();

  LCF.Page.Fade.In();
  document.body.style.opacity = 1;
}