const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { GridFSBucket } = require('mongodb');

dotenv.config({ path: './config.env' });

// 连接数据库
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log('DB connection successful!');
});

// 初始化 GridFSBucket
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = new GridFSBucket(conn.db, {
    bucketName: 'uploads', // 设置 GridFS 集合名称
  });

  // 确保 GridFS 初始化完成后执行后续代码
  updateJsonFile(gfs);
});

// 上传图片到 GridFS 并返回 URL
const uploadImage = (gfs, imagePath) => {
  return new Promise((resolve, reject) => {
    const filename = imagePath.split('/').pop(); // 使用文件名作为 GridFS 中的文件名
    const writeStream = gfs.openUploadStream(filename);

    fs.createReadStream(imagePath)
      .pipe(writeStream)
      .on('finish', () => {
        const imageUrl = `http://localhost:3000/images/${writeStream.id}`; // 生成图片 URL
        resolve(imageUrl);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

// 更新 JSON 文件中的图片 URL
const updateJsonFile = async (gfs) => {
  try {
    // 读取 JSON 数据
    const cabins = JSON.parse(
      fs.readFileSync(`${__dirname}/cabins-simple.json`, 'utf-8'),
    );

    // 上传图片并更新 JSON 数据
    for (const cabin of cabins) {
      const imagePath = `${__dirname}/cabins/${'cabin-' + cabin.name + '.jpg'}`; // 假设图片路径在 images 文件夹中
      const imageUrl = await uploadImage(gfs, imagePath); // 上传图片并获取 URL
      cabin.image = imageUrl; // 更新图片 URL
    }

    // 将更新后的数据写回 JSON 文件
    fs.writeFileSync(
      `${__dirname}/cabins-updated.json`,
      JSON.stringify(cabins, null, 2),
    );

    console.log('JSON 文件已更新，图片 URL 已生成！');
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit();
};
