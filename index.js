



const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())

const uri = "mongodb+srv://plateShare-user:10sLPXzCY1eC83kf@cluster0.zrfyfih.mongodb.net/?appName=Cluster0";

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
        const foodsCollection = db.collection('foods'); 

        // ADD FOOD (CREATE)
        app.post('/api/v1/foods', async (req, res) => {
            try {
                const newFood = req.body;

                if (!newFood.food_name || !newFood.food_image || !newFood.quantity || !newFood.pickup_location) {
                    return res.status(400).send({ message: 'Missing required fields.' });
                }

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

        app.get('/api/v1/my-foods', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                return res.status(400).send({ message: "Email is required" });
            }

            const cursor = foodsCollection.find({ "donator.email": email });
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/api/v1/foods/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const food = await foodsCollection.findOne(query);

                if (!food) {
                    return res.status(404).send({ message: "Food not found" });
                }
                res.send(food);
            } catch (error) {
                console.error('Error fetching single food:', error);
                res.status(500).send({ message: 'Invalid ID or server error.' });
            }
        });

        app.patch('/api/v1/foods/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updateData = req.body;

                const query = { _id: new ObjectId(id) };
                const update = {
                    $set: {
                        food_name: updateData.food_name,
                        food_image: updateData.food_image,
                        quantity: updateData.quantity,
                        pickup_location: updateData.pickup_location,
                        expire_date: updateData.expire_date,
                        notes: updateData.notes,
                        food_status: updateData.food_status || 'Available',
                    },
                };
                const result = await foodsCollection.updateOne(query, update);

                if (result.matchedCount === 0) {
                    return res.status(404).send({ message: "Food not found" });
                }

                res.send({
                    success: true,
                    message: 'Food updated successfully',
                    ...result
                });
            } catch (error) {
                console.error('Error updating food:', error);
                res.status(500).send({ message: 'Invalid ID or server error.' });
            }
        });

        app.delete('/api/v1/foods/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await foodsCollection.deleteOne(query);

                if (result.deletedCount === 0) {
                    return res.status(404).send({ message: "Food not found" });
                }

                res.send({
                    success: true,
                    message: 'Food deleted successfully',
                    ...result
                });
            } catch (error) {
                console.error('Error deleting food:', error);
                res.status(500).send({ message: 'Invalid ID or server error.' });
            }
        });


        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        })

        // GET ALL PRODUCTS -->
        app.get('/products', async (req, res) => {

            console.log(req.query);
            const email = req.query.email;
            const query = {}
            if (email) {
                query.donator_email = email;

            }
            const cursor = productsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        // GET TOP PRODUCTS -->
        app.get('/top_products', async (req, res) => {
            const cursor = productsCollection.find().sort({ quantity: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        // GET ONE PRODUCT -> 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        // POST PRODUCT ->
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.send(result);
        })

        // UPDATE PRODUCT ->
        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedProduct = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: {
                    food_image: updatedProduct.food_image,

                }
            }
            const result = await productsCollection.updateOne(query, update);
            res.send(result);
        })


        // DELETE PRODUCT -> 
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





