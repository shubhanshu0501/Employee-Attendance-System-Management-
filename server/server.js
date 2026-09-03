require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const auth = require("./routes/auth");
const attendance = require("./routes/attendance");
const leave = require("./routes/leave");
const hr = require("./routes/hr");

const app = express();

// Configure CORS for local development ports and cross-origin production requests
app.use(cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/api/auth", auth.router);
app.use("/api/attendance", attendance.router);
app.use("/api/leave", leave.router);
app.use("/api/hr", hr.router);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Employee Attendance API is running");
});

let clientInstance = null;
let isConnecting = false;

async function connectMongoDBWithRetry() {
    if (isConnecting) return;
    isConnecting = true;

    const rawMongoUri = process.env.MONGO_URI;

    if (!rawMongoUri) {
        console.error("CRITICAL ERROR: MONGO_URI environment variable is not defined");
        isConnecting = false;
        return;
    }

    // Clean leading/trailing quotes or spaces from environment variable string
    const mongoUri = rawMongoUri.trim().replace(/^["']|["']$/g, '');

    try {
        console.log("Connecting to MongoDB Atlas...");

        clientInstance = new MongoClient(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });

        await clientInstance.connect();

        const db = clientInstance.db("EmployeeAttendance");

        // Ensure unique index for employee attendance per date
        await db.collection("attendance").createIndex(
            {
                employeeId: 1,
                date: 1
            },
            {
                unique: true
            }
        );

        // Inject database instance to all route modules
        auth.setDatabase(db);
        attendance.setDatabase(db);
        leave.setDatabase(db);
        hr.setDatabase(db);

        console.log("MongoDB connected successfully!");
        isConnecting = false;

    } catch (error) {
        isConnecting = false;
        console.error("MongoDB connection failed:");
        if (error && error.message) {
            const sanitizedMsg = error.message.replace(/mongodb(\+srv)?:\/\/[^@]+@/g, "mongodb+srv://*****:*****@");
            console.error(sanitizedMsg);
        } else {
            console.error(error);
        }

        console.log("Scheduling MongoDB reconnection attempt in 5 seconds...");
        setTimeout(() => {
            connectMongoDBWithRetry();
        }, 5000);
    }
}

async function startServer() {
    await connectMongoDBWithRetry();

    // Listen on Render dynamic PORT on all network interfaces (0.0.0.0)
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();