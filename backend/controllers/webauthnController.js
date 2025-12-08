import express from "express";
import User from "../models/User.js";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from "@simplewebauthn/server";

const router = express.Router();

const rpID = "localhost";   // 👈 CHANGE IF YOU DEPLOY → yourdomain.com

// -------------- REGISTER: CREATE OPTIONS --------------
router.post("/register/options", async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(400).json({ message: "User not found" });

  const options = generateRegistrationOptions({
    rpName: "Horizon Bank",
    rpID,
    userID: user._id.toString(),
    userName: user.email,
    attestationType: "none",
    authenticatorSelection: { userVerification: "preferred" },

    // Prevent reusing same passkey
    excludeCredentials: user.webauthnCredentials.map((cred) => ({
      id: Buffer.from(cred.credentialID, "base64url"),
      type: "public-key",
    })),
  });

  user.webauthnChallenge = options.challenge;
  await user.save();

  res.json(options);
});

// -------------- REGISTER: VERIFY RESPONSE --------------
router.post("/register/verify", async (req, res) => {
  const { userId, credential } = req.body;

  const user = await User.findById(userId);

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: user.webauthnChallenge,
    expectedOrigin: "http://localhost:5173",
    expectedRPID: rpID,
  });

  if (!verification.verified)
    return res.status(400).json({ message: "Verification failed" });

  const { credentialID, credentialPublicKey, counter } =
    verification.registrationInfo;

  // Save passkey
  user.webauthnCredentials.push({
    credentialID: credentialID.toString("base64url"),
    publicKey: credentialPublicKey.toString("base64url"),
    counter,
  });

  await user.save();

  res.json({ success: true });
});

// -------------- LOGIN: CREATE OPTIONS --------------
router.post("/login/options", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  if (user.webauthnCredentials.length === 0)
    return res.status(400).json({ message: "No passkey registered" });

  const options = generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: user.webauthnCredentials.map((cred) => ({
      id: Buffer.from(cred.credentialID, "base64url"),
      type: "public-key",
    })),
  });

  user.webauthnChallenge = options.challenge;
  await user.save();

  res.json(options);
});

// -------------- LOGIN: VERIFY RESPONSE --------------
router.post("/login/verify", async (req, res) => {
  const { email, credential } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge: user.webauthnChallenge,
    expectedOrigin: "http://localhost:5173",
    expectedRPID: rpID,
    authenticator: {
      credentialID: Buffer.from(user.webauthnCredentials[0].credentialID, "base64url"),
      credentialPublicKey: Buffer.from(user.webauthnCredentials[0].publicKey, "base64url"),
      counter: user.webauthnCredentials[0].counter,
    },
  });

  if (!verification.verified)
    return res.status(400).json({ message: "Authentication failed" });

  user.webauthnCredentials[0].counter =
    verification.authenticationInfo.newCounter;
  await user.save();

  res.json({ success: true, user });
});

export default router;
