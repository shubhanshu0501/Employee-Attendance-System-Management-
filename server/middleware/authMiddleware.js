const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication token is required"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid authentication token"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.employeeId = decoded.employeeId;
        req.role = decoded.role || "employee";

        next();

    } catch (error) {
        console.error("Token verification error:", error);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

module.exports = verifyToken;