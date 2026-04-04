const {isNumber} = require("./util");
const FS = {
    ...FileStream,
    writeObject: (path, data) => FileStream.write(path, JSON.stringify(data)),
    readObject: (path, defaultValue = {}) => JSON.parse(
        FileStream.read(path) ?? JSON.stringify(defaultValue)),
};

class ChannelCache {
    #channel2Id = {}
    #id2Channel = {}
    #fileStream
    #path
    #botOperator

    constructor(fileStream, path, botOperator) {
        this.#fileStream = fileStream;
        this.#path = path;
        this.#botOperator = botOperator
    }

    load() {
        let rooms = {}
        let studentRooms = {}
        let { i2c, c2i } = this.#fileStream.readObject(this.#path, {
            i2c: {},
            c2i: {}
        });
        for (let [name, id] of Object.entries(c2i)) {
            let ch = this.#botOperator.getChannelById(id);
            if (ch == null)
                continue;

            this.#channel2Id[name] = id;
            this.#id2Channel[id] = name;
            if (isNumber(name)) {
                if (ch.isGroupChannel() && ch.raw.active_members_count > 80)  // 기수 톡방이 맞는지 검사 (조건: 최소 80명 이상)
                    studentRooms[name] = ch;
            }

            rooms[name] = ch;
        }

        this.dump()
        return { rooms, studentRooms }
    }

    push(channel) {
        this.#channel2Id[channel.customName] = channel.id;
        this.#id2Channel[channel.id] = channel.customName;
    }

    dump() {
        this.#fileStream.writeObject(this.#path, {
            c2i: this.#channel2Id,
            i2c: this.#id2Channel,
        });
    }

    has(channel) {
        return channel.id in this.#id2Channel
    }

    data() {
        return { i2c: this.#id2Channel, c2i: this.#channel2Id };
    }
}

exports.FS = FS
exports.ChannelCache = ChannelCache