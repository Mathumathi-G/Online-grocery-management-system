const express = require("express");
const { assignOrdersToAgent, getAllAssignments, getAllagentOrder } = require("../Controllers/deliveryagentcontroller");
const { AdminUpdateOrder } = require("../Controllers/orderController");

const router = express.Router();

// POST: Assign orders to agent
router.post("/assign-orders", assignOrdersToAgent);

// GET: Get all assignments
router.get("/assignments", getAllAssignments);
router.get("/agent/:id", getAllagentOrder);
router.put("/agent/order/:orderId", AdminUpdateOrder);



module.exports = router;
