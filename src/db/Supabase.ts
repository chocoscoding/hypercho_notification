import { createClient } from '@supabase/supabase-js'
import dotenv from "dotenv";
dotenv.config();
const S_URL : any = process.env.SUPABASE_URL;
const S_KEY : any = process.env.SUPABASE_ANON_KEY;
export const supabase: any = createClient(S_URL,S_KEY);