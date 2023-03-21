const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.header('auth-token');
    if(!token) return res.status(401).json({ error : "Acceso denegado" });

    try {
        const payload = jwt.verify(token, process.env.ACCESSTOKEN_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(400).json({ error : "Token invalido" });
    }
};

module.exports = verifyToken;