const express = require("express");
const app = express();
const PORT = 8080;


/**
 *  M I D D L E W A R E-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


/**
 *  D A T A -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//get shortURL
function generateRandomString() {
  let characters = "123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let shortURL = '';

  for (let i = 0; i < 6; i++) {
    let randomChar = Math.floor(Math.random()*characters.length);
    shortURL += characters.charAt(randomChar);
  }
  return shortURL
};


/**
 *  ??   R O U T E S -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
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


//route to urls_index
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
});

//route to urls_new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

//route to urls_show
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { id: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


/**
 *  A P I   R O U T E S -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

//post to /urls
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`);
});

//route to longURL through the shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//remove url resource
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

//edit route
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL
  res.redirect(`/urls/${shortURL}`);
})

//update resource
app.post("/urls/:shortURL/submit", (req, res) => {
  const shortURL = req.params.shortURL;
  const newURL = req.body.newURL;
  urlDatabase[shortURL] = newURL; 
  res.redirect("/urls");
})


/**
 *  L I S T E N -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





