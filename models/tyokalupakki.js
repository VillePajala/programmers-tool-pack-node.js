const crypto = require("crypto");
const mysql = require("mysql");
const restify = require("restify-clients");
const apiKey = require("./apikeys"); 

const yhteys = mysql.createConnection({
                                        "host" : "localhost",
                                        "user" : "root",
                                        "password" : "",
                                        "database" : "PTP"
                                      });

yhteys.connect((err) => {
    if (!err) {
        console.log("Yhteys tietokantapalvelimeen avattu!");
    } else {
        throw err;
    }
});    

let apiUrl = "https://newsapi.org/v2/everything?q=programming&sortBy=popularity&apiKey=" + apiKey.techCrunchApi; 
let client;

client = restify.createJsonClient({
                            "url" : apiUrl,
                            "headers" : {
                                            "Authorization" : ['*'],
                                            'Accept': 'application/json'
                                        } 
                                  });


module.exports = {

    "haeUutiset" : (tunniste) => { 
        let hakusana;
        let hakuehto;

        if (tunniste == null) {
            hakuehto = "popularity";
            hakusana = "programming";
        } else {
            hakusana = tunniste.hakusana.replace(/ /g, "+"); // Jos hakusanoja on useampi, lisätään välilyöntien tilalle + merkki

            if (tunniste.jarjestys == "uusimmat") {
                hakuehto = "publishedAt";
            } else if (tunniste.jarjestys == "osuvimmat") {
                hakuehto = "relevance";
            } else if (tunniste.jarjestys == "suosituimmat") {
                hakuehto = "popularity";
            }
        }

        return new Promise((resolve, reject) => {
            let polku = `https://newsapi.org/v2/everything?q=${hakusana}&sortBy=${hakuehto}&apiKey=` + apiKey.techCrunchApi;

            client.get(polku, (err, req, res, data) => {
                if (!err) {
                    resolve(data.articles);  
                } else {
                    reject(err);
                }
            });
        });
    },

    "salaaSalasana" : (salasana, callback) => {
        let tiiviste = crypto.createHash("SHA512").update(salasana).digest("hex");
        return tiiviste;
    },

    "haeKayttaja" : (kayttaja, callback) => {        
        let salasana = crypto.createHash("SHA512").update(kayttaja.salasana).digest("hex");
        let sql = "SELECT * FROM users WHERE kayttajatunnus = ? AND salasana = ?";

        yhteys.query(sql, [kayttaja.tunnus, salasana], (err, data) => {
            callback(err, data);
        });
    },

    "lisaaKayttaja" : (kayttaja, callback) => {         
        let sql = "INSERT INTO users (kayttajatunnus, salasana) VALUES (?, ?)";

        yhteys.query(sql, [kayttaja.kayttajatunnus,kayttaja.salasana], (err) => {
            callback(err);            
        });
    },

    "haeIdtaulu" : (kayttaja, callback) => {         
        let sql = `SELECT * FROM yritykset WHERE kayttajaid = ?`;
        
        yhteys.query(sql, [kayttaja.id], (err, data) => {
            callback(err, data);
        });
    },

    "lisaaTauluun" : (tiedot, callback) => {         

        if (tiedot.entryId != null) { 
            let sql = `UPDATE yritykset SET yritys = ?, sijainti = ?, hakuaika = ?, verkkosivu = ?, yhteystiedot = ?, muistiinpanot = ?  WHERE id = ?`;
    
            yhteys.query(sql, [tiedot.yritys, tiedot.sijainti, tiedot.hakuaika, tiedot.verkkosivu, tiedot.yhteystiedot, tiedot.muistiinpanot, tiedot.entryId], (err) => {
                callback(err);            
            });
        } else { 
            let sql = `INSERT INTO yritykset (yritys, sijainti, hakuaika, verkkosivu, yhteystiedot, muistiinpanot, kayttajaid) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
            yhteys.query(sql, [tiedot.yritys, tiedot.sijainti, tiedot.hakuaika, tiedot.verkkosivu, tiedot.yhteystiedot, tiedot.muistiinpanot, tiedot.kayttajaId], (err) => {
                callback(err);             
            });
        }
    },

    "poistaTaulusta" : (tiedot, callback) => {           
        let sql = `DELETE FROM yritykset WHERE id = ?`;
        
        yhteys.query(sql, [tiedot.id], (err) => {
            callback(err);            
        }); 
    }, 
    
    "muutaPvm" : (data, callback) => {     
        let tiedot = [];

        data.forEach(tieto => {
            let apu = Date.parse(tieto.hakuaika);
            let aika = new Date(apu);
            let paiva = aika.getDate();
            let kuukausi = aika.getMonth() + 1;
            let vuosi = aika.getFullYear();

            tieto.hakuaika = paiva + "." + kuukausi + "." + vuosi;
            tiedot.push(tieto);
        });
        callback(tiedot);            
    }
    
};




