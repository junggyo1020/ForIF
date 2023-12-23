const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysqlSession = require('express-mysql-session')(session);

const db = require('./data/database');
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');

const sessionStore = new mysqlSession({}, db);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({ 
    secret: 'super-secret', 
    resave: false,
    saveUninitialized: false,
    store: sessionStore 
  }));

app.use(authRoutes);
app.use(portfolioRoutes);

app.get('/404', function(req, res) {
  res.render('404');
});



app.listen(5000);
