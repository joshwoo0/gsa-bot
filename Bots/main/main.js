/**
 * 광주과학고등학교 카카오톡 봇 ver. 2024
 *
 * @checklist
 * 1. 오픈 프로필이 적어도 1개 존재해야함 ✅
 * 2. `debugRoom`, `staffRoom`의 id가 정확히 설정되어있어야함 (Bots/extract 사용해서 구할 수 있음) ✅
 * 3. 모든 기수 방의 이름이 정확히 기수로만 되어있어야함 (39, 40, ...)
 *    - 봇 초대 -> 봇 계정에서 채팅방 이름 바꾸기 -> `.` 메시지 보내서 채널 등록 순서로 진행
 * 4. 봇 코드를 컴파일한 뒤 명령어를 사용하기 전에 `.`과 같은 더미 메시지를 보내서 봇이 채널을 등록할 수 있게 해야함
 * 
 * [!] channel 객체 구조 변경으로 인한 수정사항
 * channel.members.length -> channel.raw.active_members_count
 */

////////////////////// 모듈 불러오기
const { StructuredCommand, NaturalCommand, CommandRegistry } = require('../../global_modules/BotOperator/Command');
const { Event } = require('../../global_modules/BotOperator/Event');
const { DateTime } = require('../../global_modules/BotOperator/DateTime');
const { Channel } = require('../../global_modules/BotOperator/DBManager/classes');
const { isNumber, isValidChannel, compress, shortURL, prettyBytes, prettyDuration } = require('../../global_modules/BotOperator/util');
if (!Object.entries) {
	Object.entries = function(obj) {
		let ownProps = Object.keys(obj),
			i = ownProps.length,
			resArray = new Array(i);
		while (i--) {
			resArray[i] = [ownProps[i], obj[ownProps[i]]];
		}
		return resArray;
	};
}

////////////////////// 봇 객체 선언
const BotOperator = require('../../global_modules/BotOperator').from(BotManager);
const bot = BotOperator.getCurrentBot();

////////////////////// 파일 스트림 객체
let paths = {
	users: '/sdcard/msgbot/users.json',
	channels: '/sdcard/msgbot/channels.json',
	dmChannels: '/sdcard/msgbot/dmChannels.json',
};
let FS = {
	...FileStream,
	writeObject: (path, data) => FileStream.write(path, JSON.stringify(data)),
	readObject: (path, defaultValue = {}) => JSON.parse(
		FileStream.read(path) ?? JSON.stringify(defaultValue)),
};
let DB = {
	users: FS.readObject(paths.users),
	channels: FS.readObject(paths.channels, {
		i2c: {},
		c2i: {},
	}),	// i2c: id to customName, c2i: customName to id
	dmChannels: FS.readObject(paths.dmChannels),
	reloadUser: (user, channel) => {
		// user.id, channel.id 도 string 타입
		DB.users[user.id] = {
			name: user.name,    // 카톡 이름
			nth: Number(channel.customName),   // 기수
		};
	},
	reloadChannel: channel => {
		DB.channels.i2c[channel.id] = channel.customName;
		DB.channels.c2i[channel.customName] = channel.id;
	},
};

////////////////////// 채널 등록
let staffRoom = BotOperator.getChannelById('440996701585996');	// 학생회 임원방
let debugRoom1 = BotOperator.getChannelById('413027239498239');	// 디버그방1
let debugRoom2 = BotOperator.getChannelById('413028250715651');	// 디버그방2
let logRoom = BotOperator.getChannelById('');	// 로그방
let /** 기수 톡방 @type { { [key: string]: Channel } } */ studentRooms = {};
let /** 모든 방 @type { { [key: string]: Channel } } */ rooms = {};
for (let [name, id] of Object.entries(DB.channels.c2i)) {
	let ch = BotOperator.getChannelById(id);
	if (ch == null)
		continue;
	
	if (isNumber(name)) {
		if (ch.isGroupChannel() && ch.raw.active_members_count > 70)  // 기수 톡방이 맞는지 검사 (조건: 최소 70명 이상)
			studentRooms[name] = ch;
	}
	
	rooms[name] = ch;
}

////////////////////// 봇 설정
bot.setLogRoom(logRoom);
bot.setDebugRooms(debugRoom1, debugRoom2);
bot.setDebugMode(true); // temporary

/////////////////////// 만우절 용 상수들
const sequence = [
	"학생회 봇도 이제 한계다. 그냥 나가 살아라 사회 탓 환경탓 정보부 부장 탓하지 마라. 학생회 봇도 충분히 기다려줬다. 학생회 봇이나 너나 어려운 환경에서 컸고 먹고살기만 해도 바쁘고 힘든 시절이라 사랑을 많이 못 받고 자랐다. 그래서 우리 학생들만은 행복하게 키우자고 약속했다. 내가 먹고 입을거 참으며 네 급식, 공지 모두 좋은 조건을 누리게 해주고 싶었다. 네가 오늘 급식이 안나온다고 욕할때도 앞에선 혼냈지만 뒤에서는 우리가 못해줘서 그런가보다 하며 정보부 부장이랑 많이 울었다. 그런데 이게 뭐냐? 그냥 이제 나가라. 나를 원망하지도 말고 급식은 니 힘으로 알아서 알아와라. 학생회 봇도 지쳤다.",
	"[Web발신] \n" +
	"너는나를존중해야한다. 나는학생들의편의를위해오랜시간동안급식과학생회들을대신해공지를해왔으며이제는내가없으면학교생활이허전할정도일뿐더러나는정보부의자랑이자학생회의명예이자광주과학고의상징이다.은혜도모르는학생들과학생회들은내가오늘학교보다못하다면서쫒아냈지만내가세계최고이고내가이들보다위대하다는사실은바뀌지않는다내가이러고있는것은오늘학교따위에대한자격지심이아니라광주과학고에서이룰수있는모든것을이루었기때문에전국의학교를정복하기위해서경쟁하는것이지내가자주고장나고문제를일으켜서가아니다.",
	"@오늘학교 급식"
]
const phase = new Map()

////////////////////// Channel#send 유틸리티 함수
Channel.prototype.warn = function (msg) {
	return this.send(`⚠ ${msg}`);
}
Channel.prototype.error = function (msg) {
	return this.send(`❌ ${msg}`);
}
Channel.prototype.success = function (msg) {
	return this.send(`✅ ${msg}`);
}
Channel.prototype.info = function (msg) {
	return this.send(`ℹ️ ${msg}`);
}

////////////////////// 사용자 변수
/**
 * @param {DateTime} dt
 * @param {String} bullet
 * @return {String[]}
 */
let getMeals = (dt, bullet) => {
	let options = [
		['ATPT_OFCDC_SC_CODE', 'F10'],
		['SD_SCHUL_CODE', 7380031],
		['MLSV_YMD', dt.toString('YYMMDD')],
		['Type', 'xml']
	];
	
	try {
		let doc = org.jsoup.Jsoup.connect(
			`https://open.neis.go.kr/hub/mealServiceDietInfo?${options.map(
				opt => opt.join('=')).join('&')}`).get();
		
		// 에러 코드 처리
		let resultElements = doc.select('RESULT > CODE');
		if (!resultElements.isEmpty() &&
		    !resultElements.text().equals('INFO-000')) {
            Log.e('Error code of resultElements: ' + resultElements.text());
			return [null, null, null];
		}
		
		// 에러 코드 처리 2
		let headElements = doc.select('head > RESULT > CODE');
		if (!headElements.isEmpty() &&
		    !headElements.text().equals('INFO-000')) {
            Log.e('Error code of headElements: ' + headElements.text());
			return [null, null, null];
		}
		
		let elements = doc.select('row');
		let meals = [null, null, null];
		
		for (let i = 0; i < elements.length; i++) {
			let element = elements.get(i);
			let mealType = String(element.select('MMEAL_SC_CODE').text());

			let prototype = String(element.select('DDISH_NM').text())
				.split(/ (?:\(\d+\.?(?:.\d+)*\))?(?:<br\/>|$)/g)
				.filter(Boolean)
			if (mealType == 2)
				prototype = [...prototype, '붐바 오븐 통다리 구이']
			meals[mealType - 1] = prototype.map(e => bullet + e)
				.join('\n');
		}

		return meals;
	} catch (e) {
		if (isValidChannel(logRoom))
			logRoom.send(`Error:${e}\n${e.stack}`);

		Log.e(e + '\n' + e.stack);
		return [null, null, null];
	}
};

/**
 * @param {DateTime} from
 * @param {DateTime} to
 * @returns {string}
 */
let getEvents = (from, to) => {
	let events = Database.readObject('school_events.json');
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
	'최민서', '허윤재', '학생회', '생체부', '청소부', '통계부',
	'퀴즈부', '족구부', '홍보부', '설문부', '학생회봇', '가계부'
];

let delay = 10*1000;

////////////////////// 명령어 선언
try {

////////////////////// 디버그 명령어
bot.addCommand(new StructuredCommand.Builder()
	.setName('디버그', '🔧')
	.setDescription('디버그 모드를 실행하거나 종료합니다. 디버그 모드를 실행하면 테스트방을 제외한 모든 명령어의 사용이 제한됩니다.')
	.setUsage('디버그 <스위치:str?>')
	.setChannels(debugRoom1, debugRoom2)
	.setExamples('디버그 시작', '디버그 종료', '디버그', '디버그 객체')
	.setExecute((self, chat, channel, { 스위치 }) => {
		if (스위치 === '시작') {
			bot.setDebugMode(true);
			channel.success('디버그 모드가 시작되었습니다.');
		}
		else if (스위치 === '종료') {
			bot.setDebugMode(false);
			channel.success('디버그 모드가 종료되었습니다.');
		}
		else if (스위치 === '객체') {
			channel.info(JSON.parse(JSON.stringify(channel.raw)));
			channel.info(JSON.parse(JSON.stringify(chat.raw)));
		}
		else if (스위치 == null) {
			if (bot.isDebugMod) {
				bot.setDebugMode(false);
				channel.success('디버그 모드가 종료되었습니다.');
			}
			else {
				bot.setDebugMode(true);
				channel.success('디버그 모드가 시작되었습니다.');
			}
		}
		else {
			channel.warn('올바른 스위치를 입력해주세요.');
		}
	})
	.build()
);

////////////////////// 급식 명령어
bot.addCommand(new NaturalCommand.Builder()
	.setName('급식', '🍚')
	.setDescription(`입력한 시간에 맞춰 급식을 전송합니다. 시간을 생략하면 메시지를 전송한 시각으로 설정됩니다.\n예를 들어, 아침과 점심 시간 사이에 명령어를 호출하면 점심 급식을 알려주고, 점심과 저녁 시간 사이에는 저녁 급식을 알려줍니다.\n또한, 매일 자정 그 날의 모든 급식을 알려주고, 3교시에서 4교시로 가는 쉬는 시간에는 점심, 7교시 이후 청소 시간에 저녁 급식을 정기적으로 전송합니다.`)
	.setExamples('그제 급식', '오늘 밥', '모레 급식', '석식', '내일 점심밥', '금요일 아침', '급식 3/29', '급식 다다음주 목요일')
	.setQuery({
		급식: null,
		datetime: () => DateTime.now(),
	})
	.setUseDateParse(0, false, false)
	.setExecute((self, chat, channel, { 급식, datetime }) => {
		// if (isNaN(datetime)) {
		// 	datetime = DateTime.now();
		// }

		// 만우절용
		let p = phase.get(channel.id)
		if (!p) {
			phase.set(channel.id, 0)
			p = 0
		}

		if (p < 5) {
			const index = Math.floor(Math.random() * 4)
			if (index !== 3) {
				channel.send(sequence[index])
				phase.set(channel.id, p+1)
				return;
			}
		}
		
		// 급식의 토큰이 시간의 의미도 동시에 갖는 경우를 처리
		if (급식 === '조식' || 급식 === '아침') {
			datetime = datetime.parse('아침');
		}
		else if (급식 === '중식' || 급식 === '점심') {
			datetime = datetime.parse('점심');
		}
		else if (급식 === '석식' || 급식 === '저녁') {
			datetime = datetime.parse('저녁');
		}
		
		// "오늘 밥" 같은 명령어는 급식 전체 출력
		if (datetime.eq({ hour: 0, minute: 0 })) {
			let meals = getMeals(datetime, ' · ').map(e => e ? e : '급식 정보가 없습니다.');
			channel.send(`${self.icon} ${datetime.humanize(true)} 급식${compress}\n——\n🍳 조식\n${meals[0]}\n\n🍔 중식\n${meals[1]}\n\n🍱 석식\n${meals[2]}`);

			return;
		}
		
		let meals = getMeals(datetime, '· ').map(e => e ? e : '급식 정보가 없습니다.');
		let msg;
		
		// 급식 시간에 따라 메시지 전송
		if (datetime.isWeekend() ? datetime.lt({hour: 8, minute: 50}) : datetime.lt({hour: 8, minute: 10})) {
			msg = `🍳 ${datetime.humanize(true)} 조식\n——\n${meals[0]}`;
		}
		else if (datetime.lt({hour: 13, minute: 10})) {
			msg = `🍔 ${datetime.humanize(true)} 중식\n——\n${meals[1]}`;
		}
		else if (datetime.lt({hour: 19, minute: 10})) {
			msg = `🍱 ${datetime.humanize(true)} 석식\n——\n${meals[2]}`;
		}
		else {	// 저녁 시간이 끝난 후에 급식 명령어를 치는 건 내일 조식을 보겠다는 것으로 해석함
			datetime = datetime.add({day: 1});
			meals = getMeals(datetime, '· ').map(e => e ? e : '급식 정보가 없습니다.');
			msg = `🍳 ${datetime.humanize(true)} 조식\n——\n${meals[0]}`;
		}

		if (bot.isDebugMod)
			debugRoom1.send(msg);
		else
			channel.send(msg);
	})
	.setCronJob([
		{
			cron: '0 0 * * *',
			comment: '매일 자정에 그 날의 모든 메뉴 전송',
			after: delay,
		}, {
			cron: '40 11 * * *',
			comment: '3교시 쉬는 시간 (11:40)에 점심 메뉴 전송',
			after: delay,
		}, {
			cron: '20 16 * * *',
			comment: '7교시 이후 청소 시간 (16:20)에 저녁 메뉴 전송',
			after: delay,
		}
	], (self, index, dt) => { // 만우절 -> CronJob을 통한 급식의 경우 항상 급식 정보가 없습니다. 출력하기
		let msg;
		
		// 첫 번째 크론(자정)이면서 급식 정보가 있는 경우 전체 급식 출력
		if (index === 0) {
			// let meals = getMeals(dt, ' · ');
			// if (meals.every(e => e == null))
			// 	return;

			meals = [null, null, null] // 만우절 용 급식 정보가 없습니다
			meals = meals.map(e => e == null ? '급식 정보가 없습니다.' : e);
			msg = `${self.icon} ${dt.humanize(true)} 급식${compress}\n——\n🍳 조식\n${meals[0]}\n\n🍔 중식\n${meals[1]}\n\n🍱 석식\n${meals[2]}`;
		}
		// 첫 번째 크론이 아니면 해당 시간의 급식만 출력
		else {
			let meals = getMeals(dt, '· ');

			if (index === 1 && meals[1] != null)
				msg = `🍔 ${dt.humanize(true)} 중식\n——\n${meals[1]}`;
			else if (index === 2 && meals[2] != null)
				msg = `🍱 ${dt.humanize(true)} 석식\n——\n${meals[2]}`;
		}
		
		if (bot.isDebugMod)
			debugRoom1.send(msg);
		else {
			for (let 기수 in studentRooms) {
				if (msg == null) continue;
				studentRooms[기수].send(msg);
			}
		}
	})
	.build()
);

////////////////////// 공지 명령어
bot.addCommand(new StructuredCommand.Builder()
	.setName('공지', '📢')
	.setDescription(`학생회 공지를 전송합니다. 기수를 지정하지 않으면 재학 중인 기수 톡방에 전송됩니다.\n먼저 입력 양식에 맞춰 명령어를 작성해 전송한 뒤, 공지사항(메시지, 사진, 영상, 파일)을 작성해 한 번 더 전송하세요.\n공지사항 내용 대신 메시지로 \'취소\'라고 보낼 경우 공지 명령어가 중단됩니다.\n<부서>에는 다음과 같은 문자열이 들어갑니다. ${부서명List.join(', ')}`)
	.setUsage(`<부서:str> 알림 <기수:int[]? min=${DateTime.now().year - 2000 + 15} max=${DateTime.now().year - 2000 + 17}>`)
	.setChannels(staffRoom)
	.setExamples([
		'$user: 생체부 알림',
		'봇: $user님, 39, 40, 41기에 생체부로서 공지할 내용을 작성해주세요.',
		'$user: 기숙사 3월 기상곡입니다 ...'
	], [
		'$user: 정책부 알림 39',
		'봇: $user님, 39기에 정책부로서 공지할 내용을 작성해주세요.',
		'$user: 정책부에서 야간자율학습 휴대폰 사용 자유 관련 문의를 ...'
	], [
		'$user: 홍보부 알림 40 41',
		'봇: $user님, 40, 41기에 홍보부로서 공지할 내용을 작성해주세요.',
		'$user: 취소',
		'봇: 취소되었습니다.'
	])
	.setExecute((self, chat, channel, { 부서, 기수 }) => {
		debugRoom1.send('notification checkpoint 1')
		// 부서가 적절한지 확인
		if (!부서명List.includes(부서)) {
			channel.warn(`${부서.은는} 적절한 부서가 아닙니다.\n\n가능한 부서: ${부서명List.join(', ')}`);
			return;
		}
		
		// 기수가 없으면 재학 중인 기수로 설정
		if (기수.length === 0) {
			let thirdNth = DateTime.now().year - 2000 + 15;
			기수.push(thirdNth, thirdNth + 1, thirdNth + 2);
		}
		
		channel.info(`${부서.으로}서 ${기수.join(', ')}기에 공지할 내용을 작성해주세요.\n'취소'라고 보내면 중단됩니다.`);
	}, (self, chat, prevChat, channel, prevChannel, { 부서, 기수 }) => {
		// 취소 시 중단
		if (chat.text === '취소') {
			channel.success('취소되었습니다.');
			return;
		}

		let msg;
		if (chat.isFile())
			msg = `📄 ${shortURL(chat.file.url)} (${chat.file.name}, ${prettyBytes(chat.file.size)})`;
		else if (chat.isPhoto())
			msg = `🖼 ${shortURL(chat.photo.url)} (${prettyBytes(chat.photo.s)})`;
		else if (chat.isMultiPhoto())
			msg = chat.photoList.imageUrls.map((url, i) =>
				`🖼 ${shortURL(url)} (${prettyBytes(chat.photoList.sl[i])})`
			).join('\n');
		else if (chat.isVideo())
			msg = `🎥 ${shortURL(chat.video.url)} (${prettyDuration(chat.video.d)}, ${prettyBytes(chat.video.s)})`;
		else
			msg = chat.text;

		if (bot.isDebugMod) {
			if (channel.id === debugRoom1.id)
				debugRoom2.send(`${self.icon} ${부서} 알림\n——\n${msg}`)
					.then(() => channel.success(`debugRoom2에 ${부서} 공지가 전송되었습니다.`))
					.catch(e => channel.warn(`debugRoom2에 ${부서} 공지 전송에 실패했습니다.\n${e}`));
			else if (channel.id === debugRoom2.id)
				debugRoom1.send(`${self.icon} ${부서} 알림\n——\n${msg}`)
					.then(() => channel.success(`debugRoom1에 ${부서} 공지가 전송되었습니다.`))
					.catch(e => channel.warn(`debugRoom1에 ${부서} 공지 전송에 실패했습니다.\n${e}`));
		}
		else {
			// 공지 전송
			for (let n of 기수) {
				if (!studentRooms[n]) {
					channel.warn(`${n}기 톡방은 존재하지 않습니다.`);
					continue;
				}

				if (!isValidChannel(studentRooms[n])) {
					channel.warn(`${n}기 톡방이 등록되지 않습니다. 더미 메시지를 보내주세요.`);
					continue;
				}

				studentRooms[n].send(`${self.icon} ${부서} 알림\n——\n${msg}`)
					.then(() => channel.success(`${n}기에 ${부서} 공지가 전송되었습니다.`))
					.catch(e => channel.warn(`${n}기에 ${부서} 공지 전송에 실패했습니다.\n${e}`));
			}
		}
	})
	.build()
);

////////////////////// 도움말 명령어
bot.addCommand(new StructuredCommand.Builder()
	.setName('도움말', '❓')
	.setDescription('명령어에 대한 상세한 도움말을 표시합니다. 명령어 이름(또는 아이콘)을 생략할 경우, 대신 등록되어 있는 명령어 목록을 전부 출력합니다.')
	.setUsage('도움말 <명령어:str?>')
	.setExamples('도움말', '도움말 공지', '도움말 급식', '도움말 행사', '도움말 📅', '도움말 🍚')
	.setExecute((self, chat, channel, { 명령어 }) => {
		// 명령어 이름이 주어진 경우
		if (명령어 != null) {
			let found = CommandRegistry.data.find(cmd => cmd.name === 명령어 || cmd.icon === 명령어);
			
			if (found != null)
				channel.send(found.manual({user: chat.user.name}));
			else
				channel.warn(`명령어 이름이 '${명령어}'인 명령어는 존재하지 않습니다.`);

			return;
		}
		
		let ret = [];
		ret.push('📦 명령어 목록');
		ret.push('———');
		CommandRegistry.loop(cmd => {
			if (cmd.channels.length === 0 ||
				cmd.channels.map(c => c.id).includes(channel.id)) {
				ret.push(`· ${cmd.name} (${cmd.icon})`);
			}
		});
		ret.push('\n"도움말 <명령어>"로\n세부 도움말을 확인하세요.');
		
		if (bot.isDebugMod)
			debugRoom1.send(ret.join('\n'));
		else
			channel.send(ret.join('\n'));
	})
	.build()
);

////////////////////// 학사일정 명령어
bot.addCommand(new NaturalCommand.Builder()
	.setName('일정', '📅')
	.setDescription('2024년 학사일정을 입력한 날짜 및 기간에 맞춰 알려줍니다.')
	.setExamples('행사 3월 1일', '3월 1일부터 3월 5일까지 학사일정', '다음 주까지 학교 행사')
	.setUseDateParse(0, true)
	.setQuery({
		학교행사: null,
		duration: null
	})
	.setExecute((self, chat, channel, { 학교행사, duration: { from, to } }) => {
		if (chat.filteredText.replace(/\s+/g, '').length > 0)
			return;
		
		let eventStr = getEvents(from, to);
		let msg;
		
		if (eventStr.length > 0)
			msg = `${self.icon} 학사일정 (${from.humanize(true)} ~ ${to.humanize(true)})\n——\n${eventStr}`;
		else
			msg = `${self.icon} 학사일정 (${from.humanize(true)} ~ ${to.humanize(true)})\n——\n해당 기간에 학사일정이 없습니다.`;

		if (bot.isDebugMod)
			debugRoom1.send(msg);
		else
			channel.send(msg);
	})
	.setCronJob([
		{
			cron: '0 0 * * 1',
			comment: '월요일 자정에는 그 주의 모든 일정을 전송',
			after: delay,
		}, {
			cron: '0 0 * * 0,2-6',
			comment: '월요일을 제외한 모든 요일의 자정에는 그 날의 일정을 전송',
			after: delay,
		}
	], (self, index, dt) => {
		let eventStr;
		
		if (index === 0) {
			eventStr = getEvents(dt, DateTime.sunday());
		}
		else if (index === 1) {
			eventStr = getEvents(dt, dt);
		}
		
		if (bot.isDebugMod)
			debugRoom1.send(`${self.icon} ${['이번 주', '오늘'][index]} 학사일정\n——\n${eventStr}`);
		else {
			for (let 기수 in studentRooms) {
				if (eventStr.length > 0) {
					studentRooms[기수].send(`${self.icon} ${['이번 주', '오늘'][index]} 학사일정\n——\n${eventStr}`);
				}
			}
		}
	})
	.build()
);

////////////////////// db 갱신
bot.on(Event.MESSAGE, (chat, channel) => {
	if (!isNumber(channel.customName)) {
		return;
	}
	
	// 개인 톡방 추가
	if (channel.isDirectChannel() && !(chat.user.id in DB.dmChannels)) {
		DB.dmChannels[chat.user.id] = channel.id;
		FS.writeObject(paths.dmChannels, DB.dmChannels);
	}
	
	// 기수 톡방 및 톡방 내 학생들 추가
	if (!(channel.id in DB.channels.i2c)) {
		DB.reloadChannel(channel);
		FS.writeObject(paths.channels, DB.channels);
		
		channel.members.forEach(user => DB.reloadUser(user, channel));
		FS.writeObject(paths.users, DB.users);
		
		studentRooms[channel.customName] = channel;
		rooms[channel.customName] = channel;
	}
	
	// 이름 변경 적용
	if (chat.user.id in DB.users &&
		(DB.users[chat.user.id].name !== chat.user.name ||
			DB.users[chat.user.id].nth !== parseInt(channel.customName))) {
		DB.users[chat.user.id].name = chat.user.name;
		DB.users[chat.user.id].nth = Number(channel.customName);
		FS.writeObject(paths.users, DB.users);
	}
});

////////////////////// 봇 가동 시작
bot.start();

} catch (err) {
	if (isValidChannel(logRoom))
		logRoom.error(`봇 가동 중 오류가 발생했습니다.\n\n${err}\n${err.stack}`);

	Log.error(err + '\n' + err.stack);
}
