import express from "express";
import "dotenv/config";
import cors from "cors";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

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

    // new user
    app.post("/register", async (req, res) => {
      const { email, password } = req.body;

      try {
        const existEmail = await usersCollection.findOne({ email: email });
        if (existEmail)
          return res.status(400).json({ message: "Already Email Registered" });

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = {
          email,
          password: hashPassword,
          role: "user",
        };
        const result = await usersCollection.insertOne(newUser)
        res.status(200).send({
          message: "New User Added Successfully!",
          result
        });
      } catch (error) {
        res.status(404).json({
          message: "Failed Registration",
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
