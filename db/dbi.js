const mysql = require('mysql');

const dbi = {};

dbi.getConnection = () => {
  if (!dbi.connection) {
    const {
      DB_HOST: host,
      DB_USER: user,
      DB_DATABASE: database,
      DB_PASSWORD: password,
    } = process.env;
  
    dbi.connection = mysql.createConnection({
      host,
      user,
      password,
      database,
      multipleStatements: true,
    });
  }
  return dbi.connection;
};

dbi.query = (query, params) => {
  const conn = dbi.getConnection();
  return new Promise((resolve, reject) => {
    conn.query(query, params, (err, data) => {
      if (err) return reject(err);
      else return resolve(data);
    });
  });
};

dbi.closeConnection = () => {
  if (dbi.connection) return dbi.connection.end();
};

module.exports = dbi;