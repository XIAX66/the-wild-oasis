class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // 这里接收的是聚合管道对象
    this.queryString = queryString;
    this.pipeline = []; // 新增管道操作存储
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1. 处理status过滤
    if (this.queryString.status) {
      this.pipeline.push({
        $match: { status: this.queryString.status },
      });
    }

    // 2. 处理其他过滤条件（支持MongoDB操作符）
    if (Object.keys(queryObj).length > 0) {
      let matchStage = {};

      // 转换查询操作符（如 gte -> $gte）
      const queryStr = JSON.stringify(queryObj).replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`,
      );

      matchStage = JSON.parse(queryStr);

      this.pipeline.push({ $match: matchStage });
    }

    // 3. 合并原始管道和新添加的过滤条件
    this.query = this.query.appendOptions({
      pipeline: [...this.query.pipeline, ...this.pipeline],
    });

    return this; // 保持链式调用
  }
}

//   sort() {
//     // 2) Sorting
//     if (this.queryString.sort) {
//       const sortBy = this.queryString.sort.split(',').join(' ');
//       // console.log(sortBy);
//       this.query = this.query.sort(sortBy);
//     } else {
//       this.query = this.query.sort('-createdAt');
//     }
//     return this;
//   }

//   limitFields() {
//     // 3) Field limiting
//     if (this.queryString.fields) {
//       const fields = this.queryString.fields.split(',').join(' ');
//       this.query = this.query.select(fields);
//     } else {
//       this.query = this.query.select('-__v');
//     }
//     return this;
//   }

//   paginate() {
//     // 4) Pagenation
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 100;
//     const skip = (page - 1) * limit;

//     this.query = this.query.skip(skip).limit(limit);

//     return this;
//   }
// }

module.exports = APIFeatures;
