const hash = require('./hash');
const mysql = require('mysql2');
// mysql을 동기적으로 사용하는 방법을 알아내야 함. chatgpt에게 물어보니 mysql2라는게 있다고 한다. 더 알아보자.

const host = '127.0.0.1';
const port = 3306;
const user = 'root';
const password = 'onlyroot';
const database = 'jsgame';

const pool = mysql.createPool({host, user, database, password, waitForConnections:true, 
    connectionLimit:10, queueLimit:0, enableKeepAlive:true, keepAliveInitialDelay:0});

async function select(sql) {
    const [rows, feilds] = await pool.promise().query(sql);
    return rows;
}

async function insert(sql) {
    const [rows, feilds] = await pool.promise().query(sql);
    console.log(sql);
}

async function deleteSql(sql) {
    const [rows, feilds] = await pool.promise().query(sql);
}

async function insertNewId(id, passwd, nickname) {
    const [rows, feilds] = await pool.promise().execute(`insert into account(userId, passwd, nickname) values(?, ?, ?);`,
    [id, hash.sha256(passwd), nickname]);
}

module.exports = {select, insert, deleteSql, insertNewId};