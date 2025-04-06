const mongoose = require("mongoose");

const orderAssignSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // or "agent" if you have separate agent model
    required: true,
  },
  orderId: [
    {
      type:String,
      ref: "orders",
      required: true,
    },
  ],
  assignedDate: {
    type: Date,
    default: Date.now,
  },
});

const orderAssignModel = mongoose.model("orderAssignments", orderAssignSchema);

module.exports = orderAssignModel;
