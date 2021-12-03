const advancedResults = (model, populate) => async (req, res, next) => {
    const reqQuery = { ...req.query };

    // Fields to exclude, and remove them
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach((param) => delete reqQuery[param]);
   
    // Create querry string and add operators
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
   
    // Finding resources id DB
    let query;
    if (req.params.userId) {
      query = model.find({
        $and: [{ user: req.params.userId }, JSON.parse(queryStr)],
      });
    } else {
      query = model.find(JSON.parse(queryStr));
    }
  
    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      // Selecting fields to display
      query = query.select(fields);
    }
    if (req.query.sort) {
      const fields = req.query.sort.split(',').join(' ');
      // Sorting by fields
      query = query.sort(fields);
    } else {
      query = query.sort('-date');
    }
  
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 55;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
  
    query = query.skip(startIndex).limit(limit);

    if(populate) {
        query = query.populate(populate);
    }
 
    // Exequting query
    const results = await query;
  
    // Pagination result
    const pagination = {};
  
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }
  
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit,
      };
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }
    next();
};

module.exports = advancedResults;