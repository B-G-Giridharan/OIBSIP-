const jwt = require("jsonwebtoken");

const COOKIE_NAME = "railreserve_token";

function getJwtSecret() {
  return process.env.JWT_SECRET || "railreserve-local-dev-secret-change-me";
}

function signUserToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    getJwtSecret(),
    { expiresIn: "8h" }
  );
}

function requireAuth(req, res, next) {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  const header = req.headers.authorization || "";
  const bearerToken = header.startsWith("Bearer ") ? header.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = { id: payload.sub, username: payload.username };
    return next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

module.exports = {
  COOKIE_NAME,
  signUserToken,
  requireAuth,
};
