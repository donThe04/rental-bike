require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const userRoutes = require('./routes/userRoutes');
const carRoutes = require('./routes/carRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const sensorRoutes = require('./routes/sensorRoutes');

const app = express();
// ✅ Render sẽ tự động cấp PORT, nếu không có sẽ dùng 5001
const PORT = process.env.PORT || 5001;

// ✅ 1. Tạo HTTP server
const server = http.createServer(app);

// ✅ 2. Cấu hình Socket.IO (Mở rộng CORS để nhận từ mọi nguồn khi lên Cloud)
const io = new Server(server, {
  cors: {
    origin: "*", // Cho phép tất cả các nguồn để tránh lỗi CORS trên Production
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true
});

// 👉 Đưa instance io vào app để Controller sử dụng (dùng trong sensorController)
app.set('io', io);

// ✅ 3. Cấu hình CORS cho Express
app.use(cors({
  origin: "*", 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
}));

app.use(express.json());

// ✅ 4. Kết nối MongoDB Atlas
const connectDB = async () => {
  try {
    // Sử dụng biến MONGODB_URI từ .env hoặc Render Environment Variables
    const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bike-rental';
    await mongoose.connect(dbURI);
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Không dừng process ngay để có thể debug trên Render logs
  }
};
connectDB();

// ✅ 5. Khai báo Routes
app.use('/api/users', userRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/iot', sensorRoutes);

app.get('/', (req, res) => {
  res.send('🚀 IoT Bike Rental Server is Running on Cloud!');
});

// ✅ 6. Quản lý kết nối Socket.io
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Cho phép Frontend gia nhập phòng (room) để nhận dữ liệu từ ESP32 cụ thể
  socket.on('join', (roomName) => {
    socket.join(roomName);
    console.log(`🏠 Client ${socket.id} gia nhập phòng: ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ✅ 7. Khởi động Server
// Trên Render, không nên bắt buộc '0.0.0.0' trong một số trường hợp, chỉ cần listen PORT
server.listen(PORT, () => {
  console.log('------------------------------------------------');
  console.log(`🚀 Server is running on port: ${PORT}`);
  console.log(`📡 Cloud API: Ready for ESP32 and React`);
  console.log('------------------------------------------------');
});