//index.js
const fs = require('node:fs');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
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
app.use('/sound', express.static('sound'));
app.use('/songs', express.static('songs'));
app.use('/js', express.static('static/js'));

//room은 새로운 파일로 만들어 따로 관리하자.
const roomModule = require('./room');
const room = new roomModule.Room;

// session
const sessionAge = 1000 * 60 * 30; // 30minutes
let session_store = new MemoryStore();
app.use(session({ secret: "secretkey", rolling: true, resave: false, saveUninitialized: false, store: session_store, cookie: { maxAge: sessionAge } }))
// session은 로그인 한 유저들만 발급한다. 로그아웃하면 세션을 삭제한다.

// 데코레이션 패턴
const doAsync = fn => async (req, res, next) => await fn(req, res, next).catch(next);

// 메인 화면
app.get('/', async (req, res) => {
    const rows = await DB.select(`select bId, title, postDatetime, commentNum, nickname from post where userId = 'admin' order by bId desc`);
    res.render('index', { navText: logInOutStr.navStr(req.session.userId ? true : false), rows });
});

// 채팅/크아
app.get('/chatAndCrazyArcade', async (req, res) => {
    if (req.session.userId) {
        const rows = await DB.select(`select * from account where userId='${req.session.userId}';`);
        res.render('chatAndCrazyArcade', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
    }
    else {
        res.send(`<script>alert('로그인 후 이용해주세요');location.href="/";</script>`);
    }
})

//리듬게임 리스트
app.get('/rhythmGameList', (req, res) => {
    //디렉토리를 읽은 후 리듬게임 리스트를 전송함.
    let songList = fs.readdirSync('./songs');
    //디렉토리만 필터
    songList = songList.filter((val) => fs.statSync(`./songs/${val}`).isDirectory());
    songList.forEach((val, index) => {
        songList[index] = { name: songList[index], bg: undefined };
        if (fs.existsSync(`./songs/${val}/info.txt`)) {
            let info = fs.readFileSync(`./songs/${val}/info.txt`, { encoding: 'utf8' });
            songList[index].bg = JSON.parse(info).bg;
        }
    })
    res.render('rhythmGameList', { songList, navText: logInOutStr.navStr(req.session.userId ? true : false) });
})

// 리듬게임 곡을 클릭했을 때 플레이가능한 비트맵들을 보여줌
app.get('/getSongListDataByName/:name', (req, res) => {
    const name = req.params.name;
    const songListData = fs.readdirSync(`./songs/${name}`);
    res.send(songListData.filter((val) => val.endsWith('.osu')));
});

// 리듬게임-인게임
app.get('/playRhythmGame/:songName/:fileName', (req, res) => {
    res.render('playRhythmGame');
});

// 리듬게임-인게임에서 비트맵 정보들 반환
app.get('/getFileData/:songName/:fileName', (req, res) => {
    const songName = req.params.songName;
    const fileName = req.params.fileName;
    const data = fs.readFileSync(`./songs/${songName}/${fileName}`, { encoding: 'utf8' });
    const youtubeId = JSON.parse(fs.readFileSync(`./songs/${songName}/info.txt`, { encoding: 'utf8' })).youtubeId;
    res.send({data, youtubeId});
});

// 로그아웃 버튼을 누를 시
app.get('/logout', (req, res) => {
    req.session.destroy((err) => { });
    res.redirect('/');
})

// 회원가입 화면
app.get('/signUp', (req, res) => {
    //{logIn:(req.session.userId ? true : false)}
    res.render('signUp', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})

//id, passwd, nickname을 받아 회원가입이 가능하다면 db에 insert, 아니면 오류메시지를 표시
app.get('/canISignUp', async (req, res) => {
    const id = req.query.id;
    const passwd = req.query.passwd;
    const nickname = req.query.nickname;
    //중복된 id가 있다면 오류.
    let rows = await DB.select(`select count(*) from account where userId='${id}'`);
    if (rows[0]['count(*)'] !== 0) {
        res.send("idOverlapped"); return;
    }
    //중복된 nickname이 있다면 오류.
    rows = await DB.select(`select count(*) from account where nickname='${nickname}'`);
    if (rows[0]['count(*)'] !== 0) {
        res.send("nickNameOverlapped"); return;
    }
    //id와 nickname이 중복되지 않았다면 회원가입 성공.
    await DB.insertNewId(id, passwd, nickname);
    res.send('ok');
})

// 로그인 화면
app.get('/signIn', (req, res) => {
    res.render('signIn', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})

// id, passwd를 받아 맞는 id, pqsswd라면 세션 생성
app.post('/canISignIn', async (req, res) => {
    const id = req.body.id;
    const passwd = req.body.passwd;
    // id가 존재하지 않는지 확인한다.
    const rows = await DB.select(`select * from account where userId='${id}'`);
    if (rows.length === 0) {
        res.send("idDoesNotExist"); return;
    }
    if (rows[0].passwd !== hash.sha256(passwd)) {
        res.send("incorrectPassword"); return;
    }
    //세션에 정보부여
    req.session.userId = id;
    req.session.nickname = rows[0].nickname;
    req.session.charImg = rows[0].charImg;
    res.send('ok');
})

// 랭킹 화면
app.get('/Rank', async (req, res) => {
    const rows = await DB.select(`select nickname, level, exp, charImg from account order by level desc, exp desc`);
    res.render('Rank', { navText: logInOutStr.navStr(req.session.userId ? true : false), rows });
})

// 게임 맵 리스트 화면
app.get('/GameMapList', async (req, res) => {
    res.render('GameMapList', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})

//메이플아케이드에서 정보를 요청할 때.
app.get('/getCharacterInfo', async (req, res)=>{
    if(req.session.userId) {
        const rows = await DB.select(`select nickname, level, exp, speed, wbLimitQuantity, wbLen, money, charImg from jsgame.account where userId = '${req.session.userId}'`);
        res.send(rows[0]);
    }
    else
        res.send('noLogin');
})
//메이플아케이드에서 정보를 저장할 때.
app.get('/saveCharacterInfo', async (req, res)=>{
    if(req.session.userId) {
        const level = req.query.level;
        const exp = req.query.exp;
        const speed = req.query.speed;
        const wbLimitQuantity = req.query.wbLimitQuantity;
        const wbLen = req.query.wbLen;
        const money = req.query.money;
        await DB.update(`update account set level=${level}, exp=${exp}, speed=${speed}, wbLimitQuantity=${wbLimitQuantity}, wbLen=${wbLen}, money=${money} where userId = '${req.session.userId}';`);
        res.send('ok');
    }
    else
        res.send('noLogin');
})
//중앙사냥터
app.get('/mapleArcade_mid', (req, res) => {
    res.render('gameMaps/중앙사냥터', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})
//중앙사냥터_맵편집
app.get('/mapleArcade_midMap', (req, res) => {
    res.render('gameMaps/중앙사냥터_맵편집', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})
//서쪽사냥터
app.get('/mapleArcade_west', (req, res) => {
    res.render('gameMaps/서쪽사냥터', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})
//서쪽사냥터_맵편집
app.get('/mapleArcade_westMap', (req, res) => {
    res.render('gameMaps/서쪽사냥터_맵편집', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})
//동쪽사냥터
app.get('/mapleArcade_east', (req, res) => {
    res.render('gameMaps/동쪽사냥터', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})
//동쪽사냥터_맵편집
app.get('/mapleArcade_eastMap', (req, res) => {
    res.render('gameMaps/동쪽사냥터_맵편집', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})
//남쪽사냥터
app.get('/mapleArcade_south', (req, res) => {
    res.render('gameMaps/남쪽사냥터', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})
//남쪽사냥터_맵편집
app.get('/mapleArcade_southMap', (req, res) => {
    res.render('gameMaps/남쪽사냥터_맵편집', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})

// 게시판 화면
app.get('/bulletinBoard', async (req, res) => {
    res.render('bulletinBoard', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
})

// 게시글들 리스트 반환
app.get('/getPosts', async (req, res) => {
    const rows = await DB.select(`select bId, title, postDatetime, commentNum, nickname from post order by bId desc`);
    res.send(rows);
})

// 새글 쓰기 화면
app.get('/newPost', (req, res) => {
    if (req.session.userId ? true : false) {
        res.render('newPost', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
    }
    else {
        res.send(`<script>alert('로그인 후 이용해주세요');history.back();</script>`);
    }
})

// 새글 쓰기
app.post('/sendPost', async (req, res) => {
    if ((req.session.userId ? true : false) === false) {
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
    res.render('viewPost', { navText: logInOutStr.navStr(req.session.userId ? true : false) });
});

// 게시글 내용 반환
app.get('/getPostBybId/:bId', async (req, res) => {
    const bId = req.params.bId;
    const rows = await DB.select(`select bId, title, text, postDatetime, commentNum, nickname 
    from post where bId = ${bId}`);
    //글쓴이와 현재 세션 닉네임이 같나? 를 보면 된다.
    res.send([rows, req.session.nickname]);
})

// 댓글 내용 반환
app.get(`/getCommentBybId/:bId`, async (req, res) => {
    const bId = req.params.bId;
    const rows = await DB.select(`select * from comment where bId = ${bId}`);
    res.send([rows, req.session.nickname]);
})

// 댓글 쓰기
app.get(`/sendComment/:bId`, async (req, res) => {
    if (req.session.userId ? true : false) {
        const bId = req.params.bId;
        const cText = req.query.cText;
        const userId = req.session.userId;
        const nickname = req.session.nickname;
        //댓글 삽입
        await DB.insertComment(bId, cText, userId, nickname);
        //댓글수 증가
        await DB.update(`update post set commentNum = commentNum + 1 where bId = ${bId};`);
        res.send('ok');
    }
    else
        res.send('you have to log in');
})

// 게시글 수정
app.get('/editPost/:bId', async (req, res) => {
    const bId = req.params.bId;
    if (req.session.userId ? true : false) {
        const rows = await DB.select(`select userId, title, text from post where bId = ${bId}`);
        if (rows[0].userId === req.session.userId) {
            res.render(`editPost`, { navText: logInOutStr.navStr(req.session.userId ? true : false), title: rows[0].title, text: rows[0].text });
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
app.post('/editPost/:bId', async (req, res) => {
    if ((req.session.userId ? true : false) === false) {
        res.send(`error: no login`);
        return;
    }
    const bId = req.params.bId;
    const title = req.body.title;
    const text = req.body.text;
    const userId = req.session.userId;
    const rows = await DB.select(`select userId from post where bId=${bId};`);
    if (rows[0].userId !== userId) {
        res.send(`wrong person`);
        return;
    }
    await DB.updatePost(title, text, bId);
    res.send("ok");
})

// 게시글 삭제
app.get('/deletePost/:bId', async (req, res) => {
    const bId = req.params.bId;
    if (req.session.userId ? true : false) {
        let rows = await DB.select(`select userId from post where bId = ${bId}`);
        if (rows[0].userId === req.session.userId) {
            // 게시글 삭제
            await DB.deleteSql(`delete from post where bId = ${bId}`);
            // 게시글 댓글들 삭제
            rows = await DB.select(`delete from comment where bId = ${bId};`)
            res.send('ok');
        }
        else res.send('noRight');
    }
    else {
        res.send('noRight');
    }
})

// 댓글 삭제
app.get('/removeComment/:cId', async (req, res) => {
    const cId = req.params.cId;
    const bId = req.query.bId;
    if (req.session.userId ? true : false) {
        const rows = await DB.select(`select userId from comment where cId = ${cId}`);
        if (rows[0].userId === req.session.userId) {
            await DB.deleteSql(`delete from comment where cId = ${cId}`);
            //댓글수 감소
            await DB.update(`update post set commentNum = commentNum - 1 where bId = ${bId};`);
            res.send('ok');
        }
        else res.send('noRight');
    }
    else {
        res.send('noRight');
    }
})

// 내 정보 화면
app.get('/myInfo', async (req, res) => {
    //로그인 했을 때
    if (req.session.userId) {
        const rows = await DB.select(`select * from account where userId='${req.session.userId}';`);
        res.render('myInfo', {
            navText: logInOutStr.navStr(req.session.userId ? true : false),
            userId: rows[0].userId, nickname: rows[0].nickname, charImg: rows[0].charImg, level: rows[0].level, exp: rows[0].exp,
            speed: rows[0].speed, wbLimitQuantity: rows[0].wbLimitQuantity, wbLen: rows[0].wbLen, money: rows[0].money
        });
    }
    //로그인 안했을 때
    else {
        res.send(`<script>alert('로그인 후 이용해주세요');location.href='/';</script>`);
    }
})

// 내 정보 수정
app.get('/editMyInfo', async (req, res) => {
    if ((req.session.userId ? true : false) === false) {
        res.send(`error: no login`);
        return;
    }
    const nickname = req.query.nickname;
    const charImg = req.query.charImg;
    req.session.charImg = charImg;
    //중복된 nickname이 있다면 charImg만 바꾼다.
    rows = await DB.select(`select count(*) from account where nickname='${nickname}'`);
    if (rows[0]['count(*)'] !== 0) {
        await DB.update(`update jsgame.account set charImg='${charImg}' where userId='${req.session.userId}';`);
        res.send('캐릭터 이미지 변경');
    }
    else {
        await DB.update(`update jsgame.account set nickname='${nickname}', charImg='${charImg}' where userId='${req.session.userId}';`);
        res.send('캐릭터 이미지와 닉네임 변경');
    }
})

// 새 채팅방 만들기
app.post('/makeNewChatRoom', (req, res) => {
    const chatRoomName = req.body.chatRoomName;
    const key = room.makeNewChatRoom(chatRoomName);
    res.send(key);
})

// 새 크아방 만들기
// room에 maxPopulation=2로 추가 설정.
app.post('/makeNewChatCARoom', (req, res) => {
    const chatCARoomName = req.body.chatCARoomName;
    const key = room.makeNewCAChatRoom(chatCARoomName);
    res.send(key);
})

server.listen(10101, () => {
    console.log('listening on *:10101');
});

require('./socket')(server, session_store, room);