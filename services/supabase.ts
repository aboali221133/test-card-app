
import { createClient } from '@supabase/supabase-js';

// بيانات مشروعك التي قمت بتزويدي بها
const supabaseUrl = 'https://rdkrpswllzurqwbkcxgy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka3Jwc3dsbHp1cnF3YmtjeGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTM4NjAsImV4cCI6MjA4NzAyOTg2MH0.Og8d4sSVD84cp7wSxpGRl1IJ9vuWMdDlDwKmqn4gbbY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
