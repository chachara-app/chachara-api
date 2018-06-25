/* eslint no-console: 0 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

const { TEST_DB_DATABASE } = process.env;

const connection = (() => {
  const {
    TEST_DB_HOST: host,
    TEST_DB_USER: user,
    TEST_DB_PASSWORD: password,
  } = process.env;

  return mysql.createConnection({
    host,
    user,
    password,
    multipleStatements: true,
  });
})();

const queryDb = queryStr => {
  return new Promise((resolve, reject) => {
    connection.query(queryStr, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

const tables = ['languages', 'questions'];

queryDb(`DROP DATABASE IF EXISTS \`${TEST_DB_DATABASE}\`;`)
  .then(() => {
    console.log('Dropped database');
    return queryDb(`CREATE DATABASE \`${TEST_DB_DATABASE}\`;`);
  })
  .then(() => {
    console.log('Created new database');
    return queryDb(`use \`${TEST_DB_DATABASE}\`;`);
  })
  .then(() => {
    const createTableQueries = tables.map(table => {
      const query = fs.readFileSync(
        path.join(__dirname, '../db/tables', `${table}.sql`),
        'utf8'
      );
      return queryDb(query);
    });
    return Promise.all(createTableQueries);
  })
  .then(() => {
    console.log('Created tables');
    const query = fs.readFileSync(
      path.join(__dirname, '../db/seeds/index.sql'),
      'utf8'
    );
    return queryDb(query);
  })
  .then(() => {
    console.log('Test data inserted');
    return connection.end();
  })
  .then(() => {
    console.log('Connection closed');
  })
  .catch(console.error);
