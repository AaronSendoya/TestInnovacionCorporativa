const admin = require("firebase-admin");

admin.initializeApp();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: node setAdminClaim.js <email>");
    process.exit(1);
  }

  const usuario = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(usuario.uid, {admin: true});
  console.log(
    `Custom claim admin=true asignado a ${email} (uid: ${usuario.uid}).`,
  );
}

main().catch((error) => {
  console.error("Error al asignar el custom claim:", error);
  process.exit(1);
});
