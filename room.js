//room.js
const crypto = require('crypto');

class Room {
    constructor() {
        //key는 방 접속id로, 방을 구분짓기 위한 것으로만 사용한다.
        this.keys = new Set();
        // key를 name으로, {name, population}을 value로 가진다.
        this.chatRoomData = {};
        // key를 name으로, {name, population, maxPopulation, info}을 value로 가진다. info는 nickname을 name으로, {ready, keyboard}를 value로 가진다.
        this.chatCARoomData = {};
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
        this.chatRoomData[key] = { name, population: 0 };
        return key;
    }
    makeNewCAChatRoom(name) {
        let key = this.makeDistinctKey();
        this.keys.add(key);
        this.chatCARoomData[key] = { name, population: 0, maxPopulation: 2, info: {} };
        return key;
    }
    addChatPopulation(key) {
        this.chatRoomData[key].population++;
    }
    addCAChatPopulationInfo(key, nickname) {
        this.chatCARoomData[key].population++;
        this.chatCARoomData[key].info[nickname] = { ready: false, keyboard: false };
    }
    subChatPopulation(key) {
        if (!this.chatRoomData[key]) return false;
        this.chatRoomData[key].population--;
        if (this.chatRoomData[key].population <= 0)
            this.deleteChatRoom(key);
        return true;
    }
    subCAChatPopulation(key, nickname) {
        if (!this.chatCARoomData[key]) return false;
        this.chatCARoomData[key].population--;
        delete this.chatCARoomData[key].info[nickname];
        if (this.chatCARoomData[key].population <= 0)
            this.deleteCAChatRoom(key);
        return true;
    }
    CAReady(key, nickname) {
        this.chatCARoomData[key].info[nickname].ready = true;
        if (Object.values(this.chatCARoomData[key].info).every((v) => v.ready == true) && this.chatCARoomData[key].population >= 2) return 'all ready';
    }
    getCARoomInfo(key) {
        if (!this.chatCARoomData[key]) return false;
        return this.chatCARoomData[key].info;
    }
    deleteChatRoom(key) {
        this.keys.delete(key);
        delete this.chatRoomData[key];
    }
    deleteCAChatRoom(key) {
        this.keys.delete(key);
        delete this.chatCARoomData[key];
    }
    getChatRoomList() {
        return this.chatRoomData;
    }
    getCAChatRoomList() {
        return this.chatCARoomData;
    }
    getCARoomPopulation(key) {
        return this.chatCARoomData[key].population;
    }
    saveCAKeyboardData(key, nickname, keyboardObject){
        this.chatCARoomData[key].info[nickname].keyboard = keyboardObject;
    }
    allCAplayerKeyboardDataReceived(key) {
        return Object.values(this.chatCARoomData[key].info).every((v)=>v.keyboard);
    }
    getCAKeyboardData(key) {
        return this.chatCARoomData[key].info;
    }
    setCAKeyboardDataFalse(key) {
        for(let nickname of Object.keys(this.chatCARoomData[key].info)) {
            this.chatCARoomData[key].info[nickname].keyboard=false;
        }
    }
}

module.exports = { Room };