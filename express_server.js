/***
 * R E Q U I R E
 */

const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, userEmailExists, urlsForUser } = require("./helperFunctions.js")


/**
 *  C O N F I G
 */

const SALT = 10;
const PORT = 8080;
const app = express();

/**
 *  M I D D L E W A R E-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret-keys'],
  maxAge: 24 * 60 * 60 * 1000 // 24hours
}))


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
    userID: "aJ48lu",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple",
  },
  aJ48lu: {
    id: "aJ48lu",
    email: "use@example.com",
    password: "purple",
  }
};

/**
 *  R O U T E S -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

//ROOT/HOME
app.get("/", (req, res) => {
  const userID = req.session.user_id;
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

//ALL URLS
app.get("/urls", (req, res) => {
  //set cookie for user
  const userID = req.session.user_id;

  //declare user variable based on user database with matching cookie
  const user = users[userID];
  
  // Create the templateVars object to pass variables to the template
  const templateVars = {
    user,
    urls: urlsForUser(userID, urlDatabase) }; //filtering user saved urls using callback
  
  //Condition to deny access to anyone not found on user database
  if (!userID) {
    res.status(403).send("Access Denied: You don't have permission, please create account and/or log in before proceeding");
  }
  
  res.render("urls_index", templateVars);
});


//CREATE NEW URL
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];

  //Condition to only allow logged in users to create new url, otherwise redirect to log in page
  if (userID) {
    res.render("urls_new", { user });
  } else {
    res.render("login", { user: null });
  }
});


//VIEW URL
app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const id = req.params.id;
  
  //if user is not recognized deny access
  if (!urlDatabase[id]) {
    res.status(403).send("Access Denied");
  }
  
  //if user is recognized render page if logged in, otherwise send log in message request
  if (userID) {
    const longURL = urlDatabase[id].longURL;
    const templateVars = { id, longURL, user };

    res.render("urls_show", templateVars);  

  } else {
    res.status(403).send("Please log in first");
  }

});


//REGISTER
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  
  //Condition to redirect logged in users to urls page
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("register", { user: null });
  }
});


//LOGIN 
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  
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

//CREATE NEW URL
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;

  //Condition to deny access to anyone not found on user database
  if (!userID) {
    res.status(403).send("Access Denied: You don't have permission, please create account and/or log in before proceeding");
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


//DELETE URL
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;

  if (!userID) {
    res.status(401).send("Unauthorized")
    return;
  }

  if (!users[userID]) {
    res.status(401).send("Please log in")
    return;
  }
  
  if (!urlDatabase[urlID]) {
    res.status(404).send("URL does not exist")
    return;
  }
  
  if (urlDatabase[urlID].userID !== userID) {
    res.status(403).send("Unauthorized")
    return;
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


//EDIT URL
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  res.redirect(`/urls/${id}`);
});


//SUBMIT EDIT URL
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const urlID = req.params.id;

  if (!userID) {
    res.status(401).send("Unauthorized")
    return;
  }

  if (!urlDatabase[urlID]) {
    res.status(404).send("URL does not exist")
    return;
  }

  if (urlDatabase[urlID].userID !== userID) {
    res.status(403).send("Unauthorized")
    return;
  }

  const newURL = req.body.newURL;   
  urlDatabase[urlID].longURL = newURL;
  
  res.redirect("/urls");
});


//ROUTE TO LONGURL
app.get("/u/:id", (req, res) => {
  
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Page Not Found")
  }
  
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


//LOGIN ------
app.post("/login", (req, res) => {
  const email = req.body.email; //email input on login form
  const password = req.body.password; //password input on login form
  
  //Check if user exists in database
  if (!userEmailExists(email, users)) {
    res.status(403).send("User not found");
    return;
  }

  //Declare user variable to store the found user
  const user = userEmailExists(email, users);

  //Check if found users password corresponds to input password

  const isMatch = bcrypt.compareSync(password, user.password);

  if (!isMatch) {
    res.status(403).send("Invalid Password");
    return;
  }
  
  //Set cookie to corresponding userID
  req.session.user_id = user.id;
  console.log(req.session.user_id);
  res.redirect("/urls");
});


//LOGOUT ------
app.post("/logout", (req, res) => {
  //clear cookie and redirect to login 
  req.session = null;
  res.redirect("/login");
});


//REGISTER ------
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
    return;
  }
  
  //create random id
  const id = generateRandomString();

  //encrypting password
  const salt = bcrypt.genSaltSync(SALT);
  const hashedPassword = bcrypt.hashSync(password, salt)
  
  //Create new user object
  users[id] = { id, email, password: hashedPassword };
  
  req.session.user_id = id;
  res.redirect("/urls");
});


/**
 *  L I S T E N -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





