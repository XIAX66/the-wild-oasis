const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// 初始化 GridFSBucket
let bucket;
const conn = mongoose.connection;
conn.once('open', () => {
  bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads', // 指定存储桶名称（对应集合）
  });
  //console.log('GridFSBucket initialized');
});

router.get('/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const files = await bucket.find({ _id: fileId }).toArray();

    if (!files.length) return res.status(404).send('File not found');
    const file = files[0];

    // 设置响应头（关键修改）
    res.set({
      'Content-Type': file.contentType || 'image/jpeg', // 确保有默认类型
      'Content-Disposition': `inline; filename="${file.filename}"`, // 内联显示并指定文件名
    });

    // 流式传输
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).send('Error streaming file');
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
