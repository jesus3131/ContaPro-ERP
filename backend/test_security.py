# test_security.py
# Propósito: Script de prueba para verificar hash de contraseñas y tokens JWT

import sys
sys.path.insert(0, '.')
from app.core.security import verify_password, get_password_hash
print('Import OK')
h = get_password_hash('admin123')
print(f'Hash: {h}')
print(f'Verify: {verify_password("admin123", h)}')
