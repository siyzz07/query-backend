export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login successful.',
    INVALID_CREDENTIALS: 'Invalid email .',
    TOKEN_MISSING: 'Access token missing.',
    TOKEN_INVALID: 'Invalid or expired token.',
    FORBIDDEN: 'Access forbidden.',
    OTP_SENT_SUCCESS: 'OTP sent successfully.',
    OTP_INVALID: 'Invalid or expired OTP code.'
  },
  DOCUMENT: {
    FETCH_SUCCESS: 'Documents fetched successfully.',
    CREATE_SUCCESS: 'Document created successfully.',
    DELETE_SUCCESS: 'Document deleted successfully.',
    NOT_FOUND: 'Document not found.',
    MISSING_FIELDS: 'Missing required document fields.'
  },
  VENDOR: {
    CREATE_SUCCESS: 'Vendor created successfully.',
    CREATE_FAILED: 'Failed to create vendor.',
    ALREADY_EXISTS: 'Vendor with this email already exists.',
    VENDOR_NOT_FOUND: 'Vendor not found.'
  },
  SERVER: {
    INTERNAL_ERROR: 'Internal server error.'
  },
  SUPERADMIN: {
    CREATE_VENDOR_SUCCESS: 'Vendor created successfully.',
    CREATE_VENDOR_FAILED: 'Failed to create vendor.',
    ALREADY_EXISTS: 'Vendor with this email already exists.',
    INVALID_CREDENTIALS: 'Invalid secret key.',
    
  },
  QUERY: {
    INVALID_SECRET_KEY: 'Invalid Secret Key',
    API_KEY_NOT_AVAILABLE: 'API KEY not available',
  }
};
export type Message = typeof MESSAGES;
