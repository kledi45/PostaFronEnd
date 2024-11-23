// utils/apiResponse.js
export class ApiResponse {
    constructor(statusCode, result = null, message = '') {
      this.statusCode = statusCode;
      this.result = result;
      this.message = message || this.getMessage(); 
    }
    
    getMessage() {
      const statusMessages = {
        0: 'Done',
        1: 'Internal Server Error. Please try again later.',
        2: 'Entity not found. Please check the details and try again.',
        3: 'Unauthorized access. Please log in.',
        4: 'Password is incorrect. Please check your credentials.',
        5: 'User does not exist. Please check the username or register.',
      };
  
      return statusMessages[this.statusCode] || 'An unknown error occurred.';
    }
  
    // Check if the request was successful
    isSuccess() {
      return this.statusCode === 0; // 'Done' corresponds to a successful operation (status code 0)
    }
  }
  