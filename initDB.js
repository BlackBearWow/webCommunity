//import * as fs from 'node:fs';
const fs = require('node:fs');
const crypto = require('crypto');
const mysql = require('mysql');

const host = '127.0.0.1';
const port = 3306;
const user = 'root';
const password = 'onlyroot';

function createDatabase() {
    const connection = mysql.createConnection({ host, port, user, password, database: 'sys'});
    const sqls = fs.readFileSync('./database/createDatabase.sql').toString().match(/[^;]+;/g);
    console.log(sqls);
    connection.connect();

    for (sql of sqls) {
        console.log(sql);
        connection.query(sql, (error, results, fields) => {
            if(error) {console.log(`에러발생: ${sql}`); throw error};
        })
    }

    connection.end();
}

function insertSql(sql) {
    const connection = mysql.createConnection({ host, port, user, password, database: 'jsgame'});
    connection.connect();

    connection.query(sql, (error, results, fields) => {
        if(error) {console.log(`에러발생: ${sql}`); throw error}
        else console.log(`성공: ${sql}`);
    })

    connection.end();
}

function makeSha256Hash(passwd) {
    return crypto.createHash('sha256').update(passwd).digest('hex');
}

//createDatabase();

//이상하게도 db를 만들고 insert까지하려하면 jsgame이 없다고 나온다.

insertSql(`insert into account values ("admin", "${makeSha256Hash('1234')}", "admin", 20, 30, 4.0, 5, 5, 5000);`);
insertSql(`insert into account values ("guest", "${makeSha256Hash('guest')}", "guest", 20, 1, 2.0, 3, 3, 5000);`);
insertSql(`insert into account values ("sce6544", "${makeSha256Hash('as86cew5x1')}", "차돌짬뽕", 10, 1, 2.0, 3, 3, 5000);`);
insertSql(`insert into account values ("se654c", "${makeSha256Hash('3ew515s48c')}", "김치찌개", 10, 1, 2.0, 3, 3, 5000);`);
insertSql(`insert into account values ("pat0407", "${makeSha256Hash('asdf')}", "김치찌개", 10, 1, 2.0, 3, 3, 5000);`);