//import
import express  from "express";
import mongoose from "mongoose";
import whatsupSchema  from "./messagesModel.js";
import Pusher from "pusher";
import cors from "cors";

//app config
const app = express();
const port = process.env.PORT || 9000;
const db = mongoose.connection;

//pusher logic
db.once('open',() => {
    console.log("stream open....");
    const msgCollection = db.collection('whatsupschemas'); //watch for changes to the schema
    const changeStream = msgCollection.watch();
    changeStream.on('change',(change) => {
        console.log('A change occurred',change);
        if(change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted",{
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
            });
        } else {
            console.log("error triggering Pusher");
        }

    });
});
//pusher config
const pusher = new Pusher({
    appId: "1469083",
    key: "c5126fe6fc5c15423b73",
    secret: "512acc30a0d2cedd3c9a",
    cluster: "mt1",
    useTLS: true
});

//middleware
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

// db config
const MONGO_URL = "mongodb+srv://admin:admin@cluster0.rltzsfl.mongodb.net/whatsupclonedb?retryWrites=true&w=majority"
mongoose.connect(MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(function(response) {
    console.log("Connected to MongoDB");
}).catch(function(err) {
    console.log(err)
});

// api routes
app.get('/', (req, res) => res.status(200).send('heey whatsupMern api'));

    //create a new msg
app.post('/messages/new', (req, res) => {
    const msg = req.body;
    whatsupSchema.create(msg,(err,data) =>{
        if(err) {
            res.status(500).send(err);
        } else { res.status(200).send(data);
        }
    });
});
    //fetch a msg
app.get('/messages/sync', (req, res) =>{
    whatsupSchema.find((err,data) =>{
        if(err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    });
});

//listen
app.listen(port,() =>console.log('listening on port ' + port));