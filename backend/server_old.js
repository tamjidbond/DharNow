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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


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
              <h2>DharNow Verification</h2>
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

// 2. Get requests I RECEIVED (I am the lender)
app.get('/api/requests/owner/:uid', async (req, res) => {
  try {
    const requests = await db.collection("requests").find({ lenderUid: req.params.uid }).toArray();
    res.json(requests);
  } catch (err) { res.status(500).send(err.message); }
});

// 3. Get requests I SENT (I am the borrower)
app.get('/api/requests/borrower/:uid', async (req, res) => {
  try {
    const requests = await db.collection("requests").find({ borrowerUid: req.params.uid }).toArray();
    res.json(requests);
  } catch (err) { res.status(500).send(err.message); }
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



// --- GET SINGLE ITEM WITH OWNER DETAILS ---
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await db.collection("items").findOne({ _id: new ObjectId(req.params.id) });
    if (!item) return res.status(404).send("Item not found");

    // Fetch the owner's profile from the Users collection
    const owner = await db.collection("users").findOne({ firebaseUid: item.lentBy });

    res.json({ item, owner });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/requests/create', async (req, res) => {
  try {
    const { itemId, lenderUid, borrowerUid, message } = req.body;
    const newRequest = {
      itemId: new ObjectId(itemId),
      lenderUid,
      borrowerUid,
      message,
      status: 'pending',
      createdAt: new Date()
    };
    await db.collection("requests").insertOne(newRequest);
    res.status(201).json({ message: "Success" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/items/add', async (req, res) => {
  try {
    const { title, description, category, image, coordinates, userId } = req.body;

    // Create a GeoJSON point for the coordinates
    const location = {
      type: "Point",
      coordinates: coordinates // [longitude, latitude]
    };

    const newItem = {
      title,
      description,
      category,
      image, // Base64 image
      location: location, // MongoDB GeoJSON format
      lentBy: userId, // The user who listed the item
      status: 'available',
      postedAt: new Date()
    };

    const result = await db.collection("items").insertOne(newItem);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).send("Error adding item: " + err.message);
  }
});

// GET all users who are NOT verified yet
app.get('/api/admin/pending-users', async (req, res) => {
  try {
    const users = await db.collection("users").find({ isVerified: false }).toArray();
    res.json(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- APPROVE A BORROW REQUEST ---
app.patch('/api/requests/approve/:requestId', async (req, res) => {
  try {
    const requestId = new ObjectId(req.params.requestId);

    // 1. Find the request to get the Item ID
    const request = await db.collection("requests").findOne({ _id: requestId });

    // 2. Mark request as 'approved'
    await db.collection("requests").updateOne(
      { _id: requestId },
      { $set: { status: 'approved' } }
    );

    // 3. Mark the item as 'lent' (unavailable)
    await db.collection("items").updateOne(
      { _id: request.itemId },
      { $set: { status: 'lent' } }
    );

    res.json({ message: "Request approved! Item is now lent." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/requests/complete/:requestId', async (req, res) => {
  try {
    const { rating, borrowerUid } = req.body;
    const requestId = new ObjectId(req.params.requestId);

    // 1. Mark request as completed
    const request = await db.collection("requests").findOneAndUpdate(
      { _id: requestId },
      { $set: { status: 'completed', rating: rating } }
    );

    // 2. Make the item 'available' again on the map
    await db.collection("items").updateOne(
      { _id: request.value.itemId },
      { $set: { status: 'available' } }
    );

    // 3. Update Borrower's Karma (Add rating points to their profile)
    await db.collection("users").updateOne(
      { firebaseUid: borrowerUid },
      { $inc: { karma: rating, totalDeals: 1 } }
    );

    res.json({ message: "Deal completed and Karma updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user status to Verified
app.patch('/api/admin/verify-user/:uid', async (req, res) => {
  try {
    await db.collection("users").updateOne(
      { firebaseUid: req.params.uid },
      { $set: { isVerified: true } }
    );
    res.json({ message: "User verified successfully!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { uid, phone, name, address, nidPhoto } = req.body;

    const userProfile = {
      firebaseUid: uid,
      phone: phone,
      name: name,
      address: address,
      nidPhoto: nidPhoto, // This will now be the Base64 string of the image
      isVerified: false,
      karma: 10,
      createdAt: new Date()
    };

    await db.collection("users").insertOne(userProfile);
    res.status(201).json({ message: "Success! NID saved to MongoDB." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

startServer();