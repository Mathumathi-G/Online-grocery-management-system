const orderAssignModel = require("../models/assigdeliveryagent");
const orderModel = require("../models/orderModel");
const assignOrdersToAgent = async (req, res) => {
  try {
    let { agentId, orderId } = req.body;

    // Normalize input
    if (!agentId) {
      return res.status(400).json({ message: "agentId is required." });
    }

    if (!orderId || (typeof orderId !== "string" && !Array.isArray(orderId))) {
      return res.status(400).json({ message: "orderId must be a string or an array." });
    }

    if (typeof orderId === "string") {
      orderId = [orderId];
    }

    if (orderId.length === 0) {
      return res.status(400).json({ message: "orderId array cannot be empty." });
    }

    const inputAgentId = agentId.toString();

    // Fetch all assignments
    const allAssignments = await orderAssignModel.find({});
    const alreadyAssignedOrderIds = new Set();

    allAssignments.forEach(assign => {
      const assignedAgentId = assign.agentId.toString();
      const ids = Array.isArray(assign.orderId) ? assign.orderId : [assign.orderId];

      ids.forEach(id => {
        alreadyAssignedOrderIds.add(id.toString());
      });
    });

    // Filter out already assigned orders
    const newOrderIds = [];
    const skippedOrderIds = [];

    orderId.forEach(id => {
      if (alreadyAssignedOrderIds.has(id.toString())) {
        skippedOrderIds.push(id);
      } else {
        newOrderIds.push(id);
      }
    });

    if (newOrderIds.length === 0) {
      return res.status(200).json({
        message: "All selected orders are already assigned to agents.",
        skippedOrderIds,
      });
    }

    // Check if the agent already has an assignment
    let assignment = await orderAssignModel.findOne({ agentId });

    if (assignment) {
      const existingIds = new Set(assignment.orderId.map(id => id.toString()));
      newOrderIds.forEach(id => existingIds.add(id.toString()));
      assignment.orderId = Array.from(existingIds);
    } else {
      assignment = new orderAssignModel({ agentId, orderId: newOrderIds });
    }

    await assignment.save();

    res.status(201).json({
      message: "Orders assigned successfully!",
      assignedOrderIds: newOrderIds,
      skippedOrderIds,
      assignment,
    });

  } catch (error) {
    console.error("Order assignment error:", error);
    res.status(500).json({
      message: "Server error while assigning orders.",
      error: error.message,
    });
  }
};




// Optional: Fetch assignments
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await orderAssignModel
      .find()
      .populate("agentId", "name email") // include agent details
      .populate("orderId");

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignments", error: error.message });
  }
};



// Optional: Fetch assignments
const getAllagentOrder = async (req, res) => {
    try {
      const assignments = await orderAssignModel.find({agentId:req.params.id})

     const ordersids= assignments[0].orderId

     const orders = await Promise.all(
      ordersids.map(async (id) => {
        const order = await orderModel.findById(id);
        return order;
      })
    );  
    
    // If you want to filter out null or only certain orders by a condition:
    

      res.status(200).json(
        {
          success:true,
          orders
        }
      );
    } catch (error) {
      res.status(500).json({ message: "Error fetching assignments", error: error.message });
    }
  };

module.exports = { assignOrdersToAgent, getAllAssignments ,getAllagentOrder};
