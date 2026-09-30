import express from "express";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";
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
        const newBook = await booksCollection.insertOne(bookData);
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
        author,
        minYear,
        maxYear,
        genre,
        minPrice,
        maxPrice,
        order,
        sortBy,
        search,
      } = req.query;
      try {
        const currentPage = Math.max(1, parseInt(page) || 1);
        const perPage = parseInt(limit) || 5;
        const skip = (currentPage - 1) * perPage;

        // filter
        const filter = {};
        // search
        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } },
          ];
        }
        // genre filtering
        if (genre) filter.genre = genre;
        // author filtering
        if (author) filter.author = author;
        // publishedYear filtering
        if (minYear || maxYear) {
          filter.publishedYear = {
            ...(minYear && { $gte: parseInt(minYear) }),
            ...(maxYear && { $lte: parseInt(maxYear) }),
          };
        }
        // price filtering
        if (minPrice || maxPrice) { 
          filter.price = {
            ...(minPrice && { $gte: parseFloat(minPrice) }),
            ...(maxPrice && { $lte: parseFloat(maxPrice) }),
          };
        }
        // sorting
        const sortOptions = { [sortBy || "title"]: order === "desc" ? -1 : 1 };

        const [books, totalBooks] = await Promise.all([
          booksCollection
            .find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(perPage)
            .toArray(),
          booksCollection.countDocuments(filter),
        ]);
        res.status(200).json({
          message: "All Book Find Successfully",
          books,
          totalBooks,
          currentPage,
          totalPages: Math.ceil(totalBooks / perPage),
        });
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    }); 
    // get book ID
    app.get("/books/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const singleBook = await booksCollection.findOne({
          _id: new ObjectId(id),
        });
        res.status(200).json({
          message: "Book Find Successfully",
          singleBook,
        });
      } catch (error) {
        res.status(404).json({
          message: "Book Not Found",
          error,
        });
      }
    });
    // update Books = PUT
    app.put("/books/:id", async (req, res) => {
      const { id } = req.params;
      const booksData = req.body;
      try {
        const updatedBook = await booksCollection.updateOne(
          { _id: new ObjectId({ id }) },
          { $set: booksData },
        );
        res.status(200).json({
          message: "Updated Book Successfully",
          updatedBook,
        });
      } catch (error) {
        res.status(404).json({
          message: "Book Not Found",
          error,
        });
      }
    });
    // delete books
    app.delete("/books/:id", async (req, res) => {
      const { id } = req.params;
      try {
        const deleteBook = await booksCollection.deleteOne({
          _id: new ObjectId({ id }),
        });
        res.status(200).json({
          message: "Delete Book Successfully",
          deleteBook,
        });
      } catch (error) {
        res.status(404).json({
          message: "Book Not Found",
          error,
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
  //await client.close();
}

app.get("/", (req, res) => {
  res.send("Book Management API!");
});

app.listen(port, async () => {
  await connectToMongoDB();
  console.log(`Example app listening on port ${port}`);
});
