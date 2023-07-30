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
    console.log(rows);
    console.log(feilds);
}

async function insertNewId(id, passwd, nickname) {
    const [rows, feilds] = await pool.promise().execute(`insert into account(userId, passwd, nickname) values(?, ?, ?);`,
    [id, hash.sha256(passwd), nickname]);
}

async function main() {
    const rows = await select(`select count(*) from account limit 2;`);
    console.log(`리턴이 되는거니? ${JSON.stringify(rows)}}`);
    await select(`select id from account;`);

    pool.end((err)=>{});
}
//main();

module.exports = {select, insert, insertNewId};