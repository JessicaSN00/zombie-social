var mongoose = require('mongoose');

var weaponsSchema = mongoose.Schema({
    name : {type: String, required: true, unique: true},
    description: {type: String, requiered: true, unique: true},
    ammo: {type: Boolean, requiered: true},
    strong: {type: Number, requiered: true}
});

var donothing = () => {

}

var Weapons = mongoose.model("Weapons", weaponsSchema);
module.exports = Weapons;
