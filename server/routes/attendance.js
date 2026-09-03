const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

let db;

function setDatabase(database) {
    db = database;
}

function checkDbReady(res) {
    if (!db) {
        res.status(503).json({
            message: "Database connection is not ready. Please try again in a moment."
        });
        return false;
    }
    return true;
}

// CHECK IN
router.post("/checkin", verifyToken, async (req, res) => {
    try {
        if (!checkDbReady(res)) return;

        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                message: "Employee ID is required"
            });
        }

        const today = new Date();
        const date = today.toISOString().split("T")[0];

        // Check if employee already checked in today
        const existingAttendance = await db
            .collection("attendance")
            .findOne({
                employeeId: employeeId,
                date: date
            });

        if (existingAttendance) {
            return res.status(409).json({
                message: "Already checked in today"
            });
        }

        const attendance = {
            employeeId: employeeId,
            date: date,
            checkIn: today,
            checkOut: null,
            status: "Present"
        };

        await db.collection("attendance").insertOne(attendance);

        res.status(201).json({
            message: "Check-in successful",
            attendance: attendance
        });

    } catch (error) {
        console.error("Check-in error:", error);

        res.status(500).json({
            message: error.message || "Check-in failed due to a server error."
        });
    }
});

// GET TODAY'S ATTENDANCE
router.get("/today/:employeeId", verifyToken, async (req, res) => {
    try {
        if (!checkDbReady(res)) return;

        const { employeeId } = req.params;

        const today = new Date();
        const date = today.toISOString().split("T")[0];

        const attendance = await db
            .collection("attendance")
            .findOne({
                employeeId: employeeId,
                date: date
            });

        if (!attendance) {
            return res.json({
                attendance: null
            });
        }

        res.json({
            attendance: attendance
        });

    } catch (error) {
        console.error("Get attendance error:", error);

        res.status(500).json({
            message: error.message || "Failed to fetch today's attendance."
        });
    }
});

// CHECK OUT
router.put("/checkout", verifyToken, async (req, res) => {
    try {
        if (!checkDbReady(res)) return;

        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                message: "Employee ID is required"
            });
        }

        const today = new Date();
        const date = today.toISOString().split("T")[0];

        const attendance = await db
            .collection("attendance")
            .findOne({
                employeeId: employeeId,
                date: date
            });

        if (!attendance) {
            return res.status(404).json({
                message: "Please check in first"
            });
        }

        if (attendance.checkOut) {
            return res.status(409).json({
                message: "Already checked out today"
            });
        }

        await db.collection("attendance").updateOne(
            {
                _id: attendance._id
            },
            {
                $set: {
                    checkOut: today
                }
            }
        );

        res.json({
            message: "Check-out successful",
            attendance: {
                ...attendance,
                checkOut: today
            }
        });

    } catch (error) {
        console.error("Check-out error:", error);

        res.status(500).json({
            message: error.message || "Check-out failed due to a server error."
        });
    }
});

// GET ATTENDANCE HISTORY
router.get("/history/:employeeId", verifyToken, async (req, res) => {
    try {
        if (!checkDbReady(res)) return;

        const { employeeId } = req.params;

        const attendance = await db
            .collection("attendance")
            .find({
                employeeId: employeeId
            })
            .sort({
                date: -1
            })
            .toArray();

        res.json({
            attendance: attendance
        });

    } catch (error) {
        console.error("Get history error:", error);

        res.status(500).json({
            message: error.message || "Failed to fetch attendance history."
        });
    }
});

module.exports = {
    router,
    setDatabase
};