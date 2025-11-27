const yup = require('yup');

module.exports.registrationSchem = yup.object().shape({
  firstName: yup.string().required().min(1),
  lastName: yup.string().required().min(1),
  displayName: yup.string().required().min(1),
  email: yup.string().email().required().min(4),
  password: yup.string().required().min(1),
  role: yup
    .string()
    .matches(/(customer|creator)/)
    .required(),
});

module.exports.loginSchem = yup.object().shape({
  email: yup.string().email().required().min(4),
  password: yup.string().required().min(1),
});

module.exports.contestSchem = yup.object().shape({
  contestType: yup
    .string()
    .matches(/(name|logo|tagline)/)
    .required('Contest type is required'),
  title: yup.string().required('Title is required').min(1),
  industry: yup.string().required('Industry is required').min(1),
  focusOfWork: yup.string().required('Focus of work is required').min(1),
  targetCustomer: yup.string().required('Target customer is required').min(1),
  fileName: yup.string().optional(),
  originalFileName: yup.string().optional(),
  typeOfName: yup.string().optional(),
  styleName: yup.string().optional(),
  nameVenture: yup.string().optional(),
  typeOfTagline: yup.string().optional(),
  brandStyle: yup.string().optional(),
  file: yup.mixed().nullable().optional(),
  domainOption: yup.number().optional(),
  haveFile: yup.boolean().optional(),
});
