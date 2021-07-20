let svg = null;

window.addEventListener('load', () => {
    const file = document.getElementById('file');
    file.addEventListener('change', evt => {
        const INPUT = evt.target;
        if (INPUT.files.length == 0) {
            console.log('No file selected');
            return;
        }
        const F = INPUT.files[0];
        var reader = new FileReader();
        reader.readAsText(F);
        reader.onload = function (e) {
            let ai = reader.result;
            svg = ai2svg(ai);
            console.log(svg);
        };
    });
});

downButton.addEventListener('click', function () {
    downloadAsXmlFile("download.svg", svg);
});

function ai2svg(data) {
    let lines = data.split("\n");
    let w = 0;
    let h = 0;

    // SVGファイルの幅と高さを計算
    for (line of lines) {
        if (line.indexOf("%%BoundingBox:") != -1) {
            let bbpos = line.split(" ");
            w = parseInt(bbpos[bbpos.length - 2]) - parseInt(bbpos[bbpos.length - 4]) + 1;
            h = parseInt(bbpos[bbpos.length - 1]) - parseInt(bbpos[bbpos.length - 3]) + 1;
            break;
        }
    }

    let xmlString = "<?xml version=\"1.0\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 20010904//EN\" \"http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd\"><svg version=\"1.0\" dummy=\"http://www.w3.org/2000/svg\" style=\"stroke:black; stroke-linecap:square; stroke-width:0.2\" width=\"" + w + "\" height=\"" + h + "\"></svg>";
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xmlString, "text/xml");

    let elements = xmlDoc.getElementsByTagName("svg");
    let node = null;
    let d = null;
    for (line of lines) {
        let parts = line.split(" ");
        let tail = parts[parts.length - 1];
        if (tail === "m") {
            node = xmlDoc.createElement("path");
            node.setAttribute("style", "fill:none;");
            d = "M"+parts[0]+" "+parts[1];
        } else if (tail === "L") {
            d += " L"+parts[0]+" "+parts[1];
        } else if (tail === "S") {
            node.setAttribute("d", d);
            elements[0].appendChild(node);
        } else if (tail === "s") {
            d += " Z";
            node.setAttribute("d", d);
            elements[0].appendChild(node);
        }
    }

    return new XMLSerializer().serializeToString(xmlDoc).replace("dummy", "xmlns");
}

function downloadAsXmlFile(fileName, content) {
    const BLOB = new Blob([content], { 'type': 'text/xml' });
    const CAN_USE_SAVE_BLOB = window.navigator.msSaveBlob !== undefined;

    if (CAN_USE_SAVE_BLOB) {
        window.navigator.msSaveBlob(BLOB, fileName);
        return;
    }

    const TEMP_ANCHOR = document.createElement('a');
    TEMP_ANCHOR.href = URL.createObjectURL(BLOB);
    TEMP_ANCHOR.setAttribute('download', fileName);

    TEMP_ANCHOR.dispatchEvent(new MouseEvent('click'));
};
