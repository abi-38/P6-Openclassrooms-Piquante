const express = require('express'); // installation du module express qui permet de coder plus facilement et rapidement en node dans le back
const helmet = require('helmet'); // module de sécurité http pour l'app helmet - installe des http headers différents
require('dotenv').config(); // cache le lien mongoose bdd

const bodyParser = require('body-parser'); // permet de lire les éléments parser (format json) reçu par le front, cf. ligne 26
const mongoose = require('mongoose'); // installation du module mongoose pour utiliser les formules comme Model.save(), Model.updateOne()... et envoyer des modèles bien rangés à la bdd

const path = require('path'); // lecture du chemin d'accès aux images

const userRoutes = require('./routes/user'); // on ramène les routes des users
const sauceRoutes = require('./routes/sauces'); // on ramènes les routes des sauces

// connexion à la bdd
mongoose.connect(process.env.DB_MONGODB, // cacher les données
    { useNewUrlParser: true,
    useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();
app.use(helmet()); // utilisation de helmet pour la sécurité

/* CORS - Permet d'accéder au front - lien entre les 2 serveurs grâce aux autorisations ci-dessous */
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // tout le monde peut se connecter
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // les requêtes get post put delete patch sont acceptées
    next(); // permet de passer à la lecture des autres middlewares
});

app.use(bodyParser.json()); // transforme le corps de la requete en objet js utilisable, cf. ligne 2


app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;