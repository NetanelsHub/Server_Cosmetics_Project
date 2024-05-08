const Admin = require("../model/admin_model");
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");

let isFirstAdminAdded = false;

module.exports = {
    AddFirstAdmin: async (req, res) => {
        try {
            if (!isFirstAdminAdded) {
                
                // Check if there is already an admin
                const isAdmin = await Admin.findOne({ role: "Admin" });
                if (!isAdmin) {
                    console.log("hi")
                    // Password Encryption
                    const hashAdmin = await hash(process.env.ADMIN_PASSWORD, 10);

                    // Create first admin
                    const firstAdmin = new Admin({
                        admin_email: process.env.ADMIN_EMAIL,
                        admin_password: hashAdmin,
                        role: "Admin"
                    });

                    // Save the first admin
                    await firstAdmin.save();

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
            // console.log("hi")
            const { admin_email, admin_password } = req.body;
            console.log("email:", admin_email, admin_password)
            if (!admin_email || !admin_password) {
                throw new Error("You need to insert all credentials.");
            }

            const admin = await Admin.findOne({ admin_email });
            console.log("admin work", !admin)

            if (!admin) {
                throw new Error("Sorry, there is no such an user.");
            }

            // Checking req.body password  vs Encryption password 
            const isCompare = await compare(admin_password, admin.admin_password);
            if (!isCompare) {
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


            return res.status(200).json({ token: token });
        } catch (error) {

            console.log(error);
            return false
        }
    },
    addASuperUser: async (req, res) => {
        try {
            const { admin_email,  admin_password,admin_role ,admin_fName ,admin_lName } = req.body;
            // console.log(role)
            if (!admin_email || ! admin_password || !admin_role || !admin_fName || !admin_lName) {
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

            // Password Encryption
            const hashedPassword = await hash(admin_password, 10);

            console.log(hashedPassword)
            const newAdminManager = new Admin({
                admin_email: admin_email,
                admin_password: hashedPassword, // Store the hashed password
                admin_role: admin_role ,
                admin_fName: admin_fName,
                admin_lName :admin_lName
            });

            // Save the document to the database
            await newAdminManager.save();


            return res.status(200).json({ message: "Adding admin or manager Editor successful" });

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
            const newToken = jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: 60 * 15 // 15 minutes in seconds
            })

            // set cookie
            res.cookie("token", newToken, { maxAge: 1000 * 60 * 15 })

            return res.status(200).json({ token: newToken });
        } catch (error) {
            console.log(error);

        }

    },
    // Reset_password: async (req, res) => {
    //     try {
    //         const { admin_email, admin_password } = req.body;

    //         if (!admin_email || !admin_password) {
    //             throw new Error("You need to provide both email and new password.");
    //         }

    //         const admin = await Admin.findOne({ admin_email });

    //         if (!admin) {
    //             throw new Error("Sorry, there is no such user.");
    //         }

    //         // Hash the new password
    //         const hashedPassword = await hash(admin_password, 10);

    //         // Validate the new password
    //         const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;
    //         if (!passwordRegex.test(admin_password)) {
    //             throw new Error("Password must contain at least one digit, one lowercase letter, one uppercase letter, and be at least 5 characters long.");
    //         }

    //         // Update the password only if it meets the criteria
    //         admin.admin_password = hashedPassword;

    //         // Save the updated admin
    //         await admin.save();

    //         return res.status(200).json({ message: "Password reset successfully." });
    //     } catch (error) {
    //         return res.status(500).json({ error: error.message });
    //     }
    // },
    // logOutAdmin:async (req,res )=>{
    //     try {
    //         console.log("hi")
    //         // console.log(req.payload)
    //         // const {id} = req.payload
    //         // const userId = req.headers.authorization
    //         const userId = req.headers.authorization
    //         console.log(userId)
    //         // const decode =jwt.verify(userId,process.env.JWT_SECRET)
    //         console.log(userId,"aaa")

    //     } catch (error) {

    //     }
    // }
    //1.
    //1.1 delete the token
    //
};
