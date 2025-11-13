

const express = require('express');
const cors = require('cors');

// MONGO DB -> 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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
        const usersCollection = db.collection('users');

        // NEEEEEEEW
        const foodsCollection = db.collection('foods');

        // ADD FOOD (CREATE)
        app.post('/api/v1/foods', async (req, res) => {
            try {
                const newFood = req.body;

                // Basic validation
                if (!newFood.food_name || !newFood.food_image || !newFood.quantity || !newFood.pickup_location) {
                    return res.status(400).send({ message: 'Missing required fields.' });
                }

                // Default values
                newFood.food_status = newFood.food_status || 'Available';
                newFood.created_at = new Date().toISOString();

                const result = await foodsCollection.insertOne(newFood);
                res.status(201).send({
                    success: true,
                    message: 'Food item added successfully',
                    insertedId: result.insertedId
                });
            } catch (error) {
                console.error('Error adding food:', error);
                res.status(500).send({ message: 'Server error while adding food.' });
            }
        });



        // USERS -->
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        })

        // GET ALL -->
        app.get('/products', async (req, res) => {

            console.log(req.query);
            const email = req.query.email;
            const query = {}
            if (email) {
                query.donator_email = email;

            }

            // const cursor = productsCollection.find(query).sort({quantity: -1}).limit(6);

            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // 
        app.get('/top_products', async (req, res) => {
            const cursor = productsCollection.find().sort({ quantity: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        // GET ONE -> 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        // POST ->
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        })

        // UPDATE ->
        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: {
                    // name: updatedProduct.name,
                    // price: updatedProduct.price
                    food_image: updatedProduct.food_image,

                }
            }
            const result = await productsCollection.updateOne(query, update);
            res.send(result);
        })


        // DELETE -> 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {

    }
}
run().catch(console.dir)


app.listen(port, () => {
    console.log(`Plate Share Is Running Port, ${port}`);

})












