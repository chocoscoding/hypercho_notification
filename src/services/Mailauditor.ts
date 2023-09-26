import { readFile } from "fs";

const mailAuditor = async (path: string, dataList: object): Promise<any> => {
  return new Promise((resolve, reject) => {
    readFile(path, `utf-8`, (error: any, data: any) => {
      if (error) {
        console.log(`Error reading file ${path}`);
        reject(error);
      }
      //make a temp variable of data, which is the html returned
      let newdata = data;
      //turn the datalist object to an array
      Object.entries(dataList).forEach(([key, value]) => {
        newdata = newdata.replace(`{{${key}}}`, value);
        //change the newdata variable
      });
      //return the newdata
      console.log(`file read and changed successfully`)
      resolve(newdata);
    });
  });
};

export default mailAuditor;
