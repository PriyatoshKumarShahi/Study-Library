const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bannedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isGeneral: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", ChannelSchema);
