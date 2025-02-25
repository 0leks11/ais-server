// server/database.js
const { Sequelize, DataTypes } = require("sequelize");

// Подключаемся к SQLite (можно поменять на файл, если нужно)
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "db.sqlite",
  logging: false,
});

const Vessel = sequelize.define("Vessel", {
  mmsi: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // rawData будет хранить полный JSON в виде строки
  rawData: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

async function initDB() {
  // Если вы заранее создаете таблицу вручную, то вместо sync можно использовать миграции
  // или отключить автоматическое создание.
  // Но для примера используем sync() для упрощения.
  await sequelize.sync();
}

module.exports = { sequelize, Vessel, initDB };
