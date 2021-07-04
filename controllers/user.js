const bcrypt = require('bcrypt'); // permet de crypter le mdp - primordial pour la sécurité
const User = require('../models/user'); // on importe notre modèle de user
const jwt = require('jsonwebtoken'); // permet de créer les token de connexion et de les vérifier

require('dotenv').config();

// fonction signup pour créer un utilisateur - testée ok 
exports.signup = (req, res, next) => {
    var emailReg = new RegExp(/^([\w-\.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,4})/i); // regex qui vérifie que l'email est cohérent - protection supp.
    var validEmail = emailReg.test(req.body.email);
    var mdpReg = new RegExp(/^[\w-\.]{7,8}$/i); // regex qui vérifie que le mdp est cohérent - protection supp.
    var validMdp = mdpReg.test(req.body.password);
    if (validEmail && validMdp) { // si email entré par utilisateurET le mdp correspondent au regex on passe à la suite des actions/fonctions
        bcrypt.hash(req.body.password, 10) 
        // fonction pour crypter le mdp, on lui passe en paramètre, 10 est le nombre de tour pour le hachage (on ne veut pas que ce soit trop long)
        .then(hash => { // hash est le résultat de bcrypt.hash (on l'appelle comme on veut)
        const user = new User({ // création d'un nouvel utilisateur
            email: req.body.email, // ajouter un vérrou sur le type ici
            password: hash // à password on lui passe le résultat du mdp hashé -> ajouter un verrou
        });
        user.save() // enregistrement de ce nouvel utilisateur dans la bdd (avec le mdp crypté)
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    } else {
        throw 'Adresse email ou mot de passe non valide !';
    }
};

// fonction login pour se connecté une fois l'utilisateur créé - testée ok 
exports.login = (req, res, next) => {
    var emailReg = new RegExp(/^([\w-\.]+)@((?:[\w]+\.)+)([a-zA-Z]{2,4})/i);
    var validEmail = emailReg.test(req.body.email);
    var mdpReg = new RegExp(/^[\w-\.]{7,8}$/i); 
    var validMdp = mdpReg.test(req.body.password);
    if (validEmail && validMdp) { 
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
                        process.env.TOKEN, // RANDOM_TOKEN_SECRET - pahdtcps521199cjneyslfh1545sljfsss1145 -> celui-ci sera encodé !
                        { expiresIn: '6 hours' } // le token n'est plus valide au-delà de 6h
                    )
                });
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));;
    } else {
        throw 'Adresse email ou mot de passe non valide !';
    }
};

