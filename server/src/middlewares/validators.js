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

module.exports.validateContestCreation = async (req, res, next) => {
  if (!req.body.contests) {
    return next(new BadRequestError('No contests provided'));
  }

  let contestsArray;
  try {
    contestsArray =
      typeof req.body.contests === 'string'
        ? JSON.parse(req.body.contests)
        : req.body.contests;
  } catch (parseError) {
    return next(new BadRequestError('Invalid contests format'));
  }

  const validationPromises = contestsArray.map(async (contest, index) => {
    try {
      await schems.contestSchem.validate(contest, { abortEarly: false });
      return { isValid: true };
    } catch (validationError) {
      return {
        isValid: false,
        errors: validationError.errors,
      };
    }
  });

  try {
    const results = await Promise.all(validationPromises);
    const failedValidations = results.filter((result) => !result.isValid);

    if (failedValidations.length > 0) {
      const errorMessages = failedValidations
        .map((failed) => failed.errors.join(', '))
        .join('; ');

      return next(
        new BadRequestError(`Invalid contest data: ${errorMessages}`)
      );
    }

    next();
  } catch (err) {
    next(new BadRequestError('Validation failed'));
  }
};
