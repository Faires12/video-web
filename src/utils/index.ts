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
    const data = new Date(v)
    const dataFormatada = `${data.getDate() <= 9 ? "0" : ""}${data.getDate()} ${
      meses[data.getMonth()]
    }, ${data.getFullYear()}`;
    return dataFormatada;
  }
}
