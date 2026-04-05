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

        let doc = org.jsoup.Jsoup.connect(
                `https://open.neis.go.kr/hub/${url}?${queries}`
        ).get();

        // 에러 코드 처리
        let resultElements = doc.select('RESULT > CODE');
        if (!resultElements.isEmpty() && !resultElements.text().equals('INFO-000'))
            throw new Error('Error code of resultElements: ' + resultElements.text());

        // 에러 코드 처리 2
        let headElements = doc.select('head > RESULT > CODE');
        if (!headElements.isEmpty() && !headElements.text().equals('INFO-000'))
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

    getEvents() {

    }
}

exports.Connection = Connection;