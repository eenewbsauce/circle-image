var should = require('should');

describe('test one', function(){
  it('should be equal', function(){
    (5).should.be.exactly(5).and.be.a.Number();
  });
});

describe('test two', function(){
  it('should be equal', function(){
    (4).should.be.exactly(5).and.be.a.Number();
  });
});
