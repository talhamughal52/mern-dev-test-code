const express = require("express");
const router = express.Router();
const multer = require("multer");
const bcrypt = require("bcryptjs");
const emailValidator = require("email-validator");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const { protect } = require("../middlewares/authMiddleware");

const generateToken = require("../utils/generateToken");

const Car = require("../schemas/carSchema");
const User = require("../schemas/userSchema");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(path.join(__dirname, "../uploads/"));
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}.${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All Fields Are Required!");
  }
  if (!emailValidator.validate(email)) {
    res.status(400);
    throw new Error("Invalid Email Address!");
  }
  let user = await User.findOne({ email: email });
  if (!user) {
    res.status(401);
    throw new Error("Invalid Email or Password!");
  }
  const match = await bcrypt.compare(password, user.password);

  if (user.email !== email || !match) {
    res.status(401);
    throw new Error("Invalid Email or Password!");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
    message: "Login Successful!",
  });
});

// @desc    Add a New Car
// @route   POST /api/users/add-car
// @access  Private

const addCar = asyncHandler(async (req, res) => {
  const { model, price, phone, city, maxPictures } = req.body;
  const images = req.files.map((file) => file.path);

  if (!model || !price || !phone || !city || !maxPictures || !images) {
    res.status(400);
    throw new Error("All Fields Are Required!");
  }

  if (model.length < 3) {
    res.status(400);
    throw new Error("Car Model must be minium 3 letters");
  }

  if (isNaN(price)) {
    res.status(400);
    throw new Error("Price Must Be A Number!");
  }

  if (isNaN(phone)) {
    res.status(400);
    throw new Error("Phone Must Be A Number!");
  }

  if (phone.length !== 11) {
    res.status(400);
    throw new Error("Phone Must Be 11 Digits Long!");
  }

  if (images.length < 1 || images.length > maxPictures) {
    res.status(400);
    throw new Error(`Max Pictures Must Be Between 1 and ${maxPictures}!`);
  }

  const car = new Car({
    user: req.user._id,
    model,
    price,
    phone,
    city,
    images,
  });
  const createdCar = await car.save();

  res.status(201).json(createdCar);
});

router.post("/login", authUser);
router.post("/add-car", protect, upload.array("images"), addCar);

module.exports = router;
