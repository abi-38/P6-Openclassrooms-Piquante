// middleware d'authentification 

const jwt = require('jsonwebtoken');
require('dotenv').config();
 
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // on sépare le token créé au niveau de l'espace et on prend la 2nd valeur
        // on se débarrasse du BEARED
        const decodedToken = jwt.verify(token, process.env.TOKEN); // on vérifie que le token de l'utilisateur correspond à celui qu'on a créé
        const userId = decodedToken.userId; // on récupère le userId grâce au Token, il agit comme un objet js
        if(req.body.userId && req.body.userId !== userId){ // en connaissant l'id on vérifie de nouveau que le userId celui de la requête
            throw 'User Id non valable !';
        } else {
            next(); // si tout est bon on peut passer à la suite
        }
    }
    catch {
        res.status(401).json({ error: error | 'Utilisateur non authentifié !' })
    }
};
