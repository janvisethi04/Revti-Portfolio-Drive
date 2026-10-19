import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ehsgpwdkmrnfzjxiebtz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoc2dwd2RrbXJuZnpqeGllYnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDI4NzcsImV4cCI6MjA5NjU3ODg3N30.22e4ZXie1-gsBq0sBL3rRxy-DNVjVeP04FqYJZ2jItw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
