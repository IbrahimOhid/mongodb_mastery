import express from "express";
import "dotenv/config";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const port = 3000;
const uri = process.env.URI
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
// rJSxJw5E0bceJPbe
