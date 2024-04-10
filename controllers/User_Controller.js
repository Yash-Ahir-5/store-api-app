const sequelize = require("../utils/db");
const { QueryTypes } = require('sequelize');
const emailValidator = require("email-validator");
const fs = require("fs");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const { firstname, lastname, email, password, gender, hobbies, user_role } = req.body;

    const removePPicIfErr = () => {
        fs.unlink(`./public/assets/${req.file?.filename}`, (err, succ) => {
            if (err) {
                console.log("Error" + err.message);
            }
        });
    };

    let profile_pic = null;
    if (req.file) {
        profile_pic = req.file.filename;
    }
    console.log(profile_pic);
    // else{
    //     res.status(400).json({message: 'Profile picture is required'});
    //     return;
    // }

    if (
        !firstname ||
        !lastname ||
        !email ||
        !password ||
        !gender ||
        !hobbies ||
        !profile_pic
    ) {
        removePPicIfErr();
        return res.status(400).json({ message: "All fields are required" });
    }


    try {
        if (!emailValidator.validate(email)) {
            removePPicIfErr();
            return res.status(400).json({ message: "Invalid Email" });
        }

        if (password.length < 6) {
            removePPicIfErr();
            return res.status(400).json({ message: "Password must be atleast 6 characters" });
        }

        // Checking if the user already exists
        const emailExists = await sequelize.query(
            `SELECT * FROM users WHERE email = '${email}'`,
            { type: QueryTypes.SELECT }
        );

        if (emailExists.length) {
            removePPicIfErr();
            return res.status(400).json({ message: "email already exists" });
        }

        // Hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //One Admin only
        if (user_role == 1) {
            const [adminUser] = await sequelize.query(
                `select email from users where user_role = 1`,
                {
                    type: QueryTypes.SELECT,
                }
            );

            if (adminUser) {
                console.log(adminUser);
                return res.status(409).json({ error: "Admin already exist" });
            }
        }

        // Inserting data into the users database
        const userCreated = await sequelize.query(
            "INSERT INTO `users` (`firstname`, `lastname`, `email`, `password`, `gender`, `hobbies`, `user_role`, `profile_pic`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            {
                type: QueryTypes.INSERT,
                replacements: [
                    firstname,
                    lastname,
                    email,
                    hashedPassword,
                    gender,
                    hobbies,
                    user_role || "2",
                    profile_pic,
                ],
            }
        );
        if (userCreated == undefined) {
            res.status(400).json({ error: "Error while creating the user" });
        }
        res.status(200).json({ message: "You are registered successfully" });

    } catch (error) {
        removePPicIfErr();
        return res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password are Required" });
    }

    try {
        // Query to find user in database
        const checkUser = await sequelize.query(
            `SELECT * FROM users WHERE email = :email`,
            {
                replacements: { email },
                type: QueryTypes.SELECT,
            }
        );

        // Checking if the user exists
        if (!checkUser) {
            return res.status(400).json({ message: "Invalid Email" });
        }

        // Getting the hashed password from the database
        const hashedPassword = checkUser[0].password;
        console.log(hashedPassword);

        // Comparing the password
        const isValidPassword = await bcrypt.compare(password, hashedPassword);

        if (!isValidPassword) {
            return res.status(400).json({ message: "Invalid Password" });
        } 
            console.log(checkUser[0]);
            jwt.sign(
                checkUser[0],
                process.env.JWT_SECRET,
                { expiresIn: "600s" },
                (err, token) => {
                    if (err) {
                        console.log(err);
                        return res.status(404).json({ error: "Token error" });
                    }
                    res.status(200).json({ message: "Successfully Logged In", id: checkUser.id, token });
                }
            );
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// const deleteUser = async (req, res) => {
//     const { id } = req.params;
// }

module.exports = {
    registerUser,
    loginUser,
    // deleteUser
}