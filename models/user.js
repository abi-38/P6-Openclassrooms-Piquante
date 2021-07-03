const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // pour éviter les erreurs sur mongoose on ajoute ce module !
 
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, // on mettant juste unique: true on risque d'avoir des erreurs étranges sur mongoose...
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator); // on applique le module (adresse email doit être unique) au schéma avant de l'exporter
module.exports = mongoose.model('User', userSchema);