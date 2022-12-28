const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middle wares
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASSWORD)



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nhx4fnh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const taskCollection = client.db('taskManager').collection('tasks');
        //post task data from home to database
        app.post('/tasks', async(req, res)=>{
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        });

        //get task data from database
        app.get('/tasks', async(req, res)=>{
            let query = {};

            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = taskCollection.find(query);
            const tasks = await cursor.toArray();
            res.send(tasks);
        })
        
    }
    finally{

    }
}

run().catch(err => console.error(err));



app.get('/', (req, res) =>{
    res.send('Task Manager Server is Running')
})

app.listen(port, () =>{
    console.log(`Task Manager Server running on ${port}`);
})