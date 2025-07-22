#!/bin/bash

# FastAPI Authentication System Startup Script

echo "🚀 Starting FastAPI Authentication System..."
echo "================================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7+ first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip first."
    exit 1
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "⚠️  requirements.txt not found"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ] && [ -f ".env.template" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.template .env
    echo "✅ Created .env file. You can customize it as needed."
fi

# Start the FastAPI server
echo "🌟 Starting FastAPI server..."
echo "🔗 Server will be available at: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "To stop the server, press Ctrl+C"
echo "================================================"

# Start uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
