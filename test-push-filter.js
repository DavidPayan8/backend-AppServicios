// Script de prueba para verificar el filtrado de notificaciones push
// Ejecutar desde la consola de Node.js o como script independiente

const { Op } = require("sequelize");

// Simulación de datos
const mockBrowsers = [
  { id: 1, id_usuario: 10, endpoint: "endpoint1", isActive: true },
  { id: 2, id_usuario: 20, endpoint: "endpoint2", isActive: true },
  { id: 3, id_usuario: 30, endpoint: "endpoint3", isActive: true },
  { id: 4, id_usuario: 10, endpoint: "endpoint4", isActive: true }, // Mismo usuario, otro browser
  { id: 5, id_usuario: 40, endpoint: "endpoint5", isActive: false }, // Inactivo
];

// Función de prueba
function testWhereClause(userIds) {
  const whereClause = { isActive: true };

  if (userIds) {
    if (Array.isArray(userIds)) {
      whereClause.id_usuario = { [Op.in]: userIds };
    } else {
      whereClause.id_usuario = userIds;
    }
  }

  console.log("\n--- Test Case ---");
  console.log("Input userIds:", userIds);
  console.log("Generated whereClause:", JSON.stringify(whereClause, null, 2));

  // Simular filtrado
  const filtered = mockBrowsers.filter((browser) => {
    if (!whereClause.isActive && !browser.isActive) return false;
    if (whereClause.isActive && !browser.isActive) return false;

    if (whereClause.id_usuario) {
      if (whereClause.id_usuario[Op.in]) {
        return whereClause.id_usuario[Op.in].includes(browser.id_usuario);
      } else {
        return browser.id_usuario === whereClause.id_usuario;
      }
    }

    return true;
  });

  console.log(
    "Filtered browsers:",
    filtered.map((b) => ({ id: b.id, id_usuario: b.id_usuario })),
  );
  console.log("Count:", filtered.length);
}

// Ejecutar pruebas
console.log("=== PRUEBAS DE FILTRADO ===\n");

console.log("1. Usuario único (ID: 10)");
testWhereClause(10);

console.log("\n2. Array de usuarios (IDs: [10, 20])");
testWhereClause([10, 20]);

console.log("\n3. Array de un solo usuario (IDs: [30])");
testWhereClause([30]);

console.log("\n4. null (todos los usuarios activos)");
testWhereClause(null);

console.log("\n5. Array vacío (ningún usuario)");
testWhereClause([]);

console.log("\n=== FIN DE PRUEBAS ===");
