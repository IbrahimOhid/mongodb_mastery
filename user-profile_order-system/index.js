import "dotenv/config";
import cors from "cors";
import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const port = 3000;
const uri = process.env.URI;

// middleware
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri);

// connecting mongo db
export async function connectToMongoDB() {
  try {
    await client.connect();
    // create database
    const db = client.db("user-profile-order-system");
    // schema validation
    const userSchema = {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          title: "User Profile Validation",
          required: ["name", "email", "age"],
          properties: {
            name: {
              bsonType: "string",
              description: "'name' must be a string and is required",
            },
            email: {
              bsonType: "string",
              pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
              description: "'email' must be a string and is required",
            },
            age: {
              bsonType: "int",
              minimum: 18,
              description: "'Age' must be a 18 Years Old",
            },
            address: {
              bsonType: "object",
              description: "'email' must be a Object and is required",
              properties: {
                street: {
                  bsonType: "string",
                },
                city: {
                  bsonType: "string",
                },
                zip: {
                  bsonType: "int",
                },
              },
            },
          },
        },
      },
    };
    // order schema
    const orderSchema = {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          title: "Order Validation",
          required: ["user_id", "items", "totalAmount"],
          properties: {
            user_id: {
              bsonType: "objectId",
              description: "'userId' must be a string and is required",
            },
            items: {
              bsonType: "array",
              required: ["product", "price"],
              properties: {
                product: {
                  bsonType: "string",
                },
                price: {
                  bsonType: "double",
                },
              },
            },
            totalAmount: {
              bsonType: "double",
              description:"Total Order Price"
            },
            status: {
              enm: ["Pending", "Shipped", "Delivered"]
            },
            orderData:{
              bsonType: "date"
            }
          },
        },
      },
    };
    // create db collection
    await db.createCollection("users", userSchema);
    const userCollection = db.collection("users");

    // indexing
    userCollection.createIndex({ email: 1 }, { unique: true });

    // post request
    app.post("/users", async (req, res) => {
      try {
        const newUser = userCollection.insertOne({
          ...req.body,
          createdAt: new Date(),
        });
        res.status(200).json({
          message: "New User Added Successfully",
          newUser,
        });
      } catch (error) {
        res.status(404).json({
          message: "Create New User Failed",
          error,
        });
      }
    });
    // get request
    app.get("/users", async (req, res) => {
      try {
        const userData = await userCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.status(200).json({
          message: "All User Data Show",
          userData,
        });
      } catch (error) {
        res.status(404).json({
          message: "User Data Not Found",
        });
      }
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
  await connectToMongoDB();
});
