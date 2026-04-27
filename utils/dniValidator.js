function dniValidator(filenameStr) {

  const regex = /^nominas\d*[_-](\d{8})([A-Z])\.pdf$/i;
  const match = filenameStr.match(regex);

  if (!match) {
    console.log("❌ Formato inválido:", filenameStr);
    return false;
  }

  const numero = parseInt(match[1], 10);
  const letra = match[2].toUpperCase();

  const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
  const letraCorrecta = letras[numero % 23];

  if (letra !== letraCorrecta) {
    console.log("❌ DNI inválido:", filenameStr);
    return false;
  }

  console.log("✅ Archivo válido:", filenameStr);
  return true;
}

module.exports = dniValidator;
