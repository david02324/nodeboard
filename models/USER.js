const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('USER', {
    USER_CODE: {
      type: DataTypes.STRING(100),
      allowNull: false,
      primaryKey: true
    },
    NICKNAME: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "NICKNAME_UNIQUE"
    },
    GROUP: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "USER"
    }
  }, {
    sequelize,
    tableName: 'USER',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "USER_CODE" },
        ]
      },
      {
        name: "NICKNAME_UNIQUE",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "NICKNAME" },
        ]
      },
    ]
  });
};
