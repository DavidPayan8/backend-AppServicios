/**
 * Test script for Flutter Fichaje API
 * Run with: node test-flutter-fichaje.js
 */

const BASE_URL = "http://localhost:3000/api/flutter-fichaje";

// Helper function to make POST requests
async function testFichar(codigoUsuario, testName) {
  console.log(`\n🧪 Test: ${testName}`);
  console.log(`   Codigo Usuario: ${codigoUsuario}`);

  try {
    const response = await fetch(`${BASE_URL}/fichar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Flutter-API-Key": "8960507a5412b5a3a9419a43d21de43e4190bba54d4664f63bca672f9fc2c1d8",
      },
      body: JSON.stringify({ codigo_usuario: codigoUsuario }),
    });

    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(
      `   Rate Limit - Remaining: ${response.headers.get("X-RateLimit-Remaining")}`,
    );
    console.log(`   Response:`, JSON.stringify(data, null, 2));

    return { status: response.status, data, headers: response.headers };
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return null;
  }
}

// Helper to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("=".repeat(60));
  console.log("🚀 Flutter Fichaje API - Test Suite");
  console.log("=".repeat(60));

  // Test 1: Invalid user
  await testFichar("INVALID_CODE_999", "Usuario inválido (debe retornar 404)");
  await wait(500);

  // Test 2: Missing codigo_usuario
  console.log(`\n🧪 Test: Sin codigo_usuario (debe retornar 400)`);
  try {
    const response = await fetch(`${BASE_URL}/fichar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Flutter-API-Key": "8960507a5412b5a3a9419a43d21de43e4190bba54d4664f63bca672f9fc2c1d8",
      },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
  }
  await wait(500);

  // Test 3 & 4: Valid user - entrada y salida
  // NOTE: You need to replace 'TEST_USER_001' with an actual codigo_usuario from your database
  const validCode = "8260"; // ⚠️ REPLACE WITH REAL CODE

  console.log(`\n⚠️  Para probar con un usuario real, necesitas:`);
  console.log(`   1. Actualizar un usuario en la BD con un codigo_usuario`);
  console.log(`   2. Reemplazar 'TEST_USER_001' en este script con ese código`);
  console.log(`   3. Asegurarte de que el usuario tenga fichaje_activo = true`);

  await testFichar(validCode, "Primera llamada - Entrada (si usuario existe)");
  await wait(1000);

  await testFichar(validCode, "Segunda llamada - Salida (si usuario existe)");
  await wait(1000);

  await testFichar(
    validCode,
    "Tercera llamada - Nueva Entrada (si usuario existe)",
  );

  // Test 5: Rate limiting (commented out as it requires 100+ requests)
  console.log(`\n⚠️  Test de Rate Limiting omitido (requiere 100+ requests)`);
  console.log(
    `   Para probarlo manualmente, ejecuta este endpoint 101 veces en 15 minutos`,
  );

  console.log("\n" + "=".repeat(60));
  console.log("✅ Tests completados");
  console.log("=".repeat(60));
}

// Run tests
runTests().catch(console.error);
