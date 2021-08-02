const advanceResults = (model, populate) => async (req, res, next) => {
    let query;
    // Copy from req.query
    const reqQuery = { ...req.query }
    // Fields to exclude
    const removeFields = ['select','sort','page','limit']
    // loop over removeFields and delete them from reqQuery
    removeFields.forEach(el => delete reqQuery[el]);
    // Create query String
    let queryStr = JSON.stringify(reqQuery)
    // Create Operators ($gt, $lt, $in)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
    
    // Fetch model data with query
    query = model.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query.select(fields);
        console.log(`select: ${fields}`);
    }
    // Sort Fields
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query.sort(sortBy);
        console.log(`sort: ${sortBy}`);
    }else{
        query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await model.countDocuments()

    query = query.skip(startIndex).limit(limit)

    // Populate
    if (populate) {
        query = query.populate(populate)
    }

    // Execute Query
    const results = await query;

    // Pagination button
    const pagination = {}
    // next pagination
    if (endIndex < total) {
        pagination.next = {
            next: page + 1,
            limit
        }
    }
    // prev pagination
    if (startIndex > 0) {
        pagination.prev = {
            prev: page - 1,
            limit
        }
    }

    res.advanceResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next()
}

module.exports = advanceResults