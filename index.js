const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000


// middleware
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
app.use(express.json());


// mongodb 
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DATABASE_USER}:${process.env.DATABASE_KEY}@cluster0.cczhmev.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const database = client.db("ProdsSarkDB");
        const productCollection = database.collection("products");


        

        app.get("/products", async (req, res) => {
            const {
              q,
              brand,
              category,
              minPrice,
              maxPrice,
              sortBy,
              page = 0,
              size = 8,
            } = req.query;
      
            const query = {
              ...(q && { productName: { $regex: q, $options: "i" } }),
              ...(brand && { brandName: brand }),
              ...(category && { category: category }),
              ...(minPrice && { price: { $gte: parseFloat(minPrice) } }),
              ...(maxPrice && { price: { $lte: parseFloat(maxPrice) } }),
            };
      
            const sortOptions = {
              ...(sortBy === "priceLowHigh" && { price: 1 }),
              ...(sortBy === "priceHighLow" && { price: -1 }),
              ...(sortBy === "dateAdded" && { dateAdded: -1 }),
            };
            // const sortOptions = {
            //   ...(sortBy === "priceHighLow" && { price: -1 }),
            //   ...(sortBy === "dateAdded" && { dateAdded: -1 }),
            // };
      
            const cursor = productCollection.find(query).sort(sortOptions).skip(page * size).limit(parseInt(size));
            const result = await cursor.toArray();
      
            res.send(result);
          });


        // commented
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})