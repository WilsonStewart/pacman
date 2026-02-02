function drawSprite(imgSrc, svgElement) {
  ctx = document.createElement("canvas").getContext("2d");

  var img1 = new Image();
  img1.src = imgSrc;

  img1.onload = function () {
    svgElement.replaceChildren();
    ctx.drawImage(img1, 0, 0);
    const data = ctx.getImageData(0, 0, 16, 16).data;

    const pixels = [];
    for (let i = 0; i < data.length; i += 4) {
      pixels.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: data[i + 3],
      });
    }

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const i = (y * 16 + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3] / 255;

        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", 1);
        rect.setAttribute("height", 1);
        rect.setAttribute("fill", `rgba(${r},${g},${b},${a})`);

        svgElement.appendChild(rect);
      }
    }
  };
}
