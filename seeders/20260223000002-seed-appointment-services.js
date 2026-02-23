'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('AppointmentServices', [
      {
        id: uuidv4(),
        name: 'Basic Haircut',
        description: 'A standard haircut service',
        price: 500,
        showTime: 30,
        order: 1,
        isRemove: false,
        isPublic: true,
        ShopId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Hair Coloring',
        description: 'Professional hair coloring service',
        price: 2000,
        showTime: 120,
        order: 2,
        isRemove: false,
        isPublic: true,
        ShopId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Premium Spa Treatment',
        description: 'Full body spa treatment',
        price: 3500,
        showTime: 90,
        order: 3,
        isRemove: false,
        isPublic: false,
        ShopId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('AppointmentServices', null, {});
  },
};
