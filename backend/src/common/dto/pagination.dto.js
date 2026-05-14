const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  return {
    page: parseInt(page),
    limit: parseInt(limit),
    skip,
    totalPages,
    totalResults: total,
  };
};

module.exports = { getPaginationMeta };
