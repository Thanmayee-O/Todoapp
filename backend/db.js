import mongoose from "mongoose";

export async function connectdb(URI){
    await mongoose.connect(URI)
    console.log("Database has connected")
}