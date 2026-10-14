
const express = require("express");
const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/v1/emp/employees
// Return only employees owned by the authenticated user.
router.get("/employees", authenticateToken, async (req, res) => {
  try {
    const employees = await Employee.find({
      owner: req.user.userId
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Employees retrieved successfully",
      employees
    });
  } catch (error) {
    console.error("Get employees error:", error.message);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

// GET /api/v1/emp/employees/:eid
router.get("/employees/:eid", authenticateToken, async (req, res) => {
  try {
    const { eid } = req.params;

    if (!mongoose.isValidObjectId(eid)) {
      return res.status(400).json({
        message: "Invalid employee ID"
      });
    }

    const employee = await Employee.findOne({
      _id: eid,
      owner: req.user.userId
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    return res.status(200).json({
      message: "Employee retrieved successfully",
      employee
    });
  } catch (error) {
    console.error("Get employee error:", error.message);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

// POST /api/v1/emp/employees
router.post("/employees", authenticateToken, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      gender,
      designation,
      department,
      salary
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !gender ||
      !designation ||
      !department ||
      salary === undefined ||
      salary === null ||
      salary === ""
    ) {
      return res.status(400).json({
        message: "All employee fields are required"
      });
    }

    if (
      typeof email !== "string" ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address"
      });
    }

    const normalizedGender =
      typeof gender === "string"
        ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
        : "";

    if (!["Male", "Female", "Other"].includes(normalizedGender)) {
      return res.status(400).json({
        message: "Gender must be Male, Female, or Other"
      });
    }

    const numericSalary = Number(salary);

    if (!Number.isFinite(numericSalary) || numericSalary < 0) {
      return res.status(400).json({
        message: "Salary must be a non-negative number"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Employee email is globally unique in the current schema.
    const existingEmployee = await Employee.findOne({
      email: normalizedEmail
    });

    if (existingEmployee) {
      return res.status(409).json({
        message: "An employee with this email already exists"
      });
    }

    const employee = await Employee.create({
      first_name,
      last_name,
      email: normalizedEmail,
      gender: normalizedGender,
      designation,
      department,
      salary: numericSalary,
      owner: req.user.userId
    });

    return res.status(201).json({
      message: "Employee created successfully",
      employee
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An employee with this email already exists"
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: error.message
      });
    }

    console.error("Create employee error:", error.message);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

// PUT /api/v1/emp/employees/:eid
router.put("/employees/:eid", authenticateToken, async (req, res) => {
  try {
    const { eid } = req.params;

    if (!mongoose.isValidObjectId(eid)) {
      return res.status(400).json({
        message: "Invalid employee ID"
      });
    }

    const allowedFields = [
      "first_name",
      "last_name",
      "email",
      "gender",
      "designation",
      "department",
      "salary"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "At least one valid employee field is required"
      });
    }

    if (updates.email !== undefined) {
      if (
        typeof updates.email !== "string" ||
        !EMAIL_REGEX.test(updates.email.trim())
      ) {
        return res.status(400).json({
          message: "Please provide a valid email address"
        });
      }

      updates.email = updates.email.trim().toLowerCase();

      const existingEmployee = await Employee.findOne({
        email: updates.email,
        _id: { $ne: eid }
      });

      if (existingEmployee) {
        return res.status(409).json({
          message: "An employee with this email already exists"
        });
      }
    }

    if (updates.gender !== undefined) {
      if (typeof updates.gender !== "string") {
        return res.status(400).json({
          message: "Gender must be Male, Female, or Other"
        });
      }

      updates.gender =
        updates.gender.charAt(0).toUpperCase() +
        updates.gender.slice(1).toLowerCase();

      if (!["Male", "Female", "Other"].includes(updates.gender)) {
        return res.status(400).json({
          message: "Gender must be Male, Female, or Other"
        });
      }
    }

    if (updates.salary !== undefined) {
      const salary = Number(updates.salary);

      if (
        updates.salary === "" ||
        !Number.isFinite(salary) ||
        salary < 0
      ) {
        return res.status(400).json({
          message: "Salary must be a non-negative number"
        });
      }

      updates.salary = salary;
    }

    // Only update an employee owned by this user.
    const employee = await Employee.findOneAndUpdate(
      {
        _id: eid,
        owner: req.user.userId
      },
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    return res.status(200).json({
      message: "Employee updated successfully",
      employee
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An employee with this email already exists"
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: error.message
      });
    }

    console.error("Update employee error:", error.message);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

// DELETE /api/v1/emp/employees?eid=xxx
router.delete("/employees", authenticateToken, async (req, res) => {
  try {
    const { eid } = req.query;

    if (!eid) {
      return res.status(400).json({
        message: "Employee ID (eid) is required"
      });
    }

    if (!mongoose.isValidObjectId(eid)) {
      return res.status(400).json({
        message: "Invalid employee ID"
      });
    }

    // Only delete an employee owned by this user.
    const employee = await Employee.findOneAndDelete({
      _id: eid,
      owner: req.user.userId
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    return res.status(200).json({
      message: "Employee deleted successfully",
      employee
    });
  } catch (error) {
    console.error("Delete employee error:", error.message);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

module.exports = router;
