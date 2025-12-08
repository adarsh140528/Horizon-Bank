// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/* -----------------------------------------------------
   WebAuthn Credential Schema
----------------------------------------------------- */
const credentialSchema = new mongoose.Schema({
  credentialID: { type: String, required: true },      // base64url string
  publicKey: { type: String, required: false },         // stored clientDataJSON/attestationObject
  counter: { type: Number, default: 0 },
});

/* -----------------------------------------------------
   User Schema
----------------------------------------------------- */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    accountNumber: {
      type: String,
      unique: true,
    },

    status: {
      type: String,
      default: "active",
    },

    beneficiaries: [
      {
        name: String,
        accountNumber: String,
      },
    ],

    /* -------------------------------------------------
       WebAuthn Fields
    ------------------------------------------------- */
    webauthnChallenge: { type: String },  // challenge stored temporarily

    webauthnCredentials: {
      type: [credentialSchema],
      default: [],
    },

    webauthnEnabled: {
      type: Boolean,
      default: false,
    },

    /* -------------------------------------------------
       Banking Fields
    ------------------------------------------------- */
    balance: {
      type: Number,
      default: 0,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

/* -----------------------------------------------------
   Password Hashing
----------------------------------------------------- */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

/* -----------------------------------------------------
   Compare Password
----------------------------------------------------- */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
