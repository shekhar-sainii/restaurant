const standardResponse = (success, data, message) => {
  return {
    success,
    data,
    message,
  };
};

module.exports = { standardResponse };
