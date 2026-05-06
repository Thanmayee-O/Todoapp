import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import { connectdb } from './db.js'
import cors from 'cors'
import useroute from './route/useroute.js'
import taskroute from './route/taskroute.js'
import router from './route/allusers.js'

const app = express()

dotenv.config()

app.use(express.json())
app.use(cors())


const port = process.env.PORT || 8000
const URI = process.env.MONGO_URI 

async function start(){
    try{
        await connectdb(URI)
        app.listen(3000, "0.0.0.0", () => {
        console.log("Server running on port 3000");
        });
    }
    catch(err){
        console.log("Connection failed")
        console.log(err)
    }
}

start()

app.use("/api/auth", useroute);
app.use('/api/tasks' , taskroute);
app.use('/api/allusers' , router);