const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: 'priytoshshahi90@gmail.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('825018', 10);
      const admin = new User({
        name: 'Priyatosh Kumar',
        email: 'priytoshshahi90@gmail.com',
        password: hashedPassword,
        role: 'faculty'
      });
      await admin.save();
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

module.exports = createDefaultAdmin;
