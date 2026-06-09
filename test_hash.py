from passlib.context import CryptContext
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
hash = pwd.hash("admin123")
print(f"Hash: {hash}")
result = pwd.verify("admin123", hash)
print(f"Verify: {result}")
