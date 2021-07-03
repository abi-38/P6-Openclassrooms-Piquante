const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
// récap des format d'images possible

const storage = multer.diskStorage({ // fonction de config qui prend 2 arg destination et nom du fichier
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_'); 
    // on reprend le nom de fichier original mais on enlève les espaces que notre serveur n'aime pas
    // on remplace les espaces par l'enderscor
    const extension = MIME_TYPES[file.mimetype]; // MYNE_TYPE sera un objet qui fait référence aux lignes (4 à 5)
    callback(null, name + Date.now() + '.' + extension); // on génère un nom de fichier unique pour notre extension 
    // nam original sans espace + dare.now() -> date et heures actuelles + un point + extensions
  }
});

module.exports = multer({storage: storage}).single('image'); // exportation des info de notre image
// . single image car un image unique à la fois sera modifiée