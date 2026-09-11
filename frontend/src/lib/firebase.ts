import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  type AppCheck,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Por defecto usa emuladores locales; poner NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false
// para que este mismo frontend (corriendo local con `next dev`) consuma Firebase real.
const usarEmuladores =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS !== "false";

declare global {
  var __pista8EmuladoresConectados: boolean | undefined;
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined;
}

let auth: Auth;
let db: Firestore;
let appCheck: AppCheck | null = null;

// Firebase Auth exige un apiKey válido al inicializar: se restringe al
// navegador para no romper el prerenderizado de Next.js en el servidor.
if (typeof window !== "undefined") {
  const firebaseApp: FirebaseApp = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);

  if (usarEmuladores && !globalThis.__pista8EmuladoresConectados) {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "localhost", 8085);
    globalThis.__pista8EmuladoresConectados = true;
  }

  const appCheckSiteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
  if (!usarEmuladores && appCheckSiteKey) {
    if (process.env.NODE_ENV === "development") {
      // Permite probar App Check desde localhost contra el backend real.
      // Con NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN fijo, cualquier
      // navegador local usa el mismo token ya registrado en Firebase
      // (evita tener que registrar uno nuevo por cada navegador/perfil).
      globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN =
        process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN ?? true;
    }
    appCheck = initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }
} else {
  auth = {} as Auth;
  db = {} as Firestore;
}

export { auth, db, appCheck };
