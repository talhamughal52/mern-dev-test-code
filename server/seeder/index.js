const User = require("../schemas/userSchema");
const Car = require("../schemas/carSchema");
const dotenv = require("dotenv");
const connectDb = require("../config/db");
const bcrypt = require("bcryptjs");

dotenv.config();

connectDb();

const importData = async () => {
  try {
    await User.deleteMany();
    await Car.deleteMany();
    await User.create({
      name: "Amjad",
      email: "Amjad@desolint.com",
      email: "Amjad@desolint.com",
      password: bcrypt.hashSync("123456abc", 10),
    });
    console.log("Data created in database");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Car.deleteMany();
    console.log("database destroyed");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
