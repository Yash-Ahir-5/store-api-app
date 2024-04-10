const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sequelize = require("../../utils/sequelize");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    // Checking if the user exists
    const getUser = await sequelize.query(
      `SELECT * FROM users WHERE email = :email`,
      {
        replacements: { email },
        type: QueryTypes.SELECT,
      }
    );

    // Checking if the user exists
    if (!getUser.length) {
      return res.status(400).json({ message: "wrong email" });
    }

    // Getting the hashed password from the database
    const hashedPassword = getUser[0].password;

    // Comparing the password
    const validPassword = await bcrypt.compare(password, hashedPassword);

    if (!validPassword) {
      return res.status(400).json({ message: "wrong password" });
    } else {
      return jwt.sign(
        {
          userId: getUser[0].userId,
          email: getUser[0].email,
          firstName: getUser[0].firstName,
          lastName: getUser[0].lastName,
          gender: getUser[0].gender,
          hobbies: getUser[0].hobbies,
          profilePic: getUser[0].profilePic,
          roleName: getUser[0].roleName,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
        (err, token) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }
          return res.status(200).json({ message: "success", token });
        }
      );
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = loginUser;