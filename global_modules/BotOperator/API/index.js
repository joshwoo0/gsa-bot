const {DateTime} = require("../DateTime");

class Connection {

    #options

    constructor(apiKey, orgCode = 'F10', schoolCode = 7380031, type = 'xml') {
        this.#options = [
            ['KEY', apiKey],
            ['ATPT_OFCDC_SC_CODE', orgCode],
            ['SD_SCHUL_CODE', schoolCode],
            ['Type', type]
        ];
    }

    connect(url, args) {
        const queries= [
            ...this.#options,
            ...args
        ].map(opt => opt.join('=')).join('&');

        Log.i(queries);
        let doc = org.jsoup.Jsoup.connect(
                `https://open.neis.go.kr/hub/${url}?${queries}`
        ).get();

        // 에러 코드 처리
        let resultElements = doc.select('RESULT > CODE');
        if (!resultElements.isEmpty() && !String(resultElements.text()).includes('INFO'))
            throw new Error('Error code of resultElements: ' + resultElements.text());

        // 에러 코드 처리 2
        let headElements = doc.select('head > RESULT > CODE');
        if (!headElements.isEmpty() && !String(headElements.text()).includes('INFO-000'))
            throw new Error('Error code of headElements: ' + headElements.text());

        return doc.select('row')
    }

    getMeals(datetime) {
        let elements = this.connect('mealServiceDietInfo', [
            ['MLSV_YMD', datetime.toString('YYMMDD')],
        ]);
        let meals = [null, null, null]

        for (let i = 0; i < elements.length; i++) {
            let element = elements.get(i);
            let mealType = String(element.select('MMEAL_SC_CODE').text());

            meals[mealType - 1] = String(element.select('DDISH_NM').text())
                .split(/ (?:\(\d+\.?(?:.\d+)*\))?(?:<br\/>|$)/g)
                .filter(Boolean)
        }

        return meals;
    }

    getEvents(from, to) {
        const NEGLIGIBLE = ['휴업일']

        let elements = this.connect('SchoolSchedule', [
            ['AA_FROM_YMD', from.toString('YYYYMMDD')],
            ['AA_TO_YMD', to.toString('YYYYMMDD')]
        ])
        let events = []

        for (let i = 0; i < elements.length; i++) {
            const element = elements.get(i);
            const instDeductionNm = String(element.select('SBTR_DD_SC_NM').text());
            if (NEGLIGIBLE.includes(instDeductionNm))
                continue;

            const name = String(element.select('EVENT_NM').text());
            const isTargetGrade = ['ONE', 'TW', 'THREE'].map(g =>
                String(element.select(`${g}_GRADE_EVENT_YN`).text()) === 'Y'
            );
            const date = String(element.select('AA_YMD').text());
            const datetime = new DateTime();
            datetime.year = parseInt(date.slice(0, 4), 10)
            datetime.month = parseInt(date.slice(4, 6), 10)
            datetime.day = parseInt(date.slice(6, 8), 10)

            events.push({
                name: name,
                datetime: datetime,
                isTargetGrade: isTargetGrade,
            })
        }
        return events
    }
}

exports.Connection = Connection;