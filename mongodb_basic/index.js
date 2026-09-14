import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";
const app = express();
const port = 3000;
// middleware
app.use(express.json());
app.use(cors());

const uri = process.env.URI

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//create database and collection
const db = client.db("myDatabase");
const usersCollection = db.collection("users");

// add user data add to users collections

app.post("/add-user", async (req, res) => {
  try {
    const newUser = req.body;
    //const result = await usersCollection.insertOne(newUser);
    const result  = await usersCollection.insertMany(newUser)
    res.status(200).json({
      message: "User Created Successfully!",
      result,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to Create User",
      error
    })
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Welcome To MONGODB");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// icoxtechnologies_db_user
// GE5HZr9tfA86etNx
