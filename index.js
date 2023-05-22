require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5fydwdl.mongodb.net/?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("zooToys");
    const collection = database.collection("toysData");

    app.post("/toy", async (req, res) => {
      const toy = req.body;

      const result = await collection.insertOne(toy);
      console.log("New toy inserted:", toy);
      res.send(result);
    });
    app.get("/toy", async (req, res) => {
      const cursor = collection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/toys/:subcategory", async (req, res) => {
      const subcat = req.params.subcategory;
      const result = await collection.find({ subCategory: subcat }).toArray();
      res.send(result);
    });
    app.delete("/toy/:toyId", async (req, res) => {
      const id = req.params.toyId;
      const filter = { _id: new ObjectId(id) };
    
      try {
        const result = await collection.deleteOne(filter);
        console.log("Toy deleted:", id);
        res.json(result);
      } catch (error) {
        console.error("Error deleting toy:", error);
        res.status(500).json({ error: "Error deleting toy" });
      }
    });
    
    // PATCH route to update a toy
    app.patch("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      const updateDoc = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };
    
      try {
        const result = await collection.updateOne(filter, updateDoc);
        res.json({ modifiedCount: result.modifiedCount });
      } catch (error) {
        console.error("Error updating toy:", error);
        res.status(500).json({ error: "Error updating toy" });
      }
    });

    app.get("/toysdata", async (req, res) => {
      let query = {};
      if (req.query?.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }
      const result = await collection.find(query).toArray();
      res.send(result);
    });



    app.get("/toydata", async (req, res) => {
      let query = {};
      if (req.query?._id) {
        query = { _id: new ObjectId(req.query._id) };
      }
      const result = await collection.find(query).toArray();
      res.send(result);
    });



    app.get("/toy/id/:toyId", async (req, res) => {
      const id = req.params.toyId;
      const data = { _id: new ObjectId(id) };
      const options = {
        projection: {
          name: 1,
          price: 1,
          pictureUrl: 1,
          email: 1,
          sellerName: 1,
          subCategory: 1,
          rating: 1,
          quantity: 1,
          description: 1,
        },
      };
      const result = await collection.findOne(data, options);
      res.send(result);
    });

    // Assuming you have the necessary imports and setup for Express and MongoDB
    app.get("/toysdata", (req, res) => {
      
      const { sellerEmail, sortOrder, sortBy } = req.query;
      const query = { sellerEmail };
    
      let sortOptions = {sortBy:sortOrder};
     
      Toy.find(query)
        .sort(sortOptions)
        .then((toys) => {
          res.json(toys);
        })
        .catch((error) => {
          console.error("Error fetching toys data:", error);
          res.status(500).json({ error: "Error fetching toys data" });
        });
    });
    
    // Other routes and server setup...

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    //await client.close();
  }
}
run().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
});

app.get("/", (req, res) => {
  res.send("Backend is Running");
});
