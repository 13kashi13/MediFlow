from supabase import create_client, ClientOptions
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in the environment")

# Standard client (used for auth operations and user-scoped queries)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Admin client — uses service role key with schema set to bypass RLS on direct table operations
supabase_admin = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
    options=ClientOptions(schema="public")
)
