import express from "express";
import "dotenv/config";
import { MongoClient } from "mongodb";

const app = express();
const port = 3000;
const uri = process.env.URL; 
// middleware
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const client = new MongoClient(uri);

export async function connectToMongoDB() { 
  try {
    await client.connect();

    // create db and client
    const bank = client.db("amar-bank");
    const accountsCollection = bank.collection("account");
    const transactionsCollection = bank.collection("transaction");

    // 
    // await accountsCollection.insertMany([
    //   {accountHolder: "Md Ibrahim", balance: 1000},
    //   {accountHolder: "Jisan", balance: 2000}
    // ])

    // transfer fund user account
    app.post("/transfer-fund", async (req, res)=>{
      const { fromAccountId, toAccountId , balance} = req.body;
      console.log(fromAccountId)
    })

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
