const extractMetaDataList = () => {
    console.log(`Browsing List...`);
    const totalList = browseJSON('./data/pillyze/product/totalProductList.json');

    console.log(`total :: ${totalList.length} items!`);

    console.log('----------- DUMMY -----------');

    console.log(totalList[0]);

    console.log('-----------  END  -----------');

    console.log('Processing.....');

    // Prepare Set for UNIQUE Keys
    const makerSet = new Set();
    const mainFuncSet = new Set();
    const subFuncSet = new Set();
    const eatingTimingSet = new Set();
    const eatingCountSet = new Set();

    totalList.forEach((e, i) => {
        const { maker, eatingTiming, eatingCount, functions } = e;

        // Maker 처리
        makerSet.add(maker.trim());

        // Meta-data 처리
        eatingTimingSet.add(eatingTiming.trim());
        eatingCountSet.add(eatingCount.trim());

        // Function 처리
        functions.forEach(row => {
            const isMain = row['type'] === 'main';
            const targetSet = isMain ? mainFuncSet : subFuncSet;

            const contents = row['contents'];

            contents.forEach(cnts => targetSet.add(cnts.trim()));
        });
    });

    console.log('----------- RESULT -----------');
    console.log({
        makerCnt: makerSet.size,
        mainFuncCnt: mainFuncSet.size,
        subFuncCnt: subFuncSet.size,
        eatingTimingCnt: eatingTimingSet.size,
        eatingCountCnt: eatingCountSet.size,
    });
    console.log('----------- RESULT -----------');

    const BASEDIR = './data/beeHealer';
    saveSetAsJson(`${BASEDIR}/makerList.json`, makerSet);
    saveSetAsJson(`${BASEDIR}/mainFuncList.json`, mainFuncSet);
    saveSetAsJson(`${BASEDIR}/subFuncList.json`, subFuncSet);
    saveSetAsJson(`${BASEDIR}/eatingTimingList.json`, eatingTimingSet);
    saveSetAsJson(`${BASEDIR}/eatingCountList.json`, eatingCountSet);

    console.log('----------- COMPLETED -----------');
};

const getFormattedDataFromRaw = () => {
    const nutList = browseJSON('./data/aimee/nutList.json');

    const nutDB = [];
    const intakeDB = [];

    nutList.forEach((nut, i) => {
        const { idx, unitCdValue, formalNutrientNm, mainNutrientNm, ingestCare, recommendDailyRequirementsList } = nut;

        const refinedIngestCare = ingestCare
            .replace('&middot;', '')
            .replace(/\r\n/g, '-')
            .split('-')
            .map(e => e.trim())
            .filter(e => e);

        nutDB.push({ id: idx, unit: unitCdValue, name: mainNutrientNm, tips: refinedIngestCare, efficacy: [] });

        recommendDailyRequirementsList?.forEach(req => {
            const { minMonth, maxMonth, reqMin, reqAvg, reqMax, reqLimit, gender, desc } = req;

            intakeDB.push({
                id: i + 1,
                nutrient_id: idx,
                min_age: minMonth,
                max_age: maxMonth,
                isMale: gender === 1,
                reqMin,
                reqAvg,
                reqMax,
                reqLimit,
                description: desc,
            });
        });
    });

    const BASE_DIR = './data/beeHealer/DB';
    saveListAsJSON(`${BASE_DIR}/nutDB.json`, nutDB);
    saveListAsJSON(`${BASE_DIR}/intakeDB.json`, intakeDB);
};
