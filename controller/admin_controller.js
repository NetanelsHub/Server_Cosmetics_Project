const Admin = require("../model/admin_model");
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");
const{transporter} =require("../middleware/mailer")
let isFirstAdminAdded = false;
const crypto = require("crypto");
const Token = require("../model/forpass_admin_model");
// const logo = require("../public/uploads/logo.webp")

module.exports = {
    AddFirstAdmin: async (req, res) => {
        try {
            if (!isFirstAdminAdded) {
                console.log("add firs admin")
                // Check if there is already an admin
                const isAdmin = await Admin.findOne({ role: "Admin" });
                if (!isAdmin) {

                    // Password Encryption
                    const hashAdmin = await hash(process.env.ADMIN_PASSWORD, 10);
                        console.log(hashAdmin)
                    // Create first admin
                    const firstAdmin = new Admin({
                        admin_email: process.env.ADMIN_EMAIL,
                        admin_password: hashAdmin,
                        admin_role: "Admin",
                        admin_fName: "Yossi&Nati",
                        admin_lName: "ceo"

                    });
                    console.log(firstAdmin)
                    // Save the first admin
                    await firstAdmin.save();
                    console.log("after the save")
                    // Change the flag to true   
                    isFirstAdminAdded = true;

                    return res.status(200).json({
                        message: "First admin added successfully"
                    });
                }
            } else {
                return res.status(200).json({ message: "First admin already exists" });
            }
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

    loginAdmin: async (req, res) => {
        try {
            const { admin_email, admin_password } = req.body;
            console.log("email:", admin_email, admin_password)
            
            if (!admin_email || !admin_password) {
                throw new Error("You need to insert all credentials.");
            }

            const admin = await Admin.findOne({ admin_email },"admin_password admin_role _id");
            console.log(admin)
            console.log("admin work", !admin)   

            if (!admin) {
                throw new Error("Sorry, there is no such an user.");
            }
            // console.log(admin_password, admin.admin_password)  
            // Checking req.body password  vs Encryption password 
            const isCompare = await compare(admin_password, admin.admin_password);
            if (!isCompare) {
                console.log("not compare")
                throw new Error("Sorry, invalid password for admin/managers.");
            }

            // Add token: payload, secret word, time for token
            const payload = { id: admin._id };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: 60 * 15 // 15 minutes in seconds
            });

            //add token to object
            admin.token = token

            // Save the updated admin
            await admin.save()

            // set cookie
            res.cookie("token", token, { maxAge: 1000 * 60 * 15 })


            return res.status(200).json({
                 token: token ,
                 admin

                });
        } catch (error) {

            console.log(error);
            // return false
        }
    },

    addASuperUser: async (req, res) => {
        try {
            const { admin_email, admin_password, admin_role, admin_fName, admin_lName } = req.body;
            // console.log(role)
            // if (!admin_email || !admin_password || !admin_role || !admin_fName || !admin_lName) {
            //     throw new Error("You need to insert all credentials.");
            // }

            // Validate the new password
            const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
            if (!passwordRegex.test(admin_password)) {
                throw new Error("Password must contain at least one digit, one lowercase letter, one uppercase letter, and be at least 5 characters long.");
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
                admin_lName: admin_lName
            });

            // Save the document to the database
            await newAdminManager.save();


            const mail = {
                from:process.env.MAILER_EMAIL,
                to:admin_email,
                subject:`Hello ${admin_fName}`,
                html:`<h1>Cosmetics company</h1>
                <p>Congratulations on joining us as an ${admin_role}</p>
                <img src="" />
                `}
               
                await transporter.sendMail(mail,(err, info) => {
                if (err) {
                    console.error('Error occurred while sending email:', err);
                } else {
                    console.log('Email sent successfully:', info.response);
                }})

            return res.status(200).json({ message: "Adding admin or manager Editor successful !" });

        } catch (error) {
            if (error.code === 11000 && error.keyPattern.admin_email) {
                // This error indicates a duplicate key error (email already exists)
                return res.status(400).json({ error: "Email address already exists." });
            } else {
                console.error(error);
                return res.status(500).json({ error: "An error occurred while adding admin or manager." });
            }
        }
    },

    autoAdmin: async (req, res) => {
        try {
            const { id } = req.payload
            console.log(id)
            const newToken = jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: 60 * 15 // 15 minutes in seconds
            })

            // set cookie
            res.cookie("token", newToken, { maxAge: 1000 * 60 * 15 , httpOnly:true})

            return res.status(200).json({ token: newToken });
        } catch (error) {
            console.log(error);

        }

    },logoutAdmin: async (req, res) => {
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
            const allUser = await Admin.find()
            // console.log(allUser)
            // if db its empty
            if (!allUser) {
                throw new Error("Db its empty")
            }

            return res.status(200).json({ message: "Get all user successful", allUser });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Get all user failed" });
        }
    },

    deleteSuperUser: async (req, res) => {
        try {
            console.log(req.params.id)
            await Admin.findByIdAndDelete(req.params.id)

            return res.status(200).json({ message: "user delete successful" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "user delete failed" });
        }
    },

    updateSuperUser: async (req, res) => {
        try {
            console.log("hi", req.params.id)
            const id = req.params.id
            const { admin_email, admin_password, admin_fName, admin_lName, admin_role } = req.body

            // console.log(req.body)

            if (!admin_email || !admin_password || !admin_fName || !admin_lName || !admin_role) {
                throw new Error("You need to insert all credentials.");
            }

             // Validate the new password
             const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
             if (!passwordRegex.test(admin_password)) {
                 throw new Error("Password must contain at least one digit, one lowercase letter, one uppercase letter, and be at least 5 characters long.");
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
                admin_email : admin_email,
                admin_password: hashedPassword,
                admin_fName : admin_fName,
                admin_lName : admin_lName,
                admin_role : admin_role
            }

            const after_Update = await Admin.findByIdAndUpdate(id,new_info)
            console.log("after updat:", after_Update)

            return res.status(200).json({ message: "user update successful" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "user update failed" });
        }
    },
    ForgotPassword: async (req, res) => {
        try {
          const admin = await Admin.findOne({ admin_email: req.body.email });
         
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
            html: `<a href="http://localhost:5173/resetPassword?token=${resetToken}&uid=${admin._id}">לחץ כאן</a>
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
      }

}

