import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
const app = express();
const port = 3000;
// middleware
app.use(express.json());
app.use(cors());

const uri = process.env.URI;

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
    const result = await usersCollection.insertMany(newUser);
    res.status(200).json({
      message: "User Created Successfully!",
      result,
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to Create User",
      error,
    });
  }
});
// find all user
app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.status(200).json({
      message: "Users Find Successfully",
      users,
    });
  } catch (error) {
    res.status(400).json({
      message: "User Not Found",
      error,
    });
  }
});
// find single user
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const singleUser = await usersCollection.findOne({
      _id: new ObjectId({ id }),
    });
    res.status(200).json({
      message: "User Find Successfully",
      singleUser,
    });
  } catch (error) {
    res.status(400).json({
      message: "User Not Found",
      error,
    });
  }
});
// find email
app.get("/users/user/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const finalUser = await usersCollection
      .find({ email, age: { $gt: 2 } }, { projection: { name: 1 } })
      .toArray();
    res.status(200).json(finalUser);
  } catch (error) {
    res.status(404).json({
      message: "Data Not Found",
      error,
    });
  }
});
// update user data
app.patch("/update-user/:id", async (req, res) => {
  const { id } = req.params;
  const userData = req.body;
  try {
    const filter = { _id: new ObjectId({ id }) };
    const userInfo = {
      $set: {
        ...userData,
      },
    };

    const options = { upsert: true };

    const updateUser = await usersCollection.updateOne(
      filter,
      userInfo,
      options,
    );
    res.json(updateUser);
  } catch (error) {
    res.status(400).json({
      message: "User Not Found",
      error,
    });
  }
});
// update all data
app.patch("/users/increase-age", async (req, res) => {
  const userAgeIncrease = await usersCollection.updateMany(
    {},
    { $set: { status: "Pending" } },
  );
  res.json(userAgeIncrease);
});
// delete user
app.delete("/users/delete-user/:id", async (req, res) => {
  const { id } = req.params;
  const filter = { _id: new ObjectId({ id }) };
  try {
    const deleteUser = await usersCollection.deleteOne(filter);
    res.json(deleteUser);
  } catch (error) {
    res.status(400).json({
      message: "User Not Found",
      error,
    });
  }
});
// delete all
app.delete("/users/status", async (req, res) => {
  const { status } = req.body;
  try {
    const deleteStatusData = await usersCollection.deleteMany({ status });
    res.json(deleteStatusData);
  } catch (error) {
    res.json(400).json({
      message: "Data Not Found",
      error,
    });
  }
});
// Search by Greater Than Age
app.get("/users/grater-age/:age", async (req, res) => {
  const { age } = req.params;
  try {
    // const graterThanAge = await usersCollection
    //   .find({ age: { $gt: parseInt(age) } })
    //   .toArray();
    const lessThanAge = await usersCollection
      .find({ age: { $lt: parseInt(age) } })
      .toArray();

    res.status(200).json({
      message: "Users Found Successfully",
      //graterThanAge, 
      lessThanAge
    });
  } catch (error) {
    res.status(400).json({ message: "User Not Found", error: error.message });
  }
});
// logical operators
// and operator
app.get("/user/logical-operator/and", async(req, res)=>{
  try {
    const user = await usersCollection.find({
      $and: [
        {age: {$gte : 20}},
        {age: {$lte: 30}}
      ]
    }).toArray()
    res.status(200).json({
      message: "Sort Successfully",
      user
    })
  } catch (error) {
    res.status(200).json({
      message: "Data Not Found",
      error
    })
  }
})
// or operator
app.get("/user/logical-operator/or", async(req, res)=>{
  try {
    const user = await usersCollection.find({
      $or: [
        {age: {$gte : 20}},
        {age: {$lte: 30}}
      ]
    }).toArray()
    res.status(200).json({
      message: "Sort Successfully",
      user
    })
  } catch (error) {
    res.status(200).json({
      message: "Data Not Found",
      error
    })
  }
})
// not operator
app.get("/user/logical-operator/not", async(req, res)=>{
  try {
    const user = await usersCollection.find({
      age:{$not: {$gt: 20}}
    }).toArray()
    res.status(200).json({
      message: "Sort Successfully",
      user
    })
  } catch (error) {
    res.status(200).json({
      message: "Data Not Found",
      error
    })
  }
})

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
