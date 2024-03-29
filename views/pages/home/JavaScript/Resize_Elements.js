function ResizeElements(event) {
    //Page Title
    const titleContainer = document.getElementById("SiteTitleContainer");
    titleContainer.style.borderRadius = LCF.Element.GetBorderRadius(titleContainer, 10);

    let lowestFontSize = Infinity;

    const borderRadius = titleContainer.clientWidth * 0.1;
    const fontFamily = document.body.style.fontFamily;

    const titleButtons = titleContainer.children;
    for (const button of titleButtons) {
        button.style.borderRadius = LCF.Element.GetBorderRadius(button, borderRadius);

        let fontSize = button.clientHeight;
        const maxWidth = LCF.Element.GetTextWidth(button.innerHTML, fontFamily, `${fontSize}px`) + 50;
        if (maxWidth > button.clientWidth)
            fontSize = fontSize * (button.clientWidth / maxWidth);

        if (fontSize < lowestFontSize)
            lowestFontSize = fontSize;
    }

    for (const button of titleButtons) {
        button.style.fontSize = `${lowestFontSize}px`;
        button.style.lineHeight = `${button.clientHeight}px`;
    }

    if (!event) {
        LCF.Page.Fade.In();
        document.body.style.opacity = 1;
    }
}