//room.js
const crypto = require('crypto');

class Room {
    constructor() {
        //key는 방 접속id로, 방을 구분짓기 위한 것으로만 사용한다.
        this.keys = new Set();
        //{key, name, population}으로 구성됨.
        this.chatRoomData = new Array();
        //{key, name, population, maxPopulation, info}으로 구성됨. info는 배열로, {nickname, ready}
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
        this.chatCARoomData.push({key, name, population:0, maxPopulation:2, info:new Array()});
        return key;
    }
    addChatPopulation(key) {
        for(let i=0; i<this.chatRoomData.length; i++) {
            if(this.chatRoomData[i].key == key) {
                this.chatRoomData[i].population++; break;
            }
        }
    }
    addCAChatPopulationInfo(key, nickname) {
        for(let i=0; i<this.chatCARoomData.length; i++) {
            if(this.chatCARoomData[i].key == key) {
                this.chatCARoomData[i].info.push({nickname, ready:false});
                this.chatCARoomData[i].population++; break;
            }
        }
    }
    subChatPopulation(key) {
        for(let i=0; i<this.chatRoomData.length; i++) {
            if(this.chatRoomData[i].key == key) {
                this.chatRoomData[i].population--;
                if(this.chatRoomData[i].population <= 0)
                    this.deleteChatRoom(key);
                break;
            }
        }
    }
    subCAChatPopulation(key, nickname) {
        for(let i=0; i<this.chatCARoomData.length; i++) {
            if(this.chatCARoomData[i].key == key) {
                this.chatCARoomData[i].population--;
                this.chatCARoomData[i].info = this.chatCARoomData[i].info.filter((v)=>v.nickname != nickname);
                if(this.chatCARoomData[i].population <= 0)
                    this.deleteCAChatRoom(key);
                break;
            }
        }
    }
    CAReady(key, nickname) {
        for(let i=0; i<this.chatCARoomData.length; i++) {
            if(this.chatCARoomData[i].key == key) {
                for(let k=0; k<this.chatCARoomData[i].info.length; k++) {
                    if(this.chatCARoomData[i].info[k].nickname === nickname) {
                        this.chatCARoomData[i].info[k].ready=true; 
                        if(this.chatCARoomData[i].info.every((val)=>val.ready==true)) return 'all ready';
                        break;
                    }
                }
                break;
            }
        }
    }
    getCARoomInfo(key) {
        for(let i=0; i<this.chatCARoomData.length; i++) {
            if(this.chatCARoomData[i].key == key) {
                return this.chatCARoomData[i].info;
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