
const nodemailer = require('nodemailer');

const getOrderStatusEmail = ({
    
    orderId,
    orderDate,
    status,
    orderItems,
    total,
    shippingInfo,
    _id
  },userName) => {
    const itemsRows = orderItems
      .map(
        (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.rate}</td>
            <td>₹${item.quantity * item.rate}</td>
          </tr>
        `
      )
      .join("");
  
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Order Status Update</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
        }
        .container {
          width: 90%;
          max-width: 600px;
          margin: auto;
          padding: 20px;
          border: 1px solid #e2e2e2;
          border-radius: 10px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          padding-bottom: 10px;
        }
        .order-status {
          background-color: #eef5ff;
          padding: 10px 15px;
          border-left: 5px solid #007bff;
          margin: 20px 0;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
        }
        .items-table th, .items-table td {
          padding: 8px;
          border: 1px solid #ddd;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #777;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🛒 Order Status Update</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Your order <strong>#${_id}</strong> placed on <strong>${orderDate}</strong> has been updated.</p>
        </div>
  
        <div class="order-status">
          <strong>Current Status:</strong> ${status}
        </div>
  
        <h3>Order Summary:</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
  
        <p><strong>Total Amount:</strong> ₹${total}</p>
  
        <h3>Shipping Info:</h3>
        <p>
          ${shippingInfo.address},<br />
          ${shippingInfo.city} - ${shippingInfo.pinCode}<br />
          Mobile: ${shippingInfo.mobileNumber}
        </p>
  
        <div class="footer">
          <p>Thank you for shopping with us!</p>
          <p>– Your Company Name</p>
        </div>
      </div>
    </body>
    </html>
    `;
  };



  const getLowStockEmail = ({ productName, currentStock, threshold, imageUrl }) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Low Stock Alert</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f5f7fa;
            color: #333;
          }
          .container {
            width: 90%;
            max-width: 600px;
            margin: auto;
            background-color: #fff;
            border: 1px solid #e1e1e1;
            border-radius: 10px;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding-bottom: 10px;
          }
          .alert {
            background-color: #fff3cd;
            padding: 10px 15px;
            border-left: 5px solid #ffc107;
            margin: 20px 0;
            font-weight: bold;
          }
          .product-info {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-top: 20px;
          }
          .product-info img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚠️ Low Stock Alert</h2>
          </div>
  
          <div class="alert">
            Attention: Stock for <strong>${productName}</strong> is running low!
          </div>
  
          <div class="product-info">
            <img src="${imageUrl}" alt="${productName}" getOrderStatusEmail/>
            <div>
              <p><strong>Product:</strong> ${productName}</p>
              <p><strong>Current Stock:</strong> ${currentStock}</p>
              <p><strong>Alert Threshold:</strong> ${threshold}</p>
            </div>
          </div>
  
          <p>Please restock this item soon to avoid going out of stock.</p>
  
          <div class="footer">
            <p>This is an automated notification. Please do not reply.</p>
            <p>– Inventory Management System</p>
          </div>
        </div>
      </body>
    </html>
    `;
  };
  

  

  
const sendStatusEmail = async (recipientEmail,OrderDetailsl,name) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            }

        })
// title, description, location, latitude, longitude, newStatus, updaterRole, fromEmail
        const emailcontent =getOrderStatusEmail(OrderDetailsl,name)

        await transporter.sendMail({
            from: process.env.SMPT_MAIL,
            to: recipientEmail,
            subject: 'Your order status updated',
            html: emailcontent
        })

        console.log(" email has been sent");

    } catch (error) {
        console.error('Error sending verification email:', error);
    }
}



const sendlowStockEmail = async (recipientEmail,products) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            }

        })
// title, description, location, latitude, longitude, newStatus, updaterRole, fromEmail

      const productdetails={
         productName:products.name,
         currentStock:products.stocks,
          threshold:"", 
          imageUrl:products.url
         }
        const emailcontent =getLowStockEmail(productdetails)

        await transporter.sendMail({
            from: process.env.SMPT_MAIL,
            to: recipientEmail,
            subject: "⚠️ Low Stock Alert",
            html: emailcontent
        })

        console.log(" email has been sent");

    } catch (error) {
        console.error('Error sending verification email:', error);
    }
}


const newProductLaunchEmail = (userName, product, categoryName = "General",image) => {
    const kgOptions = product.kilogramOption.map(kg => parseFloat(kg)).join(" kg, ") + " kg";
    const launchDate = new Date(product.date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #28a745;">🎉 New Product Launched!</h2>
        <p>Hi ${userName},</p>
  
        <p>We're thrilled to introduce a brand-new product to our store. Here's everything you need to know:</p>
  
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0; background-color: #f9f9f9;">
          <h3 style="margin-top: 0; color: #007bff;">${product.name}</h3>
          <img src="${image}" alt="${product.name}" style="max-width: 100%; height: auto; margin: 15px 0;" />
          
          <p><strong>Category:</strong> ${categoryName}</p>
          <p><strong>Price:</strong> ₹${product.rate}</p>
          <p><strong>Stock Available:</strong> ${product.stocks} units</p>
          <p><strong>Weight Options:</strong> ${kgOptions}</p>
          <p><strong>Launch Date:</strong> ${launchDate}</p>
          <p><strong>Total Reviews:</strong> ${product.numOfReviews}</p>
        </div>
  
        <p>Don't wait — explore this product and order now before it sells out!</p>
  
        <a href="https://your-store-url.com/products/${product._id}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Product</a>
  
        <p style="margin-top: 30px;">Happy Shopping!<br/>— Team TCF Grocery</p>
      </div>
    `;
  };




    
const sendEmaillaunchProduct = async (recipientEmail,name,product,categorie,image) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            }

        })
// title, description, location, latitude, longitude, newStatus, updaterRole, fromEmail
        const emailcontent =newProductLaunchEmail(name,product,categorie,image)

        await transporter.sendMail({
            from: process.env.SMPT_MAIL,
            to: recipientEmail,
            subject: '🎉  New Product Launched!',
            html: emailcontent
        })

        console.log("email has been sent");

    } catch (error) {
        console.error('Error sending verification email:', error);
    }
}
  





module.exports={sendStatusEmail,sendlowStockEmail,sendEmaillaunchProduct}
  

  