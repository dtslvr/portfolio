class Helper {

  public getCORSHeaders () {
    return {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
    };
  }

}

export const helper = new Helper();
