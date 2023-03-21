const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
require('dotenv').config()

const app = express();

// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Conexión a Base de datos
const dbUser = process.env.DBUSER;
const dbPassword = process.env.DBPASSWORD;
const dbName = process.env.DBNAME;
const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.wtf3otw.mongodb.net/${dbName}?retryWrites=true&w=majority`;

/*mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('conectado a mongodb')) 
  .catch(e => console.log('error de conexión', e));*/


// import routes
const middleToken = require('./routes/validate-token');
const authRoutes = require('./routes/auth');
const webhookRoutes = require('./routes/webhook');
const dashboardRoutes = require('./routes/dashboard');

// route middlewares
app.use('/api/user', authRoutes);

app.use('/webhook', webhookRoutes);

app.get('/me', middleToken, dashboardRoutes);

// iniciar server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`servidor andando en: ${PORT}`)
})

