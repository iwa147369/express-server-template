#!/bin/bash

# Project Setup Script
# This script sets up the development environment for the Retail Management API

echo "🚀 Setting up Retail Management API..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Google Sheets credentials"
else
    echo "✅ .env file already exists"
fi

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    echo "📁 Creating logs directory..."
    mkdir -p logs
else
    echo "✅ Logs directory already exists"
fi

# Run tests to verify setup
echo "🧪 Running tests to verify setup..."
npm test

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Google Sheets credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000/api/health to verify the setup"
echo ""
