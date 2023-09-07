const hash = require('./hash');
const mysql = require('mysql2');
const moment = require('moment-timezone');

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

async function insertPost(title, text, userId, nickname) {
    // 현재 한국 시간 가져오기
    const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    const [rows, feilds] = await pool.promise().execute(`insert into jsgame.post (title, text, postDatetime, commentNum, userId, nickname) values (?, ?, ?, ?, ?, ?);`,
    [title, text, now, 0, userId, nickname]);
}

async function insertComment(bId, cText, userId, nickname) {
    const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    const [rows, feilds] = await pool.promise().execute(`insert into jsgame.comment (bId, cText, commentDatetime, userId, nickname) values (?, ?, ?, ?, ?);`,
    [bId, cText, now, userId, nickname]);
}

async function updatePost(title, text, bId) {
    const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    const [rows, feilds] = await pool.promise().execute(`update jsgame.post set title=?, text=?, postDatetime=? where bId=?;`,
    [title, text, now, bId]);
}

async function update(sql) {
    const [rows, feilds] = await pool.promise().query(sql);
}

async function deleteSql(sql) {
    const [rows, feilds] = await pool.promise().query(sql);
}

async function insertNewId(id, passwd, nickname) {
    const [rows, feilds] = await pool.promise().execute(`insert into account(userId, passwd, nickname, charImg) values(?, ?, ?, ?);`,
    [id, hash.sha256(passwd), nickname, 'bazzi']);
}

module.exports = {select, insert, insertPost, insertComment, update, updatePost, deleteSql, insertNewId};