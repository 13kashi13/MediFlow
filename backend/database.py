import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

# Initialize the Supabase client
supabase: Client = create_client(url, key)

def log_audit(user_id: str, user_name: str, action: str, resource: str, details: str, ip_address: str = None):
    """
    Helper function to log actions to the audit_logs table.
    """
    try:
        supabase.table('audit_logs').insert({
            'user_id': user_id,
            'user_name': user_name,
            'action': action,
            'resource': resource,
            'details': details,
            'ip_address': ip_address
        }).execute()
    except Exception as e:
        print(f"Failed to write audit log: {e}")
