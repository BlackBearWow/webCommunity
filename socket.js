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
                    room.addNewNicknameAtIndex(session.nickname);
                    io.to('index').emit('response onlineChatNicknames', room.getIndexNicknames());
                })
            }
        });
        socket.on('request onlineChatNicknames', () => {
            socket.emit('response onlineChatNicknames', room.getIndexNicknames());
        });
        socket.on('request room List', () => {
            socket.emit('response room List', room.getRoomList());
        });

        socket.on('chat message', (key, msg) => {
            io.to(key).emit('chat message', msg);
        });
        socket.on("whatIsMyRoom", (key) => {
            socket.join(key);
            room.addPopulation(key);
            io.to('index').emit('response room List', room.getRoomList());
        });
        socket.on('disconnecting', () => {
            for (const r of socket.rooms) {
                //인덱스페이지에서 나가면 집합에서 제외한다.
                if (r === 'index') {
                    //express-session 값을 알아내기 위해 cookie값을 알아낸다.
                    const connect_sid = socket.request.headers.cookie.match(/(?<=connect.sid=)[^;]+/)[0];
                    //cookie값의 일부분이 sessionID이다. 해당 부분을 추출한다.
                    const sessionID = connect_sid.match(/(?<=s%3A)[^.]+/)[0];
                    session_store.get(sessionID, function (err, session) {
                        room.deleteNicknameAtIndex(session.nickname);
                        io.to('index').emit('response onlineChatNicknames', room.getIndexNicknames());
                    })
                }
                if (r != socket.id)
                    room.subPopulation(r);
            }
        });
        socket.on('disconnect', () => {
            io.to('index').emit('response room List', room.getRoomList());
        });
    });
};