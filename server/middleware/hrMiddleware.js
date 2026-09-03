function verifyHR(req, res, next) {

    if (req.role !== "hr") {
        return res.status(403).json({
            message: "HR access required"
        });
    }

    next();
}

module.exports = verifyHR;