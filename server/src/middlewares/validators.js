const { BadRequestError } = require('../errors');
const schems = require('../validationSchemes/schems');

module.exports.validateRegistrationData = async (req, res, next) => {
  const validationResult = await schems.registrationSchem.isValid(req.body);
  if (!validationResult) {
    return next(new BadRequestError('Invalid data for registration'));
  } else {
    next();
  }
};

module.exports.validateLogin = async (req, res, next) => {
  const validationResult = await schems.loginSchem.isValid(req.body);
  if (validationResult) {
    next();
  } else {
    return next(new BadRequestError('Invalid data for login'));
  }
};

// In your validators.js
module.exports.validateContestCreation = (req, res, next) => {
  console.log('🔍 SERVER VALIDATOR DEBUG - Starting contest validation');
  console.log(
    '🔍 SERVER VALIDATOR DEBUG - Request body keys:',
    Object.keys(req.body)
  );
  console.log(
    '🔍 SERVER VALIDATOR DEBUG - Contests data type:',
    typeof req.body.contests
  );

  if (!req.body.contests) {
    console.log('❌ SERVER VALIDATOR DEBUG - No contests in request body');
    return next(new BadRequestError('No contests provided'));
  }

  let contestsArray;
  try {
    // Check if contests is a string (JSON) or already an array
    if (typeof req.body.contests === 'string') {
      contestsArray = JSON.parse(req.body.contests);
      console.log(
        '🔍 SERVER VALIDATOR DEBUG - Parsed contests from JSON string'
      );
    } else {
      contestsArray = req.body.contests;
      console.log('🔍 SERVER VALIDATOR DEBUG - Contests is already an array');
    }
  } catch (parseError) {
    console.log(
      '❌ SERVER VALIDATOR DEBUG - Failed to parse contests:',
      parseError
    );
    return next(new BadRequestError('Invalid contests format'));
  }

  console.log(
    '🔍 SERVER VALIDATOR DEBUG - Number of contests:',
    contestsArray.length
  );
  console.log('🔍 SERVER VALIDATOR DEBUG - Contests array:', contestsArray);

  const promiseArray = [];
  contestsArray.forEach((el, index) => {
    console.log(`🔍 SERVER VALIDATOR DEBUG - Validating contest ${index}:`, {
      contestType: el.contestType,
      title: el.title,
      industry: el.industry,
      focusOfWork: el.focusOfWork,
      targetCustomer: el.targetCustomer,
    });
    promiseArray.push(schems.contestSchem.isValid(el));
  });

  return Promise.all(promiseArray)
    .then((results) => {
      console.log('🔍 SERVER VALIDATOR DEBUG - Validation results:', results);
      results.forEach((result, index) => {
        if (!result) {
          console.log(
            `❌ SERVER VALIDATOR DEBUG - Contest ${index} failed validation`
          );
          return next(new BadRequestError(`Contest ${index} is invalid`));
        }
      });
      console.log(
        '✅ SERVER VALIDATOR DEBUG - All contests validated successfully'
      );
      next();
    })
    .catch((err) => {
      console.log('❌ SERVER VALIDATOR DEBUG - Validation promise error:', err);
      next(err);
    });
};
