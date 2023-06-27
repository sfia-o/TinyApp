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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  }
}

//get shortURL
function generateRandomString() {
  let characters = "123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let shortURL = '';

  for (let i = 0; i < 6; i++) {
    let randomChar = Math.floor(Math.random() * characters.length);
    shortURL += characters.charAt(randomChar);
  }
  return shortURL;
};

//finding user by email
function userEmailExists(email, users) {
  let user 

  for (const id in users) {
      if (users[id].email === email) {
      user = users[id];
      }
  }
  return user;
};


/**
 *  R O U T E S -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

//route to root
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


/**
 *  R E N D E R   R O U T E S -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

//List All URLs
app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  const templateVars = {
    user,
    urls: urlDatabase };
  
  res.render("urls_index", templateVars);
});

//Create New URL
app.get("/urls/new", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  if (userID) {
    res.render("urls_new", { user })
  } else {
    res.render("login", { user: null })
  }
});

//View New URL
app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const id = req.params.id;
  const longURL = urlDatabase[id]

  if (!urlDatabase[id]) {
    res.status(404).send("The url you are looking for does not exist")
  }

  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);
});

//Register Page
app.get("/register", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  const templateVars = {
    user,
    urls: urlDatabase };

  if (userID) {
    res.render("urls_index", templateVars)
  } else {
    res.render("register", { user: null })
  }
})

//Login
app.get("/login", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  const templateVars = {
    user,
    urls: urlDatabase };

  if (userID) {
    res.render("urls_index", templateVars)
  } else {
    res.render("login", { user: null })
  }
})


/**
 *  A P I   R O U T E S -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

//Create New URL
app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id;

  if (!userID) {
    res.status(403).send("Access Denied: You don't have permission, please create account before proceeding")
  }

  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
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
  
  if (urlDatabase[id]) {
    urlDatabase[id] = newURL;
  }
  res.redirect("/urls");
});

//Route to longURL through the shortURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!userEmailExists(email, users)) {
    res.status(403).send("User not found")
  } 

  const user = userEmailExists(email, users);

  if (user.password !== password) {
    res.status(403).send("Invalid Password")
  }

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
  
  if (email === '' ||  password === '') {
    res.status(400).send('Invalid Input')
    return;
  }

  if (userEmailExists(email, users)) {
    res.status(400).send("Email is already registered")
  }

  const id = generateRandomString();
  users[id] = { id, email, password };
  
  res.cookie('user_id', id)
  res.redirect("/urls")
})


/**
 *  L I S T E N -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





