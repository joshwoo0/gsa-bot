const { Bot, Chat, Channel, User } = require('./implementation');
const fs = require('fs');
const request = require('sync-request');
const xml2js = require('xml2js');

///////////////////////////////////////

const { StructuredCommand, NaturalCommand, CommandRegistry } = require('../global_modules/BotOperator/Command/index');
const { DateTime } = require('../global_modules/BotOperator/Datetime');
const { isNumber, isValidChannel, compress } = require('../global_modules/BotOperator/util');
const bot = new Bot();

let staffRoom = new Channel('staffRoom', '412937930061983');	// 학생회 임원방
let debugRoom1 = new Channel('debugRoom1', '413027239498239');	// 디버그방1
let debugRoom2 = new Channel('debugRoom2', '413028250715651');	// 디버그방2
let logRoom = new Channel('logRoom', '413032741340672');	// 로그방

/** @type {Record<String, Channel>} */
const studentRooms = {};
let min = DateTime.now().year - 2000 + 15;
studentRooms[min] = new Channel(`${min}기 방`);
studentRooms[min + 1] = new Channel(`${min + 1}기 방`);
studentRooms[min + 2] = new Channel(`${min + 2}기 방`);

bot.setDebugRoom(debugRoom1, debugRoom2);
bot.setLogRoom(logRoom);

const getMeals = (dt, bullet) => {
	const options = [
		['ATPT_OFCDC_SC_CODE', 'F10'],
		['SD_SCHUL_CODE', 7380031],
		['MLSV_YMD', dt.toString('YYMMDD')],
		['Type', 'xml']
	];
	
	const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?${options.map(opt => opt.join('=')).join('&')}`;
	
	try {
		const res = request('GET', url);
		const xmlData = res.getBody('utf8');
		
		let meals = [null, null, null];
		let result = null;
		
		xml2js.parseString(xmlData, (err, parsedResult) => {
			if (err) throw err;
			result = parsedResult;
		});
		
		// 에러 코드 처리
		const resultCode = result?.mealServiceDietInfo?.RESULT?.[0]?.CODE?.[0];
		if (resultCode && resultCode !== 'INFO-000') {
			console.error('Error code of resultElements: ' + resultCode);
			return [null, null, null];
		}
		
		const elements = result?.mealServiceDietInfo?.row || [];
		
		elements.forEach(element => {
			const mealType = element.MMEAL_SC_CODE?.[0];
			const dishName = element.DDISH_NM?.[0];
			
			if (mealType && dishName) {
				meals[mealType - 1] = dishName.split(/ (?:\(\d+\.?(?:.\d+)*\))?(?:<br\/>|$)/g)
				.filter(Boolean)
				.map(e => bullet + e)
				.join('\n');
			}
		});
		
		return meals;
	} catch (e) {
		console.error(`Error: ${e}\n${e.stack}`);
		return [null, null, null];
	}
};

const getEvents = (from, to) => {
	let events = JSON.parse(fs.readFileSync('D:\\Repo\\gsa-bot\\Bots\\main\\Database\\school_events.json', 'utf8'));
	let satisfied = {};
	
	for (let date in events) {
		let dt = DateTime.parse(date);
		let dtString = dt.toString('M월 D일:');
		
		if (from.le(dt) && dt.le(to)) {
			if (!(dtString in satisfied)) {
				satisfied[dtString] = [];
			}
			
			for (let event of events[date].split(/,\s+/))
				satisfied[dtString].push(`    · ${event}`);
		}
	}
	
	let msg = '';
	for (let dtString in satisfied) msg +=
		`${dtString}\n${satisfied[dtString].join('\n')}\n`;
	
	return msg.slice(0, -1);
};

let 부서명List = [
	'회장', '부회장', '학생회', '생체부', '환경부', '통계부',
	'문예부', '체육부', '홍보부', '정책부', '정보부', '총무부'
];

let delay = 10 * 1000;

///////////////////////////////////////

const filePath = 'D:\\Repo\\gsa-bot\\Bots\\main\\main.js';
const fileContent = fs.readFileSync(filePath, 'utf8');
const commandRegex = /bot\.addCommand\([\s\S]*?\n\);/g;
const commands = fileContent.match(commandRegex);
if (commands) commands.forEach(str => bot.addCommand(eval(str.substring('bot.addCommand'.length))));

const message = (msg, channel=studentRooms[min], username='rhs') => {
	bot.onMessage(new Chat(msg, new User(username)), channel);
}

///////////////////////////////////////
// todo: CronJob 테스트는 불가능

// message("정보부 알림", staffRoom);
// message("테스트 공지입니다.", staffRoom);

// message("정보부 알림 39 41", staffRoom);
// message("테스트 39, 41기 공지입니다.", staffRoom);

// message("회장 알림", staffRoom);
// message("취소", staffRoom);

// message("홍보부 알림 35 36 37 38", staffRoom);

// message("오늘 밥")

// message("밥");
// message("메뉴");
// message("석식");

// message("오늘 메뉴 뭐야");
// message("오늘 메뉴 뭐");
// message("오늘 메뉴 ");

// message("(밥)");
// message(";;;;;밥;;;;");
// message("@==밥===@");

// message("내년까지 일정");
// message("오늘부터 10월까지 학사");

// message("일정");
// message("학사 일정");

// message("도움말");
// message("도움말", staffRoom);
// message("도움말", debugRoom1);

// message("도움말 도움말");
// message("도움말 공지");
// message("도움말 디버그");
// message("도움말 급식");
// message("도움말 일정");

// message("도움말 ❓");
// message("도움말 📢");
// message("도움말 🔧");
// message("도움말 🍚");
// message("도움말 📅");

// message("도움말 아무말");