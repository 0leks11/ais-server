const { Sequelize, DataTypes } = require("sequelize");

// Подключаемся к живому PostgreSQL
const sequelize = new Sequelize(
  "postgresql://oleksii:a7G0WD4ed5LxM8OAkKfSDMgwe1i6jukp@dpg-ouvht6btq21c73btc52g-a.frankfurt-postgres.render.com:5432/ais_5pq6",
  {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
);

const Vessel = sequelize.define(
  "Vessel",
  {
    mmsi: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    rawData: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: false, 
  }
);

async function initDB() {
  await sequelize.sync();
}

module.exports = { sequelize, Vessel, initDB };
