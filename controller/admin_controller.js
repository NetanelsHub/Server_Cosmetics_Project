const Admin = require("../model/admin_model");
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { transporter } = require("../middleware/mailer");
let isFirstAdminAdded = false;
const crypto = require("crypto");
const Token = require("../model/forgot_password_model");


module.exports = {
  AddFirstAdmin: async (req, res) => {
    try {
      if (!isFirstAdminAdded) {
        console.log("add firs admin");
        // Check if there is already an admin
        const isAdmin = await Admin.findOne({ role: "Admin" });
        if (!isAdmin) {
          // Password Encryption
          const hashAdmin = await hash(process.env.ADMIN_PASSWORD, 10);
          console.log(hashAdmin);
          // Create first admin
          const firstAdmin = new Admin({
            admin_email: process.env.ADMIN_EMAIL,
            admin_password: hashAdmin,
            admin_role: "Admin",
            admin_fName: "Yossi&Nati",
            admin_lName: "ceo",
          });
          console.log(firstAdmin);
          // Save the first admin
          await firstAdmin.save();
          console.log("after the save");
          // Change the flag to true
          isFirstAdminAdded = true;

          return res.status(200).json({
            message: "First admin added successfully",
            success: true,
          });
        }
      } else {
        return res.status(200).json({ message: "First admin already exists" });
      }
    } catch (error) {
      return res.status(500).json({
        error: "Internal Server Error",
        success: false,
      });
    }
  },

  loginAdmin: async (req, res) => {
    try {
      const { admin_email, admin_password } = req.body;
      console.log("email:", admin_email, admin_password);

      if (!admin_email || !admin_password) {
        throw new Error("You need to insert all credentials.");
      }

      const admin = await Admin.findOne(
        { admin_email },
        "admin_password admin_role _id"
      );
      console.log(admin);
      console.log("admin work", !admin);

      if (!admin) {
        throw new Error("Sorry, there is no such an user.");
      }
      // console.log(admin_password, admin.admin_password)
      // Checking req.body password  vs Encryption password
      const isCompare = await compare(admin_password, admin.admin_password);
      if (!isCompare) {
        console.log("not compare");
        throw new Error("Sorry, invalid password for admin/managers.");
      }

      // Add token: payload, secret word, time for token
      const payload = { id: admin._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 60 * 15, // 15 minutes in seconds
      });

      //add token to object
      admin.token = token;

      // Save the updated admin
      await admin.save();

      // set cookie
      res.cookie("token", token, { maxAge: 1000 * 60 * 15 });

      return res.status(200).json({
        token: token,
        success: true,
        admin,
      });
    } catch (error) {
      return res.status(401).json({
        message: "not authoritaion",
        success: false,
        error: error.message,
      });
    }
  },
  loginWithGoogle: async (req, res) => {
    try {
      console.log(req.body);
      const { admin_email } = req.body;
      console.log(admin_email);
      if (!admin_email) {
        throw new Error("You need to insert all credentials.");
      }

      const admin = await Admin.findOne({ admin_email });
      console.log(admin);
      console.log("admin work", !admin);

      if (!admin) {
        throw new Error("Sorry, there is no such an user.");
      }

      // Add token: payload, secret word, time for token
      const payload = { id: admin._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 60 * 15, // 15 minutes in seconds
      });

      //add token to object
      admin.token = token;

      // Save the updated admin
      await admin.save();

      // set cookie
      res.cookie("token", token, { maxAge: 1000 * 60 * 15 });

      return res.status(200).json({
        token: token,
        success: true,
        admin,
      });
    } catch (error) {
      return res.status(401).json({
        message: "not authoritaion",
        success: false,
        error: error.message,
      });
    }
  },

  addASuperUser: async (req, res) => {
    try {
      const {
        admin_email,
        admin_password,
        admin_role,
        admin_fName,
        admin_lName,
      } = req.body;
      // console.log(role)
      // if (!admin_email || !admin_password || !admin_role || !admin_fName || !admin_lName) {
      //     throw new Error("You need to insert all credentials.");
      // }

      // Validate the new password
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
      if (!passwordRegex.test(admin_password)) {
        throw new Error(
          "Password must contain at least one digit, one lowercase letter, one uppercase letter, and be at least 5 characters long."
        );
      }

      // Validate the email address
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(admin_email)) {
        throw new Error("Invalid email address format.");
      }

      // Password Encryption
      const hashedPassword = await hash(admin_password, 10);

      // console.log(hashedPassword)
      const newAdminManager = new Admin({
        admin_email: admin_email,
        admin_password: hashedPassword, // Store the hashed password
        admin_role: admin_role,
        admin_fName: admin_fName,
        admin_lName: admin_lName,
      });

      // Save the document to the database
      await newAdminManager.save();


      const mail = {
        from: process.env.MAILER_EMAIL,
        to: admin_email,
        subject: `Welcome to Cosmetics Company`,
        html: `
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                border: 1px solid #ccc;
                border-radius: 8px;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
              }
              .content {
                margin-bottom: 20px;
              }
              .instructions {
                background-color: #f7f7f7;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img  src=${"https://res.cloudinary.com/dijj34ady/image/upload/v1718875826/sinleidftnkhskxvtjy1.png"} style=""max-width: 200px; height: 50px;">
                <h1>Welcome to Mineral cosmetics</h1>
              </div>
              <div class="content">
                <p>Dear ${admin_fName},</p>
                <p>Welcome to our team at Mineral cosmetics Company! We are delighted to have you on board as our new ${admin_role}.</p>
                <div class="instructions">
                  <p>Before your first day, please review the following:</p>
                  <ul>
                    <li>Company policies and procedures</li>
                    <li>Team introductions and contacts</li>
                    <li>First day orientation schedule</li>
                  </ul>
                </div>
                <p>If you have any questions, feel free to reach out to us.</p>
              </div>
              <div class="footer">
                <p>We look forward to working together and achieving great success!</p>
                <p>Best regards,</p>
                <p>Mineral cosmetics</p>
              </div>
            </div>
          </body>
          </html>
        `,

      };
      
      await transporter.sendMail(mail, (err, info) => {
        if (err) {
          console.error("Error occurred while sending email:", err);
        } else {
          console.log("Email sent successfully:", info.response);
        }
      });

      return res.status(200).json({
        message: "Adding admin or manager Editor successful !",
        success: true,
      });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.admin_email) {
        // This error indicates a duplicate key error (email already exists)
        return res
          .status(400)
          .json({
            error: "Email address already exists.",
            success: false,
            error: error.message,
          });
      } else {
        console.error(error);
        return res
          .status(500)
          .json({
            error: "An error occurred while adding admin or manager.",
            success: false,
            error: error.message,
          });
      }
    }
  },

  autoAdmin: async (req, res) => {
    try {
      const { id } = req.payload;
      console.log(id);
      const newToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: 60 * 15, // 15 minutes in seconds
      });

      // set cookie
      res.cookie("token", newToken, { maxAge: 1000 * 60 * 15, httpOnly: true });

      return res.status(200).json({
        token: newToken,
        success: true,
      });
    } catch (error) {
      return res.status(401).json({
        message: "not authoritaion",
        success: false,
        error: error.message,
      });
    }
  },
  logoutAdmin: async (req, res) => {
    try {
      res.clearCookie("token");

      return res.status(200).json({
        message: "successfully to logout user",
        success: true,
      });
    } catch (error) {
      return res.status(401).json({
        message: "not authoritaion",
        success: false,
        error: error.message,
      });
    }
  },

  getSuperUser: async (req, res) => {
    try {
      const allUser = await Admin.find();
      // console.log(allUser)
      // if db its empty
      if (!allUser) {
        throw new Error("Db its empty");
      }

      return res.status(200).json({
        message: "Get all user successful",
        success: true,
        allUser,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({
          message: "Get all user failed",
          success: false,
          error: error.message,
        });
    }
  },

  deleteSuperUser: async (req, res) => {
    try {
      console.log(req.params.id);
      await Admin.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        message: "Admin delete successful",
        success: true,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: "Admin delete failed",
          success: false,
          error: error.message,
        });
    }
  },

  updateSuperUser: async (req, res) => {
    try {
      console.log("hi", req.params.id);
      const id = req.params.id;
      const {
        admin_email,
        admin_password,
        admin_fName,
        admin_lName,
        admin_role,
      } = req.body;

      // console.log(req.body)

      if (
        !admin_email ||
        !admin_password ||
        !admin_fName ||
        !admin_lName ||
        !admin_role
      ) {
        throw new Error("You need to insert all credentials.");
      }

      // Validate the new password
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
      if (!passwordRegex.test(admin_password)) {
        throw new Error(
          "Password must contain at least one digit, one lowercase letter, one uppercase letter, and be at least 5 characters long."
        );
      }

      // Validate the email address
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(admin_email)) {
        throw new Error("Invalid email address format.");
      }

      // Hash the new password
      const hashedPassword = await hash(admin_password, 10);

      // Update the user
      const new_info = {
        admin_email: admin_email,
        admin_password: hashedPassword,
        admin_fName: admin_fName,
        admin_lName: admin_lName,
        admin_role: admin_role,
      };

      const after_Update = await Admin.findByIdAndUpdate(id, new_info);

      return res.status(200).json({
        message: "user update successful",
        success: true,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: "user update failed",
          success: false,
          error: error.message,
        });
    }
  },
  ForgotPassword: async (req, res) => {
    try {
        console.log(req.body)
      const admin = await Admin.findOne({ admin_email: req.body.admin_email });
    
      if (!admin) {
        throw new Error("Email not exist");
      }
      const token = await Token.findOne({ adminId: admin._id });

      if (token) await token.deleteOne();

      const resetToken = crypto.randomBytes(32).toString("hex");

      const hashPass = await hash(resetToken, 10);

      await new Token({
        adminId: admin._id,
        token: hashPass,
        createdAt: Date.now(),
      }).save();

      //sendEmail
      await transporter.sendMail({
        from: process.env.MAILER_EMAIL,
        to: admin.admin_email,
        subject: "Reset Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
            <div style="text-align: center; padding: 10px;">
              <img src=${"https://res.cloudinary.com/dijj34ady/image/upload/v1718875826/sinleidftnkhskxvtjy1.png"} alt="Mineral cosmetics" style="max-width: 200px; height: auto;">
            </div>
            <div style="padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #333;">Reset Your Password</h2>
              <p style="color: #666;">Hello,</p>
              <p style="color: #666;">We received a request to reset your password. Click the button below to reset it.</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="http://localhost:5173/resetPassword?token=${resetToken}&uid=${admin._id}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #666;">If you didn't request a password reset, please ignore this email or contact support if you have questions.</p>
              <p style="color: #666;">Thank you,<br>Mineral cosmetics</p>
            </div>
            <div style="text-align: center; padding: 10px; margin-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999;">&copy; 2024 Mineral cosmetics. All rights reserved.</p>
              <p style="color: #999;"><a href="https://your-company-website.com" style="color: #007bff; text-decoration: none;">Visit our website</a></p>
            </div>
          </div>
        `,
      });
      

      return res.status(200).json({
        message: "successfully to send email",
        success: true,
      });
    } catch (error) {
      return res.status(401).json({
        message: "not authoritaion",
        success: false,
        error: error.message,
      });
    }
  },
  ResetPassword: async (req, res) => {
    try {
      const { uid, token } = req.query;
      const { password } = req.body;

      const passwordResetToken = await Token.findOne({ adminId: uid });
      if (!passwordResetToken) {
        throw new Error("Invalid or expired password reset token");
      }
      const isValid = await compare(token, passwordResetToken.token);
      if (!isValid) {
        throw new Error("Invalid or expired password reset token");
      }
      const hashed = await hash(password, 10);

      const admin = await Admin.findByIdAndUpdate( 
        uid,
        {
          admin_password: hashed,
        },
        { new: true }
      );
      // // if good
      await passwordResetToken.deleteOne();

      return res.status(200).json({
        message: "successfully to update password user",
        success: true,
      });
    } catch (error) {
      return res.status(401).json({
        message: "not authoritaion",
        success: false,
        error: error.message,
      });
    }
  },
};
