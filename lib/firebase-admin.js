import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const apps = getApps();

if (!apps.length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const formattedKey = privateKey
    ? privateKey.replace(/\\n/g, "\n").replace(/\n/g, "\n")
    : undefined;

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: formattedKey,
    }),
  });
}

const db = getFirestore();

export { db };
