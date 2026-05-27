const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "fullName is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "age is required"],
      min: [1, "age must be greater than 0"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGODB_URI;

app.use(express.json());

const sendResponse = (res, statusCode, status, message, data = null) => {
  res.status(statusCode).json({
    status,
    message,
    data,
  });
};

const formatValidationError = (error) => {
  if (error.name === "ValidationError") {
    return Object.values(error.errors).map((item) => item.message).join(", ");
  }

  if (error.name === "CastError") {
    return "Invalid user id";
  }

  if (error.code === 11000) {
    return "Email already exists";
  }

  return error.message || "Internal server error";
};

app.get("/", (req, res) => {
  return sendResponse(res, 200, "success", "API is running", {
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.post("/api/users", async (req, res) => {
  try {
    const user = await User.create(req.body);

    return sendResponse(res, 201, "success", "User created successfully", user);
  } catch (error) {
    return sendResponse(res, 400, "error", formatValidationError(error), null);
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return sendResponse(res, 200, "success", "Users fetched successfully", users);
  } catch (error) {
    return sendResponse(res, 500, "error", formatValidationError(error), null);
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!user) {
      return sendResponse(res, 404, "error", "User not found", null);
    }

    return sendResponse(res, 200, "success", "User updated successfully", user);
  } catch (error) {
    return sendResponse(res, 400, "error", formatValidationError(error), null);
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return sendResponse(res, 404, "error", "User not found", null);
    }

    return sendResponse(res, 200, "success", "User deleted successfully", user);
  } catch (error) {
    const statusCode = error.name === "CastError" ? 400 : 500;
    return sendResponse(res, statusCode, "error", formatValidationError(error), null);
  }
});

if (!mongoUri) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Connection Error:", error);
    process.exit(1);
  });
