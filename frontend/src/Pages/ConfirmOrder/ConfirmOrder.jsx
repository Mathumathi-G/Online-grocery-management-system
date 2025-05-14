import React, { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../Components/Footer/Footer";
import Header from "../../Components/Header/Header";
import { useSelector } from "react-redux";
import "./ConfirmOrder.css";
import axios from "axios";
import Loader from "../../Components/Loader/Loader";
import OrderPlace from "../OrderPlace/OrderPlace";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";

const ConfirmOrder = ({ shippingInfo }) => {
  const { user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.userCart);

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.rate * item.quantity,
    0
  );

  document.title = "Confirm Order";

  const [orderLoading, setOrderLoading] = useState(false);
  const [isOrderPlace, setIsOrderPlace] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentModeDialog, setPaymentModeDialog] = useState(false);
const [selectedPaymentMode, setSelectedPaymentMode] = useState(""); // "cod" or "online"


  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardType: "Visa",
  });

  const handleInputChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const validateCard = () => {
    const { cardNumber, expiry, cvv } = cardDetails;

    const cardRegex = /^\d{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3}$/;

    if (!cardRegex.test(cardNumber)) {
      alert("Invalid card number");
      return false;
    }
    if (!expiryRegex.test(expiry)) {
      alert("Invalid expiry date (MM/YY)");
      return false;
    }
    if (!cvvRegex.test(cvv)) {
      alert("Invalid CVV");
      return false;
    }

    return true;
  };

  const autoGenerateCard = () => {
    const prefix = cardDetails.cardType === "Visa" ? "4" : "5";
    const randomDigits = () =>
      Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join("");
    setCardDetails({
      ...cardDetails,
      cardNumber: prefix + randomDigits().slice(0, 15),
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      expiry: "12/26",
    });
  };

const handlePaymentSubmit = async (mode = "online") => {
  if (mode === "online" && !validateCard()) return;

  try {
    setOrderLoading(true);
    setOpenPaymentModal(false);

    const { data } = await axios.post(`/api/user/new/order`, {
      cartItems,
      shippingInfo,
      userId: user._id,
      total: subTotal,
      paymentMode: mode,
    });

    setIsOrderPlace(true);
  } catch (error) {
    alert(error?.response?.data?.message || "Order failed");
  } finally {
    setOrderLoading(false);
  }
};


  return (
    <>
      {isOrderPlace ? (
        <OrderPlace />
      ) : (
        <>
          <Header />
          {orderLoading ? (
            <Loader LoadingName={"Placing Order"} />
          ) : (
            <>
              {cartItems.length !== 0 && shippingInfo && user ? (
                <div className="confirm-order-section">
                  <div className="order-summary-section">
                    <h1>Order Summary</h1>
                    <div className="product-summary">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.map((product, i) => (
                            <tr key={i}>
                              <td>{product.name}</td>
                              <td>{product.quantity} Kg</td>
                              <td>₹ {product.rate}</td>
                              <td>
                                ₹ {product.quantity * product.rate}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="shipping-details-summary">
                      <h1>Shipping Info</h1>
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Address</th>
                            <th>City</th>
                            <th>Pin Code</th>
                            <th>Mobile Number</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{user.firstName + " " + user.lastName}</td>
                            <td>{shippingInfo.address}</td>
                            <td>{shippingInfo.city}</td>
                            <td>{shippingInfo.pinCode}</td>
                            <td>{shippingInfo.mobileNumber}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="payment-summary">
                      <h6>Subtotal: <span>₹ {subTotal}</span></h6>
                      <h6 className="free-shipping">Free Shipping For You</h6>
                      <h6 className="total">Total: <span>₹ {subTotal}</span></h6>
                    </div>

                    <div className="confirm-order-btn">
                      <button
                        className="cOrder"
                        onClick={() => setPaymentModeDialog(true)}
                      >
                        Confirm Order
                      </button>
                      <Link to="/Order/Checkout">
                        <button>Cancel Order</button>
                      </Link>
                    </div>

                  </div>
                </div>
              ) : (
                ""
              )}
            </>
          )}
          <Footer />
        </>
      )}

      {/* Payment Modal */}
      <Dialog open={openPaymentModal} onClose={() => setOpenPaymentModal(false)}>
        <DialogTitle>Enter Card Details</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Card Number"
            name="cardNumber"
            value={cardDetails.cardNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // Only digits
              if (value.length <= 16) {
                setCardDetails({ ...cardDetails, cardNumber: value });
              }
            }}
            margin="normal"
            inputProps={{ maxLength: 16 }}
          />

          <TextField
            fullWidth
            label="Expiry (MM/YY)"
            name="expiry"
            value={cardDetails.expiry}
            onChange={(e) => {
              let value = e.target.value.replace(/[^\d]/g, "");
              if (value.length >= 3) {
                value = value.slice(0, 2) + "/" + value.slice(2, 4);
              }
              if (value.length <= 5) {
                setCardDetails({ ...cardDetails, expiry: value });
              }
            }}
            margin="normal"
            placeholder="MM/YY"
          />

          <TextField
            fullWidth
            label="CVV"
            name="cvv"
            value={cardDetails.cvv}
            onChange={handleInputChange}
            margin="normal"
            type="password"
          />
          <TextField
            fullWidth
            select
            label="Card Type"
            name="cardType"
            value={cardDetails.cardType}
            onChange={handleInputChange}
            margin="normal"
          >
            <MenuItem value="Visa">Visa</MenuItem>
            <MenuItem value="MasterCard">MasterCard</MenuItem>
          </TextField>
          <Button onClick={autoGenerateCard} style={{ marginTop: 10 }}>
            Auto Fill Dummy Card
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentModal(false)}>Cancel</Button>
          <Button onClick={handlePaymentSubmit} variant="contained" color="primary">
            Pay & Place Order
          </Button>
        </DialogActions>
      </Dialog>

      {/*  */}

      <Dialog open={paymentModeDialog} onClose={() => setPaymentModeDialog(false)}>
        <DialogTitle>Select Payment Mode</DialogTitle>
        <DialogContent>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setSelectedPaymentMode("cod");
              setPaymentModeDialog(false);
              handlePaymentSubmit("cod");
            }}
            style={{ marginBottom: "10px" }}
          >
            Cash On Delivery
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              setSelectedPaymentMode("online");
              setPaymentModeDialog(false);
              setOpenPaymentModal(true); // Open card modal
            }}
          >
            Online Payment
          </Button>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default ConfirmOrder;
