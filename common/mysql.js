const mysql = require('mysql')
const mysqlConfig = require('./../config').mysqlConfig;
const log = require('./log')
let util = require('./utils')

const pool = mysql.createPool(mysqlConfig)

let query = function(sql, values, note) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function(err, connection) {
            if (err) {
                reject(err)
            } else {
                log.info(note, sql, util.nullStrToNull(values))
                connection.query(sql, util.nullStrToNull(values), (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })
}

module.exports = { query }