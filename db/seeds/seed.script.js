/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { dropDb, seedDb } = require('./index');
const questions = require('../data/questions.json');

const { NODE_ENV } = process.env;
const DB_URI = process.env[`${NODE_ENV}_DB_URI`];

mongoose.connect(DB_URI)
  .then(() => console.log(`Connected to ${NODE_ENV} database`))
  .then(() => dropDb())
  .then(() => console.log(`Dropped ${NODE_ENV} database`))
  .then(() => {
    return seedDb(questions);
  })
  .then(() => console.log(`Seeded ${NODE_ENV} database`))
  .then(() => mongoose.disconnect());
