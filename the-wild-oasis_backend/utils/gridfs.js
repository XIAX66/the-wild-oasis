const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfs;

const initializeGridFS = () => {
  const conn = mongoose.connection;
  conn.once('open', () => {
    gfs = new GridFSBucket(conn.db, {
      bucketName: 'uploads',
    });
    console.log('GridFS initialized');
  });
};

const getGridFS = () => gfs;

module.exports = { initializeGridFS, getGridFS };
