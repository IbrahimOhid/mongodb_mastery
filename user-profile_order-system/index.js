import "dotenv/config";
import cors from "cors"
import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const port = 3000;
const uri = process.env.URI

// middleware
app.use(cors());
app.use(express.json())
  
const client = new MongoClient(uri); 

// connecting mongo db
export async function connectToMongoDB() {
  try {
    await client.connect();
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
  await connectToMongoDB();
});      