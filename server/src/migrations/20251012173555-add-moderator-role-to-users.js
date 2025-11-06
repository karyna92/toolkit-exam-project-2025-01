'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN 
        CREATE TYPE "enum_Users_role_new" AS ENUM ('customer', 'creator', 'moderator');
      EXCEPTION 
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Users" 
      ALTER COLUMN "role" TYPE "enum_Users_role_new" 
      USING "role"::text::"enum_Users_role_new";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Users_role";
      ALTER TYPE "enum_Users_role_new" RENAME TO "enum_Users_role";
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Users_role_old" AS ENUM ('customer', 'creator');
      
      ALTER TABLE "Users" 
      ALTER COLUMN "role" TYPE "enum_Users_role_old" 
      USING (
        CASE 
          WHEN "role" = 'moderator' THEN 'customer' 
          ELSE "role"::text 
        END
      )::"enum_Users_role_old";
      
      DROP TYPE "enum_Users_role";
      ALTER TYPE "enum_Users_role_old" RENAME TO "enum_Users_role";
    `);
  },
};
