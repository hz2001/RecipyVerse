// 📁 supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project-id.supabase.co'  // ← 替换
const supabaseAnonKey = 'your-anon-key'  // ← 替换

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
