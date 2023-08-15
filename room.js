//room.js
const crypto = require('crypto');

class Room {
    constructor() {
        //key는 방 접속id로, 방을 구분짓기 위한 것으로만 사용한다.
        this.keys = new Set();
        //{key, name, population}으로 구성됨.
        this.chatRoomData = new Array();
        //{key, name, population, maxPopulation}으로 구성됨.
        this.chatCARoomData = new Array();
        //index페이지에 어떤 사람들이 있는지 저장하는 용도
        this.indexNicknames = new Set();
    }
    addNewNicknameAtIndex(nickname) {
        this.indexNicknames.add(nickname);
    }
    deleteNicknameAtIndex(nickname) {
        this.indexNicknames.delete(nickname);
    }
    getIndexNicknames() {
        return Array.from(this.indexNicknames);
    }
    makeDistinctKey() {
        let randomString = crypto.randomBytes(5).toString("hex");
        //id가 겹친다면 다시 id를 만든다.
        if (this.keys.has(randomString))
            randomString = this.makeDistinctKey();
        return randomString;
    }
    makeNewChatRoom(name) {
        let key = this.makeDistinctKey();
        this.keys.add(key);
        this.chatRoomData.push({key, name, population:0});
        return key;
    }
    makeNewCAChatRoom(name) {
        let key = this.makeDistinctKey();
        this.keys.add(key);
        this.chatCARoomData.push({key, name, population:0, maxPopulation:2});
        return key;
    }
    addPopulation(key) {
        for(let i=0; i<this.chatRoomData.length; i++) {
            if(this.chatRoomData[i].key == key) {
                this.chatRoomData[i].population++; break;
            }
        }
        for(let i=0; i<this.chatCARoomData.length; i++) {
            if(this.chatCARoomData[i].key == key) {
                this.chatCARoomData[i].population++; break;
            }
        }
    }
    subPopulation(key) {
        for(let i=0; i<this.chatRoomData.length; i++) {
            if(this.chatRoomData[i].key == key) {
                this.chatRoomData[i].population--;
                if(this.chatRoomData[i].population <= 0)
                    this.deleteChatRoom(key);
                break;
            }
        }
        for(let i=0; i<this.chatCARoomData.length; i++) {
            if(this.chatCARoomData[i].key == key) {
                this.chatCARoomData[i].population--;
                if(this.chatCARoomData[i].population <= 0)
                    this.deleteCAChatRoom(key);
                break;
            }
        }
    }
    deleteChatRoom(key) {
        this.keys.delete(key);
        this.chatRoomData = this.chatRoomData.filter((v)=> v.key != key);
    }
    deleteCAChatRoom(key) {
        this.keys.delete(key);
        this.chatCARoomData = this.chatCARoomData.filter((v)=> v.key != key);
    }
    getChatRoomList() {
        return this.chatRoomData;
    }
    getCAChatRoomList() {
        return this.chatCARoomData;
    }
    getCARoomPopulation(key) {
        let data = this.chatCARoomData.find((val)=>val.key===key);
        return data.population;
    }
}

module.exports = {Room};