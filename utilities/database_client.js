import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

/**
 * Database client class to connect to MongoDB.
 * Follows singleton design pattern.
 */
export class DatabaseClient {
  constructor() {
    if (!DatabaseClient.instance) {
      try {
        // Connect to MongoDB
        const uri = process.env.MONGODB_URI || `mongodb://127.0.0.1:27017/`;
        mongoose
          .connect(uri, {
            dbName: "generativeai",
          })
          .then(() => {
            console.log("MongoDB connected successfully");
          })
          .catch((err) => {
            console.error("Error connecting to MongoDB:", err);
          });

        DatabaseClient.instance = mongoose.connection;
      } catch (error) {
        console.error("Error initializing DatabaseClient:", error);
      }
    }

    return DatabaseClient.instance;
  }
}

export default DatabaseClient;
