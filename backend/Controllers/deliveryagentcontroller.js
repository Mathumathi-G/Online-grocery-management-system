const orderAssignModel = require("../models/assigdeliveryagent");
const orderModel = require("../models/orderModel");
const assignOrdersToAgent = async (req, res) => {
  try {
    let { agentId, orderId } = req.body;

    // Normalize orderId to an array if it's a single string
    if (typeof orderId === "string") {
      orderId = [orderId];
    }

    // Input validation
    if (!agentId || !Array.isArray(orderId) || orderId.length === 0) {
      return res.status(400).json({
        message: "agentId and a non-empty orderId array are required.",
      });
    }

    // Check if an assignment already exists for this agent
    let assignment = await orderAssignModel.findOne({ agentId });

    if (assignment) {
      // Avoid duplicate orderIds using Set
      const existingOrderIds = new Set(assignment.orderId.map(id => id.toString()));
      orderId.forEach(id => existingOrderIds.add(id.toString()));
      assignment.orderId = Array.from(existingOrderIds);
    } else {
      // Create a new assignment if none exists
      assignment = new orderAssignModel({ agentId, orderId });
    }

    // Save the assignment (new or updated)
    await assignment.save();

    res.status(201).json({
      message: "Orders assigned successfully!",
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
