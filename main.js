const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const session = require("express-session");
const tyokalupakki = require("./models/tyokalupakki");  

const portti = 3113;

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { "extended" : true } ));

app.use(express.static("./public"));


app.use(session({                         
                "name" : "Programmer's tool pack",
                "secret" : "SuuriSalaisuus!", 
                "resave" : false, 
                "saveUninitialized" : false,
                cookie: {
                    maxAge : false
                }
}));


app.get("/", (req, res) => { 
    let tunniste = null;

    tyokalupakki.haeUutiset(tunniste)
    .then((data) => {

        if (!data) {
            virhe = err.message;
            tulokset = null;
        } else {
            virhe = null;
            let tulokset = [];

            data.forEach(uutinen => {

                if (uutinen.urlToImage == null) {
                    uutinen.urlToImage = "img/eikuvaa.png";
                }
                tulokset.push(uutinen);
            });

            res.render("index", {"tulokset" : tulokset, "virhe" : virhe, "muokattava" : null, "kayttaja" : null});
        }
    })
    .catch((err) => {
        virhe = "Jokin meni pieleen. Lataa sivu uudestaan."
        res.render("index", {"tulokset" : null, "virhe" : virhe, "muokattava" : null, "kayttaja" : null});
    })
});


app.get("/kirjaudu/", (req, res) => {           
    res.render("login", { "virhe" : null });
});


app.get("/rekisteroidy/", (req, res) => {       
    res.render("register", { "virhe" : null });
});


app.post("/newuser/", (req, res) => {

    let salasana = tyokalupakki.salaaSalasana(req.body.salasana);

    let uusiKayttaja = {

                        "kayttajatunnus" : req.body.tunnus,
                        "salasana" : salasana
                        
                       };

    tyokalupakki.lisaaKayttaja(uusiKayttaja, () => { 
        tyokalupakki.haeKayttaja(req.body, (err, kayttaja) => { 
            if (err) {
                throw err;
            } else {
                res.redirect("/kirjaudu");
            }
        });
    });
});


app.use((req, res, next) => {
    if (!req.session.saaTulla && req.path != "/login/") {
        res.render("login", { "virhe" : null });
    } else {
        next();
    };
});


app.get("/etusivu/", (req, res) => { 
    let tunniste = null;  // Oletusarvo uutisten suodatukselle
    
    tyokalupakki.haeUutiset(tunniste)   
    .then((data) => {

        if (!data) {
            virhe = err.message;
            tulokset = null;
        } else {
            virhe = null;
            let tulokset = [];

            data.forEach(uutinen => {

                if (uutinen.urlToImage == null) {      
                    uutinen.urlToImage = "img/eikuvaa.png";
                }
                tulokset.push(uutinen);
            });

            res.render("index", {"tulokset" : tulokset, "virhe" : virhe, "muokattava" : null, "kayttaja" : req.session.kayttaja});
        }
    })
    .catch((err) => {
        virhe = "Jokin meni pieleen. Lataa sivu uudestaan."
        res.render("index", {"tulokset" : null, "virhe" : virhe, "muokattava" : null, "kayttaja" : req.session.kayttaja});
    })
});


app.post("/login/", (req, res) => {    

    if ( req.body.remember ) {
        let hour = 3600000;
        req.session.cookie.maxAge = 7 * 24 * hour; 
    } else {
        req.session.cookie.expires = false;
    }; 

    tyokalupakki.haeKayttaja(req.body, (err, kayttaja) => {
        
        if (err) {
            virhe = "Virheellinen käyttäjätunnus tai salasana."
        }

        if (kayttaja[0]) {
            req.session.saaTulla = true;
            let sessioKayttaja = {
                                    "id": kayttaja[0].id,
                                    "tunnus" : kayttaja[0].kayttajatunnus
                                 };
            req.session.kayttaja = sessioKayttaja;
            res.redirect("/etusivu/")
        } else {
            let virhe = "Virheellinen käyttäjätunnus tai salasana.";
            req.session.saaTulla = false;
            res.render("login", { "virhe" : virhe });
        }
    });
});


app.get("/tools/", (req, res) => { 
    let virhe = null;

    tyokalupakki.haeIdtaulu(req.session.kayttaja, (err, data) => {  

        if (data) {
            tyokalupakki.muutaPvm(data, (err, tiedot) => {
                res.render("tools", { "tiedot" : data, "muokattava" : null, "kayttaja" : req.session.kayttaja, "virhe" : virhe });
            });
        } else {
            res.render("tools", { "tiedot" : null, "muokattava" : null, "kayttaja" : req.session.kayttaja, "virhe" : virhe });
        }
    });  
});


app.post("/tallenna/", (req, res) => { 
    let entryId = null;
    let uusiTietue;

    if (req.body.entryId) {
        entryId = req.body.entryId
        uusiTietue = { 
            "entryId" : entryId,
            "yritys" : req.body.yritys[0],
            "sijainti" : req.body.sijainti[0],
            "hakuaika" : req.body.hakuaika[0],
            "verkkosivu" : req.body.verkkosivu[0],
            "yhteystiedot" : req.body.yhteystiedot[0],
            "muistiinpanot" : req.body.muistiinpanot[0],
            "kayttajatunnus" : req.session.kayttaja.tunnus,
            "kayttajaId" : req.session.kayttaja.id
                     };  

    } else { 
        uusiTietue = {
            "entryId" : entryId,
            "yritys" : req.body.yritys,
            "sijainti" : req.body.sijainti,
            "hakuaika" : req.body.hakuaika,
            "verkkosivu" : req.body.verkkosivu,
            "yhteystiedot" : req.body.yhteystiedot,
            "muistiinpanot" : req.body.muistiinpanot,
            "kayttajatunnus" : req.session.kayttaja.tunnus,
            "kayttajaId" : req.session.kayttaja.id
                      }; 
    }                                                                             

    tyokalupakki.lisaaTauluun(uusiTietue, (err) => { 
        let virhe = null;

        if (err) {
            virhe = "Tiedon tallennuksessa tapahtui virhe. Kokeile uudestaan.";
        }

        tyokalupakki.haeIdtaulu(req.session.kayttaja, (err, data) => {
            if (err) {
                virhe = "Aikaisempia tietoja ei voitu hakea. Kokeile uudestaan."
            }

            tyokalupakki.muutaPvm(data, (err, tiedot) => { 
                res.render("tools", { "tiedot" : data, "muokattava" : null, "kayttaja" : req.session.kayttaja, "virhe" : virhe });
            });
        });
    });
});


app.post("/hae/", (req, res) => { 

    tyokalupakki.haeUutiset(req.body)
    .then((data) => {

        if (!data) {
            virhe = err.message;
            tulokset = null;
        } else {
            virhe = null;
            let tulokset = [];

            data.forEach(uutinen => {
                if (uutinen.urlToImage == null) {      
                    uutinen.urlToImage = "img/eikuvaa.png";
                }
                tulokset.push(uutinen);
            });

            res.render("index", {"tulokset" : tulokset, "virhe" : virhe, "muokattava" : null, "kayttaja" : req.session.kayttaja});
        }
    })
    .catch((err) => {
        virhe = "Jokin meni pieleen. Lataa sivu uudestaan."
        res.render("index", {"tulokset" : null, "virhe" : virhe, "muokattava" : null, "kayttaja" : req.session.kayttaja});
    })
});


app.get("/logout/", (req, res) => {     
    req.session.saaTulla = false;
    res.redirect("/");
});


app.get("/poista/:id", (req, res) => {     
    let uusiTietue = {
                    "id" : req.params.id,  
                    "kayttajatunnus" : req.session.kayttaja.tunnus,
                    "kayttajaId" : req.session.kayttaja.id
                     };                                                                                

    tyokalupakki.poistaTaulusta(uusiTietue, (err) => {  
        let virhe = null;

        if (err) {
            virhe = "Tiedon poisto ei onnistunut. Kokeile uudestaan."
        }

        tyokalupakki.haeIdtaulu(req.session.kayttaja, (err, data) => {  

            if (err) {
                virhe = "Aikaisempia tietoja ei voitu hakea. Kokeile uudestaan.";
            }

            tyokalupakki.muutaPvm(data, (err, tiedot) => {
                res.render("tools", { "tiedot" : data, "muokattava" : null, "kayttaja" : req.session.kayttaja, "virhe" : virhe });
            });
        });
    });
});


app.get("/muokkaa/:id", (req, res) => { 
    let uusiTietue = {
                    "id" : req.params.id,
                    "kayttajatunnus" : req.session.kayttaja.tunnus,
                    "kayttajaId" : req.session.kayttaja.id
                     };                                                                                

    tyokalupakki.haeIdtaulu(req.session.kayttaja, (err, data) => {  
        let virhe = null;

        if (err) {
            virhe = "Aikaisempia tietoja ei voitu hakea. Kokeile uudestaan.";
        }

        tyokalupakki.muutaPvm(data, (err, tiedot) => {
            res.render("tools", { "tiedot" : data, "kayttaja" : req.session.kayttaja, "muokattava" : uusiTietue, "virhe" : virhe });
        });
    });
});


app.listen(portti, () => {         
    console.log(`Palvelin käynnistyi porttiin: ${portti}`);
});





