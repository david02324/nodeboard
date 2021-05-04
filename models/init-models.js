var DataTypes = require("sequelize").DataTypes;
var _POST = require("./POST");
var _REPLY = require("./REPLY");
var _THUMBUPS = require("./THUMBUPS");
var _USER = require("./USER");

function initModels(sequelize) {
  var POST = _POST(sequelize, DataTypes);
  var REPLY = _REPLY(sequelize, DataTypes);
  var THUMBUPS = _THUMBUPS(sequelize, DataTypes);
  var USER = _USER(sequelize, DataTypes);


  return {
    POST,
    REPLY,
    THUMBUPS,
    USER,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
