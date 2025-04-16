//Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/.env" });
}

const cloudinary = require("cloudinary");
const expressFileUpload = require("express-fileupload");
const express = require("express");
const app = express();
const path = require("path");
const cors = require('cors');
app.use(cors());
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connectDB = require("./Config/connection");
const userRoutes = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const { lowstockcontroller } = require("./Controllers/productController");

//Body Parser
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));

//Cookies Parser
app.use(cookieParser());

//Database Connect
connectDB();
//JSON
app.use(express.json());

//Use Express File Upload
app.use(expressFileUpload());

//Config Cloudniary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET_KEY,
});

app.listen(process.env.PORT, "localHost", () => {
  console.log(`Server Running At http://localhost:${process.env.PORT}`);
});

//Load Route
app.use("/api/user", userRoutes);
// http://localhost:8000/api/user/agent/register
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/recommendation", require("./routes/smartrecomendation"));
app.use("/api/delivery",require("./routes/agentroutes"))


// http://localhost:8000/api/delivery/agent/order/67f29502517f9ad60071a7be


//Access Front End Static Files
app.use(express.static(path.join(__dirname, "../frontend/build")));


//Access Front End All URL
app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});
