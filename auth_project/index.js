import express from "express";
import "dotenv/config";
import cors from "cors";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";
import { verifyToken } from "./middleware/authMiddleware.js";

const app = express();
const port = 3000;
const uri = process.env.URI;
// middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Authentication");
});

const client = new MongoClient(uri);

export async function connectToMongoDB() {
  try {
    await client.connect();

    // create db & collections
    const db = client.db("auth_management");
    const usersCollection = db.collection("users");
    const transactionCollection = db.collection("transactions");

    // new user
    app.post("/register", async (req, res) => {
      const { email, password } = req.body;

      try {
        const user = await usersCollection.findOne({ email: email });
        if (user)
          return res.status(400).json({ message: "Already Email Registered" });

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = {
          email,
          password: hashPassword,
          role: "user",
        };
        const result = await usersCollection.insertOne(newUser);
        res.status(200).send({
          message: "New User Added Successfully!",
          result,
        });
      } catch (error) {
        res.status(404).json({
          message: "Failed Registration",
          error,
        });
      }
    });
    // login user
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await usersCollection.findOne({ email: email });
        if (!user) return res.status(404).json("User Not Found");
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json("Password invalid");

        const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1h" },
        );
        res.json({ message: "User Login Successfully", token });
      } catch (error) {
        res.status(404).json({
          message: "Failed to Login User",
          error,
        });
      }
    });
    // get user
    app.get("/users", async (req, res) => {
      const users = await usersCollection
        .find({}, { projection: { password: 0 } })
        .toArray();
      res.status(200).send(users);
    });
    // get transaction
    app.get("/transaction/:email", verifyToken, async (req, res) => {
      const { email } = req.params;
      try {
        const user = await transactionCollection.findOne({ email });
        if (!user)
          return res.status(404).json({ message: "User & Order Not Found" });
        res.status(200).json({
          message: "User & Order History Is Available",
          order: user,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to User & Order History",
          error: message.error,
        });
      }
    });
    // get dashboard
    app.get("/dashboard", verifyToken,  async (req, res) => {
      res.json({
        message: "Welcome To Dashboard",
      });
    });

    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  // await client.close();
}

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
  await connectToMongoDB();
});
