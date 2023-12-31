const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.seb4mfu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     client.connect();

    const toyCollections = client.db("toyCollections").collection("toyData");

    app.post("/addToys", async (req, res) => {
      const addToys = req.body;
    //   console.log(addToys);

      const result = await toyCollections.insertOne(addToys);
      res.send(result);
    });

    app.get("/allToys", async (req, res) => {
      const cursor = toyCollections.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });
      
      app.get("/allToys/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await toyCollections.findOne(query);
        res.send(result);
      });

    //   fetch toy by category
      app.get("/toyByCategory/:category", async (req, res) => {
        // console.log(req.params.category);
        const toyCategory = await toyCollections
          .find({
            category: req.params.category,
          })
          .toArray();
        res.send(toyCategory);
      });

    //   fetch by email
      app.get("/myToys", async (req, res) => {
        // console.log(req.query.email);
        let query = {};
        if (req.query?.email) {
          query = { sellerEmail: req.query.email };
          // console.log(query);
        }
          const result = await toyCollections.find(query).toArray();
        //   console.log(result);
        res.send(result);
      });

    //   delete item
      app.delete("/myToys/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await toyCollections.deleteOne(query);
        res.send(result);
      });

    //   update
      app.patch("/myToys/:id", async (req, res) => {
          const id = req.params.id;
        //   console.log(id);
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedToy = req.body;
        console.log(updatedToy);

        const setToyData = {
          $set: {
            quantity: updatedToy.updateQuantity,
            price: updatedToy.updatePrice,
            description: updatedToy.updateDescription,
          },
        };

        const result = await toyCollections.updateOne(
          filter,
          setToyData,
          options
        );
        res.send(result);
      });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
