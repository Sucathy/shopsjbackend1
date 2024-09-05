const jwt = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
  const token = req.headers["authorization"];

  if (token) {
    jwt.verify(token, "your-secret-key", (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.user = decoded;
      next();
    });
  } else {
    res.redirect("/login");
  }
}

module.exports = isAuthenticated;
