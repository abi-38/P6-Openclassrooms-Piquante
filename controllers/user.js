const bcrypt = require('bcrypt'); // permet de crypter le mdp - primordial pour la sécurité
const User = require('../models/user'); // on importe notre modèle de user
const jwt = require('jsonwebtoken'); // permet de créer les token de connexion et de les vérifier

require('dotenv').config();

// fonction signup pour créer un utilisateur - testée ok 
exports.signup = (req, res, next) => {
    const emailReg = new RegExp(/^[\w\-]+(\.[\w\-]+)*@[\w\-]+(\.[\w\-]+)*\.[\w\-]{2,4}$/); // regex pour vérifier la cohérence de l'email
    const validEmail = emailReg.test(req.body.email);
    const mdpReg = new RegExp(/^[\w\-]{6,}$/);
    const validMdp = mdpReg.test(req.body.password); // regex pour vérifier la cohérence du mdp
    if(validEmail && validMdp) { // si l'email utilisateur ET son mdp correspondent au regex on passe à la suite des actions
        bcrypt.hash(req.body.password, 10) 
        // fonction pour crypter le mdp, on lui passe en paramètre, 10 est le nombre de tour pour le hachage (on ne veut pas que ce soit trop long)
        .then(hash => { // hash est le résultat de bcrypt.hash (on l'appelle comme on veut)
        const user = new User({ // création d'un nouvel utilisateur
            email: req.body.email,
            password: hash // à password on lui passe le résultat du mdp hashé
        });
        user.save() // enregistrement de ce nouvel utilisateur dans la bdd (avec le mdp crypté)
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    } else {
        throw 'Email non valide !';
    }
    
};

// fonction login pour se connecté une fois l'utilisateur créé - testée ok 
exports.login = (req, res, next) => {
    const emailReg = new RegExp(/^[\w\-]+(\.[\w\-]+)*@[\w\-]+(\.[\w\-]+)*\.[\w\-]{2,4}$/);
    const validEmail = emailReg.test(req.body.email);
    const mdpReg = new RegExp(/^[\w\-]{6,}$/);
    const validMdp = mdpReg.test(req.body.password);
    if(validEmail && validMdp) {
        User.findOne({ email: req.body.email }) // on cherche dans la bdd l'email correspondant à la requête
        .then(user => { // le résultat de findOne renvoi un valeur booléenne qu'on va appelé user
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            // si user est faux c'est qu'on ne la pas trouvé dans la bdd donc on renvoi un mess
        }
        bcrypt.compare(req.body.password, user.password) // si on a trouvé user dans la bdd on compare les mdp
        // comparaison de mdp de la requête et de la bdd, ceci renvoi un résultat boléen qu'on appelle valid
            .then(valid => {
                if (!valid) { // s'il n'y a pas de correspondance valide est faux et on renvoi un message d'erreur
                    return res.status(401).json({ error: 'Mot de passe incorrect !' });
                }
                res.status(200).json({ // si valid est vrai il y a concordance 
                    // en cas de réussite on renvoi au front ce qui l'attent : un id et un token
                    userId: user._id,
                    token: jwt.sign(
                        // grâce à jwt.sign on crée un token de connexion qui sera vérifié
                        { userId: user._id }, // on encode le userId en début de token (pour affiliation à un objet lui seul pourra le modifier)
                        process.env.TOKEN, // RANDOM_TOKEN_SECRET - pahdtcps521199cjneyslfh1545sljfsss1145
                        { expiresIn: '6 hours' } // le token n'est plus valide au-delà de 6h
                    )
                });
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    } else {
        throw 'Email ou mot de passe non valide !';
    }
};