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
    const match = await salesCollection
      .aggregate([
        {
          $match: {
            year: 2023,
          },
        },
        {
          $group: {
            _id: "$region",
            totalSales: {
              $sum: "$amount",
            },
          },
        },
        {
          $sort: {
            totalSales: -1,
          },
        },
        {
          $limit: 2,
        },
      ])
      .toArray();
    console.log(match);

    // aggregation - project
    const project = await salesCollection
      .aggregate([
        {
          $match: {
            year: 2023,
          },
        },
        {
          $project: {
            customer: 1,
            amount: 1,
            transactions: 1,
          },
        },
      ])
      .toArray();
    console.log(project);

    // aggregation - lookup
    const lookup = await salesCollection
      .aggregate([
        {
          $match: {
            year: 2023,
          },
        },
        {
          $group: {
            _id: "$region",
            totalSales: {
              $sum: "$amount",
            },
          },
        },
        {
          $lookup: {
            from: "regions",
            localField: "_id",
            foreignField: "regionId",
            as: "regionInfo",
          },
        },
      ])
      .toArray();
    console.log(lookup);

    // aggregation - unwind
    const unwind = await salesCollection
      .aggregate([
        {
          $match: {
            year: 2023,
          },
        },
        {
          $project: {
            customer: 1,
            transactions: 1,
          },
        },
        {
          $unwind: {
            path: "$transactions",
          },
        },
        {
          $group: {
            _id: "$transactions.item",
            TotalAmount: {
              $sum: "$transactions.amount",
            },
          },
        },
        {
          $sort: {
            TotalAmount: 1,
          },
        },
      ])
      .toArray();
    console.log(unwind);

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
