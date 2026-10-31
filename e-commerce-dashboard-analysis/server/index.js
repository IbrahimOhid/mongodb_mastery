import express from "express";
import { MongoClient } from "mongodb";
import "dotenv/config";
import cors from "cors";
import NodeCache from "node-cache";
import compression from "compression";

const app = express();
const port = 3000;
const uri = process.env.URI;

const cache = new NodeCache({ stdTTL: 600 });
// middleware
app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const client = new MongoClient(uri);

export async function connectToMongoDB() {
  try {
    await client.connect();

    // create db and collections
    const db = client.db("e-commerce-dashboard");
    // create indexing
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ lastLogin: -1 });
    await db.collection("products").createIndex({ category: 1 });
    await db.collection("products").createIndex({ stock: 1 });
    await db.collection("orders").createIndex({ userId: 1 });
    await db.collection("orders").createIndex({ orderDate: -1 });

    // dashboard endpoint
    app.get("/api/dashboard/analytics", async (req, res) => {
      try {
        const cacheAnalytics = cache.get("dashboardAnalytics");
        if (cacheAnalytics) {
          return res.json(cacheAnalytics);
        }

        const [activeUsers, totalProducts, totalRevenueData, monthlySalesData, inventoryMetrics] =
          await Promise.all([
            // total User
            db.collection("users").countDocuments(),
            // total Product
            db.collection("products").countDocuments(),
            // total Revenue
            db
              .collection("orders")
              .aggregate([
                {
                  $group: {
                    _id: null,
                    totalRevenue: {
                      $sum: "$totalAmount",
                    },
                    totalOrders: {
                      $sum: 1,
                    },
                  },
                },
              ])
              .toArray(),
            // monthly sales
            db
              .collection("orders")
              .aggregate([
                {
                  $group: {
                    _id: {
                      year: {
                        $year: "$orderDate",
                      },
                      month: {
                        $month: "$orderDate",
                      },
                    },
                    monthlyRevenue: {
                      $sum: "$totalAmount",
                    },
                    orders: {
                      $sum: 1,
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    monthlyRevenue: 1,
                    orders: 1,
                  },
                },
                {
                  $sort: {
                    year: 1,
                    month: 1,
                  },
                },
              ])
              .toArray(),
            // inventory Metrics
            db
              .collection("products")
              .aggregate([
                {
                  $group: {
                    _id: null,
                    totalStock: {
                      $sum: "$stock",
                    },
                    averageStock: {
                      $avg: "$stock",
                    },
                    lowStock: {
                      $sum: {
                        $cond: [
                          {
                            $lt: ["$stock", 10],
                          },
                          1,
                          0,
                        ],
                      },
                    },
                    lowOfStock: {
                      $sum: {
                        $cond: [
                          {
                            $eq: ["$stock", 0],
                          },
                          1,
                          0,
                        ],
                      },
                    },
                  },
                },
              ])
              .toArray(),
              // customer Analytics
              db.collection("customers").aggregate(
                
              ).toArray()
          ]);

        const analytics = {
          activeUsers,
          totalProducts,
          totalRevenueData,
          monthlySalesData,
          inventoryMetrics,
        };

        cache.set("dashboardAnalytics", analytics, 600);
        res.json(analytics);
      } catch (error) {
        res.send(505).json({
          message: "Internal Server Error",
          error: message.error,
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
  res.send("Hello World!");
});

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
  await connectToMongoDB();
});

// icoxtechnologies_db_user
//1YqciZs9ndfJnhkP
