    const { QueryTypes } = require("sequelize");
    const sequelize = require("../utils/db");
    const nodemailer = require("nodemailer");

    const EmailUsers = async (req, res) => {
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // Use `true` for port 465, `false` for all other ports
                auth: {
                    user: "yram.netclues@gmail.com",
                    pass: "rcdi uojz kshi swml",
                },
            });

            // async..await is not allowed in global scope, must use a wrapper
            async function main() {
                // send mail with defined transport object
                const info = await transporter.sendMail({
                    from: '"Yash Ahir 😄" <yram.netclues@gmail.com>', // sender address
                    to: "valu1eraze@gmail.com , yashahir63525@gmail.com", // list of receivers
                    subject: "Hello User", // Subject line
                    text: "Today we will create an email using SMTP in nodemail?", // plain text body
                    html: "<h1>Hello User</h1>", // html body
                });
                res.status(200).json({ message: "Email sent successfully" });
                console.log("Message sent: %s", info.messageId);
                // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
            }
        }catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    module.exports = {
        EmailUsers
    }