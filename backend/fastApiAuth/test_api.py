#!/usr/bin/env python3

"""
Test script for FastAPI Authentication System
This script tests the API endpoints to ensure they're working correctly.
"""

import requests
import json
import sys
import time

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER = {
    "username": "testuser123",
    "email": "test@example.com",
    "password": "testpass123"
}

def test_server_connection():
    """Test if the server is running"""
    print("🔍 Testing server connection...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ Server is running")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Server responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server")
        print(f"   Make sure the FastAPI server is running at {BASE_URL}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_user_registration():
    """Test user registration endpoint"""
    print("\n🔍 Testing user registration...")
    try:
        response = requests.post(
            f"{BASE_URL}/register",
            json=TEST_USER,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 201:
            print("✅ User registration successful")
            data = response.json()
            print(f"   User ID: {data.get('id')}")
            print(f"   Username: {data.get('username')}")
            print(f"   Email: {data.get('email')}")
            return True
        elif response.status_code == 400:
            error_data = response.json()
            if "already registered" in error_data.get("message", "").lower():
                print("⚠️  User already exists (this is expected on subsequent runs)")
                return True
            else:
                print(f"❌ Registration failed: {error_data.get('message')}")
                return False
        else:
            print(f"❌ Registration failed with status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Registration test failed: {e}")
        return False

def test_user_login():
    """Test user login endpoint"""
    print("\n🔍 Testing user login...")
    try:
        login_data = {
            "username": TEST_USER["username"],
            "password": TEST_USER["password"]
        }

        response = requests.post(
            f"{BASE_URL}/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            print("✅ User login successful")
            data = response.json()
            print(f"   Message: {data.get('message')}")
            print(f"   User: {data.get('user', {}).get('username')}")
            return True
        else:
            print(f"❌ Login failed with status: {response.status_code}")
            error_data = response.json()
            print(f"   Error: {error_data.get('message')}")
            return False

    except Exception as e:
        print(f"❌ Login test failed: {e}")
        return False

def test_invalid_login():
    """Test login with invalid credentials"""
    print("\n🔍 Testing invalid login...")
    try:
        invalid_data = {
            "username": TEST_USER["username"],
            "password": "wrongpassword"
        }

        response = requests.post(
            f"{BASE_URL}/login",
            json=invalid_data,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 401:
            print("✅ Invalid login correctly rejected")
            return True
        else:
            print(f"❌ Expected 401 status, got: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Invalid login test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 FastAPI Authentication System Test Suite")
    print("=" * 50)

    tests = [
        test_server_connection,
        test_user_registration,
        test_user_login,
        test_invalid_login
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1
        time.sleep(0.5)  # Brief pause between tests

    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! Your FastAPI authentication system is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the error messages above.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
