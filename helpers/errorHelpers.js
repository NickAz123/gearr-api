import { USER_ERROR_CODES } from '../constants/userErrors.js';
import { SYS_ERROR_CODES } from '../constants/systemErrors.js';
import { GEAR_ERROR_CODES } from '../constants/gearrErrors.js';

const ALL_ERRORS = { ...USER_ERROR_CODES, ...SYS_ERROR_CODES, ...GEAR_ERROR_CODES };

export const sendError = (res, errorCode, customMessage = null) => {
  //Find the configuration or default to a standard 500 server error
  const errorConfig = ALL_ERRORS[errorCode] || SYS_ERROR_CODES.SERVER_ERROR;
  
  return res.status(errorConfig.status).json({
    status: errorConfig.status >= 500 ? 'error' : 'fail',
    code: errorCode || 'INTERNAL_SERVER_ERROR',
    message: customMessage || errorConfig.message
  });

};