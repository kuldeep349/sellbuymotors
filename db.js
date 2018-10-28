var mysql = require('mysql');
//const {rowtojson} = require('../services/util.service')
var config = {
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'education',
    insecureAuth : true
//    debug: ['ComQueryPacket', 'RowDataPacket']
  }

class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }
    query(sql, args, single) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows, fields) => {
             // console.log(rows)
                if (err)
                    return reject(err);
                    var result = single?rows[0]:rows;
                    // console.log(rows);

                     if (rows.length) resolve(JSON.stringify(result));
                     resolve([])
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}
const database = new Database(config);
module.exports.database = database;
