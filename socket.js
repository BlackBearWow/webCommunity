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
                    socket.emit('yourNickname', socket.nickname);
                    room.addNewNicknameAtIndex(session.nickname);
                    io.to('index').emit('response onlineChatNicknames', room.getIndexNicknames());
                })
            }
        });
        socket.on('inviteChatRoom', (nickname, key, name)=>{
            socket.to(nickname).emit('inviteChatRoom', socket.nickname, key, name);
        });
        socket.on('inviteCAChatRoom', (nickname, key, name)=>{
            socket.to(nickname).emit('inviteCAChatRoom', socket.nickname, key, name);
        });
        socket.on('request onlineChatNicknames', () => {
            socket.emit('response onlineChatNicknames', room.getIndexNicknames());
        });
        socket.on('request chatRoomList', () => {
            socket.emit('response chatRoomList', room.getChatRoomList());
        });
        socket.on('request CAChatRoomList', () => {
            socket.emit('response CAChatRoomList', room.getCAChatRoomList());
        });
        socket.on('exitChatRoom', (key)=>{
            room.subChatPopulation(key);
            socket.leave(key);
            io.to('index').emit('response chatRoomList', room.getChatRoomList());
            io.to(key).emit('chat message', `${socket.nickname}이/가 채팅방에서 나갔습니다.`);
        });
        socket.on('exitCAChatRoom', (key)=>{
            room.subCAChatPopulation(key, socket.nickname);
            socket.leave(key);
            io.to('index').emit('response CAChatRoomList', room.getCAChatRoomList());
            //io.to(key).emit('CAChat message', `${socket.nickname}이/가 채팅방에서 나갔습니다.`);
            io.to(key).emit('CARoomInfo', room.getCARoomInfo(key));
        });
        socket.on('chat message', (key, msg) => {
            io.to(key).emit('chat message', `${socket.nickname}: ${msg}`);
        });
        socket.on('CAChat message', (key, msg) => {
            io.to(key).emit('CAChat message', `${socket.nickname}: ${msg}`);
        });
        socket.on("joinChatRoom", (key) => {
            socket.join(key);
            room.addChatPopulation(key);
            io.to('index').emit('response chatRoomList', room.getChatRoomList());
            io.to(key).emit('chat message', `${socket.nickname}이/가 채팅방에 참여했습니다.`);
        });
        socket.on("joinCAChatRoom", (key, name) => {
            //인원이 꽉찼다면 안된다.
            if(room.getCARoomPopulation(key)>=2) {
                socket.emit('alert', '크아방은 최대 2명까지만 참여 가능합니다');
            }
            //아니라면
            else {
                socket.join(key);
                room.addCAChatPopulationInfo(key, socket.nickname);
                socket.emit('CAChatRoomJoinSucess', key, name);
                io.to('index').emit('response CAChatRoomList', room.getCAChatRoomList());
                //io.to(key).emit('CAChat message', `${socket.nickname}이/가 채팅방에 참여했습니다.`);
                io.to(key).emit('CARoomInfo', room.getCARoomInfo(key));
            }
        });
        socket.on('iAmReady', (key)=>{
            //room에 내가 ready=true로 한다.
            if(room.CAReady(key, socket.nickname)=='all ready')
                io.to(key).emit('gameStart');
            io.to(key).emit('CARoomInfo', room.getCARoomInfo(key));
        })
        socket.on('disconnecting', () => {
            for (const r of socket.rooms) {
                //인덱스페이지에서 나가면 집합에서 제외한다.
                if (r === 'index') {
                    room.deleteNicknameAtIndex(socket.nickname);
                    io.to('index').emit('response onlineChatNicknames', room.getIndexNicknames());
                }
                else if (r != socket.id) {
                    room.subChatPopulation(r);
                    room.subCAChatPopulation(r, socket.nickname);
                    io.to(r).emit('chat message', `${socket.nickname}이/가 채팅방에서 나갔습니다.`);
                    io.to(r).emit('CARoomInfo', room.getCARoomInfo(r));
                }
            }
        });
        socket.on('disconnect', () => {
            io.to('index').emit('response chatRoomList', room.getChatRoomList());
            io.to('index').emit('response CAChatRoomList', room.getCAChatRoomList());
        });
        socket.on('keyBoardData', (key, keyboardObject)=>{
            //key, nickname에 맞는 키보드 데이터 저장.
            //모든 플레이어의 키보드 데이터가 저장되었다면 emit.
        })
    });
};