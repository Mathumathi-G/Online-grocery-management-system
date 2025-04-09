import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import {
  Assignment,
  LocalShipping,
  CheckCircle,
  PictureAsPdf,
  FileDownload,
} from "@mui/icons-material";
import Header from "../../Components/Header/Header";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AgentDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchAgentOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:8000/api/delivery/agent/" + user._id
      );
      setOrders(data.orders);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching agent orders", err);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId) => {
    try {
      await axios.put(
        `http://localhost:8000/api/delivery/agent/order/${orderId}`,
        { oStatus: "Delivered" }
      );
      fetchAgentOrders();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  useEffect(() => {
    fetchAgentOrders();
  }, []);

  const totalOrders = orders?.length;
  const deliveredOrders = orders?.filter((o) => o.status === "Delivered").length;
  const inProgressOrders = totalOrders - deliveredOrders;

  const statusColors = {
    Processing: "warning",
    Packed: "info",
    Shipped: "primary",
    Delivered: "success",
  };

  const getNextStatus = (current) => {
    const steps = ["Processing", "Packed", "Shipped", "Delivered"];
    const index = steps.indexOf(current);
    return steps[index + 1] || "Delivered";
  };

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order._id.includes(searchQuery) ||
      `${order.user?.firstName} ${order.user?.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
    
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 20;
  
    const statusColors = {
      Processing: { r: 255, g: 193, b: 7 },   // warning (yellow)
      Packed:     { r: 3, g: 169, b: 244 },   // info (blue)
      Shipped:    { r: 63, g: 81, b: 181 },   // primary (indigo)
      Delivered:  { r: 76, g: 175, b: 80 },   // success (green)
    };
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(" Delivery Orders Report", 14, y);
    y += 10;
  
    filteredOrders.forEach((order, i) => {
      const boxHeight = 40;
      const boxPadding = 5;
  
      // Box background
      doc.setFillColor(245, 248, 255); // light background
      doc.roundedRect(10, y, 190, boxHeight, 4, 4, 'F');
  
      // Order Header
      doc.setFontSize(13);
      doc.setTextColor(33, 33, 33);
      doc.text(` Order #${i + 1}`, 14, y + 8);
  
      // Order Details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(` ID: ${order._id?.slice(0, 8)}...`, 14, y + 16);
      doc.text(` Customer: ${order.user || "N/A"}`, 14, y + 24);
      doc.text(` Items: ${order.orderItems?.length || 0}`, 110, y + 16);
      doc.text(` Date: ${order.orderDate?.slice(0, 10) || "N/A"}`, 110, y + 24);
  
      // Status Badge
      const color = statusColors[order.status] || { r: 158, g: 158, b: 158 }; // default grey
      doc.setFillColor(color.r, color.g, color.b);
      doc.setTextColor(255, 255, 255);
      doc.roundedRect(110, y + 28, 60, 8, 2, 2, 'F');
      doc.text(order.status || "Unknown", 115, y + 34);
  
      y += boxHeight + 10;
  
      // Auto page break
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  
    doc.save("orders_report.pdf");
  };
  
  const exportExcel = () => {
    const data = filteredOrders.map((order) => ({
      "Order ID": order._id,
      "Customer ID": `${order.user}`,
      Items: order.orderItems.length,
      Status: order.status,
      "Order Date": order.orderDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = { Sheets: { Orders: worksheet }, SheetNames: ["Orders"] };
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "orders_report.xlsx");
  };

  return (
    <>
      <Header />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Box sx={{ p: 7, display: "flex", flexDirection: "column", alignItems: "center", gap: "40px" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Delivery Agent Dashboard
        </Typography>

        {/* Summary */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  <Assignment /> Total Orders
                </Typography>
                <Typography variant="h4" color="primary">
                  {totalOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  <LocalShipping /> In Progress
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {inProgressOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  <CheckCircle /> Delivered
                </Typography>
                <Typography variant="h4" color="success.main">
                  {deliveredOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search & Filter */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <input
              type="text"
              placeholder="Search by Order ID or Customer Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              <option value="All">All Status</option>
              <option value="Processing">Processing</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </Grid>
          <Grid item xs={6} md={1.5}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={exportPDF}
              startIcon={<PictureAsPdf />}
            >
              PDF
            </Button>
          </Grid>
          <Grid item xs={6} md={1.5}>
            <Button
              fullWidth
              variant="outlined"
              color="success"
              onClick={exportExcel}
              startIcon={<FileDownload />}
            >
              Excel
            </Button>
          </Grid>
        </Grid>

        {/* Orders Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders?.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>#{order._id.slice(0, 6)}...</TableCell>
                  <TableCell>
                    {order.user?.firstName} {order.user?.lastName}
                  </TableCell>
                  <TableCell>{order.orderItems.length}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={statusColors[order.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{order.orderDate}</TableCell>
                  <TableCell>
                    {order.status !== "Delivered" && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => updateOrderStatus(order._id)}
                      >
                        Next: {getNextStatus(order.status)}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!filteredOrders?.length && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No orders assigned.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default AgentDashboard;
