/**
 * H E L P E R   F U N C T I O N S ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

//get shortURL
function generateRandomString() {
  let characters = "123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let shortURL = '';

  for (let i = 0; i < 6; i++) {
    let randomChar = Math.floor(Math.random() * characters.length);
    shortURL += characters.charAt(randomChar);
  }
  return shortURL;
}

//finding user by email
function userEmailExists(email, users) {
  let user;

  for (const id in users) {
    if (users[id].email === email) {
      user = users[id];
    }
  }
  return user;
}

//list urls for user
function urlsForUser(id, urlDatabase) {
  //Declare new object
  let savedURLS = {};
  
  //Loop through database
  for (const url in urlDatabase) {

    //check if id matches userID
    if (urlDatabase[url].userID === id) {

      //keep that as a savedURLS
      savedURLS[url] = urlDatabase[url];
    }
  }
  return savedURLS;
}

module.exports = {
  generateRandomString,
  userEmailExists,
  urlsForUser
};