import { createConnection } from "mysql2";
import dotenv from "dotenv";

// export default connection;
class DatabaseConnection {
  constructor() {
    if (!DatabaseConnection.instance) {
      dotenv.config();
      // connection to the database
      const connection = createConnection({
        host: "localhost",
        user: "root",
        password: "Stuccosong88",
        database: "generative_ai",
      });

      // Connect to MySQL
      connection.connect((err) => {
        if (err) throw err;
        console.log("Connected to the MySQL server.");
      });
      DatabaseConnection.instance = connection;
    }
    // Initialize object
    return DatabaseConnection.instance;
  }
  // Properties & Methods
}

export default DatabaseConnection;
