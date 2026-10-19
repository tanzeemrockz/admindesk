import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://jerjcyesegdpbicfhajz.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcmpjeWVzZWdkcGJpY2ZoYWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNzU5NzEsImV4cCI6MjEwNzY1MTk3MX0.Sd3yMYKVtuJQjSrF_9orA4kqtIdGo-gXMCdzmLHFVxw';

export const INTAKE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfMF3Inm3AfIOPMHFS1sq2yTuSkACQ6QweBD9RDcf93SqHGeg/viewform?usp=header';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});
