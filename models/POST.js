const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('POST', {
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    TITLE: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    AUTHOR: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    TYPE: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    CONTENT: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    VIEWS: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    PASSWORD: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    isLogined: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    THUMBUP: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'POST',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ID" },
        ]
      },
    ]
  });
};
