const letrasControl = "TRWAGMYFPDXBNJZSQVHLCKE";

const dniRegex = /^[0-9]{8}[A-Z]$/i; // NIF: 8 números + 1 letra control
const nieRegex = /^[X-Z][0-9]{7}[A-Z]$/i; // NIE: 1 letra + 7 números + 1 letra control

const nieLetras = "XYZ";

/**
 * Comprueba si la cadena dada es un DNI válido.
 * @param {string} dni El DNI a comprobar.
 * @returns {boolean} Si el DNI es válido.
 */
const esDniValido = (dni) => {
	if (!dniRegex.test(dni)) {
		return false;
	}

	const numero = parseInt(dni.substring(0, 8));
	const letra = dni.charAt(8).toUpperCase();

	const resto = numero % letrasControl.length;
	return letrasControl.charAt(resto) === letra;
}

// https://www.interior.gob.es/opencms/es/servicios-al-ciudadano/tramites-y-gestiones/dni/calculo-del-digito-de-control-del-nif-nie/#:~:text=Por%20ejemplo%2C%20si%20el%20n%C3%BAmero,n%C3%BAmeros%20y%20d%C3%ADgito%20de%20control.
/**
 * Comprueba si la cadena dada es un NIE válido.
 * @param {string} nie El NIE a comprobar.
 * @returns {boolean} Si el NIE es válido
 */
const esNieValido = (nie) => {
	if (!nieRegex.test(nie)) {
		return false;
	}

	// Para verificar el NIE, se reemplaza la primera letra por un número (X -> 0, Y -> 1, Z -> 2)
	// y luego se verifica como si fuera un DNI

	const numeroPrimero = nieLetras.indexOf(nie.charAt(0).toUpperCase());
	const numero = numeroPrimero * 10_000_000 + parseInt(nie.substring(1, 8));
	const letra = nie.charAt(8).toUpperCase();

	const resto = numero % letrasControl.length;
	return letrasControl.charAt(resto) === letra;
}

module.exports = {
	esDniValido,
	esNieValido,
}