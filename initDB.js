const fs = require('node:fs');
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

function insertData(data) {
    connection.execute(`insert into jsgame.account values (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7], data[8]], 
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

insertData([`admin`, `${hash.sha256('1234')}`, `admin`, 20, 30, 4.0, 5, 5, 5000]);
insertData([`guest`, `${hash.sha256('guest')}`, `guest`, 20, 1, 2.0, 3, 3, 5000]);
insertData([`sce6544`, `${hash.sha256('as86cew5x1')}`, `차돌짬뽕`, 10, 1, 2.0, 3, 3, 5000]);
insertData([`se654c`, `${hash.sha256('3ew515s48c')}`, `김치찌개`, 10, 1, 2.0, 3, 3, 5000]);
insertData([`pat0407`, `${hash.sha256('asdf')}`, `김치찌개`, 10, 1, 2.0, 3, 3, 5000]);

// 종료
connection.end();