import dotenv from "dotenv";
dotenv.config();

const isTest:boolean = process.env.ENVIRONMENT === 'test';
const whitelist = ['https://hypercho.com'];

export const corsOptions = ()=>{

    //if its in production allow only sites in the whitelist
    if(!isTest){ 
         return {
            origin: function (origin:any, callback:any) {
                if (whitelist.indexOf(origin) !== -1) {
                    callback(null, true)
                } else {
                    callback(new Error('Not allowed by CORS'))
                }
            }
        }
    }
    //if its in test environment return origin to allow all
    return {
        origin: '*'
    }
}