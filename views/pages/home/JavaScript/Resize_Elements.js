function ResizeElements() {
    //Page Title
    const titleContainer = document.getElementById("SiteTitleContainer");
    titleContainer.style.borderRadius = LCF.Elements.GetBorderRadius(titleContainer, 10);

    const title = document.getElementById("SiteTitle");
    title.style.borderRadius = LCF.Elements.GetBorderRadius(title, titleContainer.clientWidth * 0.1);

    let titleFontSize = title.clientHeight;
    
    const titleMaxWidth = LCF.Elements.GetTextWidth("Gecko", document.body.style.fontFamily, `${titleFontSize}px`) + 50;
    if (titleMaxWidth > title.clientWidth)
        titleFontSize = titleFontSize * (title.clientWidth / titleMaxWidth);

    title.style.fontSize = `${titleFontSize}px`;
    title.style.lineHeight = `${title.clientHeight}px`;

    const singlePlayer = document.getElementById("SinglePlayer");
    singlePlayer.style.borderRadius = LCF.Elements.GetBorderRadius(singlePlayer, titleContainer.clientWidth * 0.1);
}