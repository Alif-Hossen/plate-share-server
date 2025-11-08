

const express = require('express');
const cors = require('cors');

// MONGO DB -> 
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
const port = process.env.PORT || 3000;

// MIDDLEWARE ->
app.use(cors());
app.use(express.json())

// MONGO URI ->
const uri = "mongodb+srv://plateShare-user:10sLPXzCY1eC83kf@cluster0.zrfyfih.mongodb.net/?appName=Cluster0";

// MONGO CLIENT ->
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



app.get('/', (req, res) => {
    res.send('Plate Share Is Running');
})

async function run() {
    try {
        await client.connect();

        const db = client.db('plate_db');
        const productsCollection = db.collection('products');

        app.post('/products', async(req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        })

        // app.delete('/products/:id', (req, res) => {
        //     const id = 
        // })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally{

    }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`Plate Share Is Running Port, ${port}`);

})












