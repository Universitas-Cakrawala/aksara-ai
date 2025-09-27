import requests
import json

# Test register
register_data = {
    "username": "testuser",
    "password": "testpass123",
    "nama_lengkap": "Test User",
    "email": "test@example.com"
}

try:
    print("Testing register endpoint...")
    response = requests.post("http://localhost:8000/api/v1/users/register", json=register_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")

# Test login
login_data = {
    "username": "testuser",
    "password": "testpass123"
}

try:
    print("\nTesting login endpoint...")
    response = requests.post("http://localhost:8000/api/v1/users/login", json=login_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")