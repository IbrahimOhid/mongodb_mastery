import express from "express";
import { MongoClient } from "mongodb";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});


const client = new MongoClient(
  "mongodb+srv://icoxtechnologies_db_user:FOliawgFbn3kbjvj@cluster0.nrmf6kb.mongodb.net/",
);

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

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
 await connectToMongoDB();
});

//icoxtechnologies_db_user
//FOliawgFbn3kbjvj
