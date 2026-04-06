import sys
import secrets
try:
    from jose import jwt
    IS_JOSE = True
except ImportError:
    import jwt
    IS_JOSE = False

jwt_secret = "super_secret_jwt_token_with_exactly_32_chars_stl_prime!"
postgres_password = secrets.token_hex(16)

anon_payload = {"role": "anon", "iss": "supabase", "iat": 1600000000, "exp": 2600000000}
service_role_payload = {"role": "service_role", "iss": "supabase", "iat": 1600000000, "exp": 2600000000}

if IS_JOSE:
    anon_key = jwt.encode(anon_payload, jwt_secret, algorithm="HS256")
    service_role_key = jwt.encode(service_role_payload, jwt_secret, algorithm="HS256")
else:
    anon_key = jwt.encode(anon_payload, jwt_secret, algorithm="HS256")
    service_role_key = jwt.encode(service_role_payload, jwt_secret, algorithm="HS256")
    if isinstance(anon_key, bytes):
        anon_key = anon_key.decode('utf-8')
    if isinstance(service_role_key, bytes):
        service_role_key = service_role_key.decode('utf-8')

env_content = f"""POSTGRES_PASSWORD={postgres_password}
JWT_SECRET={jwt_secret}
ANON_KEY={anon_key}
SERVICE_ROLE_KEY={service_role_key}

# Gateway / Cong / API Setup
API_EXTERNAL_URL=http://localhost:15432
SITE_URL=http://localhost:15300
"""

with open(".env.supabase", "w") as f:
    f.write(env_content)

print(".env.supabase created successfully")
