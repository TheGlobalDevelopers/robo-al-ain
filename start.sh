#!/bin/bash
echo "Starting Robo Al Ain Supermarket..."

# Start backend
echo "Starting backend server..."
node server/index.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo "Application started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo "Admin: http://localhost:3000/admin"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
