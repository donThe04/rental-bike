
// Xác thực người dùng qua RFID
const User = require('../models/user');
const jwt = require('jsonwebtoken'); // Import JWT để tạo token

// Xác thực người dùng qua RFID
exports.authenticateUserByRFID = async (req, res) => {
    const { rfid, carId } = req.body;  // Lấy RFID và carId từ body

    try {
        // Tìm người dùng dựa trên RFID
        const user = await User.findOne({ rfid });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Lấy thời gian hiện tại
        const timestamp = new Date().toISOString();

        // Tạo token cho người dùng
        // const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1000h' });

        // Trả về thông tin người dùng, carId và thời gian
        res.json({
            message: 'Authentication successful RFID',
            // token,  
            userId: user._id,
            carId: carId || null,  // Thông tin xe nếu có
            timestamp  // Thời gian hiện tại
        });
    } catch (err) {
        res.status(500).json({ message: 'Error authenticating user', error: err.message });
    }
};
