import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to set the user context for RLS
const setUserContext = async (userAvatar: string) => {
  await supabase.rpc('set_user_id', { user_id: userAvatar });
};

// Wrapper function to execute Supabase operations with user context
export const withUserContext = async <T>(
  operation: () => Promise<T>,
  userAvatar: string
): Promise<T> => {
  await setUserContext(userAvatar);
  return operation();
}; 