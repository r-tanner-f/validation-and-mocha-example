//Dependencies
var should = require('chai').should();
var chai = require('chai');

//And of course, we'll need the code under test:
var validate = require('../app.js');

describe('Email validation', function () {
  it('should return false on an invalid email address', function () {
    //there's a "bug" in the code causing the function to return true
    validate.email('asdfdsafdsafds').should.be.false;
  });

  //our other test just hangs out in the same describe() block
  it('should return true on a valid email address', function () {
    validate.email('test@gmail.com').should.be.true;
  });
});

describe('Address validation', function () {

  //note that we're passing 'done' to the anonymous function
  it('should return true on a valid zipcode + address', function (done) {

    var address = {street: '123 Easy St', city: 'Seattle', Zip: '55555' }

    validate.address(address, function (err, result){
      //mocha will show us the error when it throws
      if (err) throw err;
      result.should.be.true;
      //now we call 'done' inside the callback
      done();
    });
  });
});

describe('Phone number validation', function () {
  it('should check for dashes in the phone number AND for an area code', function () {

    //lets define what we expect in the first place
    var expected_phone_validation = ['contains-dashes', 'no-area-code'];

    //then we'll store the result in a variable this time so we can perform multiple asserts/shoulds
    var phone_validation = validate.phone('555-5555');

    phone_validation.length.should.equal(2);

    //we can also use deepEquals to check if the *contents* of the array match
    phone_validation.should.deep.equal(expected_phone_validation);
    //in this case, it will fail as a bug prevents it from noticing the dashes
    //and also considers no area code a 'bad' area code
  });
});
