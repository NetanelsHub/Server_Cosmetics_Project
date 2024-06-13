const Client = require("../model/client_model");
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { transporter } = require("../middleware/mailer");
const crypto = require("crypto");
const Token = require("../model/forgot_password_model");

module.exports = {
  registerClient: async (req, res) => {
    try {
      console.log(req.body);
      const { client_fName, client_lName, client_password, client_email } =
        req.body;

      if (!client_fName || !client_lName || !client_password || !client_email) {
        throw new Error("you need to insert all credential to inputs");
      }

      const hashPass = await hash(client_password, 10);

      if (!hashPass) throw new Error("try again");
      const client = req.body;
      client.client_password = hashPass;

      const newClient = new Client(req.body);
      await newClient.save();

      client.client_password = "*******";

      const mail = {
        from: process.env.MAILER_EMAIL,
        to: client_email,
        subject: `Hello ${client_fName}`,
        html: `<h1>Cosmetics company</h1>
        <p>Congratulations on joining us as an</p>
        <img src="" />
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
        message: "successfully to register client",
        success: true,
        client: req.body,
      });
    } catch (error) {
      return res.status(500).json({
        message: "not successfully to register user",
        success: false,
        error: error.message,
      });
    }
  },
  loginClient: async (req, res) => {
    try {
      const { client_email, client_password } = req.body;
      console.log("email:", client_email, client_password);
      if (!client_email || !client_password) {
        throw new Error("You need to insert all credentials.");
      }

      const client = await Client.findOne({ client_email });
      console.log(client);
      console.log("client work", !client);

      if (!client) {
        throw new Error("Sorry, there is no such an user.");
      }

      // Checking req.body password  vs Encryption password
      const isCompare = await compare(client_password, client.client_password);
      if (!isCompare) {
        console.log("not compare");
        throw new Error("Sorry, invalid password for admin/managers.");
      }

      // Add token: payload, secret word, time for token
      const payload = { id: client._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 60 * 15, // 15 minutes in seconds
      });

      let oldTokens = client.tokens || [];

      if (oldTokens) {
        oldTokens = oldTokens.filter((t) => {
          const timeDiff = (Date.now() - parseInt(t.signAt)) / 1000;
          if (timeDiff < 60 * 15) {
            return t;
          }
        });
      }

      await Client.findByIdAndUpdate(client._id, {
        tokens: [...oldTokens, { token, signAt: Date.now().toString() }],
      });

      // set cookie
      res.cookie("token", token, { maxAge: 1000 * 60 * 15, httpOnly: true });

      return res.status(200).json({ 
        token: token,
        success: true,
        client
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  logOut: async (req, res) => {
    try {
      const token = req.headers.authorization;

      const decode = jwt.verify(token, process.env.JWT_SECRET);

      if (!decode) {
        throw new Error("token dont verify");
      }

      const client = await Client.findById(decode.id);
      console.log(client);
      const newTokens = client.tokens.filter((t) => t.token !== token);

      await Client.findByIdAndUpdate(decode.id, {
        tokens: [...newTokens],
      });

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
  authClient: async (req, res) => {
    try {
      const { id } = req.payload;

      const payload = {
        id,
      };

      const { tokens } = await Client.findById(id);

      const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: 60 * 15,
      });

      const newTokens = tokens.filter((t) => t.token !== req.token);
      console.log(newTokens);

      await Client.findByIdAndUpdate(id, {
        tokens: [
          ...newTokens,
          { token: newToken, signAt: Date.now().toString() },
        ],
      });

      return res.status(200).json({
        message: "successfully to auth user",
        success: true,
        newToken,
      });
    } catch (error) {
      return res.status(401).json({
        message: "not authoritaion",
        success: false,
        error: error.message,
      });
    }
  },
  getAllClients: async (req, res) => {
    try {
        // קבלת הפרמטרים מהבקשה
        const { page = 1, limit = 7, searchEmail } = req.query;

        // יצירת שאילתה ריקה
        const query = {};


        // הוספת סינון לפי אימייל אם קיים
        if (searchEmail) {
            query.client_email = { $regex: searchEmail, $options: "i" }; // מתעלם מגודל האותיות
        }

        // ספירת מספר המסמכים העונים על השאילתה
        const count = await Client.countDocuments(query);
        const pages = Math.ceil(count / limit);

        // מציאת הלקוחות העונים על השאילתה עם הגבלה ודילוג לפי הדפדוף
        const allClients = await Client.find(query)
            .skip((page - 1) * limit)
            .limit(limit);

        // שליחת המידע ללקוח
        return res.status(200).json({
            message: "Get all Client successful",
            success: true,
            allClients,
            pages
        });
    } catch (error) {
        // טיפול בשגיאות
        console.error(error);
        return res.status(500).json({
            message: "Get all Client failed",
            success: false,
            error: error.message,
        });
    }
}
,
  deleteClients: async (req, res) => {
    try {
      const id = req.params.id;
    
      await Client.findByIdAndDelete(id);

      return res.status(200).json({
        message: "successfully to delete Client",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: "error in delete Client",
        success: false,
        error: error.message,
      });
    }
  },
  updateClient: async (req, res) => {
    try {
     
      const id = req.params.id
      
      const { client_email, client_password, client_fName, client_lName } = req.body
      console.log("update pass:",client_password)
      if (!client_email || !client_password || !client_fName || !client_lName) {
        throw new Error("You need to insert all credentials.");
      }
    
      // Validate the email address
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!emailRegex.test(client_email)) {
        throw new Error("Invalid email address format.");
      }
      
      // Update the user. 
      // because we not allowed the admin to change the password 
      // we insert the pass word as is 
      const new_info = {
        client_email: client_email,
        client_password: client_password,
        client_fName: client_fName,
        client_lName: client_lName,
      }

      const after_Update = await Client.findByIdAndUpdate(id, new_info) 

      return res.status(200).json({
        message: "client update successful",
        success: true,
        after_Update
      });
    } catch (error) {
      return res.status(500).json({
        message: "client update failed",
        success: false,
        error: error.message,
      });
    }
  },  
  ForgotPassword: async (req, res) => {
    try {
        console.log(req.body)
      const client = await Client.findOne({ client_email: req.body.client_email });
    
      if (!client) {
        throw new Error("Email not exist");
      }
      const token = await Token.findOne({ clientId: client._id });

      if (token) await token.deleteOne();

      const resetToken = crypto.randomBytes(32).toString("hex");

      const hashPass = await hash(resetToken, 10);

      await new Token({
        clientId: client._id,
        token: hashPass,
        createdAt: Date.now(),
      }).save();

      //sendEmail
      await transporter.sendMail({
        from: process.env.MAILER_EMAIL,
        to: client.client_email,
        subject: "Reset Password",
        html: `<a href="http://localhost:5173/resetPassword?token=${resetToken}&uid=${client._id}">לחץ כאן</a>
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

      const passwordResetToken = await Token.findOne({ clientId: uid });
      if (!passwordResetToken) {
        throw new Error("Invalid or expired password reset token");
      }
      const isValid = await compare(token, passwordResetToken.token);
      if (!isValid) {
        throw new Error("Invalid or expired password reset token");
      }
      const hashed = await hash(password, 10);

      const client = await Client.findByIdAndUpdate(
        uid,
        {
          client_password: hashed,
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
}  

;
