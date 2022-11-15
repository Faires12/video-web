export function maskDateInFull(v: Date | undefined) {
  if (v) {
    const meses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    const data = new Date(v);
    const dataFormatada = `${data.getDate() <= 9 ? "0" : ""}${data.getDate()} ${
      meses[data.getMonth()]
    }, ${data.getFullYear()}`;
    return dataFormatada;
  }
}

export function getAverageRGB(src: string) {
  const imgEl = new Image();
  imgEl.src = src;
  imgEl.crossOrigin = "Anonymous";

  return new Promise<string>(resolve => {
    imgEl.onload = () => {
      var blockSize = 5, // only visit every 5 pixels
        defaultRGB = { r: 0, g: 0, b: 0 }, // for non-supporting envs
        canvas = document.createElement("canvas"),
        context = canvas.getContext && canvas.getContext("2d"),
        data,
        width,
        height,
        i = -4,
        length,
        rgb = { r: 0, g: 0, b: 0 },
        count = 0;
  
      if (!context) {
        return defaultRGB;
      }
  
      height = canvas.height =
        imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
      width = canvas.width =
        imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
  
      context.drawImage(imgEl, 0, 0);
  
      try {
        data = context.getImageData(0, 0, width, height);
      } catch (e) {
        return defaultRGB;
      }
  
      length = data.data.length;
  
      while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
      }
  
      // ~~ used to floor values
      rgb.r = ~~(rgb.r / count);
      rgb.g = ~~(rgb.g / count);
      rgb.b = ~~(rgb.b / count);
      resolve(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)
    };
  })
  
}
