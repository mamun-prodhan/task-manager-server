const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const completedTaskCollection = client.db('taskManager').collection('completedTasks');
        const commentsCollection = client.db('taskManager').collection('comments');
        //post task data from home to database
        app.post('/tasks', async(req, res)=>{
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        });

        //update task data
        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const data = req.body;
            const updateDoc = {
                $set: {
                    "task": data.newTask,
                    // "email": data.email,
                    // "review": data.review
                },
            };
            const result = await taskCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        });

        //post completed task data to database
        app.post("/completedTasks", async(req, res)=>{
            const completedTask = req.body;
            const result = await completedTaskCollection.insertOne(completedTask);
            res.send(result);
        })

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

        //get completedTasks data from database
        app.get('/completedTasks', async(req, res)=>{
            let query = {};

            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }
            const cursor = completedTaskCollection.find(query);
            const completedTasks = await cursor.toArray();
            res.send(completedTasks);
        })

        app.post('/comments', async (req, res) => {
            const comment = req.body;
            const result = await commentsCollection.insertOne(comment); 
            res.send(result);
        });
        
        //delete task
        app.delete("/tasks/:id", async(req, res)=>{
            const id = req.params.id;
            const result = await taskCollection.deleteOne({_id:ObjectId(id)})
            console.log(result)
            res.send(result)
        })

        //delete completed task
        app.delete("/completedTasks/:id", async(req, res)=>{
            const id = req.params.id;
            const result = await completedTaskCollection.deleteOne({_id:ObjectId(id)})
            console.log(result)
            res.send(result)
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