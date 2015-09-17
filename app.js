module.exports = {

  email: function() {
    return true;
  },

  address: function(address, callback) {
    callback(null, true);
  },

  phone: function(number) {
    return ['no-area-code','bad-area-code']
  }
}
