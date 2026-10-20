import express from "express";
import { MongoClient } from "mongodb";
import "dotenv/config";
import cors from "cors";
import NodeCache from "node-cache";
import compression from "compression";

const app = express();
const port = 3000;
const uri = process.env.URI;

const cache = new NodeCache({ stdTTL: 100 });
// middleware
app.use(express.json());
app.use(compression());
app.use(express.urlencoded({extended: true}))
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }),
);

const client = new MongoClient(uri);

export async function connectToMongoDB() {
  try {
    await client.connect();

    // create db and collections
    const db =  client.db("e-commerce-dashboard");
    // create indexing
    await db.collection("users").createIndex({ email: 1}, {unique: true});
    await db.collection("users").createIndex({ lastLogin: -1});
    await db.collection("products").createIndex({ category : 1});
    await db.collection("products").createIndex({ stock: 1 });
    await db.collection("orders").createIndex({ userId : 1});
    await db.collection("orders").createIndex({ orderDate: -1 });

    










    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  //await client.close();
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
  await connectToMongoDB();
});

// icoxtechnologies_db_user
//1YqciZs9ndfJnhkP
