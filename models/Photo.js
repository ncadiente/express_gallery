module.exports = function(sequelize, DataTypes) {
  var Photo = sequelize.define("Photo", {
    title: DataTypes.STRING,
    link : DataTypes.STRING,
    description : DataTypes.TEXT
  });

  return Photo;
};