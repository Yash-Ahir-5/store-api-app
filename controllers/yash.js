const sequelize = require("../utiles/database");
const { QueryTypes } = require("sequelize");
const Joi = require("joi");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../helper/SecurePassword");

const welcome = (req, res) => {
  res.send("hello");
};

const addUser = async (req, res) => {
  const removePPicIfErr = () => {
    fs.unlink(`./public/assets/${req.file?.filename}`, (err, succ) => {
      if (err) {
        console.log("Error" + err.message);
      }
    });
  };
  console.log(req.body);
  console.log(req.file.filename);

  try {
    const { firstname, lastname, email, password, gender, hobbies, userRole } =
      req.body;

    const profile_pic = req.file.filename;
    // const profile_pic = "Static";

    console.log(firstname + profile_pic);

    if (!firstname) {
      return res.status(400).json({ error: "Firstname cannot be empty" });
    }

    if (!lastname) {
      return res.status(400).json({ error: "Lastname cannot be empty" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email cannot be empty" });
    }

    if (!email.endsWith("@gmail.com" || "@email.com" || "@yahoo.com")) {
      return res
        .status(550)
        .json({ Error: "User Unknown - Email must be from example.com" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password cannot be empty" });
    }

    if (!gender) {
      return res.status(400).json({ error: "Gender cannot be empty" });
    }

    if (!hobbies || hobbies.length === 0) {
      return res.status(400).json({ error: "Hobbies cannot be empty" });
    }

    // if (!userRole) {
    //   return res.status(400).json({ error: "UserRole cannot be empty" });
    // }

    if (!profile_pic) {
      return res.status(400).json({ error: "Profile picture cannot be empty" });
    }

    const checkEmail = await sequelize.query(
      "select * from users where email = ?",
      {
        type: QueryTypes.SELECT,
        replacements: [email],
      }
    );

    if (checkEmail.length != 0) {
      removePPicIfErr();
      //
      return res.status(409).json({ error: "Email already exist" });
    }

    //One Admin only
    if (userRole == 1) {
      const [adminUser] = await sequelize.query(
        `select email from users where userRole = 1`,
        {
          type: QueryTypes.SELECT,
        }
      );

      if (adminUser) {
        console.log(adminUser);
        return res.status(409).json({ error: "Admin already exist" });
      }
    }

    console.log(__dirname + "public/assets" + `/${profile_pic}`);

    //insertData
    const securePassword = await hashPassword(password);
    const userCreated = await sequelize.query(
      "INSERT INTO `users` (`firstname`, `lastname`, `email`, `password`, `gender`, `hobbies`, `userRole`, `profile_pic`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      {
        type: QueryTypes.INSERT,
        replacements: [
          firstname,
          lastname,
          email,
          securePassword,
          gender,
          hobbies,
          userRole || "2",
          profile_pic,
        ],
      }
    );

    if (userCreated == undefined) {
      res.status(400).json({ error: "Error while creating the user" });
    }
    res
      .status(200)
      .json({ success: true, message: "User registered successfully" });
  } catch (err) {
    removePPicIfErr();
    res.status(500).json({ error: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email cannot be empty" });
    }
    if (!email.endsWith("@gmail.com" || "@email.com" || "@yahoo.com")) {
      return res
        .status(550)
        .json({ Error: "User Unknown - Email must be from example.com" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password cannot be empty" });
    }

    const [checkUser] = await sequelize.query(
      "select * from users where email = ?",
      {
        type: QueryTypes.SELECT,
        replacements: [email],
      }
    );

    if (checkUser == undefined) {
      return res.status(404).json({ error: "Email does not exist" });
    }

    const comparePass = await comparePassword(password, checkUser.password);

    if (!comparePass) {
      return res.status(404).json({ error: "Enter the correct credentails" });
    }

    jwt.sign(
      checkUser,
      process.env.SECUREKEY,
      { expiresIn: "1h" },
      (err, authToken) => {
        if (err) {
          return res.status(404).json({ error: "Token error" });
        }

        res
          .status(200)
          .json({ status: "success", id: checkUser.id, authToken });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  welcome,
  addUser,
  loginUser,
};