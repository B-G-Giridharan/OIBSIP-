const express = require("express");
const bcrypt = require("bcryptjs");
const { getDb } = require("../db/database");
const { COOKIE_NAME, signUserToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  };
}

router.post("/login", (req, res) => {
  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const user = getDb()
    .prepare("SELECT id, username, password_hash FROM users WHERE username = ?")
    .get(username);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({
      message: "Access denied. Invalid username or password.",
    });
  }

  const token = signUserToken(user);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  return res.json({
    message: "Login successful.",
    user: { id: user.id, username: user.username },
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ message: "Logged out successfully." });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
