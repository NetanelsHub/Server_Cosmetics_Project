const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Types.ObjectId,
    ref: "Admins",
  },
  clientId: {
    type: mongoose.Types.ObjectId,
    ref: "Clients",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

//ואלידציה כך שרק אחד מהשדות יהיה בשימוש
tokenSchema.path('adminId').validate(function(value) {
  return !this.clientId || !value;
}, 'adminId and userId cannot both be set.');

tokenSchema.path('clientId').validate(function(value) {
  return !this.adminId || !value;
}, 'adminId and userId cannot both be set.');

module.exports = mongoose.model("Token", tokenSchema);
