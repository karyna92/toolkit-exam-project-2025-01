'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('moderator123!', 10);

    await queryInterface.bulkInsert('Users', [
      {
        firstName: 'Doe',
        lastName: 'Doe',
        displayName: 'Doe',
        password: hashedPassword,
        email: 'moderator@gmail.com',
        avatar: 'anon.png',
        role: 'moderator',
        balance: 0,
        accessToken: null,
        rating: 0,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      email: 'moderator@gmail.com',
    });
  },
};
