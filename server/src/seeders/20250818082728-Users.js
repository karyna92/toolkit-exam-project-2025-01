const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('creator123', 10);

    return queryInterface.bulkInsert('Users', [
      {
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'johnny',
        password: hashedPassword1,
        email: 'john@example.com',
        avatar: 'anon.png',
        role: 'customer',
        balance: 100,
        rating: 4.5,
      },
      {
        firstName: 'Alice',
        lastName: 'Smith',
        displayName: 'aliceC',
        password: hashedPassword2,
        email: 'alice@example.com',
        avatar: 'anon.png',
        role: 'creator',
        balance: 200,
        rating: 5,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  },
};
