//index.js
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const session = require("express-session");

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

// 메인 화면
app.get('/', (req, res) => {
    //로그인 했을 때
    if(req.session.user) {
        res.render('index_afterLogin', {id:"pat0407", nickname:"주호", level:3, exp:0, speed:3, wbLimitQuantity:4, wbLen:3, money:4});
    }
    //로그인 안했을 때
    else {
        res.render('index_beforeLogin');
    }
});

// 로그아웃 버튼을 누를 시
app.get('/logout', (req, res) => {
    req.session.destroy((err)=>{});
    res.redirect('/');
})

// 회원가입 화면
app.get('/signUp', (req, res) => {
    res.render('signUp', {logIn:(req.session.user ? true : false)});
})

// 로그인 화면
app.get('/signIn', (req, res) => {
    res.render('signIn', {logIn:(req.session.user ? true : false)});
})

app.get('/n', (req, res) => {
    req.session.user = "juho";
    res.redirect('/');
});

server.listen(8880, () => {
    console.log('listening on *:8880');
});