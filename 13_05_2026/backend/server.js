const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.disable("x-powered-by");

const parseOrigins = (raw) => {
  if (!raw) return null;
  const origins = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return origins.length ? origins : null;
};

const allowedOrigins = parseOrigins(process.env.CORS_ORIGIN);

app.use(
  cors(
    allowedOrigins
      ? {
          origin(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error("Not allowed by CORS"));
          },
        }
      : undefined
  )
);
app.use(express.json());

const USER_NAME_MIN_LEN = 2;
const AGE_MIN = 0;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: USER_NAME_MIN_LEN,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: AGE_MIN,
    },
    email: {
      type: String,
      required: true,
      match: EMAIL_REGEX,
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

const toInt = (value, fallback) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? fallback : num;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeUserPayload = (payload) => {
  const normalized = {};

  if (typeof payload.name === "string") {
    normalized.name = payload.name.trim();
  }

  if (payload.age !== undefined && payload.age !== null && payload.age !== "") {
    const ageNum = Number(payload.age);
    if (Number.isInteger(ageNum) && ageNum >= AGE_MIN) {
      normalized.age = ageNum;
    }
  }

  if (typeof payload.email === "string") {
    normalized.email = payload.email.trim();
  }

  if (typeof payload.address === "string") {
    normalized.address = payload.address.trim();
  }

  return normalized;
};

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "user-api",
  });
});

app.get("/health", (req, res) => {
  const isDbUp = mongoose.connection.readyState === 1;
  res.status(isDbUp ? 200 : 503).json({
    ok: isDbUp,
    mongo: isDbUp ? "connected" : "disconnected",
  });
});

app.get("/api/users", async (req, res) => {
  try {
    const rawPage = toInt(req.query.page, 1);
    const rawLimit = toInt(req.query.limit, 5);

    const page = clamp(rawPage, 1, 1000000);
    const limit = clamp(rawLimit, 1, 100);

    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filters = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filters.$or = [
        { name: { $regex: regex } } ,
        { email: { $regex: regex } },
        { address: { $regex: regex } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      User.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filters),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({
      page,
      limit,
      total,
      totalPages,
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching users.",
      error: error.message,
    });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const normalized = normalizeUserPayload(req.body || {});
    const user = await User.create(normalized);

    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error.",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Server error while creating user.",
      error: error.message,
    });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const normalized = normalizeUserPayload(req.body || {});

    if (Object.keys(normalized).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update.",
      });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, normalized, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid data for update.",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Server error while updating user.",
      error: error.message,
    });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const deleted = await User.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting user.",
      error: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || "";

const startServer = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGODB_URI is not set.");
    }

    await mongoose.connect(MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
