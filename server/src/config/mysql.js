const mysql = require("mysql2/promise");
require("dotenv").config();

const config = {
  user: "uvjrd469tio0mrjz",
  host: "bw29rwejnmb7a0ihv8ip-mysql.services.clever-cloud.com",
  password: "A6q9yQI2tphgxS9bxWN0",
  database: "bw29rwejnmb7a0ihv8ip",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
}

const config2 = {
  user: "root",
  host: "localhost",
  password: "rahul@1992#",
  database: "scheduler",
  waitForConnections: true,
}

const pool = mysql.createPool(config2);

module.exports = pool;