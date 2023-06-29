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

const testDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "PJ88lu",
  },
  "iRGTY7": {
    longURL: "https://www.example.ca",
    userID: "PJ88lu",
  }
}

//test for generateRandomString
describe('generateRandomString', function() {
  it('should return a 6 digit random string', function() {
    const randomStringLength = generateRandomString().length
    const expectedOutput = 6;
   
    assert.equal(randomStringLength, expectedOutput)
  });
  
  it('should return an unique string everytime, no two strings should match', function() {
    const stringOne = generateRandomString()
    const stringTwo = generateRandomString()
   
    assert.notEqual(stringOne, stringTwo)
  });
});

//test for userEmailExists
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

//test for urlsForUser
describe('urlsForUser', function() {
  it('should return an object of URL information specific to the passed userID', function() {
    const urlDatabase = urlsForUser("aJ48lW", testDatabase)
    const expectedURLS = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW", }
    }  
   
    assert.deepEqual(urlDatabase, expectedURLS)
  });

  it('should return an empty object when a userID match is not found in database', function() {
    const urlDatabase = urlsForUser("rAndO", testDatabase)
    const expectedURLS = {};  
   
    assert.deepEqual(urlDatabase, expectedURLS)
  });
});