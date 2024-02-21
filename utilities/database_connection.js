import { createConnection } from "mysql2";
import dotenv from "dotenv";

class DatabaseConnection {
  static connections = {};

  static getConnection(databaseName) {
    if (!this.connections[databaseName]) {
      dotenv.config();
      const connection = createConnection({
        host: "localhost",
        user: "root",
        password: "Stuccosong88",
        database: databaseName,
      });

      connection.connect((err) => {
        if (err) throw err;
        console.log(`Connected to the MySQL server: ${databaseName}`);
      });

      this.connections[databaseName] = connection;
    }
    return this.connections[databaseName];
  }
}

export default DatabaseConnection;
