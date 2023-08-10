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
        const rows = await DB.select(`select * from account where userId='${req.session.userId}';`);
        res.render('index_afterLogin', {navText:logInOutStr.navStr(req.session.userId ? true : false), 
            userId:rows[0].userId, nickname:rows[0].nickname, level:rows[0].level, exp:rows[0].exp, 
            speed:rows[0].speed, wbLimitQuantity:rows[0].wbLimitQuantity, wbLen:rows[0].wbLen, money:rows[0].money});
    }
    //로그인 안했을 때
    else {
        //res.render('sample', {navText:logInOutStr.navStr(req.session.userId ? true : false)});
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
    const rows = await DB.select(`select bId, title, postDatetime, commentNum from post order by bId desc`);
    res.send(rows);
})

// 새글 쓰기 화면
app.get('/newPost', (req, res)=>{
    if(req.session.userId ? true : false) {
        res.render('newPost', {navText:logInOutStr.navStr(req.session.userId ? true : false)});
    }
    else {
        res.send(`<script>alert('로그인 후 이용해주세요');history.back();</script>`);
    }
})

// 새글 쓰기
app.post('/sendPost', async (req, res)=>{
    if((req.session.userId ? true : false)===false){
        res.send(`error: no login`);
        return;
    }
    const title = req.body.title;
    const text = req.body.text;
    const userId = req.session.userId;
    const nickname = req.session.nickname;
    await DB.insertPost(title, text, userId, nickname);
    res.send("ok");
})

// 게시글 내용 보이기
app.get('/viewPost/:bId', (req, res) => {
    res.render('viewPost', {navText:logInOutStr.navStr(req.session.userId ? true : false)});
});

// 게시글 내용 반환
app.get('/getPostBybId/:bId', async (req, res)=>{
    const bId = req.params.bId;
    const rows = await DB.select(`select bId, title, text, postDatetime, commentNum, nickname 
    from post where bId = ${bId}`);
    res.send(rows);
})

// 댓글 내용 반환
app.get(`/getCommentBybId/:bId`, async (req, res)=>{
    const bId = req.params.bId;
    const rows = await DB.select(`select * from comment where bId = ${bId}`);
    res.send(rows);
})

// 댓글 쓰기
app.get(`/sendComment/:bId`, async (req, res)=>{
    if(req.session.userId ? true : false) {
        const bId = req.params.bId;
        const cText = req.query.cText;
        const userId = req.session.userId;
        const nickname = req.session.nickname;
        await DB.insertComment(bId, cText, userId, nickname);
        res.send('ok');
    }
    else
        res.send('you have to log in');
})

// 게시글 수정
app.get('/editPost/:bId', async (req, res)=>{
    const bId = req.params.bId;
    if(req.session.userId ? true : false){
        const rows = await DB.select(`select userId, title, text from post where bId = ${bId}`);
        if(rows[0].userId === req.session.userId){
            res.render(`editPost`, {navText:logInOutStr.navStr(req.session.userId ? true : false), title:rows[0].title, text:rows[0].text});
        }
        else {
            res.send(`<script>alert('권한이 없습니다');history.back();</script>`);    
        }
    }
    else {
        res.send(`<script>alert('권한이 없습니다');history.back();</script>`);
    }
})

// 게시글 수정 db에 저장
app.post('/editPost/:bId', async (req, res)=>{
    if((req.session.userId ? true : false)===false){
        res.send(`error: no login`);
        return;
    }
    const bId = req.params.bId;
    const title = req.body.title;
    const text = req.body.text;
    const userId = req.session.userId;
    const rows = await DB.select(`select userId from post where bId=${bId};`);
    if(rows[0].userId !== userId){
        res.send(`wrong person`);
        return;
    }
    await DB.updatePost(title, text, bId);
    res.send("ok");
})

// 게시글 삭제
app.get('/deletePost/:bId', async (req, res)=>{
    const bId = req.params.bId;
    if(req.session.userId ? true : false){
        const rows = await DB.select(`select userId from post where bId = ${bId}`);
        if(rows[0].userId === req.session.userId) {
            await DB.deleteSql(`delete from post where bId = ${bId}`);
            res.send('ok');
        }
        else res.send('noRight');
    }
    else{
        res.send('noRight');
    }
})

server.listen(8880, () => {
    console.log('listening on *:8880');
});