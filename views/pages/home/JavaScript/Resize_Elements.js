function ResizeElements() {
    //Page Title
    const titleContainer = document.getElementById("SiteTitleContainer");
    titleContainer.style.borderRadius = LCF.Elements.GetBorderRadius(titleContainer, 10);

    let lowestFontSize = Infinity;

    const borderRadius = titleContainer.clientWidth * 0.1;
    const fontFamily = document.body.style.fontFamily;

    const titleButtons = titleContainer.children;
    for (const button of titleButtons) {
        button.style.borderRadius = LCF.Elements.GetBorderRadius(button, borderRadius);

        let fontSize = button.clientHeight;
        const maxWidth = LCF.Elements.GetTextWidth(button.innerHTML, fontFamily, `${fontSize}px`) + 50;
        if (maxWidth > button.clientWidth)
            fontSize = fontSize * (button.clientWidth / maxWidth);

        if (fontSize < lowestFontSize)
            lowestFontSize = fontSize;
    }

    for (const button of titleButtons) {
        button.style.fontSize = `${lowestFontSize}px`;
        button.style.lineHeight = `${button.clientHeight}px`;
    }

    document.body.style.opacity = 1;
}