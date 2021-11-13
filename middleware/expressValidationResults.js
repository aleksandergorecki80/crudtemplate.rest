const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

const expressValidationResults = (req, res, next) => {
      // Validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let validationErrors = [];
    errors.array().forEach((element) => {
      validationErrors = [...validationErrors, element.msg];
    });
    return next(new ErrorResponse(validationErrors, 404));
  }
  next();
}

module.exports = expressValidationResults;