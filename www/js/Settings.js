class Settings {
    constructor() {
        this.settingsDB = openDatabase("Shaffl_Settings", "1", "Shaffl settings.", 9007199254740991);
        this.defaults = {
            model: "DanbooruModel",
            history: "preserve",
            username: null,
            password: null
        };
        if(!this.settingsDB) throw new Error("DB Failure");
        this.settingsDB.transaction(tx => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS shaffl (key TEXT UNIQUE, value TEXT)");
            tx.executeSql("CREATE TABLE IF NOT EXISTS shaffl_history (name TEXT, url TEXT, timestamp INTEGER)");
            tx.executeSql("CREATE TABLE IF NOT EXISTS shaffl_models (id TEXT UNIQUE, xml TEXT UNIQUE)");
        });
    }
    get(key) {
        return new Promise((resolve, reject) => {
            this.settingsDB.transaction(tx => {
                tx.executeSql(`SELECT * FROM shaffl WHERE key='${key}'`, [], (tx, res) => {
                    if(typeof res.rows[0] === "undefined") {
                        resolve(this.defaults[key]);
                        return undefined; //stop exexution
                    }
                    resolve(res.rows[0].value);
                });
            });
        });
    }
    getModelXML() {
        return new Promise((resolve, reject) => {
            this.get("model").then(model => {
                this.settingsDB.transaction(tx => {
                    tx.executeSql(`SELECT * FROM shaffl_models WHERE id='${model}'`, [], (tx, res) => {
                    if(typeof res.rows[0] === "undefined") {
                        resolve(this.defaults.model);
                        return undefined; //stop exexution
                    }
                    resolve(res.rows[0].xml);
                    });
                });
            });
        });
    }
    addModelXML(id, xml) {
        return new Promise((resolve, reject) => {
            this.settingsDB.transaction(tx => {
                tx.executeSql("INSERT OR REPLACE INTO shaffl_models ('id', 'xml') VALUES (?,?)", [id, xml], (tx, res) => {
                    resolve(true);
                }, (tx, err) => {
                    reject(err);
                });
            });
        });
    }
    set(key, value) {
        return new Promise((resolve, reject) => {
            this.settingsDB.transaction(tx => {
                tx.executeSql("INSERT OR REPLACE INTO shaffl ('key', 'value') VALUES (?,?)", [key, value], (tx, res) => {
                    resolve(true);
                }, (tx, err) => {
                    reject(err);
                });
            });
        });
    }
}