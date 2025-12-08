// frontend/src/utils/webauthn.js
import api from "../services/api";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

/* ----------------------------
    Helper for Base64URL
----------------------------- */
function bufferToBase64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/* ============================================================
   1️⃣  REGISTER BIOMETRIC (FaceID / Fingerprint)
   Called from Profile → enableBiometrics()
============================================================= */
export async function registerBiometric(userId) {
  try {
    // STEP 1 — Get registration challenge from backend
    const options = await api.post("/webauthn/register/options", { userId });

    // STEP 2 — Browser generates credential
    const attestation = await startRegistration(options.data);

    // STEP 3 — Send result back to backend to verify
    const verification = await api.post(
      "/webauthn/register/verify",
      attestation
    );

    return verification.data; // { success: true }
  } catch (err) {
    console.error("Biometric registration failed:", err);
    throw err;
  }
}

/* ============================================================
   2️⃣  BIOMETRIC LOGIN
   Called from Login.jsx → handleBiometricLogin()
============================================================= */
export async function biometricLogin() {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("User ID missing");

    // STEP 1 — Ask backend for login challenge + allowed credentials
    const options = await api.post("/webauthn/login/options", { userId });

    // STEP 2 — Browser authenticates via biometric
    const authResult = await startAuthentication(options.data);

    // STEP 3 — Verify with backend
    const verify = await api.post("/webauthn/login/verify", authResult);

    return verify.data; // expected { success: true, user }
  } catch (err) {
    console.error("Biometric login failed:", err);
    return { success: false };
  }
}
