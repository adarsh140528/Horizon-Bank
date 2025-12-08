// backend/routes/webauthnRoutes.js
import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* -------------------------------------------------------
   STEP 1: REGISTRATION OPTIONS (BEGIN PASSKEY SETUP)
------------------------------------------------------- */
router.post("/register", async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const challenge = crypto.randomBytes(32).toString("base64url");

  // Save challenge for validation
  user.webauthnChallenge = challenge;
  await user.save();

  res.json({
    challenge,
    rp: {
      name: "Horizon Bank",
      id: "localhost",
    },
    user: {
      id: user._id.toString(),
      name: user.email,
      displayName: user.name,
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 },     // ES256
      { type: "public-key", alg: -257 },   // RS256
    ],
    authenticatorSelection: {
      userVerification: "preferred",
    },
    attestation: "none",
    timeout: 60000,
  });
});

/* -------------------------------------------------------
   STEP 2: VERIFY REGISTRATION (SAVE PASSKEY)
------------------------------------------------------- */
router.post("/verify-register", async (req, res) => {
  const { userId, credential } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!credential?.id) {
    return res.status(400).json({ message: "Invalid credential" });
  }

  // Save credential for later login
  user.webauthnCredentials.push({
    credentialID: credential.id,
    publicKey:
      credential.response?.attestationObject ||
      credential.response?.authenticatorData ||
      "",
    counter: 0,
  });

  user.webauthnEnabled = true;
  await user.save();

  res.json({ success: true });
});

/* -------------------------------------------------------
   STEP 3: LOGIN OPTIONS (BEGIN AUTHENTICATION)
------------------------------------------------------- */
router.post("/login/options", async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user || !user.webauthnCredentials.length) {
    return res.status(400).json({ message: "Biometric login not enabled" });
  }

  const challenge = crypto.randomBytes(32).toString("base64url");

  user.webauthnChallenge = challenge;
  await user.save();

  res.json({
    challenge,
    rpId: "localhost",
    allowCredentials: user.webauthnCredentials.map((cred) => ({
      id: cred.credentialID,
      type: "public-key",
      transports: ["internal"],
    })),
    userVerification: "preferred",
    timeout: 60000,
  });
});

/* -------------------------------------------------------
   STEP 4: VERIFY LOGIN RESULT (RETURN FULL USER + JWT)
------------------------------------------------------- */
router.post("/login/verify", async (req, res) => {
  const { userId, credential } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!credential?.id) {
    return res.status(400).json({ message: "Invalid login credential" });
  }

  // SKIPPING REAL SIGNATURE CHECK FOR NOW — DEMO MODE

  // Create REAL JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Return full user so dashboard loads balance + account
  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      accountNumber: user.accountNumber,
      balance: user.balance,
      role: user.role,
      token,
    },
  });
});

export default router;
