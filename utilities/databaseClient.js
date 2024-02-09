import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

// Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});
const User = mongoose.model('user', userSchema);

/**
 * Database client class to connect to MongoDB.
 * Follows singleton design pattern.
 */
class DatabaseClient {
    constructor() {
      if (!DatabaseClient.instance) {
        // Connect to MongoDB
        const uri = `mongodb+srv://gurtejmalik:${process.env.MONGO_KEY}@generativeai.qqdsbwh.mongodb.net`;
        mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log('MongoDB connected successfully');
        }).catch(err => {
            console.error('Error connecting to MongoDB:', err);
        })

        DatabaseClient.instance = mongoose.connection;
      }
      return DatabaseClient.instance;
    }
    
    // Properties & Methods
  }
  
  export default DatabaseClient;