const fs = require('node:fs');
const moment = require('moment-timezone');
const hash = require('./hash');
const mysql = require('mysql2');

const host = '127.0.0.1';
const port = 3306;
const user = 'root';
const password = 'onlyroot';

function createDatabase() {
    const sqls = fs.readFileSync('./database/createDatabase.sql').toString().match(/[^;]+;/g);

    for (sql of sqls) {
        connection.query(sql, (error, results, fields) => {
            if(error) {console.log(`에러발생: ${sql}`); throw error};
        })
    }
    console.log(`db, table생성 완료`);
}

function insertAccountData(data) {
    connection.execute(`insert into jsgame.account values (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8]], 
    (error, results, fields) => {
        if(error) {console.log(`에러발생: ${sql}`); throw error}
        else console.log(`성공: ${JSON.stringify(results)}`);
    })
}

function insertPostData(data) {
    connection.execute(`insert into jsgame.post (title, text, postDatetime, commentNum, userId, nickname) values (?, ?, ?, ?, ?, ?);`,
    [data[0], data[1], data[2], data[3], data[4], data[5]], 
    (error, results, fields) => {
        if(error) {console.log(`에러발생: ${sql}`); throw error}
        else console.log(`성공: ${JSON.stringify(results)}`);
    })
}

function insertCommentData(data) {
    connection.execute(`insert into jsgame.comment (bId, cText, commentDatetime, userId, nickname) values (?, ?, ?, ?, ?);`,
    [data[0], data[1], data[2], data[3], data[4]], 
    (error, results, fields) => {
        if(error) {console.log(`에러발생: ${sql}`); throw error}
        else console.log(`성공: ${JSON.stringify(results)}`);
    })
}

const connection = mysql.createConnection({ host, port, user, password, database: 'sys'});
connection.connect();

createDatabase();

//이상하게도 db를 만들고 insert까지하려하면 jsgame이 없다고 나온다.
//해당 오류는 connection.connect와 connection.end를 프로그램 시작과 마지막으로 옮겨서 해결했다.

insertAccountData([`admin`, `${hash.sha256('1234')}`, `관리자`, 20, 30, 4.0, 5, 5, 5000]);
insertAccountData([`guest`, `${hash.sha256('guest')}`, `guest`, 20, 1, 2.0, 3, 3, 5000]);
insertAccountData([`sce6544`, `${hash.sha256('as86cew5x1')}`, `차돌짬뽕`, 10, 1, 2.0, 3, 3, 5000]);
insertAccountData([`se654c`, `${hash.sha256('3ew515s48c')}`, `김치찌개`, 10, 1, 2.0, 3, 3, 5000]);
insertAccountData([`asdf`, `${hash.sha256('asdf')}`, `김치찌개`, 10, 1, 2.0, 3, 3, 5000]);

// 현재 한국 시간 가져오기
const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');

insertPostData([`예제 타이틀`, `여기는 내용을 적는 공간입니다`, now, 0, 'admin', '관리자']);
insertPostData([`예제 타이틀2`, `여기는 내용을 적는 공간입니다2`, now, 0, 'admin', '관리자']);

insertCommentData([1, `댓글이당`, now, 'admin', '관리자']);
insertCommentData([1, `댓글이당22`, now, 'admin', '관리자']);

// 종료
connection.end();