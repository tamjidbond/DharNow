const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');
const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your gmail
    pass: process.env.EMAIL_PASS  // Your 16-character App Password
  }
});

// This function connects to the DB and keeps the connection open
async function startServer() {
  try {
    await client.connect();
    db = client.db("DharLink");
    console.log("✅ Successfully connected to MongoDB!");

    // Start the server only AFTER the DB is connected
    const PORT = 8000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
  }
}
// Change from 10mb to 50mb
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// --- AUTH ROUTES (EMAIL OTP) ---

app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Store OTP in DB (expires in 5 mins)
    await db.collection("otps").updateOne(
      { email },
      { $set: { otp, createdAt: new Date() } },
      { upsert: true }
    );

    await transporter.sendMail({
      from: '"DharNow" <noreply@dharlink.com>',
      to: email,
      subject: "Your Verification Code",
      html: `<div style="font-family:sans-serif; padding:20px;">
              <h2>DharLink Verification</h2>
              <p>Your 6-digit code is: <b style="font-size:24px; color:#4f46e5;">${otp}</b></p>
             </div>`
    });

    res.json({ message: "OTP Sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await db.collection("otps").findOne({ email, otp });
    if (!record) return res.status(400).json({ success: false, message: "Invalid OTP" });

    // Check if user exists
    const user = await db.collection("users").findOne({ email: email });

    // Delete OTP after use
    await db.collection("otps").deleteOne({ email });

    res.json({ success: true, newUser: !user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.get('/', (req, res) => {
  res.send("DharLink Server is Live and Open!");
});

app.get('/api/items/all', async (req, res) => {
  try {
    const items = await db.collection("items").find({}).toArray();
    // Convert GeoJSON to [lat, lng] for frontend display if needed
    const formattedItems = items.map(item => ({
      ...item,
      // Leaflet uses [latitude, longitude], MongoDB uses [longitude, latitude]
      coordinates: item.location ? [item.location.coordinates[1], item.location.coordinates[0]] : [23.8103, 90.4125] // Default if no location
    }));
    res.json(formattedItems);
  } catch (err) {
    res.status(500).send("Error fetching items: " + err.message);
  }
});



// 1. Get all items listed by a specific user
app.get('/api/items/user/:uid', async (req, res) => {
  try {
    const items = await db.collection("items").find({ lentBy: req.params.uid }).toArray();
    res.json(items);
  } catch (err) { res.status(500).send(err.message); }
});

// GET: Requests received by the Owner (Incoming)
app.get('/api/requests/owner/:email', async (req, res) => {
  try {
    const requests = await db.collection("requests")
      .find({ lenderEmail: req.params.email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Requests sent by the Borrower (My Borrowing)
app.get('/api/requests/borrower/:email', async (req, res) => {
  try {
    const requests = await db.collection("requests")
      .find({ borrowerEmail: req.params.email })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






app.get('/api/users/profile/:uid', async (req, res) => {
  try {
    const user = await db.collection("users").findOne({ firebaseUid: req.params.uid });

    if (user) {
      return res.status(200).json(user);
    } else {
      // Send a clean 404. Do not send a string, send a small JSON object.
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});


app.get('/api/users/profile-by-email/:email', async (req, res) => {
  const user = await db.collection("users").findOne({ email: req.params.email });
  res.json(user);
});

app.patch('/api/users/update/:email', async (req, res) => {
  const { name, address, phone } = req.body;
  await db.collection("users").updateOne(
    { email: req.params.email },
    { $set: { name, address, phone } }
  );
  res.json({ message: "Updated" });
});



// --- GET SINGLE ITEM WITH OWNER DETAILS ---
// GET: Single item details with owner info
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await db.collection("items").findOne({ _id: new ObjectId(req.params.id) });

    if (!item) return res.status(404).json({ message: "Item not found" });

    // MANUALLY FETCH THE OWNER DATA
    const owner = await db.collection("users").findOne(
      { email: item.lentBy },
      { projection: { name: 1, phone: 1, address: 1, createdAt: 1 } }
    );

    res.json({ item, owner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create a borrow request
app.post('/api/requests/create', async (req, res) => {
  try {
    // 1. Get borrowerPhone from the body
    const { itemId, lenderEmail, borrowerEmail, borrowerPhone, message } = req.body;

    const item = await db.collection("items").findOne({ _id: new ObjectId(itemId) });

    const newRequest = {
      itemId: new ObjectId(itemId),
      itemTitle: item ? item.title : "Unknown Item",
      lenderEmail,
      borrowerEmail,
      borrowerPhone, // SAVING IT HERE
      message,
      status: 'pending',
      createdAt: new Date()
    };

    await db.collection("requests").insertOne(newRequest);
    res.status(201).json({ message: "Request sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items/add', async (req, res) => {
  try {
    // FIX: Added 'price' and 'priceType' to this list below
    const { title, description, category, price, priceType, phone, address, image, coordinates, lentBy } = req.body;

    const newItem = {
      title,
      description,
      category,
      price: Number(price), // Ensure it is a number
      priceType,
      phone,
      address,
      image,
      lentBy,
      status: 'available',
      location: {
        type: 'Point',
        coordinates: coordinates
      },
      createdAt: new Date()
    };

    await db.collection("items").insertOne(newItem);
    res.status(201).json({ message: "Item added successfully" });
  } catch (err) {
    console.error("Backend Error:", err); // This helps you see the error in your terminal
    res.status(500).json({ error: err.message });
  }
});


// PATCH: Approve a request AND Mark Item as Booked
app.patch('/api/requests/approve/:id', async (req, res) => {
  try {
    const requestId = new ObjectId(req.params.id);

    // 1. Find the request
    const request = await db.collection("requests").findOne({ _id: requestId });
    if (!request) return res.status(404).json({ message: "Request not found" });

    console.log("Approving request for Item ID:", request.itemId);

    // 2. Update Request status
    await db.collection("requests").updateOne(
      { _id: requestId },
      { $set: { status: 'approved' } }
    );

    // 3. Update Item status (CRITICAL: Ensure request.itemId is treated as ObjectId)
    const itemUpdate = await db.collection("items").updateOne(
      { _id: new ObjectId(request.itemId) },
      { $set: { status: 'booked' } }
    );

    console.log("Item update result:", itemUpdate.modifiedCount);
    res.json({ message: "Item status is now Booked" });
  } catch (err) {
    console.error("Approve Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Complete a return AND Mark Item as Available
app.patch('/api/requests/complete/:id', async (req, res) => {
  try {
    const requestId = new ObjectId(req.params.id);
    const request = await db.collection("requests").findOne({ _id: requestId });

    if (!request) return res.status(404).json({ message: "Request not found" });

    // 1. Update Request
    await db.collection("requests").updateOne(
      { _id: requestId },
      { $set: { status: 'completed' } }
    );

    // 2. Update Item back to available
    await db.collection("items").updateOne(
      { _id: new ObjectId(request.itemId) },
      { $set: { status: 'available' } }
    );

    res.json({ message: "Item is now Available" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Get all users for admin
app.get('/api/admin/all-users', async (req, res) => {
  const users = await db.collection("users").find({}).toArray();
  res.json(users);
});



// --- ADMIN INTELLIGENCE ENDPOINT ---
app.get('/api/admin/dashboard-intelligence', async (req, res) => {
  try {
    // 1. Real Category Data for the Pie Chart
    // Groups items by category and counts them
    const categoryStats = await db.collection("items").aggregate([
      { $group: { _id: "$category", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]).toArray();

    // 2. Real Monthly Growth for the Area Chart
    // Tracks listing activity over time
    const growthStats = await db.collection("items").aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%b", date: "$_id" } }, // Uses ObjectId timestamp
          items: { $sum: 1 },
          firstId: { $min: "$_id" }
        }
      },
      { $sort: { firstId: 1 } },
      { $project: { name: "$_id", items: 1, _id: 0 } }
    ]).toArray();

    // 3. Security Analysis: Detect Unreturned Items
    // Finds users who have more than 2 'pending' borrow requests
    const highRiskUsers = await db.collection("users").aggregate([
      {
        $lookup: {
          from: "requests",
          localField: "email",
          foreignField: "borrowerEmail",
          as: "userRequests"
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          pendingCount: {
            $size: {
              $filter: {
                input: "$userRequests",
                as: "r",
                cond: { $eq: ["$$r.status", "pending"] }
              }
            }
          }
        }
      },
      { $match: { pendingCount: { $gt: 2 } } } // Only show risks
    ]).toArray();

    res.json({
      categoryData: categoryStats.length > 0 ? categoryStats : [{ name: "None", value: 0 }],
      growthData: growthStats.length > 0 ? growthStats : [{ name: "No Data", items: 0 }],
      securityThreats: highRiskUsers
    });
  } catch (err) {
    console.error("Admin API Error:", err);
    res.status(500).json({ error: "Intelligence gathering failed" });
  }
});

// --- ADDITIONAL ADMIN CONTROLS ---

// Get all items with owner details for the Master List
app.get('/api/admin/all-items', async (req, res) => {
  try {
    const items = await db.collection("items").find({}).toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// System Health Stats
app.get('/api/admin/system-stats', async (req, res) => {
  try {
    const users = await db.collection("users").countDocuments();
    const items = await db.collection("items").countDocuments();
    const requests = await db.collection("requests").countDocuments();
    res.json({ users, items, requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Delete Item (Emergency)
app.delete('/api/items/delete/:id', async (req, res) => {
  try {
    await db.collection("items").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Item purged from community list." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    // Removed nidPhoto from the destructuring
    const { email, name, address } = req.body;

    const userProfile = {
      email: email,
      name: name,
      address: address,
      isVerified: true, // Automatically verify since we aren't checking docs anymore
      karma: 10,
      totalDeals: 0,
      createdAt: new Date()
    };

    await db.collection("users").insertOne(userProfile);
    res.status(201).json({ message: "Success! Profile created." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

startServer();