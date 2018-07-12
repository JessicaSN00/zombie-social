var express = require('express');
var Zombie = require('./models/zombie');
var Weapons = require('./models/weapons');

var passport = require('passport');
var acl = require('express-acl');

var router = express.Router();

acl.config({
    baseUrl: '/',
    defaultRole:'zombie',
    decodeObjectName:'zombie',
    roleSearchPath: 'zombie.role'
});

router.use((req, res, next) => {
    res.locals.currentZombie = req.zombie;
    res.locals.currentWeapons = req.weapons;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    if(req.session.passport && req.zombie){
        req.session.role = req.zombie.role;
    }
    else{
        req.session.role = 'zombie';
    }
    console.log(req.session);
    next();
});

router.use(acl.authorize);
  
router.get("/", (req, res, next) => {
    Zombie.find()
    .sort({createdAt: "descending"})
    .exec((err, zombie) => {
        if(err){
            return next(err);
        }
        res.render("index", {zombie: zombie});
    });
});

router.get("/weapons",(req, res, next) => {
    Weapons.find()
    .sort({username: "descending"})
    .exec((err, weapons) => {
        if(err){
            return next(err);
        }
        res.render("weapons",{weapons: weapons});
    });
});

router.get("/")

router.get("/signup", (req, res) => {
    res.render("signup"); 
});

router.get("/weapons", (req, res) => {
    res.render("weapons"); 
});

router.get("/login", (req, res) => {
    res.render("login"); 
});

router.get("/edit", (req, res) => {
    res.render("edit"); 
});

router.post("/login", passport.authenticate("login",{
    successRedirect:"/",
    failureRedirect: "/login",
    failureFlash: true
}));

router.post("/signup", (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;
    Zombie.findOne({username: username}, (err, zombie) => {
        if(err){
            return next(err);
        }
        if(zombie){
            req.flash("error", "El nombre de usauario ya lo ha tomado otro zombie");
            return res.redirect("/signup");
        }
        var newZombie = new Zombie({
            username: username,
            password: password,
            role: role
        });
        newZombie.save(next);
        return res.redirect("/");
    });
});

router.get("/weapons_register", (req, res) => {
    res.render("weapons_register"); 
});

router.post("/weapons_register", (req, res, next) => {
    var name = req.body.name;
    var description = req.body.description;
    var ammo = req.body.ammo;
    var strong = req.body.strong;

    Weapons.findOne({name: name}, (err, weapons) => {
        if(err){
            return next(err);
        }
        if(weapons){
            req.flash("error", "El nombre de arma ya lo ha tomado otro zombie");
            return res.redirect("/weapons_register");
        }
        var newWeapons = new Weapons({
            name: name,
            description: description,
            ammo: ammo,
            strong: strong
        });
        newWeapons.save(next);
        return res.redirect("/weapons");
    });
});

router.get("/zombie/:username", (req, res, next) => {
    Zombie.findOne({username: req.params.username}, (err, zombie) => {
        if (err){
            return next(err);
        }
        if (!zombie){
            return next(404);
        }
        res.render("profile", {zombie: zombie});
    });
}); 

router.get("/profile", (req, res) =>{
    req.logout();
    res.redirect("/");
});

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

router.get("/edit", ensureAuthenticated, (req, res) => {
    res.render("edit");
});

router.post("/edit", ensureAuthenticated,(req, res, next) => {
    req.zombie.displayName = req.body.displayName;
    req.zombie.bio = req.body.bio;
    req.zombie.save((err) => {
        if(err){
            next(err);
            return;
        }
    req.flash("info", "Perfil actualizado!");
    res.redirect("/edit");
    });
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash("info", "Necesitas iniciar sesión para poder ver esta sección");
        res.redirect("/login");
    }
}

module.exports = router;
