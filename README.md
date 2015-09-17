# Testing a validation library using Mocha

A quick rundown of easy testing using Mocha and Chai.

## Installing/Running Mocha

`npm install -g mocha`

Boom. Done. We can now `mocha`.

Mocha expects tests to be in a folder labeled `test` by default. If we've got `.js` files under `project/test`, Mocha will run them. Running tests is as simple as:
```
cd ~/validation-and-mocha-example
mocha
```

## The Code

`git clone https://github.com/r-tanner-f/validation-and-mocha-example.git` if you want to grab all the code in the examples.

After we've created our `test` folder, let's drop a unit_test.js file in there for Mocha to chew on.

### Dependencies
First, a few dependencies.

Chai isn't strictly necessary, but I do prefer the 'should' phrasing versus asserts:

``` javascript
var should = require('chai').should();
var chai = require('chai');

//And of course, we'll need the code under test:
var validate = require('../app.js');
```
### Describing test suites

Now we can get started. Lets describe a suite of a tests. How about email validation logic?

``` javascript
describe('Email validation', function () {
  //actual tests go here
});
```
That's easy enough. If we need to do any prep work, throw in a `before()`:

``` javascript
describe('Email validation', function () {
  before(function () {
      //here we would oil the recombobulator or grease the hamster wheel
  });
});
```

There's also stuff like `after()` and `beforeEach()`.

### Simple Tests

Let's write a test. Let's say `validate` has a function `email` for validating email.

`It` `should` return `true` on a valid email.

A test says `it` `should` `be` something:

``` javascript
describe('Email validation', function () {
  it('should return true on a valid email address', function () {
    validate.email('test@gmail.com').should.be.true;
  });
});
```
Mocha and Chai do some kind of voodoo magic to add `.should.be.true` to our code under test.

![magic.gif](/magic.gif)

So how about a test that *doesn't* pass?

``` javascript
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
```
Since my actual `validate.email()` simply returns true, this test is going to fail when we run `mocha`.

### Asynchronous Code

Let's say we're reaching out to a service to validate an address' zipcode. There's a bit of a trick to aynschronous code. We need to pass `done` to the test and call `done()` in the callback to let Mocha know that we're finished.

``` javascript
describe('Address validation', function () {

  //note that we're passing 'done' to the anonymous function
  it('should return true on a valid zipcode + address', function (done) {

    var address = {street: '123 Easy St', city: Seattle, Zip: '55555' }

    validate.address(address, function (err, result){
      result.should.be.true;
      //now we call 'done' inside the callback
      done();
    });
  });
});
```

In some cases we would probably mock out this 3rd party service so we can test our behavior on unexpected failure.

### Throws

Feeling lazy? Any uncaught errors will fail the test:

``` javascript
describe('Address validation', function () {
  it('should return true on a valid zipcode + address', function (done) {  
    var address = {street: '123 Easy St', city: Seattle, Zip: '55555' }
    validate.address(address, function (err, result){

      //mocha will show us the error when it throws
      if (err) throw err;

      result.should.be.true;
      done();
    });
  });
});
```

Uncaught exceptions will also bubble up through Mocha tests, causing them to fail.

### Arrays and Values

How about something more complex? What if we're returning an array of validation errors instead of simple true/false? Let's try it with some phone numbers:

``` javascript
describe('Phone number validation', function () {
  it('should check for dashes in the phone number AND for an area code', function () {

    //lets define what we expect in the first place
    var expected_phone_validation = ['contains-dashes', 'no-area-code'];

    //then we'll store the result in a variable
    //so we can perform multiple asserts/shoulds
    var phone_validation = validate.phone('555-5555');

    phone_validation.length.should.equal(2);

    //we can also use deep.equal to check if the *contents* of the array match
    phone_validation.should.deep.equal(expected_phone_validation);
    //in this case, it will fail as a bug prevents it from noticing the dashes
    //and also considers no area code a 'bad' area code
  });
});
```

Tada!

## Workflow

Mocha does shift our workflow a little. We might not `node app.js` all the time, which is handy if we can't really even *run* `node app.js` to poke around at our app (like when we're building a module). But how do we debug if we can't run the app standalone?

Let's talk about a few ways we can run Mocha.

### Command Line

The simplest way to run is by navigating to our project's directory and running the command Mocha:

```
cd ~/validation-and-mocha-example
mocha
```

And the output is:

```
$ mocha


  Email validation
    1) should return false on an invalid email address
    ✓ should return true on a valid email address

  Address validation
    ✓ should return true on a valid zipcode + address

  Phone number validation
    2) should check for dashes in the phone number AND for an area code


  2 passing (22ms)
  2 failing

  1) Email validation should return false on an invalid email address:
     AssertionError: expected true to be false


  2) Phone number validation should check for dashes in the phone number AND for an area code:

      AssertionError: expected [ 'no-area-code', 'bad-area-code' ] to deeply equal [ 'contains-dashes', 'no-area-code' ]
      + expected - actual

       [
      +  "contains-dashes"
         "no-area-code"
      -  "bad-area-code"
       ]

      at Context.<anonymous> (test/unit_test.js:50:34)
```

Two passing, two failing, and the reason why. There's also pretty colors on it!

For bonus fun, we can have nyancat tell us the results:

`mocha --reporter:nyan`

```
2   -_-_-_,------,
2   -_-_-_|   /\_/\
0   -_-_-^|__( x .x)
    -_-_-  ""  ""

 2 passing (24ms)
 2 failing
```

Adorable! There's other Mocha flags we might want to use, such as:

- `-G` for OS X Growl notification support
- `-w` to watch for .js file changes in the cwd (and execute tests after)
- `--debug-brk` to allow attachment of a debugger

### Watch

The `--watch` flag is what makes Mocha, in my opinion, a must have. Executing tests on file save can really speed up our workflow. If we've reached a sticking point in our code, write a few tests rather than constantly spinning up the debugger; once your tests pass you know you've got the solution. Or, write our tests first and then code until we've done what we intended to do.

### Debugging Tests

Sometimes (especially when building modules) we'll want to actually debug our tests while they're running. Maybe getting to a debugable point is time consuming, or we'd have to write goofy plumbing code just to reach that point. `--debug-brk` allows IDEs (and other tools) to attach a debugger, and allows us to put breakpoints in our tests and our code. This also allows us to debug in isolation, without relying on dependencies to debug our code.

One easy, crossplatform way we can accomplish debugging in Mocha tests is by using node-inspector and Chrome. There's a great post on that [here](http://blog.andrewray.me/how-to-debug-mocha-tests-with-chrome/). Visual Studio Node Tools also supports running and debugging tests. WebStorm, unfortunately, only supports running tests.   


---

Once we've gotten a handle on unit testing with Mocha, we might start thinking differently about our code. Unit testing makes it much easier to write and debug small, discrete units of code, and encourages breaking apart the monolith.
