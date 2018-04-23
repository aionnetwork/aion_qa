let SafeMathTester = artifacts.require('./mock/SafeMathTester.sol');

contract("SafeMathTester", (accs) => {
  it("should throw on a multiplication overflow", (done) => {
    SafeMathTester.new().then((instance) => {
      instance.TestMultiplicationOverflow().catch((err) => {
        console.log("error caught, expected throw on multiplication overflow");
        done();
      });
    });
  });

  it("should throw on a addition overflow", (done) => {
    SafeMathTester.new().then((instance) => {
      instance.TestAdditionOverflow().catch((err) => {
        console.log("error caught, expected throw on addition overflow");
        done();
      });
    });
  });

  it("should throw on a subtraction underflow", (done) => {
    SafeMathTester.new().then((instance) => {
      instance.TestSubtractionUnderflow().catch((err) => {
        console.log("error caught, expected throw on subtraction underflow");
        done();
      });
    });
  });

});