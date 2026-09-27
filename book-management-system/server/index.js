import express from "express";
import "dotenv/config";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.URI;
// middleware
app.use(express.json());
app.use(cors());

// mongodb Connect
const client = new MongoClient(uri);

export async function connectToMongoDB() {
  try {
    await client.connect();

    // create database and collection
    const db = client.db("book-management-system");
    const booksCollection = db.collection("books");

    // create book(POST Request)
    app.post("/books", async (req, res) => {
      const bookData = req.body;
      try {
        const newBook = await booksCollection.insertMany(bookData);
        res.status(200).json({
          message: "New Book Added Successfully",
          newBook,
        });
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    });
    // get all book
    app.get("/books", async (req, res) => {
      const {
        page,
        limit,
        genre,
        minYear,
        maxYear,
        author,
        minPrice,
        maxPrice,
        sortBy,
        order,
        search,
      } = req.query;
      try {
        const currentPage = Math.max(1, parseInt(page) || 1);
        const perPage = parseInt(limit) || 10;
        const skip = (currentPage - 1) * perPage;
        const filter = {};
        // search filter
        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ];
        }
        // genre filter
        if (genre) filter.genre = genre;
        // published year filter
        if (minYear || maxYear) {
          filter.publishedYear = {
            ...(minYear && { $gte: parseInt(minYear) }),
            ...(maxYear && { $lte: parseInt(maxYear) }),
          };
        }
        // author filter
        if (author) filter.author = author;
        // price filter
        if (minPrice || maxPrice) {
          filter.price = {
            ...(minPrice && { $gte: parseFloat(minPrice) }),
            ...(maxPrice && { $lte: parseFloat(maxPrice) }),
          };
        }
        // sortby filter
        const sortOptions = { [sortBy || "title"]: order === "desc" ? -1 : 1 };

        const allBooks = await booksCollection.find(filter).toArray();
        res.status(200).json({
          message: "All Book Find Successfully",
          allBooks,
        });
      } catch (error) {
        res.status(404).json({ error: error.message });
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
  //await client.close();
}

app.get("/", (req, res) => {
  res.send("Book Management API!");
});

app.listen(port, async () => {
  await connectToMongoDB();
  console.log(`Example app listening on port ${port}`);
});
