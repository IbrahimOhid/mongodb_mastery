import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import "dotenv/config";

const app = express();
const port = 3000;
const uri = process.env.URI;
// middleware
app.use(express.json());
app.use(cors());

const client = new MongoClient(uri);

export async function connectToMongoDB() {
  try {
    await client.connect();

    // create database
    const db = client.db("aggregation-frameworks");
    const regionsCollection = db.collection("regions");
    const salesCollection = db.collection("sales");

    // count documents
    const totalSalesDocuments = await salesCollection.countDocuments();
    console.log(totalSalesDocuments);

    // aggregation - match
    const result = await salesCollection
      .aggregate([{ $match: { region: "North" } }])
      .toArray();
      console.log(result)



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
// UEcptfjAqLumokhn
