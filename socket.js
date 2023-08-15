//socket.js
const { Server } = require("socket.io");
const roomModule = require('./room');



module.exports = (server, session_store, room = new roomModule.Room) => {
    const io = new Server(server);

    io.on('connection', (socket) => {
        socket.on("indexPage", () => {
            socket.join('index');
            //express-session 값을 알아내기 위해 cookie값을 알아낸다.
            const connect_sid = socket.request.headers.cookie.match(/(?<=connect.sid=)[^;]+/)[0];
            //cookie값의 일부분이 sessionID이다. 해당 부분을 추출한다.
            const sessionID = connect_sid.match(/(?<=s%3A)[^.]+/)[0];
            if (sessionID) {
                session_store.get(sessionID, function (err, session) {
                    socket.nickname=session.nickname;
                    //초대메시지를 받기 위해 자신의 닉네임 room에 join한다.
                    socket.join(socket.nickname);
                    room.addNewNicknameAtIndex(session.nickname);
                    io.to('index').emit('response onlineChatNicknames', room.getIndexNicknames());
                })
            }
        });
        socket.on('inviteChatRoom', (nickname, key, name)=>{
            socket.to(nickname).emit('inviteChatRoom', socket.nickname, key, name);
        });
        socket.on('request onlineChatNicknames', () => {
            socket.emit('response onlineChatNicknames', room.getIndexNicknames());
        });
        socket.on('request room List', () => {
            socket.emit('response room List', room.getRoomList());
        });
        socket.on('exitRoom', (key)=>{
            room.subPopulation(key);
            socket.leave(key);
            io.to('index').emit('response room List', room.getRoomList());
            io.to(key).emit('chat message', `${socket.nickname}이/가 채팅방에서 나갔습니다.`);
        });
        socket.on('chat message', (key, msg) => {
            io.to(key).emit('chat message', `${socket.nickname}: ${msg}`);
        });
        socket.on("whatIsMyRoom", (key) => {
            socket.join(key);
            room.addPopulation(key);
            io.to('index').emit('response room List', room.getRoomList());
            io.to(key).emit('chat message', `${socket.nickname}이/가 채팅방에 참여했습니다.`);
        });
        socket.on('disconnecting', () => {
            for (const r of socket.rooms) {
                //인덱스페이지에서 나가면 집합에서 제외한다.
                if (r === 'index') {
                    room.deleteNicknameAtIndex(socket.nickname);
                    io.to('index').emit('response onlineChatNicknames', room.getIndexNicknames());
                }
                else if (r != socket.id) {
                    room.subPopulation(r);
                    io.to(r).emit('chat message', `${socket.nickname}이/가 채팅방에서 나갔습니다.`);
                }
            }
        });
        socket.on('disconnect', () => {
            io.to('index').emit('response room List', room.getRoomList());
        });
    });
};