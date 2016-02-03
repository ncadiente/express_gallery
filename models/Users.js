module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define("Users", {
    username: DataTypes.STRING,
    password : DataTypes.STRING,
  }, {
    classMethods : {
      associate : function(models) {
        Users.hasMany(models.Photo);
      }
    }
  });

  return Users;
};