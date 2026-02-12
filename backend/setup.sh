#!/bin/bash
# Setup script for Online Library Backend with Models

echo "================================"
echo "Online Library Backend Setup"
echo "================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

# Check if data folder exists
if [ ! -d "data" ]; then
    echo "Creating data folder..."
    mkdir -p data
    echo "✓ Data folder created"
else
    echo "✓ Data folder exists"
fi

# Initialize data files if they don't exist
if [ ! -f "data/users.json" ]; then
    echo "[] " > data/users.json
    echo "✓ Created users.json"
fi

if [ ! -f "data/saved.json" ]; then
    echo "[]" > data/saved.json
    echo "✓ Created saved.json"
fi

if [ ! -f "data/otp.json" ]; then
    echo "{}" > data/otp.json
    echo "✓ Created otp.json"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    echo "PORT=3000" > .env
    echo "JWT_SECRET=your_jwt_secret_key_change_in_production" >> .env
    echo "NODE_ENV=development" >> .env
    echo "✓ Created .env file"
else
    echo "✓ .env file exists"
fi

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "To start the server, run:"
echo "  npm start    (production)"
echo "  npm run dev  (development)"
echo ""
echo "Server will run on http://localhost:3000"
echo ""
