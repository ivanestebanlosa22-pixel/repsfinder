import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gjrjzkwhdtipliwdvkhu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqcmp6a3doZHRpcGxpd2R2a2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjc3MDMsImV4cCI6MjA2NDgwMzcwM30.zIPm1f65N7MsYZvvO7idO_2M7YJDZnohbA8Er3jJhYI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
