const Order = require('../model/order_model');
const Product = require("../model/product_model");
const Client = require('../model/client_model');
const { transporter } = require("../middleware/mailer");

const generateOrderConfirmationHTML = (order) => {
  const { _id, client_details, total_price, products } = order;
  const { client_phone, client_address } = client_details;
  const { city, street, building, apartment } = client_address;

  const productRows = products.map((product) => `
    <tr>
      <td><img src="${product.productId.product_image}" alt="${product.productName} style="width: 100px; height: 100px;"></td>
      <td>${product.productId.product_name}</td>
      <td>${product.RTP}</td>
      <td>${product.quantity}</td>
      <td>${product.RTP * product.quantity}</td>
    </tr>
  `).join('');

  return  `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 0; margin: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #fff; }
        .header { text-align: center; margin-bottom: 20px; }
        .content { margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f4f4f4; }
        .footer { text-align: right; }
        .thank-you { text-align: center; margin: 20px 0; font-size: 1.2em; color: #007bff; }
        .processing { text-align: center; margin: 20px 0; font-size: 1em; color: #ff0000; }
        @media (max-width: 600px) {
          .container { padding: 10px; }
          .table th, .table td { padding: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src=${process.env.LOGO} alt="Company Logo style="width: 200px; height: 2000px;">
          <h1>Order Confirmation</h1>
          <p>Order Number: ${_id}</p>
        </div>
        <div class="thank-you">
          <p>Thank you for your order!</p>
        </div>
        <div class="processing">
          <p>Your order is being processed.</p>
        </div>
        <div class="content">
          <h2>Client Details</h2>
          <p>Phone: ${client_phone}</p>
          <p>Address: ${city}, ${street}, ${building}, ${apartment}</p>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th >Image</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>
        <div class="footer">
          <p><strong>Total Price:</strong> $${total_price}</p>
        </div>
      </div>
    </body>
  </html>
`;
};

const sendOrderConfirmationEmail = async (recipientEmail, order) => {
  const mail = {
    from: process.env.MAILER_EMAIL,
    to: recipientEmail,
    subject: `Order Confirmation - Order #${order._id}`,
    html: generateOrderConfirmationHTML(order),
  };

  try {
    await transporter.sendMail(mail);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error occurred while sending email:', error);
  }
};

module.exports = {
  addOrder: async (req, res) => {
    try {
      console.log(req.body);
      const { products, clientId } = req.body;

      const clientExists = await Client.findById(clientId);
      if (!clientExists) {
        return res.status(400).json({ message: "Client not found", success: false });
      }

      // עדכון כמות המכירות והמלאי של כל מוצר
      for (const item of products) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product with id ${item.productId} not found`, success: false });
        }
        product.sales += item.quantity;

        await product.save();
      }

      console.log("i am in order");
      const order = new Order(req.body);
      console.log("order:", order);
      const savedOrder = await order.save();
      console.log("from mongo", savedOrder);

      const populatedOrder = await Order.findById(savedOrder._id).populate('clientId').populate({
        path: 'products.productId',
        model: 'Products',
        select: 'product_image product_name'
      });
      const clientEmail = populatedOrder.clientId.client_email;

      await sendOrderConfirmationEmail(clientEmail, populatedOrder);

      await Order.findByIdAndUpdate(savedOrder._id, { status: 1 });
      console.log("Order status updated to 1");

      return res.status(200).json({
        message: "Order successfully",
        success: true,
        order: savedOrder
      });
    } catch (error) {
      console.error('Order failed:', error);
      return res.status(500).json({
        message: "Order failed",
        success: false,
        error: error.message,
      });
    }
  },
    
    getOrder: async (req, res) => {
        try {
          
            const orders = await Order.find().populate('clientId').populate({
              path: 'products.productId',
              model: 'Products',
              select: 'product_image product_name product_price '
            }).populate('products');
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },updateStatus:async (req, res) => {
        try {
    
          const status = req.params.status;
          const id = req.body.id;
          console.log(id)
    
          await Order.findByIdAndUpdate(id,{status})
    
          return res.status(200).json({
            message: "successfully updated Status",
            success: true,
          });
        } catch (error) {
          return res.status(500).json({
            message: "error in update Status",
            success: false,
            error: error.message,
          });
        }
      },
}