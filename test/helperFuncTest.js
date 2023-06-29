const { assert } = require('chai');

const { userEmailExists, generateRandomString, urlsForUser } = require('../helperFunctions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('userEmailExists', function() {
  it('should return a user with valid email', function() {
    const user = userEmailExists("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
   
    assert.equal(user.id, expectedUserID)
  });
  
  it('should return undefined with invalid email', function() {
    const user = userEmailExists("user24@example.com", testUsers)
    const expectedUser = undefined;
   
    assert.equal(user, expectedUser)
  });
});