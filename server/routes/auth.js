const express = require("express"); 
const bcrypt = require("bcrypt"); 
const jwt = require("jsonwebtoken"); 

const router = express.Router(); 

let db; 

function setDatabase(database) { 
    db = database; 
} 

// REGISTER 
router.post("/register", async (req, res) => { 
    try { 
        if (!db) {
            return res.status(503).json({
                message: "Database connection is not ready. Please try again in a moment."
            });
        }

        const { name, email, password } = req.body; 

        if (!name || !email || !password) { 
            return res.status(400).json({ 
                message: "All fields are required" 
            }); 
        } 

        const existingEmployee = await db.collection("employees").findOne({ 
            email: email 
        }); 

        if (existingEmployee) { 
            return res.status(409).json({ 
                message: "Employee already exists" 
            }); 
        } 

        const hashedPassword = await bcrypt.hash(password, 10); 
        console.log("HASHED PASSWORD:", hashedPassword); 

        const newEmployee = { 
            name: name, 
            email: email, 
            password: hashedPassword,
            department: req.body.department || "General", 
            role: "employee",
            createdAt: new Date() 
        }; 

        await db.collection("employees").insertOne(newEmployee); 

        res.status(201).json({ 
            message: "Employee registered successfully", 
            employee: { 
                name: name, 
                email: email 
            } 
        }); 

    } catch (error) { 
        console.error("Registration error:", error); 

        res.status(500).json({ 
            message: error.message || "Registration failed due to a server error." 
        }); 
    } 
}); 

// LOGIN 
router.post("/login", async (req, res) => { 
    try { 
        if (!db) {
            console.error("LOGIN REJECTED: Database instance 'db' is undefined");
            return res.status(503).json({
                message: "Database connection is not ready. Please try again in a moment."
            });
        }

        const { email, password } = req.body; 

        if (!email || !password) { 
            return res.status(400).json({ 
                message: "Email and password are required" 
            }); 
        } 

        const employee = await db.collection("employees").findOne({ 
            email: email 
        }); 

        if (!employee) { 
            return res.status(401).json({ 
                message: "Invalid email or password" 
            }); 
        } 

        const isPasswordCorrect = await bcrypt.compare( 
            password, 
            employee.password 
        ); 

        if (!isPasswordCorrect) { 
            return res.status(401).json({ 
                message: "Invalid email or password" 
            }); 
        } 

        const token = jwt.sign( 
            { 
                employeeId: employee._id,
                role: employee.role || "employee"
            }, 
            process.env.JWT_SECRET || "fallback_secret_2026", 
            { 
                expiresIn: "1d" 
            } 
        ); 

        res.json({ 
            message: "Login successful", 
            token: token, 
            employee: { 
                id: employee._id, 
                name: employee.name, 
                email: employee.email,
                role: employee.role || "employee",
                department: employee.department || "General"
            } 
        }); 

    } catch (error) { 
        console.error("Login error detail:", error); 

        res.status(500).json({ 
            message: "An internal server error occurred during login. Please try again." 
        }); 
    } 
}); 

module.exports = { 
    router, 
    setDatabase 
};