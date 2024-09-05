require("dotenv").config();
const port = process.env.PORT;
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
// const Users = require("./models/Users");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// Database Connection With MongoDB
mongoose.connect(
  "mongodb+srv://susuresh158:Sucathy64@cluster0.0zlmegi.mongodb.net/e-commerce"
);
// paste your mongoDB Connection string above with password
// password should not contain '@' special character

const isAuthenticated = require("./middleware/auth");

app.use(express.json());

app.use("/protected", isAuthenticated, (req, res) => {
  res.send("Protected content");
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

/// otp

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;

////
// app.get("/accountdetails", fetchuser, async (req, res) => {
//   try {
//     const account = await Users.findOne({ _id: req.user.id });
//     if (!account) {
//       return res.status(404).json({ message: "Account not found" });
//     }
//     res.json(account);
//   } catch (error) {
//     console.error("Error fetching account:", error.message);
//     res.status(500).json({ message: "Failed to fetch account details" });
//   }
// });
// app.get("/orderdetails/:orderId", async (req, res) => {
//   try {
//     // Extract orderId from URL parameters
//     // const { orderId } = req.params.orderId;

//     const order = await Order.findOne({ _id: req.user.id });

//     if (!order) {
//       return res.status(404).json({
//         error: {
//           code: "NOT_FOUND_ERROR",
//           description: "Order not found.",
//         },
//       });
//     }

//     // Return the order details
//     res.status(200).json({
//       order: order,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// POST endpoint to create a new order and save it to MongoDB

// Image Storage Engine
const storage = multer.diskStorage({
  destination: path.join(__dirname, "upload/images"),
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.array("product", 6), (req, res) => {
  let imageUrls = req.files.map((file) => {
    return `http://3.86.217.225/images/${file.filename}`;
  });

  res.json({
    success: 1,
    image_url: imageUrls[0] || "",
    image2_url: imageUrls[1] || "",
    image3_url: imageUrls[2] || "",
    image4_url: imageUrls[3] || "",
    image5_url: imageUrls[4] || "",
    image6_url: imageUrls[5] || "",
  });
});
app.use("/images", express.static("upload/images"));

// for website

// const multer = require("multer");
// const path = require("path");
// const express = require("express");
// const app = express();

// Image Storage Engine for product images
const productStorage = multer.diskStorage({
  destination: path.join(__dirname, "upload/images"),
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const productUpload = multer({ storage: productStorage });

app.use(express.json()); // For parsing application/json

// Route for image upload
app.post("/website", productUpload.array("website", 6), (req, res) => {
  let imageUrls = req.files.map(
    (file) => `http://3.86.217.225/images/${file.filename}`
  );

  res.json({
    success: 1,
    webimage1_url: imageUrls[0] || "",
    webimage2_url: imageUrls[1] || "",
    webimage3_url: imageUrls[2] || "",
    webimage4_url: imageUrls[3] || "",
    webimage5_url: imageUrls[4] || "",
    webimage6_url: imageUrls[5] || "",
  });
});

app.use("/images", express.static("upload/images"));

///

// Setup multer storage engine
const sstorage = multer.diskStorage({
  destination: path.join(__dirname, "upload/images"),
  filename: (req, file, cb) => {
    // Use a fixed name "modle_image" and append the original file extension
    cb(null, `modle_image${path.extname(file.originalname)}`);
  },
});

const supload = multer({ storage: sstorage });

// Create an endpoint for image upload
app.post("/uploadeds", supload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }

  const imageUrl = `http://3.86.217.225/images/${req.file.filename}`;
  const modelUrl = `http://3.86.217.225/models/${req.file.filename}.glb`;

  res.json({
    success: 1,
    image_url: imageUrl,
    model_url: modelUrl,
  });
});

// Serve static files from the "upload/images" directory
app.use("/images", express.static(path.join(__dirname, "upload/images")));
app.use("/models", express.static(path.join(__dirname, "models")));
// const websiteUpload = multer({ storage: websiteStorage });

// app.post("/uploadWebsite", websiteUpload.single("screenshot"), (req, res) => {
//   const screenshotUrl = `http://3.86.217.225/website_screenshots/${req.file.filename}`;

//   res.json({
//     success: 1,
//     screenshot_url: screenshotUrl,
//   });
// });

// app.use("/website_screenshots", express.static("upload/website_screenshots"));

/// end for website

// Middleware to fetch user from database
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res
      .status(401)
      .send({ errors: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    return res
      .status(401)
      .send({ errors: "Please authenticate using a valid token" });
  }
};

const addressSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  lastName: {
    type: String,
  },
  updatedemail: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  gender: {
    type: String,
  },
  flatHouse: {
    type: String,
  },
  fullAddress: {
    type: String,
  },
  pinCode: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
});

const orderSchema = new mongoose.Schema({
  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  //   ref: "User",
  // },
  orderId: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
  },
  currency: {
    type: String,
  },
  receipt: {
    type: String,
  },
  paymentId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    default: "pending",
  },
  orderStatus: {
    likeOrder: { type: Boolean, default: false },
    status42: { type: Boolean, default: false },
    orderCameActive: { type: Boolean, default: false },
    deliveryOrder: { type: Boolean, default: false },
  },
  // orderStatus: {
  //   likeOrder: {
  //     type: Boolean,
  //     default: false,
  //   },
  //   status42: {
  //     type: Boolean,
  //     default: false,
  //   },
  //   orderCameActive: {
  //     type: Boolean,
  //     default: false,
  //   },
  //   deliveryOrder: {
  //     type: Boolean,
  //     default: false,
  //   },
  // },
  // items: [
  //   {
  //     name: { type: String, required: true },
  //     quantity: { type: Number, required: true },
  //     price: { type: Number, required: true },
  //   },
  // ],
  addresses: {
    type: [addressSchema],
    default: [],
  },
  shipping_address: {
    username: String,
    lastName: String,
    email: String,
    phoneNumber: String,
    flatHouse: String,
    fullAddress: String,
    pinCode: String,
    state: String,
    city: String,
  },
  products: [
    {
      productId: { type: String, required: true },
      // productimg: { type: String, required: true },
      // name: { type: String, required: true },
      quantity: { type: String },
      image: { type: String },
      // price: { type: Number, required: true },
    },
  ],
  address: addressSchema,
  orderDate: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  orderId: {
    type: String,
  },
  amount: {
    type: String,
  },
  currency: {
    type: String,
  },
  receipt: {
    type: String,
  },
  paymentId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    default: "pending",
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  addresses: {
    type: [addressSchema],
    default: [],
  },

  shipping_address: {
    username: String,
    lastName: String,
    email: String,
    phoneNumber: String,
    flatHouse: String,
    fullAddress: String,
    pinCode: String,
    state: String,
    city: String,
  },
  // address: addressSchema,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model("Admin", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  username: {
    type: String,
  },
  lastName: {
    type: String,
  },
  updatedemail: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  gender: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  flatHouse: {
    type: String,
  },
  fullAddress: {
    type: String,
  },
  pinCode: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  addresses: {
    type: [addressSchema],
    default: [],
  },
  orders: {
    type: [orderSchema],
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
// Schema for creating user model
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },

  // newPassword: {
  //   type: String,
  // },
  addresses: {
    type: [otpSchema],
    default: [],
  },
  username: {
    type: String,
  },
  lastName: {
    type: String,
  },
  updatedemail: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  gender: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  flatHouse: {
    type: String,
  },
  fullAddress: {
    type: String,
  },
  pinCode: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  addresses: {
    type: [addressSchema],
    default: [],
  },
  orders: [orderSchema],
  ////
  // orderId: {
  //   type: String,
  // },
  amount: {
    type: String,
  },
  currency: {
    type: String,
  },
  receipt: {
    type: String,
  },
  paymentId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    default: "pending",
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  addresses: {
    type: [addressSchema],
    default: [],
  },
  shipping_address: {
    username: String,
    lastName: String,
    email: String,
    phoneNumber: String,
    flatHouse: String,
    fullAddress: String,
    pinCode: String,
    state: String,
    city: String,
  },
  // address: addressSchema,
  created_at: {
    type: Date,
    default: Date.now,
  },

  // end order
  date: {
    type: Date,
    default: Date.now,
  },
});

// Schema for creating Product
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  image2: {
    type: String,
    required: true,
  },
  image3: {
    type: String,
    required: true,
  },
  image4: {
    type: String,
    required: true,
  },
  image5: {
    type: String,
    required: true,
  },
  image6: {
    type: String,
    required: true,
  },
  size: {
    s: String,
    m: String,
    xl: String,
    xll: String,
  },
  category: {
    type: String,
  },
  new_price: {
    type: Number,
  },
  old_price: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  avilable: {
    type: Boolean,
    default: true,
  },
  descriptions: {
    type: String,
    required: true,
  },
});

// Schema for creating Product
const Website = mongoose.model("Website", {
  id: {
    type: Number,
    required: true,
  },
  webname: {
    type: String,
    required: true,
  },
  webimage1: {
    type: String,
    required: true,
  },
  webimage2: {
    type: String,
    required: true,
  },
  webimage3: {
    type: String,
    required: true,
  },
  webimage4: {
    type: String,
    required: true,
  },
  webimage5: {
    type: String,
    required: true,
  },
  webimage6: {
    type: String,
    required: true,
  },
  webcategory: {
    type: String,
  },
  webnew_price: {
    type: Number,
  },
  webold_price: {
    type: Number,
  },
  webdate: {
    type: Date,
    default: Date.now,
  },
  avilable: {
    type: Boolean,
    default: true,
  },
  newtags: {
    type: String,
  },
  webdescriptions: {
    type: String,
    // required: true,
  },
});

app.get("/", (req, res) => {
  res.send("Root");
});

///

app.post("/save-avatar", (req, res) => {
  const { userId, avatarData } = req.body;

  // Save avatar data to the database or file storage
  // Example: database.saveAvatar(userId, avatarData);

  res.status(200).send("Avatar saved successfully");
});

///

app.post("/updateOrderStatus", async (req, res) => {
  console.log("Received request to update order status");

  try {
    // Extracting data from the request body
    const { userId, orderId, orderStatus } = req.body;
    console.log("Request body:", { userId, orderId, orderStatus });

    // Fetch the user from the database using the ID
    const user = await Users.findById(userId).select("orders");
    console.log("Fetching user by ID:", userId);

    if (!user) {
      console.log("User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Find the order within the user's orders
    console.log("Searching for order with orderId:", orderId);
    const order = user.orders.find((order) => order.orderId === orderId);

    if (!order) {
      console.log("Order not found for orderId:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the order status in the database
    console.log("Order found. Updating order status...");
    order.orderStatus = {
      ...order.orderStatus,
      ...orderStatus, // Merge the new status with the existing status
    };

    // Save the updated user document
    await user.save();

    console.log("Order status updated successfully:", order.orderStatus);

    // Return the updated order status to the client
    res.json({
      message: "Order status updated successfully",
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

app.get("/allOrders", async (req, res) => {
  try {
    const orders = await Users.find({});
    console.log("All orders:", orders);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get("/orderdetails/:orderId", fetchuser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("orders");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const order = user.orders.find(
      (order) => order.orderId === req.params.orderId
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Error fetching order details:", error.message);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
});

//
/// getting all user details
app.get("/allusers", async (req, res) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post("/removeuser", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.body.id);
    res.status(200).send("User removed");
  } catch (err) {
    res.status(500).send(err);
  }
});

/// ending all user details
/// for order /////

/// end for order ///
// Route to fetch order details based on orderId
// app.get("/orderdetails", fetchuser, async (req, res) => {
//   try {
//     const { orderId } = req.query; // Get the orderId from query parameters

//     if (!orderId) {
//       return res.status(400).json({ message: "Order ID is required" });
//     }

//     // Find order(s) with the given orderId
//     const orders = await Order.find({ orderId: orderId });

//     if (!orders || orders.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No orders found for this order ID" });
//     }

//     res.json(orders);
//   } catch (error) {
//     console.error("Error fetching order details:", error.message);
//     res.status(500).json({ message: "Failed to fetch order details" });
//   }
// });

// app.get("/orderdetails", fetchuser, async (req, res) => {
//   try {
//     console.log("Fetching orders for user ID:", req.user.id); // Log user ID
//     const orders = await Users.find({ userId: req.user.id });
//     // const account = await Users.findOne({ _id: req.user.id });
//     if (!orders || orders.length === 0) {
//       console.log("No orders found for user ID:", req.user.id); // Log if no orders found
//       return res.status(404).json({ message: "No orders found for this user" });
//     }
//     res.json(orders);
//   } catch (error) {
//     console.error("Error fetching orders:", error.message);
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// });

app.post("/adminlogin", async (req, res) => {
  console.log("Admin Login");
  let success = false;
  let user = await Admin.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      success = true;
      console.log(user.id);
      const token = jwt.sign(data, "secret_ecom");
      return res.json({ success, token });
    } else {
      return res.status(400).json({
        success: success,
        errors: "please try with correct email/password",
      });
    }
  } else {
    return res.status(400).json({
      success: success,
      errors: "please try with correct email/password",
    });
  }
});

//Create an endpoint at ip/auth for registering the user in the database & sending token
app.post("/adminsignup", async (req, res) => {
  console.log("Admin Sign Up");
  let success = false;
  let check = await Admin.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({
      success: success,
      errors: "existing user found with this email",
    });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Admin({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });
  await user.save();
  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, "secret_ecom");
  success = true;
  return res.json({ success, token });
});

//Create an endpoint at ip/login for login the user and giving auth-token
app.post("/login", async (req, res) => {
  console.log("Login");
  let success = false;
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      success = true;
      console.log(user.id);
      const token = jwt.sign(data, "secret_ecom");
      return res.json({ success, token });
    } else {
      return res.status(400).json({
        success: success,
        errors: "please try with correct email/password",
      });
    }
  } else {
    return res.status(400).json({
      success: success,
      errors: "please try with correct email/password",
    });
  }
});

///

app.post("/order", fetchuser, async (req, res) => {
  try {
    const { amount, currency, receipt, products, shipping_address } = req.body;

    // Check if the amount exceeds the Razorpay limit
    const maxAmount = 10000000000000; // 100,000 INR in paise
    if (amount > maxAmount) {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST_ERROR",
          description: "Amount exceeds maximum amount allowed.",
        },
      });
    }

    // Create Razorpay order
    const razorpayOptions = {
      amount: amount, // amount in smallest currency unit (e.g., paise for INR)
      currency: currency || "INR",
      receipt: receipt,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(razorpayOptions);

    if (!razorpayOrder) {
      throw new Error("Failed to create Razorpay order");
    }

    // Find the authenticated user
    const user = await Users.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create new Order document
    const newOrder = {
      orderId: razorpayOrder.id,
      amount: amount,
      currency: currency,
      receipt: receipt,
      products: products,
      shipping_address: shipping_address,
    };

    // Add the new order to the user's orders array
    user.orders.push(newOrder);
    await user.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
      razorpayOrder: razorpayOrder,
    });
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// Import models

app.post("/order/validate", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shipping_address,
      products,
    } = req.body;

    // Log received data for debugging
    console.log("Received /order/validate request:", req.body);

    // Check for missing required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the user with the specific order
    const user = await Users.findOne({
      "orders.orderId": razorpay_order_id,
    });

    if (!user) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Find the specific order in the user's orders array
    const order = user.orders.find(
      (order) => order.orderId === razorpay_order_id
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Validate payment signature
    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      return res.status(400).json({ msg: "Transaction is not legit!" });
    }

    // Update order with payment ID and status
    order.paymentId = razorpay_payment_id;
    order.paymentStatus = "paid";
    order.shipping_address = shipping_address;
    order.product = products; // Assuming the payment is successful

    // Save updated order status
    await user.save();
    console.log("Payment validated successfully");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);
    res.json({
      msg: "success",
      // orderId: razorpay_order_id,
      // paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error("Error validating payment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch Orders by User ID
app.get("/orderdetails", fetchuser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select("orders");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ orders: user.orders });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});
/// end order

// Update user account details

app.post("/account", fetchuser, async (req, res) => {
  try {
    const { username, lastName, updatedemail, phoneNumber, gender } = req.body;
    const updatedUser = await Users.findOneAndUpdate(
      { _id: req.user.id },
      { username, lastName, updatedemail, phoneNumber, gender },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      message: "Account details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating account details:", error.message);
    res.status(500).json({ error: "Failed to update account details" });
  }
});

app.get("/accountdetails", fetchuser, async (req, res) => {
  try {
    const account = await Users.findOne({ _id: req.user.id });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(account);
  } catch (error) {
    console.error("Error fetching account:", error.message);
    res.status(500).json({ message: "Failed to fetch account details" });
  }
});

app.post("/address", fetchuser, async (req, res) => {
  try {
    const {
      username,
      lastName,
      updatedemail,
      phoneNumber,
      gender,
      flatHouse,
      fullAddress,
      pinCode,
      state,
      city,
    } = req.body;

    const user = await Users.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.addresses.length >= 4) {
      return res.status(400).json({ error: "Maximum of 4 addresses allowed" });
    }

    const newAddress = {
      username,
      lastName,
      updatedemail,
      phoneNumber,
      gender,
      flatHouse,
      fullAddress,
      pinCode,
      state,
      city,
    };

    user.addresses.push(newAddress);
    await user.save();

    return res.json({
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error adding address:", error.message);
    res.status(500).json({ error: "Failed to add address" });
  }
});
app.delete("/address/:addressId", fetchuser, async (req, res) => {
  try {
    const user = await Users.findOneAndUpdate(
      { _id: req.user.id },
      { $pull: { addresses: { _id: req.params.addressId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Address deleted successfully", user });
  } catch (error) {
    console.error("Error deleting address:", error.message);
    res.status(500).json({ error: "Failed to delete address" });
  }
});
app.post("/shippingdetails", fetchuser, async (req, res) => {
  try {
    const { address } = req.body;

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newOrder = {
      address,
      orderDate: new Date(),
    };

    user.orders.push(newOrder);
    await user.save();

    res.json({
      message: "Shipping details saved successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error saving shipping details:", error.message);
    res.status(500).json({ error: "Failed to save shipping details" });
  }
});
// app.post("/address", fetchuser, async (req, res) => {
//   try {
//     const {
//       username,
//       lastName,
//       updatedemail,
//       phoneNumber,
//       gender,
//       flatHouse,
//       fullAddress,
//       pinCode,
//       state,
//       city,
//     } = req.body;
//     const updatedUser = await Users.findOneAndUpdate(
//       { _id: req.user.id },
//       {
//         username,
//         lastName,
//         updatedemail,
//         phoneNumber,
//         gender,
//         flatHouse,
//         fullAddress,
//         pinCode,
//         state,
//         city,
//       },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     return res.json({
//       message: "address details updated successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Error address account details:", error.message);
//     res.status(500).json({ error: "Failed to update account details" });
//   }
// });

app.get("/addressdetails", fetchuser, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error.message);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
});

// app.get("/addressdetails", fetchuser, async (req, res) => {
//   try {
//     const account = await Users.findOne({ _id: req.user.id });

//     if (!account) {
//       return res.status(404).json({ message: "Account not found" });
//     }
//     res.json(account);
//   } catch (error) {
//     console.error("Error fetching account:", error.message);
//     res.status(500).json({ message: "Failed to fetch account details" });
//   }
// });

//Create an endpoint at ip/auth for registering the user in the database & sending token

app.post("/signup", async (req, res) => {
  console.log("Sign Up");
  let success = false;
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({
      success: success,
      errors: "existing user found with this email",
    });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });
  await user.save();
  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, "secret_ecom");
  success = true;
  return res.json({ success, token });
});

app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products");
  res.send(products);
});

app.get("/allwebproducts", async (req, res) => {
  try {
    const websites = await Website.find({});
    console.log("All Products");
    res.json(websites); // Ensure that this sends the right data structure
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
// Adjusting error handling in backend code

const nodemailer = require("nodemailer");

// Ensure this is the correct path to your OTPs model
// Ensure this is the correct path to your Users model
const dotenv = require("dotenv");

dotenv.config();

app.use(express.json());

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

app.post("/requestotp", async (req, res) => {
  console.log("Request OTP");
  let success = false;

  try {
    let user = await Users.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        success: success,
        errors: "No user found with this email",
      });
    }

    const otp = generateOTP();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpEntry = new OTP({
      email: user.email,
      otp: otpHash,
      expiresAt: Date.now() + 3600000, // OTP expires in 1 hour
    });
    await otpEntry.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          success: success,
          errors: "Error sending email",
        });
      } else {
        success = true;
        return res.json({
          success: success,
          message: "OTP sent to your email",
        });
      }
    });
  } catch (error) {
    console.error("Error in request OTP:", error);
    return res.status(500).json({
      success: success,
      errors: "Internal server error",
    });
  }
});

app.post("/resetpassword", async (req, res) => {
  let success = false;
  try {
    const { email, otp, password } = req.body;

    // Check if the OTP exists and is valid
    const otpEntry = await OTP.findOne({
      email: email,
      otp: crypto.createHash("sha256").update(otp).digest("hex"),
    });

    if (!otpEntry || otpEntry.expiresAt < Date.now()) {
      return res.status(400).json({
        success,
        errors: "OTP expired or invalid",
      });
    }

    // Find user and update password
    const user = await Users.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success,
        errors: "No user found with this email",
      });
    }
    // const bcrypt = require("bcrypt");
    // // Hash the new password and update
    // const hashedPassword = await bcrypt.hash(password, 10);
    user.password = password;
    await user.save();

    // Optionally, remove the OTP after successful reset
    await OTP.deleteOne({ email: email });

    success = true;
    return res.json({
      success,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Error in reset password:", error);
    return res.status(500).json({
      success,
      errors: "Internal server error",
    });
  }
});
app.get("/users/:id", async (req, res) => {
  const userId = req.params.id; // Extract userId from URL params
  try {
    const user = await Users.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`User with ID ${userId} fetched successfully`);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/newcollections", async (req, res) => {
  try {
    // Fetch all products
    const products = await Product.find({});

    // Slice the products array to get the latest 20 items (excluding the first one)
    const arr = products.slice(1).slice(-20);

    console.log("New Collections fetched successfully");

    // Send the sliced array as the response
    res.json(arr);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    // Send a 500 status code with an error message
    res.status(500).send("Error fetching new collections");
  }
});

app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({});
  let arr = products.splice(0, 8);
  console.log("Popular In Women");
  res.send(arr);
});

app.get("/popularinmen", async (req, res) => {
  try {
    let products = await Product.find({ category: "men" }); // Ensure you're filtering by category
    let arr = products.splice(0, 8); // Get the top 8 products
    console.log("Popular In men");
    res.send(arr); // Send the array to the frontend
  } catch (error) {
    console.error("Error fetching popular men products:", error);
    res.status(500).send("Server error");
  }
});

//Create an endpoint for saving the product in cart
app.post("/addtocart", fetchuser, async (req, res) => {
  console.log("Add Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Added");
});

//Create an endpoint for removing the product from cart
app.post("/removefromcart", fetchuser, async (req, res) => {
  console.log("Remove Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] != 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Removed");
});
app.post("/clearcart", fetchuser, async (req, res) => {
  console.log("Clear Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData = {}; // Clear the cart by setting it to an empty object
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Cart Cleared");
});
//Create an endpoint for getting the user's cart data
app.post("/getcart", fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

// app.post("/account", async (req, res)=>{
//   let userData = await Users.findOne({ _id: req.user.id });
//   if userData.account
// })
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    image2: req.body.image2,
    image3: req.body.image3,
    image4: req.body.image4,
    image5: req.body.image5,
    image6: req.body.image6,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
    descriptions: req.body.descriptions,
  });
  console.log(product);
  await product.save();
  console.log("Saved");
  res.json({ success: true, name: req.body.name });
});

// for website

app.post("/addwebsite", async (req, res) => {
  let websites = await Website.find({});
  let id;
  if (websites.length > 0) {
    let last_website_array = websites.slice(-1);
    let last_website = last_website_array[0];
    id = last_website.id + 1;
  } else {
    id = 1;
  }
  const website = new Website({
    id: id,
    webname: req.body.webname,
    webimage1: req.body.webimage1,
    webimage2: req.body.webimage2,
    webimage3: req.body.webimage3,
    webimage4: req.body.webimage4,
    webimage5: req.body.webimage5,
    webimage6: req.body.webimage6,
    category: req.body.category,
    webnew_price: req.body.webnew_price,
    webold_price: req.body.webold_price,
    webcategory: req.body.webcategory,
    webtags: req.body.webtags,
    webdescriptions: req.body.webdescriptions,
  });
  console.log(website);
  await website.save();
  console.log("Saved");
  res.json({ success: true, webname: req.body.webname });
});

//
app.post("/removeproduct", async (req, res) => {
  const product = await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name });
});

app.post("/removeproducts", async (req, res) => {
  const website = await Website.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name });
});

app.listen(port, (error) => {
  if (!error) console.log("Server Running on port " + port);
  else console.log("Error : ", error);
});
