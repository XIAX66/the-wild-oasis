const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { initializeGridFS } = require('./utils/gridfs');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shuting down...');
  console.log(err.name + ':', err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

// declare DB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB)
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection successful!');
  });

initializeGridFS();

const app = require('./app');

// 4) SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shuting down...');
  console.log(err.name + ':', err.message);
  server.close(() => {
    process.exit(1);
  });
});
