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

// APPLY FOR LEAVE
router.post("/apply", verifyToken, async (req, res) => {
    try {
        if (!checkDbReady(res)) return;

        const employeeId = req.employeeId;
        const { leaveType, startDate, endDate, reason } = req.body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({
                message: "All leave fields are required"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        if (end < start) {
            return res.status(400).json({
                message: "End date cannot be before start date"
            });
        }

        const days =
            Math.floor(
                (end - start) / (1000 * 60 * 60 * 24)
            ) + 1;

        const overlappingLeave = await db
            .collection("leaves")
            .findOne({
                employeeId: employeeId,
                status: { $in: ["Pending", "Approved"] },
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            });

        if (overlappingLeave) {
            return res.status(409).json({
                message: "Leave already exists for selected dates"
            });
        }

        const leave = {
            employeeId: employeeId,
            leaveType: leaveType,
            startDate: startDate,
            endDate: endDate,
            days: days,
            reason: reason,
            status: "Pending",
            createdAt: new Date()
        };

        await db.collection("leaves").insertOne(leave);

        res.status(201).json({
            message: "Leave application submitted",
            leave: leave
        });

    } catch (error) {
        console.error("Apply leave error:", error);

        res.status(500).json({
            message: error.message || "Leave application failed due to a server error."
        });
    }
});


// GET MY LEAVES
router.get("/my", verifyToken, async (req, res) => {
    try {
        if (!checkDbReady(res)) return;

        const employeeId = req.employeeId;

        const leaves = await db
            .collection("leaves")
            .find({
                employeeId: employeeId
            })
            .sort({
                createdAt: -1
            })
            .toArray();

        res.json({
            leaves: leaves
        });

    } catch (error) {
        console.error("Get leaves error:", error);

        res.status(500).json({
            message: error.message || "Failed to fetch leave applications."
        });
    }
});


// CANCEL PENDING LEAVE
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        if (!checkDbReady(res)) return;

        const { ObjectId } = require("mongodb");

        const leave = await db
            .collection("leaves")
            .findOne({
                _id: new ObjectId(req.params.id),
                employeeId: req.employeeId,
                status: "Pending"
            });

        if (!leave) {
            return res.status(404).json({
                message: "Pending leave not found"
            });
        }

        await db.collection("leaves").deleteOne({
            _id: leave._id
        });

        res.json({
            message: "Leave cancelled successfully"
        });

    } catch (error) {
        console.error("Cancel leave error:", error);

        res.status(500).json({
            message: error.message || "Leave cancellation failed due to a server error."
        });
    }
});


module.exports = {
    router,
    setDatabase
};