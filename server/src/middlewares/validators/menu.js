import Joi from 'joi';
import validate from 'express-validation';
import moment from 'moment';

const categories = Joi.array().items(Joi.object().keys({
  title: Joi.string()
    .min(2)
    .max(25).required(),
  meals: Joi.array().items(Joi.string().guid({
    version: [
      'uuidv4',
      'uuidv5'
    ]
  })).unique().min(1)
    .required()
}));
const date = Joi.string()
  .min(1)
  .regex(/\d{4}-\d{1,2}-\d{1,2}/)
  .error(() => 'Date format should be "YYYY-DD-MM"');

const token = Joi.string();

/**
 * Checks date and ensures date is valid
 *
 * @param  {object}   req - Request object
 * @param  {object}   res - Response object
 * @param  {Function} next - Middleware next
 * @return {res | undefined} response or calls next function
 */
const ensureDateIsValid = (req, res, next) => {
  if (req.body.date && !moment(req.body.date).isValid()) {
    return res.status(400).json({
      status: 'error',
      message: 'Date is invalid'
    });
  }

  next();
};

/**
 * confirms that date is not in the past
 *
 * @param  {object}   req - Request object
 * @param  {object}   res - Response object
 * @param  {Function} next - Middleware next
 * @return {res | undefined} response or calls next function
 */
const confirmDateIsNotPast = (req, res, next) => {
  if (req.body.date && moment(req.body.date) < moment().startOf('day')) {
    return res.status(400).json({
      status: 'error',
      message: 'You cannot set menu for a date in the past.'
    });
  }

  next();
};

/**
 * Validation middleware
 */
const validateFieldsForCreate = validate({
  body: {
    date,
    categories: categories.required(),
    token
  }
});

/**
 * Array to package middlewares to validate menu creation
 *
 * @type {Array}
 */
export const validateCreate = [
  ensureDateIsValid,
  confirmDateIsNotPast,
  validateFieldsForCreate
];


/**
 * Validation middleware
 */
export const validateUpdate = validate({
  params: {
    date
  },
  body: {
    categories,
    token
  }
});

/**
 * Validation middleware
 */
export const validateDate = validate({
  params: {
    date
  },
  body: {
    token
  }
});
