import * as fs from 'fs';
import * as path from 'path';

class Helper {

  public capitalizeFirstLetter(aString) {
    if (aString === 'ETF') {
      return aString;
    } else if (aString) {
      return aString.charAt(0).toUpperCase() + aString.slice(1).toLowerCase();
    } else {
      return null;
    }
  }

  public getCORSHeaders () {
    return {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
      'Content-Type': 'application/json'
    };
  }

  public recursiveReaddirSync(aPath: string) {
    const files = fs.readdirSync(aPath);
    let list: string[] = [];
    let stats;

    files.forEach((aFile) => {
      stats = fs.lstatSync(path.join(aPath, aFile));
      if (stats.isDirectory()) {
        list = list.concat(this.recursiveReaddirSync(path.join(aPath, aFile)));
      } else {
        list.push(path.join(aPath, aFile));
      }
    });

    return list;
  }

}

export const helper = new Helper();
