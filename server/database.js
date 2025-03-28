const { Sequelize, DataTypes } = require("sequelize");


const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl:
      process.env.DATABASE_SSL === "true"
        ? {
            require: true,
            rejectUnauthorized: false, 
          }
        : false,
  },
  logging: false,
});

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
  try {
    await sequelize.authenticate();
    console.log("Connection to PostgreSQL established successfully.");
    await sequelize.sync();
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

module.exports = { sequelize, Vessel, initDB };
