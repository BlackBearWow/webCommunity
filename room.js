//room.js
const crypto = require('crypto');

class Room {
    constructor() {
        //key는 방 접속id로, 방을 구분짓기 위한 것으로만 사용한다.
        this.keys = new Set();
        this.keyValuePopulation = new Array();
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
    makeNewRoom(name) {
        let key = this.makeDistinctKey();
        this.keys.add(key);
        this.keyValuePopulation.push([key, name, 0]);

        return key;
    }
    addPopulation(key) {
        for(let i=0; i<this.keyValuePopulation.length; i++) {
            if(this.keyValuePopulation[i][0] == key) {
                this.keyValuePopulation[i][2]++; break;
            }
        }
    }
    subPopulation(key) {
        for(let i=0; i<this.keyValuePopulation.length; i++) {
            if(this.keyValuePopulation[i][0] == key) {
                this.keyValuePopulation[i][2]--;
                if(this.keyValuePopulation[i][2] <= 0)
                    this.deleteRoom(key);
                break;
            }
        }
    }
    deleteRoom(key) {
        this.keys.delete(key);
        this.keyValuePopulation = this.keyValuePopulation.filter((v)=> v[0] != key);
    }
    getRoomList() {
        return this.keyValuePopulation;
    }
    getRoomName(key) {
        let keyValuePopulation = this.keyValuePopulation.find((val)=>val[0]===key);
        return keyValuePopulation[1];
    }
}

module.exports = {Room};