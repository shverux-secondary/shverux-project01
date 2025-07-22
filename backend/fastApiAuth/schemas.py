
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    """Base user schema"""
    username: str
    email: str

class UserCreate(UserBase):
    """Schema for user creation (registration)"""
    password: str

    @validator('username')
    def username_must_be_valid(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 50:
            raise ValueError('Username must be less than 50 characters')
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v

    @validator('password')
    def password_must_be_valid(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if len(v) > 100:
            raise ValueError('Password must be less than 100 characters')
        return v

class UserLogin(BaseModel):
    """Schema for user login"""
    username: str
    password: str

class UserResponse(BaseModel):
    """Schema for user response (excludes sensitive data)"""
    id: int
    username: str
    email: str
    message: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Updated for Pydantic v2
        # orm_mode = True  # For Pydantic v1

class LoginResponse(BaseModel):
    """Schema for login response"""
    message: str
    user: UserResponse

class MessageResponse(BaseModel):
    """Simple message response schema"""
    message: str
    status_code: Optional[int] = None
