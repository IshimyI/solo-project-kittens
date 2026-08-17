const jwt = require("jsonwebtoken");

function verifyAccessToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return res.sendStatus(401);

  try {
    const { user } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = user.id;
    next();
  } catch (error) {
    res.sendStatus(401);
  }
}

module.exports = verifyAccessToken;
