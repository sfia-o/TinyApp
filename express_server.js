const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;


/**
 *  M I D D L E W A R E-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


/**
 *  D A T A -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }
};

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
      savedURLS[url] = urlDatabase[url]
    }
  }
  return savedURLS;
}


/**
 *  R O U T E S -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

//Route to root or home
app.get("/", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  const templateVars = {
    user,
    urls: urlDatabase };

  res.render("tinyapp_home", templateVars);
});


// Provides a JSON representation of the urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


/**
 *  R E N D E R   R O U T E S -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

//List All URLs
app.get("/urls", (req, res) => {
  //set cookie for user
  const userID = req.cookies.user_id;

  //declare user variable based on user database with matching cookie
  const user = users[userID];
  
  // Create the templateVars object to pass variables to the template
  const templateVars = {
    user,
    urls: urlsForUser(userID, urlDatabase) }; //filtering user saved urls using callback
  
  //Condition to deny access to anyone not found on user database
  if (!userID) {
    res.status(403).send("Access Denied: You don't have permission, please create account and log in before proceeding");
  }
  
  res.render("urls_index", templateVars);
});


//Create New URL
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  //Condition to only allow logged in users to create new url, otherwise redirect to log in page
  if (userID) {
    res.render("urls_new", { user });
  } else {
    res.render("login", { user: null });
  }
});


//View New URL
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const id = req.params.id;

  if (!urlDatabase[id]) {
    res.status(403).send("Access Denied");
  }

  const longURL = urlDatabase[id].longURL;
  const templateVars = { id, longURL, user };

  res.render("urls_show", templateVars);
});


//Register Page
app.get("/register", (req, res) => {
  const userID = req.cookies.user_id;
  
  //Condition to redirect logged in users to urls page
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("register", { user: null });
  }
});


//Login
app.get("/login", (req, res) => {
  const userID = req.cookies.user_id;
  
  //Condition to redirect logged in users to urls page
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("login", { user: null });
  }
});


/**
 *  A P I   R O U T E S -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

//Create New URL
app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id;

  //Condition to deny access to anyone not found on user database
  if (!userID) {
    res.status(403).send("Access Denied: You don't have permission, please create account before proceeding");
  }
  
  //Declare variables to store url submitted in form and another to store a randomly generated ID
  const longURL = req.body.longURL;
  const id = generateRandomString();
  
  //Assigning these new values to a new object in our database
  urlDatabase[id] = {
    longURL,
    userID //userID from cookie
  };
  
  res.redirect(`/urls/${id}`);
});


//Delete URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


//Route to Edit URL
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});


//Edit / Update URL
app.post("/urls/:id/submit", (req, res) => {
  const newURL = req.body.newURL;
  const id = req.params.id;
  
  if (urlDatabase[id].longURL) {
    urlDatabase[id].longURL = newURL;
  }
  res.redirect("/urls");
});


//Route to longURL through the shortURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


//Login
app.post("/login", (req, res) => {
  const email = req.body.email; //email input on login form
  const password = req.body.password; //password input on login form
  
  //Check if user exists in database
  if (!userEmailExists(email, users)) {
    res.status(403).send("User not found");
  }

  //Declare user variable to store the found user
  const user = userEmailExists(email, users);

  //Check if found users password corresponds to input password
  if (user.password !== password) {
    res.status(403).send("Invalid Password");
  }
  
  //Set cookie to corresponding userID
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});


//Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});


//Register New User
app.post("/register", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  
  //Denied registration using empty values
  if (email === '' ||  password === '') {
    res.status(400).send('Invalid Input');
    return;
  }

  //Denied duplicate email registrations
  if (userEmailExists(email, users)) {
    res.status(400).send("Email is already registered");
  }

  //Generate a new ID for the new user and add it to database
  const id = generateRandomString();
  users[id] = { id, email, password };
  
  res.cookie('user_id', id);
  res.redirect("/urls");
});


/**
 *  L I S T E N -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





