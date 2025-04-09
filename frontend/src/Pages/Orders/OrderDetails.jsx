import React, { useEffect, useState } from "react";
import "./Orders.css";
import Footer from "../../Components/Footer/Footer";
import Header from "../../Components/Header/Header";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../Components/Loader/Loader";
import { getUsersOrderDetailsAction } from "../../Redux/Actions/orderActions";
import { useParams, useSearchParams } from "react-router-dom";
import NotFoundCart from "../../Components/NotFoundCart/NotFoundCart";
import jsPDF from "jspdf";
import {
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
} from "@mui/material";

const steps = ["Processing", "Packed", "Shipped", "Delivered"];

const OrderStatusStepper = ({ status }) => {
  const currentStep = steps.indexOf(status);

  return (
    <Box sx={{ width: "100%", my: 4, height: "100px" }}>
      <Stepper
        activeStep={currentStep}
        alternativeLabel
        sx={{
          "& .MuiStepLabel-label": {
            fontSize: "1.1rem",
            fontWeight: "bold",
          },
          "& .MuiStepIcon-root": {
            width: 40,
            height: 40,
          },
          "& .MuiStepIcon-text": {
            fontSize: "1rem",
          },
        }}
      >
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

const OrderDetails = () => {
  const {
    loading: orderLoading,
    order,
    error: orderError,
  } = useSelector((state) => state.getOrderDetails);
  const dispatch = useDispatch();
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (orderId) {
      document.title = `Orders Details`;
      dispatch(getUsersOrderDetailsAction(orderId));
    }
  }, [orderId]);

  const exportInvoicePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Invoice", 14, y);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 14, (y += 10));
    doc.text(`Status: ${order.status}`, 14, (y += 8));
    doc.text(`Date: ${order.orderDate?.slice(0, 10) || "N/A"}`, 14, (y += 8));
    doc.text(`Total Items: ${order.orderItems.length}`, 14, (y += 8));
    doc.text(`Total Amount: ₹ ${order.total}`, 14, (y += 10));

    // Items section
    order.orderItems.forEach((item, index) => {
      doc.setFillColor(240, 248, 255);
      doc.roundedRect(10, y, 190, 25, 2, 2, "F");

      doc.setTextColor(33, 33, 33);
      doc.setFontSize(11);
      doc.text(`${index + 1}. ${item.name}`, 14, y + 7);
      doc.text(`Qty: ${item.quantity} Kg | Rate: ₹${item.rate}/Kg`, 14, y + 14);
      doc.text(`Subtotal: ₹${item.quantity * item.rate}`, 14, y + 21);

      y += 30;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`invoice_${order._id}.pdf`);
  };

  return (
    <>
      <Header />
      {orderLoading ? (
        <Loader LoadingName={"Order Loading"} />
      ) : orderError ? (
        <NotFoundCart msg={"Something Went Wrong"} />
      ) : order && order.orderItems ? (
        <>
          <div className="orders-container"></div>
          <h1 className="Heading">Orders <span>Details</span></h1>

          <div className="orders-box">
            <div className="orders-cart-item">
              <div className="orders-cart-item-box">
                <div className="orders-total-cart-price">
                  <h2>Order Items: {order.orderItems.length}</h2>
                  <h2>Total Amount: ₹ {order.total}</h2>
                </div>
              </div>

              {order.orderItems.map((item) => (
                <div className="orders-cart-item-box" key={item._id}>
                  <img src={item.image} alt="Product" />
                  <div>
                    <h2>{item.name}</h2>
                    <h4>Quantity: {item.quantity} KG</h4>
                    <h4>Rate: ₹ {item.rate}/Kg</h4>
                  </div>
                  <div>
                    <h3>₹ {item.rate * item.quantity}</h3>
                    <h3
                      className={
                        order.status === "Processing"
                          ? "order-processing-status"
                          : order.status === "Shipped"
                          ? "order-shipping-status"
                          : "order-delivered-status"
                      }
                    >
                      {order.status}
                    </h3>
                    <span className="order-date">{order.orderDate}</span>
                  </div>
                </div>
              ))}

              <div style={{ textAlign: "right", margin: "20px 10px" }}>
                <button
                  onClick={exportInvoicePDF}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "15px",
                  }}
                >
                  📥 Download Invoice
                </button>
              </div>

              <OrderStatusStepper status={order.status} />
            </div>
          </div>
        </>
      ) : (
        <NotFoundCart msg={"Sorry, Order Not Found"} />
      )}
      <Footer />
    </>
  );
};

export default OrderDetails;
