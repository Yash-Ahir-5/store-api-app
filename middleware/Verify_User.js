const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const rawToken = req.headers["authorization"]?.split(" ")[1];
  if (rawToken == undefined) {
    return res.status(404).json({ error: "Token not found" });
  }

  jwt.verify(rawToken, process.env.JWT_SECRET, (err, verification) => {
    if (err) {
      return res.status(400).json({ error: "Token not valid" });
    }
    req.obj = verification;
    next();
  });
};

module.exports = {
  verifyToken,
};