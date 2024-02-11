import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

/**
 * Database client class to connect to MongoDB.
 * Follows singleton design pattern.
 */
class DatabaseClient {

    constructor() {
      if (!DatabaseClient.instance) {
        // Connect to MongoDB
        const uri = `mongodb+srv://gurtejmalik:${process.env.MONGO_KEY}@generativeai.qqdsbwh.mongodb.net`;
        mongoose.connect(uri).then(() => {
            console.log('MongoDB connected successfully');
        }).catch(err => {
            console.error('Error connecting to MongoDB:', err);
        })

        this.models = {};
        this.createSchemas();
        DatabaseClient.instance = mongoose.connection;
      }
      return DatabaseClient.instance;
    }
    
    /**
     * Method to create schemas and models for the DB.
     * Models are created as members of the databaseClient object.
     */
    createSchemas() {
        // user schema
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
        this.models.User = mongoose.model('User', userSchema);

        // quiz schema
        const quizSchema = new mongoose.Schema({
            title: {
                type: String,
                required: true
            },
            questionObjects: {
                type: Array,
                required: true
            }
        });
        this.models.Quiz = mongoose.model('Quiz', quizSchema);
    }
  }
  
  export default DatabaseClient;
