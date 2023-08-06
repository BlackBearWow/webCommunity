//index.js
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const session = require("express-session");
const DB = require('./db');
const hash = require('./hash');
const logInOutStr = require('./logInOutStr');

app.use(express.json());
app.use(express.urlencoded());
//위 2개를 추가해야 post body가 제대로 읽힌다.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Function to serve static files
app.use('/images', express.static('images'));

// session
const sessionAge = 1000 * 60 * 10; // 10minutes
app.use(session({secret: "secretkey", rolling: false, resave: false, saveUninitialized:false, cookie:{maxAge: sessionAge}}))
// session은 로그인 한 유저들만 발급한다. 로그아웃하면 세션을 삭제한다.

// 데코레이션 패턴
const doAsync = fn => async(req, res, next) => await fn(req, res, next).catch(next);

// 메인 화면
app.get('/', async (req, res) => {
    //로그인 했을 때
    if(req.session.userId) {
        console.log(req.session.userId);
        const rows = await DB.select(`select * from account where userId='${req.session.userId}';`);
        console.log(rows);
        res.render('index_afterLogin', {navText:logInOutStr.navStr(req.session.userId ? true : false), 
            userId:rows[0].userId, nickname:rows[0].nickname, level:rows[0].level, exp:rows[0].exp, 
            speed:rows[0].speed, wbLimitQuantity:rows[0].wbLimitQuantity, wbLen:rows[0].wbLen, money:rows[0].money});
    }
    //로그인 안했을 때
    else {
        res.render('index_beforeLogin', {navText:logInOutStr.navStr(req.session.userId ? true : false)});
    }
});

// 로그아웃 버튼을 누를 시
app.get('/logout', (req, res) => {
    req.session.destroy((err)=>{});
    res.redirect('/');
})

// 회원가입 화면
app.get('/signUp', (req, res) => {
    //{logIn:(req.session.userId ? true : false)}
    res.render('signUp', {navText:logInOutStr.navStr(req.session.userId ? true : false)});
})

//id, passwd, nickname을 받아 회원가입이 가능하다면 db에 insert, 아니면 오류메시지를 표시
app.get('/canISignUp', async (req, res) => {
    const id = req.query.id;
    const passwd = req.query.passwd;
    const nickname = req.query.nickname;
    //중복된 id가 있다면 오류.
    let rows = await DB.select(`select count(*) from account where userId='${id}'`);
    if(rows[0]['count(*)']!==0) {
        res.send("idOverlapped"); return;
    }
    //중복된 nickname이 있다면 오류.
    rows = await DB.select(`select count(*) from account where nickname='${nickname}'`);
    if(rows[0]['count(*)']!==0) {
        res.send("nickNameOverlapped"); return;
    }
    //id와 nickname이 중복되지 않았다면 회원가입 성공.
    await DB.insertNewId(id, passwd, nickname);
    res.send('ok');
})

// 로그인 화면
app.get('/signIn', (req, res) => {
    res.render('signIn', {navText:logInOutStr.navStr(req.session.userId ? true : false)});
})

// id, passwd를 받아 맞는 id, pqsswd라면 세션 생성
app.post('/canISignIn', async (req, res)=> {
    const id = req.body.id;
    const passwd = req.body.passwd;
    // id가 존재하지 않는지 확인한다.
    const rows = await DB.select(`select * from account where userId='${id}'`);
    if(rows.length===0) {
        res.send("idDoesNotExist"); return;
    }
    if(rows[0].passwd !== hash.sha256(passwd)) {
        res.send("incorrectPassword"); return;
    }
    //세션에 정보부여
    req.session.userId = id;
    req.session.nickname = rows[0].nickname;
    res.send('ok');
})

// 랭킹 화면
app.get('/Rank', async (req, res) => {
    const rows = await DB.select(`select nickname, level, exp from account order by level desc, exp desc`);
    res.render('Rank', {navText:logInOutStr.navStr(req.session.userId ? true : false), rows});
})

// 게임 맵 리스트 화면
app.get('/GameMapList', async (req, res) => {
    res.render('GameMapList', {navText:logInOutStr.navStr(req.session.userId ? true : false)});
})

// 게시판 화면
app.get('/bulletinBoard', async (req, res) => {
    res.render('bulletinBoard', {navText:logInOutStr.navStr(req.session.userId ? true : false)});
})

// 게시글들 리스트 반환
app.get('/getPosts', async (req, res) => {
    const rows = await DB.select(`select bId, title, postDatetime, commentNum from post order by bId`);
    console.log(rows);
    res.send(rows);
})

app.get('/n', (req, res) => {
    req.session.user = "juho";
    res.redirect('/');
});

server.listen(8880, () => {
    console.log('listening on *:8880');
});