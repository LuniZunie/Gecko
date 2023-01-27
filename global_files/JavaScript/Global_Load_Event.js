window.addEventListener("load", async function() {
    if (LCF.IsType.Function(ResizeElements))
        window.addEventListener("resize", ResizeElements);
});