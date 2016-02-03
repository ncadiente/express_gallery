module.exports = function(sequelize, DataTypes) {
  var Photo = sequelize.define("Photo", {
    title: DataTypes.STRING,
    link : DataTypes.STRING,
    description : DataTypes.TEXT
  }, {
    classMethods: {
      associate : function(models) {
        Photo.belongsTo(models.Users);
      }
    }
  });

  return Photo;
};