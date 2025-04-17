import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://erisxbjrzxjmftgxttfw.supabase.co'  // ← 替换
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaXN4YmpyenhqbWZ0Z3h0dGZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Nzk5ODEsImV4cCI6MjA2MDI1NTk4MX0.90idQMw_S8ODn_7v_KSrEZfhUv3Qoj4vxcvD9wVhpa8'  // ← 替换

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 