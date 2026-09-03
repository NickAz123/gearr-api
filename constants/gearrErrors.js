export const GEAR_ERROR_CODES = {
    GEAR_NOT_FOUND: {
        status: 404,
        message: 'Gear Not Found.'
    },
    GEAR_ALREADY_EXISTS: {
        status: 409,
        message: 'Gear Email or Gearname already exists.',
    },
    GEAR_OBJECT_INVALID: {
        status: 400,
        message: 'Gear Object is invalid.'
    },
    GEAR_UPDATE_FAIL: {
        status: 500,
        message: 'Failed to update user.'
    },
    GEAR_PASSWORD_MISMATCH: {
        status: 500,
        message: 'Password mismatched'
    },
    GEAR_UNAUTHORIZED: {
        status: 401,
        message: 'You do not have permission to access this resource.'
    },
    GEAR_FIELD_EMPTY: {
        status: 400,
        message: 'Field cannot be empty'
    }
}