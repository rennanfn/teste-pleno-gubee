/* eslint-disable no-unused-vars */
declare namespace Express {
  interface Request {
    customProperties: {
      login: string;
      id: string;
      token_data?: any;
    };
    userIp: {
      ip: string;
      isPublic: boolean;
    };
  }
}
