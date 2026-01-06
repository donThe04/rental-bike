const Rental = require('../models/rental');
const Car = require('../models/car');

// Thuê xe
exports.rentCar = async (req, res) => {
  const { carId, rentalStart } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!carId || !rentalStart) {
    return res.status(400).json({ message: 'Missing required fields: carId or rentalStart' });
  }

  try {
    // Kiểm tra xe có tồn tại và sẵn sàng không
    const car = await Car.findById(carId);
    if (!car || !car.available) {
      return res.status(400).json({ message: 'Car is not available for rent' });
    }

    // Tạo giao dịch thuê xe
    const rental = new Rental({
      userId: req.userId, // Lấy từ token
      carId,
      rentalStart: new Date(rentalStart),
      status: 'active', // Đánh dấu là đang thuê
    });
    await rental.save();

    // Cập nhật trạng thái xe
    const car_update = await Car.findOneAndUpdate(
      { _id: carId, available: true }, // Tìm xe khả dụng
      { available: false },            // Đánh dấu xe đã được thuê
      { new: true }                    // Trả về dữ liệu sau khi cập nhật
    );

    if (!car_update) {
      return res.status(404).json({ message: 'Car not found or already rented' });
    }

    res.status(201).json({ message: 'Car rented successfully', rental });
  } catch (err) {
    res.status(500).json({ message: 'Error renting car', error: err.message });
  }
};


//const jwt = require('jsonwebtoken');

// Thuê xe qua RFID
exports.rentCarRFID = async (req, res) => {
  const { carId, rentalStart, userId } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!carId || !rentalStart || !userId) {
      return res.status(400).json({ message: 'Missing required fields: carId, rentalStart, or userId' });
    }

    // Kiểm tra xe có tồn tại và sẵn sàng không
    const car = await Car.findById(carId);
    if (!car || !car.available) {
      return res.status(400).json({ message: 'Car is not available for rent' });
    }

    // Tạo giao dịch thuê xe
    const rental = new Rental({
      userId,
      carId,
      rentalStart: new Date(rentalStart),
      status: 'active', // Đánh dấu là đang thuê
    });
    await rental.save();

    // Cập nhật trạng thái xe
    const car_update = await Car.findOneAndUpdate(
      { _id: carId, available: true },
      { available: false },
      { new: true }
    );

    if (!car_update) {
      return res.status(404).json({ message: 'Car not found or already rented - RFID' });
    }

    res.status(201).json({ message: 'Car rented successfully - RFID', rental });
  } catch (err) {
    res.status(500).json({ message: 'Error renting car RFID', error: err.message });
  }
};



// Trả xe
exports.returnCar = async (req, res) => {
  const { carId, rentalEnd } = req.body; // ID của xe và thời gian kết thúc
  const userId = req.userId; // Lấy từ token (đã xác thực)

  // Kiểm tra dữ liệu đầu vào
  if (!carId || !rentalEnd) {
    return res.status(400).json({ message: 'Missing required fields: carId or rentalEnd' });
  }

  try {
    // Tìm giao dịch thuê theo carId và userId
    const rental = await Rental.findOne({ carId, userId, status: 'active' }).populate('carId');
    if (!rental) {
      return res.status(404).json({ message: 'ReturnCar - Active rental not found for this user with the given carId' });
    }

    // Tính tổng tiền thuê
    const car = rental.carId; // Đối tượng xe được liên kết
    if (!car) {
      return res.status(404).json({ message: 'Car associated with rental not found' });
    }

    // Tính số ngày thuê
    const rentalStart = new Date(rental.rentalStart);
    const rentalEndDate = new Date(rentalEnd);
    const days = Math.ceil((rentalEndDate - rentalStart) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.pricePerDay;

    // Cập nhật trạng thái giao dịch
    rental.status = 'completed';
    rental.rentalEnd = rentalEndDate;
    rental.totalPrice = totalPrice;
    await rental.save();

    // Cập nhật trạng thái xe
    const car_update = await Car.findOneAndUpdate(
      { _id: car._id, available: false }, // Tìm xe đang không khả dụng
      { available: true },               // Đánh dấu xe khả dụng
      { new: true }                      // Trả về dữ liệu sau khi cập nhật
    );

    if (!car_update) {
      return res.status(500).json({ message: 'Failed to update car availability' });
    }

    res.json({ 
      message: 'Car returned successfully', 
      rental: {
        rentalId: rental._id,
        rentalStart: rental.rentalStart,
        rentalEnd: rental.rentalEnd,
        totalPrice: rental.totalPrice,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error returning car', error: err.message });
  }
};



//trả xe qua RFID
// Trả xe
exports.returnCarRFID = async (req, res) => {
  const { carId, rentalEnd, userId } = req.body; // ID của xe và thời gian kết thúc

  // Kiểm tra dữ liệu đầu vào
  if (!carId || !rentalEnd) {
    return res.status(400).json({ message: 'Missing required fields: carId or rentalEnd' });
  }

  try {
    // Tìm giao dịch thuê theo carId và userId
    const rental = await Rental.findOne({ carId, userId, status: 'active' }).populate('carId');
    if (!rental) {
      return res.status(404).json({ message: 'RFID return car Active rental not found for this user with the given carId' });
    }

    // Tính tổng tiền thuê
    const car = rental.carId; // Đối tượng xe được liên kết
    if (!car) {
      return res.status(404).json({ message: 'Car associated with rental not found' });
    }

    // Tính số ngày thuê
    const rentalStart = new Date(rental.rentalStart);
    const rentalEndDate = new Date(rentalEnd);
    const days = Math.ceil((rentalEndDate - rentalStart) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.pricePerDay;

    // Cập nhật trạng thái giao dịch
    rental.status = 'completed';
    rental.rentalEnd = rentalEndDate;
    rental.totalPrice = totalPrice;
    await rental.save();

    // Cập nhật trạng thái xe
    const car_update = await Car.findOneAndUpdate(
      { _id: car._id, available: false }, // Tìm xe đang không khả dụng
      { available: true },               // Đánh dấu xe khả dụng
      { new: true }                      // Trả về dữ liệu sau khi cập nhật
    );

    if (!car_update) {
      return res.status(500).json({ message: 'Failed to update car availability' });
    }

    res.json({ 
      message: 'Car returned successfully', 
      rental: {
        rentalId: rental._id,
        rentalStart: rental.rentalStart,
        rentalEnd: rental.rentalEnd,
        totalPrice: rental.totalPrice,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error returning car', error: err.message });
  }
};




// Lấy danh sách giao dịch thuê xe của người dùng
exports.getUserRentals = async (req, res) => {
  const { userId } = req.params;

  // Kiểm tra dữ liệu đầu vào
  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }

  try {
    const rentals = await Rental.find({ userId }).populate('carId');
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving rentals', error: err.message });
  }
};
