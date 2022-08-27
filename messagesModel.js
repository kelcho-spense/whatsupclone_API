import mongoose from "mongoose";

const whatsupSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean,
});

export default mongoose.model('whatsupSchema', whatsupSchema);    