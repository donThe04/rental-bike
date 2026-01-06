const Telemetry = require('../models/telemetry');
const Car = require('../models/car');

// ESP32 gửi dữ liệu
exports.receiveTelemetry = async (req, res) => {
  // 1. LOG: Kiểm tra xem có yêu cầu nào gửi đến không
  console.log("\n--- [ESP32 REQUEST RECEIVED] ---");
  console.log("Time:", new Date().toLocaleString());
  console.log("Body từ ESP32:", req.body); // In toàn bộ dữ liệu nhận được

  const { carId, bpm, temperature, latitude, longitude } = req.body;

  if (!carId) {
    console.error("❌ Lỗi: ESP32 gửi thiếu carId");
    return res.status(400).json({ message: 'Missing carId' });
  }

  try {
    const telemetry = new Telemetry({
      carId,
      bpm,
      temperature,
      location: { latitude, longitude }
    });

    await telemetry.save();
    console.log(`✅ Đã lưu Telemetry vào DB cho xe: ${carId}`);

    // 🔥 SOCKET REALTIME THEO XE
    const io = req.app.get('io');
    if (io) {
      io.to(`car-${carId}`).emit('telemetry', {
        carId,
        bpm,
        temperature,
        latitude,
        longitude,
        createdAt: telemetry.createdAt
      });
      console.log(`📡 Đã phát Socket.io tới room: car-${carId}`);
    } else {
      console.warn("⚠️ Cảnh báo: Không tìm thấy đối tượng Socket.io (io)");
    }

    // cập nhật vị trí xe
    if (latitude && longitude) {
      const updatedCar = await Car.findByIdAndUpdate(carId, {
        location: { latitude, longitude }
      });
      
      if (updatedCar) {
        console.log(`📍 Đã cập nhật vị trí mới cho xe ${carId} trên bản đồ`);
      } else {
        console.error(`❌ Lỗi: Không tìm thấy xe với ID ${carId} trong DB để update vị trí`);
      }
    }

    res.status(201).json({
      message: 'Telemetry data saved',
      telemetry
    });
    
    console.log("--------------------------------\n");

  } catch (err) {
    console.error("💥 Lỗi hệ thống khi xử lý Telemetry:", err.message);
    res.status(500).json({
      message: 'Error saving telemetry',
      error: err.message
    });
  }
};

// lấy telemetry mới nhất
exports.getLatestTelemetry = async (req, res) => {
  const { carId } = req.params;
  console.log(`🔍 Đang lấy dữ liệu mới nhất cho xe: ${carId}`);

  try {
    const telemetry = await Telemetry
      .findOne({ carId })
      .sort({ createdAt: -1 });

    if (!telemetry) {
      console.warn(`⚠️ Không tìm thấy dữ liệu Telemetry cho xe ${carId}`);
    }

    res.json({ telemetry });
  } catch (err) {
    console.error("💥 Lỗi khi lấy Latest Telemetry:", err.message);
    res.status(500).json({
      message: 'Error fetching telemetry',
      error: err.message
    });
  }
};