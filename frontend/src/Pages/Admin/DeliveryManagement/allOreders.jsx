import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersAdminAction } from "../../../Redux/Actions/orderActions";
import Header from "../../../Components/Header/Header";
import Sidebar from "../Components/Sidebar/Sidebar";
import Loader from "../../../Components/Loader/Loader";
import NotFoundCart from "../../../Components/NotFoundCart/NotFoundCart";
import { Await, Link } from "react-router-dom";
import { HiPencilAlt } from "react-icons/hi";

import {
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  
  getAllUsersAdminAction,
} from "../../../Redux/Actions/userAction";
import axios from "axios";

const OrderList = () => {
  const dispatch = useDispatch();
  const [message, setmessage] = useState();

  const [selectedAgents, setSelectedAgents] = useState({});
  const [successAssign, setSuccessAssign] = useState(false);

  const { loading, orders, success, error } = useSelector(
    (state) => state.adminAllOrders
  );
  const { users, loading: userLoading } = useSelector(
    (state) => state.adminAllUsers
  );

  const agents = users?.filter((user) => user.role === "agent");

  useEffect(() => {
    dispatch(getAllOrdersAdminAction());
    dispatch(getAllUsersAdminAction());
  }, [dispatch]);
const assignHandler = async (orderId) => {
  const agentId = selectedAgents[orderId];

  if (!agentId) {
    setSuccessAssign(false);
    return;
  }

  try {
    console.log("Assigning order:", orderId, "to agent:", agentId);

    const { data } = await axios.post("http://localhost:8000/api/delivery/assign-orders", {
      orderId,
      agentId,
    });

    console.log("Assignment response:", data);
    setSuccessAssign(true);
    setmessage(data.message)
    //Agent Assigned Successfully!
    
    // Optional: dispatch Redux action if needed
    // dispatch(assignDeliveryAction(orderId, agentId));

  } catch (error) {
    console.error("Assignment failed:", error.response?.data || error.message);
    setSuccessAssign(false);
  }
};


  return (
    <>
      <Header />
      <Sidebar />
      <div className="dashboard-container">
        {loading || userLoading ? (
          <Loader LoadingName={"Loading Orders & Agents"} />
        ) : success ? (
          <>
            <div className="dashboard-sub-heading">
              <h1>All Orders</h1>
            </div>

            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Order Id</th>
                    <th>Name</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Assign Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {orders &&
                    orders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <Link to={`/admin/update/order/${order._id}`}>
                            #{order._id}
                          </Link>
                        </td>
                        <td>
                          {order.user?.firstName + " " + order.user?.lastName}
                        </td>
                        <td>{order.orderItems.length}</td>
                        <td>₹ {order.total}</td>
                        <td
                          className={
                            order.status === "Processing"
                              ? "order-processing-status"
                              : order.status === "Shipped"
                              ? "order-shipping-status"
                              : "order-delivered-status"
                          }
                        >
                          {order.status}
                        </td>
                        <td>{order.orderDate}</td>
                        <td>
                          <Box display="flex" alignItems="center" gap={1}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <InputLabel>Agent</InputLabel>
                              <Select
                                label="Agent"
                                value={selectedAgents[order._id] || ""}
                                onChange={(e) =>
                                  setSelectedAgents({
                                    ...selectedAgents,
                                    [order._id]: e.target.value,
                                  })
                                }
                              >
                                <MenuItem value="">None</MenuItem>
                                {agents?.map((agent) => (
                                  <MenuItem key={agent._id} value={agent._id}>
                                    {agent.firstName + " " + agent.lastName}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => assignHandler(order._id)}
                              disabled={!selectedAgents[order._id]}
                            >
                              Assign
                            </Button>

                            <Link to={`/admin/update/order/${order._id}`}>
                              <HiPencilAlt size={20} style={{ marginLeft: 10 }} />
                            </Link>
                          </Box>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        ) : error ? (
          <NotFoundCart msg={error} />
        ) : (
          ""
        )}
      </div>

      {/* Snackbar for success */}
      <Snackbar
        open={successAssign}
        autoHideDuration={3000}
        onClose={() => setSuccessAssign(false)}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccessAssign(false)}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OrderList;
