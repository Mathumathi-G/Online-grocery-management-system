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

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(36, 36, 36);
  doc.text("INVOICE", 105, y, { align: "center" });
  y += 10;

  // Invoice Details Box
  doc.setDrawColor(70);
  doc.setFillColor(245, 245, 245); // Light gray box
  doc.roundedRect(10, y, 190, 40, 3, 3, 'FD');

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0);

  y += 8;
  doc.text(`Order ID: ${order._id}`, 14, y);
  doc.text(`Status: ${order.status}`, 110, y);
  y += 8;
  doc.text(`Date: ${order.orderDate?.slice(0, 10) || "N/A"}`, 14, y);
  doc.text(`Total Items: ${order.orderItems.length}`, 110, y);
  y += 8;
  doc.text(`Payment Mode: ${order.paymentMode}`, 14, y);
  doc.text(`Total Amount: ₹ ${order.total}`, 110, y);

  y += 20;

  // Section Title for Items
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text("Order Items", 14, y);
  y += 6;

  // Table Header
  doc.setFillColor(230, 230, 250);
  doc.rect(10, y, 190, 10, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);

  doc.text("S.No", 14, y + 7);
  doc.text("Item Name", 30, y + 7);
  doc.text("Qty (Kg)", 110, y + 7);
  doc.text("Rate ₹/Kg", 140, y + 7);
  doc.text("Subtotal ₹", 170, y + 7);

  y += 12;

  // Item rows
  order.orderItems.forEach((item, index) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33);

    doc.rect(10, y - 1, 190, 10); // Border for each row

    doc.text(`${index + 1}`, 14, y + 6);
    doc.text(item.name, 30, y + 6);
    doc.text(`${item.quantity}`, 110, y + 6);
    doc.text(`₹${item.rate}`, 140, y + 6);
    doc.text(`₹${item.quantity * item.rate}`, 170, y + 6);

    y += 12;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  // Footer
  y += 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Thank you for your order!", 105, y, { align: "center" });

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
