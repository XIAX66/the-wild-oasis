module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
// ！！！ fn must be a async function or return a Promise,
// cause it use catch which is only avaliable in Promise
