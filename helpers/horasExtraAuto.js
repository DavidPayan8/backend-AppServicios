const { Op } = require('sequelize');

// "2026-04-17 14:30:00" o Date object → 870 (minutos desde medianoche)
function stringToMinutos(timeString) {
  if (!timeString) return 0;

  let timePart;

  // Si es Date object de Sequelize
  if (timeString instanceof Date) {
    timePart = timeString.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } else if (typeof timeString === 'string') {
    // Si es string, extrae la parte de hora
    timePart = timeString.split(' ')[1] || timeString;
  } else {
    return 0; // Tipo desconocido
  }

  const [h, m] = timePart.split(':').map(Number);
  return h * 60 + m;
}

// 870 → "14:30"
function minutosAHHmm(totalMinutos) {
  totalMinutos = Math.round(totalMinutos);
  const h = Math.floor(totalMinutos / 60) % 24;
  const m = totalMinutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Suma todos los intervalos cerrados del día
function calcularMinutosTrabajados(partes) {
  let total = 0;
  for (const p of partes) {
    if (!p.hora_entrada || !p.hora_salida) continue;
    const ini = stringToMinutos(p.hora_entrada);
    let fin = stringToMinutos(p.hora_salida);
    if (fin < ini) fin += 24 * 60; // cruce medianoche
    total += (fin - ini);
  }
  return total;
}

// Minuto desde medianoche en que se completó la jornada (para horaInicio del extra)
// partes: ordenados ASC por hora_entrada, el último ya tiene hora_salida
function calcularHoraInicioExtra(partes, minutosJornada) {
  let acumulado = 0;
  for (let i = 0; i < partes.length - 1; i++) {
    const p = partes[i];
    if (!p.hora_entrada || !p.hora_salida) continue;
    const ini = stringToMinutos(p.hora_entrada);
    let fin = stringToMinutos(p.hora_salida);
    if (fin < ini) fin += 24 * 60;
    acumulado += (fin - ini);
  }
  const ultimo = partes[partes.length - 1];
  const minutosFaltaban = minutosJornada - acumulado;
  const minutosEntradaUltimo = stringToMinutos(ultimo.hora_entrada);
  const resultado = Math.round(minutosEntradaUltimo + minutosFaltaban);
  return minutosAHHmm(resultado);
}

async function calcularYRegistrarHorasExtraAuto({ userId, empresaId, fecha, transaction, db }) {
  // 1. Obtener usuario con categoría y tarifas vigentes
  const usuario = await db.USUARIOS.findOne({
    where: { id: userId },
    attributes: ['id', 'horas_personalizadas'],
    include: [{
      model: db.CATEGORIA_LABORAL,
      as: 'categoriaLaboral',
      required: false,
      include: [{
        model: db.TARIFAS_CATEGORIAS,
        as: 'tarifas',
        where: {
          fecha_inicio: { [Op.lte]: fecha },
          [Op.or]: [{ fecha_fin: null }, { fecha_fin: { [Op.gte]: fecha } }]
        },
        required: false
      }]
    }],
    transaction
  });

  // 2. Resolver horas de jornada
  let minutosJornada = null;
  const hp = usuario?.horas_personalizadas;
  if (hp !== null && hp !== undefined && parseFloat(hp) > 0) {
    minutosJornada = parseFloat(hp) * 60;
  } else if (usuario?.categoriaLaboral?.tarifas?.length > 0) {
    const tarifas = usuario.categoriaLaboral.tarifas;
    const tarifa = tarifas.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))[0];
    if (tarifa && parseFloat(tarifa.horas_jornada) > 0) {
      minutosJornada = parseFloat(tarifa.horas_jornada) * 60;
    }
  }

  if (minutosJornada === null) return { minutosExtra: 0 };

  // 3. Obtener todos los partes cerrados del día (el último ya tiene hora_salida en la transacción)
  const partes = await db.CONTROL_ASISTENCIAS.findAll({
    where: { id_usuario: userId, fecha },
    order: [['hora_entrada', 'ASC']],
    transaction
  });

  const minutosTrabajados = calcularMinutosTrabajados(partes);
  const minutosExtra = minutosTrabajados - minutosJornada;

  // 4. Buscar registro automático existente del día
  const existente = await db.HorasExtra.findOne({
    where: { empleado: userId, fecha, es_automatico: true },
    transaction
  });

  if (minutosExtra <= 0) {
    if (existente) await existente.destroy({ transaction });
    return { minutosExtra: 0 };
  }

  // 5. Calcular horaInicio/horaFin
  const partesConSalida = partes.filter(p => p.hora_entrada && p.hora_salida);
  if (partesConSalida.length === 0) return { minutosExtra: 0 };

  const horaInicio = calcularHoraInicioExtra(partesConSalida, minutosJornada);
  const horaFin = minutosAHHmm(stringToMinutos(partesConSalida[partesConSalida.length - 1].hora_salida));

  // 6. Upsert
  if (existente) {
    existente.horaInicio = horaInicio;
    existente.horaFin = horaFin;
    existente.duracionMinutos = Math.round(minutosExtra);
    existente.descripcion = 'Horas extra calculadas automáticamente al fichar salida';
    await existente.save({ transaction });
  } else {
    await db.HorasExtra.create({
      empleado: userId,
      id_empresa: empresaId,
      fecha,
      horaInicio,
      horaFin,
      duracionMinutos: Math.round(minutosExtra),
      descripcion: 'Horas extra calculadas automáticamente al fichar salida',
      es_automatico: true
    }, { transaction });
  }

  return { minutosExtra: Math.round(minutosExtra), horaInicio, horaFin };
}

module.exports = { calcularYRegistrarHorasExtraAuto };
