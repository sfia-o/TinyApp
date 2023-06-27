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
}


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
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

//Create New URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//View New URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    id: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username };
  res.render("urls_show", templateVars);
});

//Register Page
app.get("/register", (req, res) => {
  res.render("register")
})


/**
 *  A P I   R O U T E S -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

//Create New URL
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//Route to Edit URL
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

//Edit / Update URL
app.post("/urls/:shortURL/submit", (req, res) => {
  const newURL = req.body.newURL;
  const shortURL = req.params.shortURL;
  
  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL] = newURL;
  }
  res.redirect("/urls");
});

//Route to longURL through the shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Login
app.post("/login", (req, res) => {
  const userID = users[userID];
  res.cookie('userID', userID);
  res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie('userID');
  res.redirect("/urls");
});

//Register New User
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password

  users[userID] = {
    id: userID,
    email,
    password
  };
  
  console.log(users);

  res.cookie('userID', userID)
  res.redirect("/urls")
})


/**
 *  L I S T E N -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





