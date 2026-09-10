import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getAppCheck } from "firebase-admin/app-check";

const usandoEmulador = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

function crearApp() {
  if (usandoEmulador) {
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  const credencial = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!credencial) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY no está configurada en el entorno."
    );
  }
  return initializeApp({ credential: cert(JSON.parse(credencial)) });
}

const app = getApps().length ? getApps()[0] : crearApp();

export const dbAdmin = getFirestore(app);
export const authAdmin = getAuth(app);
export const appCheckAdmin = getAppCheck(app);
export { usandoEmulador };
