const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// ESP32 gửi dữ liệu
router.post('/telemetry', sensorController.receiveTelemetry);

// lấy dữ liệu mới nhất
router.get('/telemetry/latest/:carId', sensorController.getLatestTelemetry);

module.exports = router;
