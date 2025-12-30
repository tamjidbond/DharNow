const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();

// --- CONFIGURATION & MIDDLEWARE ---
app.use(cors({
  origin: [
    "https://dharnow.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;





// !-================================================================--- DATABASE CONNECTION --==========================================================================
async function startServer() {
  try {
    await client.connect();
    db = client.db("DharLink");
    console.log("✅ Successfully connected to MongoDB!");

    const PORT = 8000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
  }
}



// --- BASE ROUTE ---
app.get('/', (req, res) => {
  res.send("DharLink Server is Live and Open!");
});


// !-================================================================1. AUTHENTICATION ROUTES (OTP) ---==========================================================================


app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await db.collection("otps").updateOne(
      { email },
      { $set: { otp, createdAt: new Date() } },
      { upsert: true }
    );

    await resend.emails.send({
      from: "DharNow <dharnow.contact@gmail.com>",
      to: email,
      subject: "Your DharNow Verification Code",
      html: `
    <div style="font-family:Arial,sans-serif">
      <h2>DharNow OTP</h2>
      <h1 style="letter-spacing:4px">${otp}</h1>
      <p>This code expires in 5 minutes.</p>
    </div>
  `
    });


    res.json({ success: true });
  } catch (err) {
    console.error("❌ OTP ERROR FULL:", err);
    res.status(500).json({ error: err.message });
  }

});


app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await db.collection("otps").findOne({ email, otp });
    if (!record) return res.status(400).json({ success: false, message: "Invalid OTP" });
    const user = await db.collection("users").findOne({ email: email });
    await db.collection("otps").deleteOne({ email });
    res.json({ success: true, newUser: !user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// !-================================================================--- 2.User Profile Root --==========================================================================

// server.js (Backend)

app.post('/api/users/register', async (req, res) => {
  try {
    const { email, name, address, isAdmin } = req.body;

    // 1. Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return res.json(existingUser); // Return existing user if they are already there
    }

    // 2. Create the new user object
    const newUser = {
      email,
      name,
      address,
      isAdmin: isAdmin || false, // Default to false for everyone
      createdAt: new Date()
    };

    // 3. Insert into MongoDB
    await db.collection('users').insertOne(newUser);

    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to register user" });
  }
});

app.get('/api/users/profile/:uid', async (req, res) => {
  try {
    const user = await db.collection("users").findOne({ firebaseUid: req.params.uid });
    if (user) return res.status(200).json(user);
    return res.status(404).json({ message: "User not found" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/api/users/profile-by-email/:email', async (req, res) => {
  const user = await db.collection("users").findOne({ email: req.params.email });
  res.json(user);
});

app.patch('/api/users/update/:email', async (req, res) => {
  // 1. Add 'profileImage' to the list of things to take from req.body
  const { name, address, phone, profileImage } = req.body;

  try {
    await db.collection("users").updateOne(
      { email: req.params.email },
      {
        // 2. Add 'profileImage' to the $set object so it saves to MongoDB
        $set: {
          name,
          address,
          phone,
          profileImage
        }
      }
    );
    res.json({ message: "Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

app.get('/api/users/search', async (req, res) => {
  const { query } = req.query;
  try {
    const neighbors = await db.collection("users")
      .find({
        $or: [
          { email: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } }
        ]
      })
      .limit(5).toArray();
    res.json(neighbors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// !-================================================================--- 3. Item Listing Root ---==========================================================================

app.get('/api/items/all', async (req, res) => {
  try {
    const items = await db.collection("items").find({}).toArray();
    const formattedItems = items.map(item => ({
      ...item,
      coordinates: item.location ? [item.location.coordinates[1], item.location.coordinates[0]] : [23.8103, 90.4125]
    }));
    res.json(formattedItems);
  } catch (err) {
    res.status(500).send("Error fetching items: " + err.message);
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await db.collection("items").findOne({ _id: new ObjectId(req.params.id) });
    if (!item) return res.status(404).json({ message: "Item not found" });
    const owner = await db.collection("users").findOne(
      { email: item.lentBy },
      { projection: { name: 1, phone: 1, address: 1, createdAt: 1 } }
    );
    res.json({ item, owner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items/add', async (req, res) => {
  try {
    const { title, description, category, price, priceType, phone, address, image, coordinates, lentBy } = req.body;
    const newItem = {
      title, description, category, price: Number(price), priceType, phone, address, image, lentBy,
      status: 'available',
      location: { type: 'Point', coordinates: coordinates },
      createdAt: new Date()
    };
    await db.collection("items").insertOne(newItem);
    res.status(201).json({ message: "Item added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/items/user/:uid', async (req, res) => {
  try {
    const items = await db.collection("items").find({ lentBy: req.params.uid }).toArray();
    res.json(items);
  } catch (err) { res.status(500).send(err.message); }
});

app.delete('/api/items/delete/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const deleteResult = await db.collection("items").deleteOne({ _id: new ObjectId(itemId) });
    if (deleteResult.deletedCount > 0) {
      await db.collection("requests").deleteMany({
        itemId: itemId,
        status: { $in: ['pending', 'approved'] }
      });
      res.json({ message: "Item and associated requests removed." });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

///! --- 4. BORROW REQUEST ROUTES ---

// --- CREATE REQUEST ---
app.post('/api/requests/create', async (req, res) => {
  try {
    const { itemId, lenderEmail, borrowerEmail, borrowerPhone, message, duration } = req.body;

    // Find the item to ensure it exists and get its title
    const item = await db.collection("items").findOne({ _id: new ObjectId(itemId) });
    if (!item) return res.status(404).json({ error: "Item not found" });

    const newRequest = {
      itemId: new ObjectId(itemId),
      itemTitle: item.title,
      lenderEmail,
      borrowerEmail,
      borrowerPhone,
      message,
      duration: duration || '1 Days',
      status: 'pending',
      createdAt: new Date(),
      // Adding these as null/empty initially for consistency in the DB
      returnTime: null,
      excessTime: null
    };

    await db.collection("requests").insertOne(newRequest);
    res.status(201).json({ message: "Request sent successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- APPROVE REQUEST ---
app.patch('/api/requests/approve/:id', async (req, res) => {
  try {
    const requestId = new ObjectId(req.params.id);
    const request = await db.collection("requests").findOne({ _id: requestId });

    if (!request) return res.status(404).json({ message: "Request not found" });

    // Duration calculation logic
    const durationStr = request.duration || "1 Days";
    const [val, unit] = durationStr.split(' ');
    const numValue = parseInt(val) || 1;

    let returnDate = new Date();
    if (unit?.toLowerCase().includes('day')) {
      returnDate.setDate(returnDate.getDate() + numValue);
    } else {
      returnDate.setHours(returnDate.getHours() + numValue);
    }

    // Update both Request and Item simultaneously
    const requestUpdate = db.collection("requests").updateOne(
      { _id: requestId },
      { $set: { status: 'approved', returnTime: returnDate } }
    );

    const itemUpdate = db.collection("items").updateOne(
      { _id: new ObjectId(request.itemId) },
      { $set: { status: 'booked', returnTime: returnDate } }
    );

    await Promise.all([requestUpdate, itemUpdate]);

    res.json({
      message: "Request approved!",
      returnTime: returnDate,
      duration: durationStr
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- COMPLETE REQUEST ---
app.patch('/api/requests/complete/:id', async (req, res) => {
  try {
    const requestId = new ObjectId(req.params.id);
    const request = await db.collection("requests").findOne({ _id: requestId });

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status === 'completed') return res.status(400).json({ message: "Already completed" });

    const now = new Date();
    // Safety check: if returnTime is missing, assume on-time
    const dueDate = request.returnTime ? new Date(request.returnTime) : now;

    let excessTimeLabel = "On Time";
    let borrowerKarma = 10;

    if (now > dueDate) {
      const diffMs = now - dueDate;
      const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      excessTimeLabel = diffDays > 0 ? `${diffDays} days late` : `${diffHours} hours late`;

      // Penalty: -2 Karma per hour late, min 2 Karma points
      borrowerKarma = Math.max(2, 10 - (diffHours * 2));
    }

    // 1. Finalize Request
    const updateRequest = db.collection("requests").updateOne(
      { _id: requestId },
      {
        $set: {
          status: 'completed',
          rating: req.body.rating || 5,
          completedAt: now,
          excessTime: excessTimeLabel,
          finalBorrowerKarma: borrowerKarma // Useful for history
        }
      }
    );

    // 2. Clear Item status
    const updateItem = db.collection("items").updateOne(
      { _id: new ObjectId(request.itemId) },
      { $set: { status: 'available' }, $unset: { returnTime: "" } }
    );

    // 3. Award Karma to both users
    const updateBorrower = db.collection("users").updateOne(
      { email: request.borrowerEmail },
      { $inc: { karma: borrowerKarma, totalDeals: 1 } }
    );

    const updateLender = db.collection("users").updateOne(
      { email: request.lenderEmail },
      { $inc: { karma: 15, totalDeals: 1 } }
    );

    // Run all database operations
    await Promise.all([updateRequest, updateItem, updateBorrower, updateLender]);

    res.json({
      message: `Item returned! Status: ${excessTimeLabel}.`,
      borrowerEarned: borrowerKarma,
      excessTime: excessTimeLabel
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Requests received by the Owner (Incoming)
app.get('/api/requests/owner/:email', async (req, res) => {
  try {
    const requests = await db.collection("requests").aggregate([
      { $match: { lenderEmail: req.params.email } },
      {
        $lookup: {
          from: "users",
          localField: "borrowerEmail",
          foreignField: "email",
          as: "borrowerDetails"
        }
      },
      { $unwind: { path: "$borrowerDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          itemId: 1, itemTitle: 1, lenderEmail: 1, borrowerEmail: 1,
          borrowerPhone: 1, message: 1, status: 1, createdAt: 1,
          duration: 1,      // ADD THIS
          returnTime: 1,    // ADD THIS
          borrowerName: "$borrowerDetails.name"
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET: Requests sent by the Borrower (My Borrowing) - UPDATED with Lender Name
app.get('/api/requests/borrower/:email', async (req, res) => {
  try {
    const requests = await db.collection("requests").aggregate([
      { $match: { borrowerEmail: req.params.email } },
      {
        $lookup: {
          from: "users",
          localField: "lenderEmail",
          foreignField: "email",
          as: "lenderDetails"
        }
      },
      { $unwind: { path: "$lenderDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          itemId: 1, itemTitle: 1, lenderEmail: 1, borrowerEmail: 1,
          borrowerPhone: 1, message: 1, status: 1, createdAt: 1,
          duration: 1,    // <--- ADD THIS
          returnTime: 1,
          lenderName: "$lenderDetails.name",// Extract Lender Name
          lenderPhone: "$lenderDetails.phone" // ADD THIS LINE
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


app.patch('/api/requests/reject/:id', async (req, res) => {
  try {
    await db.collection("requests").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: 'rejected' } });
    res.json({ message: "Request rejected successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// !-================================================================---5.Chat Engine Root  ---==========================================================================

app.post('/api/messages/send', async (req, res) => {
  const { senderEmail, receiverEmail, itemId, itemTitle, text } = req.body;
  try {
    const newMessage = {
      senderEmail, receiverEmail,
      itemId: itemId ? new ObjectId(itemId) : null,
      itemTitle: itemTitle || "Neighbor Chat",
      text, isRead: false,
      createdAt: new Date()
    };
    await db.collection("messages").insertOne(newMessage);
    res.status(201).json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/messages/:email', async (req, res) => {
  try {
    const messages = await db.collection("messages")
      .find({ $or: [{ receiverEmail: req.params.email }, { senderEmail: req.params.email }] })
      .sort({ createdAt: -1 }).toArray();
    res.json(messages);
  } catch (err) { res.status(500).json({ error: "Database error" }); }
});

app.get('/api/messages/thread/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const thread = await db.collection("messages")
      .find({ $or: [{ senderEmail: user1, receiverEmail: user2 }, { senderEmail: user2, receiverEmail: user1 }] })
      .sort({ createdAt: 1 }).toArray();
    res.json(thread);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/messages/read-thread/:me/:neighbor', async (req, res) => {
  try {
    const { me, neighbor } = req.params;
    await db.collection("messages").updateMany(
      { receiverEmail: me, senderEmail: neighbor, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// !-================================================================--- 6. Admin Roots ---==========================================================================

app.get('/api/admin/all-users', async (req, res) => {
  const users = await db.collection("users").find({}).toArray();
  res.json(users);
});

app.get('/api/admin/all-items', async (req, res) => {
  try {
    const items = await db.collection("items").find({}).toArray();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/system-stats', async (req, res) => {
  try {
    const users = await db.collection("users").countDocuments();
    const items = await db.collection("items").countDocuments();
    const requests = await db.collection("requests").countDocuments();
    res.json({ users, items, requests });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/emergency-delete/:id', async (req, res) => {
  try {
    await db.collection("items").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Item purged from community list." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/dashboard-intelligence', async (req, res) => {
  try {
    const categoryStats = await db.collection("items").aggregate([
      { $group: { _id: "$category", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]).toArray();

    const growthStats = await db.collection("items").aggregate([
      { $group: { _id: { $dateToString: { format: "%b", date: "$_id" } }, items: { $sum: 1 }, firstId: { $min: "$_id" } } },
      { $sort: { firstId: 1 } },
      { $project: { name: "$_id", items: 1, _id: 0 } }
    ]).toArray();

    const highRiskUsers = await db.collection("users").aggregate([
      { $lookup: { from: "requests", localField: "email", foreignField: "borrowerEmail", as: "userRequests" } },
      { $project: { name: 1, email: 1, pendingCount: { $size: { $filter: { input: "$userRequests", as: "r", cond: { $eq: ["$$r.status", "pending"] } } } } } },
      { $match: { pendingCount: { $gt: 2 } } }
    ]).toArray();

    const topUsers = await db.collection("users").find({}).sort({ karma: -1 }).limit(5).toArray();

    res.json({
      categoryData: categoryStats.length > 0 ? categoryStats : [{ name: "None", value: 0 }],
      growthData: growthStats.length > 0 ? growthStats : [{ name: "No Data", items: 0 }],
      securityThreats: highRiskUsers,
      topUsers: topUsers
    });
  } catch (err) {
    res.status(500).json({ error: "Intelligence gathering failed" });
  }
});

//! --- CATEGORY ROUTES ---=====================================================================================================================================
app.get('/api/items/count-by-category/:categoryName', async (req, res) => {
  try {
    const { categoryName } = req.params;
    // Count how many items have this category string
    const count = await db.collection('items').countDocuments({ category: categoryName });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Could not count items" });
  }
});


app.get('/api/categories', async (req, res) => {
  const categories = await db.collection('categories').find({}).toArray();
  res.json(categories);
});

app.post('/api/categories/add', async (req, res) => {
  const { name } = req.body;
  await db.collection('categories').insertOne({ name, createdAt: new Date() });
  res.json({ success: true });
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
  res.json({ success: true });
});




// !-================================================================--- 7. Community Wish Routes ---==========================================================================

// --- BROADCAST A WISH ---
app.post('/api/wishes/create', async (req, res) => {
  try {
    const { name, category, requesterEmail } = req.body;
    const newWish = {
      name,
      category,
      requesterEmail,
      status: 'open',
      createdAt: new Date()
    };
    const result = await db.collection("wishes").insertOne(newWish);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to broadcast wish: " + err.message });
  }
});

// --- GET ALL OPEN WISHES ---
app.get('/api/wishes', async (req, res) => {
  try {
    const wishes = await db.collection("wishes").aggregate([
      { $match: { status: 'open' } },
      {
        $lookup: {
          from: "users",               // Name of your users collection
          localField: "requesterEmail", // Field in wishes
          foreignField: "email",        // Field in users
          as: "posterDetails"
        }
      },
      { $unwind: "$posterDetails" },   // Turn array into an object
      { $sort: { createdAt: -1 } }     // Newest first
    ]).toArray();
    res.json(wishes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wishes" });
  }
});

// --- DELETE A WISH (User removes their own) ---
app.delete('/api/wishes/delete/:id', async (req, res) => {
  try {
    const result = await db.collection("wishes").deleteOne({
      _id: new ObjectId(req.params.id)
    });
    if (result.deletedCount === 1) {
      res.json({ message: "Wish removed from board." });
    } else {
      res.status(404).json({ message: "Wish not found." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- OPTIONAL: CLOSE WISH WHEN FULFILLED ---
app.patch('/api/wishes/fulfill/:id', async (req, res) => {
  try {
    await db.collection("wishes").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: 'fulfilled' } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

startServer();