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
const PORT = process.env.PORT || 5001;
// ✅ 1. Tạo HTTP server
const server = http.createServer(app);

// ✅ 2. Cấu hình Socket.IO
const io = new Server(server, {
  cors: {
    // CŨ: origin: ["http://localhost:3000", "http://172.20.10.8:3000"],
    // MỚI: Cho phép tất cả origin để nhận kết nối từ link Cloudflare công khai
    origin: "*", 
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true
});

// 👉 Đưa instance io vào app để Controller sử dụng
app.set('io', io);

// ✅ 3. Cấu hình CORS cho Express
app.use(cors({
  // CŨ: origin: ["http://localhost:3000", "http://172.20.10.8:3000"],
  // MỚI: Sử dụng "*" để không bị lỗi CORS khi truy cập qua URL Cloudflare
  origin: "*", 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
// ✅ 4. Kết nối MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/bike-rental');
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};
connectDB();
// ✅ 5. Khai báo Routes
app.use('/api/users', userRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/iot', sensorRoutes);
app.get('/', (req, res) => {
  res.send('IoT Bike Rental Server is Running...');
});
// ✅ 6. Quản lý kết nối Socket.io (ĐÃ THÊM LOGIC JOIN ROOM)
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  // QUAN TRỌNG: Cho phép Frontend gia nhập phòng để nhận dữ liệu từ ESP32
  socket.on('join', (roomName) => {
    socket.join(roomName);
    console.log(`🏠 Client ${socket.id} gia nhập phòng: ${roomName}`);
  });
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});
// ✅ 7. Khởi động Server
server.listen(PORT, '0.0.0.0', () => {
  console.log('------------------------------------------------');
  console.log(`🚀 Server is running on port: ${PORT}`);
  // CŨ: console.log(`🌐 Network URL: http://172.20.10.8:${PORT}`);
  // MỚI: Hiển thị link Cloudflare để tiện theo dõi
  console.log(`🌐 Cloudflare Public URL: https://ron-firefox-cornwall-musicians.trycloudflare.com`);
  console.log('------------------------------------------------');
});