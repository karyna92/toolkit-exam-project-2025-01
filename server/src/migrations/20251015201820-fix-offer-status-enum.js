'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Offers_status_tmp" AS ENUM ('pending', 'approved', 'won', 'rejected', 'declined');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Offers"
      ALTER COLUMN "status" DROP DEFAULT,
      ALTER COLUMN "status" TYPE "enum_Offers_status_tmp"
      USING "status"::text::"enum_Offers_status_tmp",
      ALTER COLUMN "status" SET DEFAULT 'pending';
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_Offers_status";
      ALTER TYPE "enum_Offers_status_tmp" RENAME TO "enum_Offers_status";
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Offers"
      ALTER COLUMN "status" DROP DEFAULT,
      ALTER COLUMN "status" TYPE VARCHAR(255)
      USING "status"::text;
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_Offers_status";
    `);
  },
};
