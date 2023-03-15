window.addEventListener("load", async function() {
    if (LCF.IsType.Function(ResizeElements))
        window.addEventListener("resize", ResizeElements);
});

window.addEventListener("error", handleError, true);

function handleError(event) {
    if (event.message)
        alert("error: " + event.message + " at linenumber: " + (event.lineno + 7) + " of file: " + event.filename);
    else
        alert("error: " + event.type + " from element: " + (event.srcElement || event.target));
}