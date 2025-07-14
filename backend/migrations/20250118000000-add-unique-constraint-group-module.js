'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // For SQLite, we need to handle duplicates differently
    // First, get all duplicate records
    const duplicates = await queryInterface.sequelize.query(`
      SELECT groupId, moduleId, MIN(id) as keepId
      FROM groupmoduleformateurs 
      GROUP BY groupId, moduleId 
      HAVING COUNT(*) > 1
    `, { type: Sequelize.QueryTypes.SELECT });

    // Delete duplicates, keeping only the first one
    for (const duplicate of duplicates) {
      await queryInterface.sequelize.query(`
        DELETE FROM groupmoduleformateurs 
        WHERE groupId = ? AND moduleId = ? AND id != ?
      `, {
        replacements: [duplicate.groupId, duplicate.moduleId, duplicate.keepId],
        type: Sequelize.QueryTypes.DELETE
      });
    }

    // Add unique constraint
    await queryInterface.addIndex('groupmoduleformateurs', {
      fields: ['groupId', 'moduleId'],
      unique: true,
      name: 'unique_group_module'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('groupmoduleformateurs', 'unique_group_module');
  }
}; 