const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('REPLY', {
    ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    POST_ID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ROOT_REPLY_ID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    AUTHOR: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    CONTENT: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    isLogined: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    PASSWORD: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'REPLY',
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
