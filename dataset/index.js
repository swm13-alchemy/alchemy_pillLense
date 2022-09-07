const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { useAxios } = require('./hook');
const fakeUA = require('fake-useragent');
const cheerio = require('cheerio');
const url = require('url');

const { browseJSON, saveListAsJSON, generateRandomString } = require('./functions');
const { getPillData } = require('./services/pillyze');
puppeteer.use(StealthPlugin());
// console.clear();

const refineDataFromPillData = async () => {
    const start = 16001;
    const end = 18000;
    const fileName = `refinedProductData_(${start}_${end}).json`;

    const fileList = fs.readdirSync('./output/pillyze/products');
    fileList.sort((a, b) => a - b);

    const result = [];
    const errList = [];

    let startIdx = 32;

    for (let i = startIdx; i < startIdx + 4; ++i) {
        if (fileList[i] == undefined) break;

        const jsonPath = `./output/pillyze/products/${fileList[i]}`;

        const rawList = browseJSON(jsonPath);

        console.log(jsonPath);

        for (let j = 0; j < rawList.length; ++j) {
            let data;
            try {
                data = await getPillDataFromHTML(rawList[j]);
            } catch (e) {
                errList.push({
                    fileIdx: i,
                    recordIdx: j,
                });
            }

            result.push(data);
            console.log(`${i + 1} 번째 파일 :: ${j + 1} / ${rawList.length}`);
        }

        console.log(`${i + 1} / ${startIdx + 4}`);
    }

    saveListAsJSON(`./data/pillyze/product/${fileName}`, result);
    saveListAsJSON(`./errorList_${fileName}.json`, errList);
};

const saveSetAsJson = (path, targetSet) => {
    const saveList = [];

    targetSet.forEach(e => {
        if (!e) return;
        saveList.push(e);
    });

    saveListAsJSON(path, saveList);
};

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
    const nutritionSet = new Set();

    totalList.forEach((e, i) => {
        const { maker, eatingTiming, eatingCount, functions, nutritions } = e;

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

        // Nutrition 처리
        nutritions.forEach(nutData => {
            const { nutName, nutAmount } = nutData;

            nutritionSet.add(nutName);
        });
    });

    console.log('----------- RESULT -----------');
    console.log({
        makerCnt: makerSet.size,
        mainFuncCnt: mainFuncSet.size,
        subFuncCnt: subFuncSet.size,
        eatingTimingCnt: eatingTimingSet.size,
        eatingCountCnt: eatingCountSet.size,
        nutritionCnt: nutritionSet.size,
    });
    console.log('----------- RESULT -----------');

    const BASEDIR = './data/beeHealer';
    saveSetAsJson(`${BASEDIR}/nutritionList.json`, nutritionSet);
    // saveSetAsJson(`${BASEDIR}/makerList.json`, makerSet);
    // saveSetAsJson(`${BASEDIR}/mainFuncList.json`, mainFuncSet);
    // saveSetAsJson(`${BASEDIR}/subFuncList.json`, subFuncSet);
    // saveSetAsJson(`${BASEDIR}/eatingTimingList.json`, eatingTimingSet);
    // saveSetAsJson(`${BASEDIR}/eatingCountList.json`, eatingCountSet);

    console.log('----------- COMPLETED -----------');
};

const MAX_NUTRITION_COUNT = 1129;

const crawlNutData = async () => {
    const result = [];

    const browser = await puppeteer.launch({
        headless: false,
    });

    const newPage = await browser.newPage();

    for (let i = 501; i <= 500; ++i) {
        const ENDPOINT = `https://www.pillyze.com/nutrients/${i}/_`;

        await newPage.waitForTimeout(500);

        await newPage.goto(ENDPOINT);

        const selector = '#amzn-captcha-verify-button';
        const isReCapCha = await newPage.$eval(selector, () => true).catch(() => false);

        if (isReCapCha) await newPage.waitForTimeout(10000);

        console.log(`${i} processing`);

        const content = await newPage.content();

        result.push(content);
    }

    saveListAsJSON('./output/pillyze/nutrition/nutritions(501_999).json', result);
};

const getRowType = str => {
    let elemType = false;

    if (str === 'title-wrap txt1') elemType = 'name';
    if (str.includes('tag-wrap')) elemType = 'subName';
    if (str.includes('caution-wrap')) elemType = 'sideEffect';
    if (str.includes('p-intake-guide')) elemType = 'intake';
    if (str.includes('effect-info-wrap')) elemType = 'effect';

    return elemType;
};

const refineNutDataFromRawHTML = $ => {
    const SECTION_SELECTOR =
        'body > div > div.all-wrap-in.all-wrap-in-040 > div.new-wide-wrap.new-wide-wrap-040 > div.new-wide-main > div.new-wide-main-in';

    let result2 = {
        name: '비타민A',
        description: [
            ' 체내 세포가 건강하게 성장하게 해줘요, 세포의 성장과 재생이 활발한 피부와 점막을 건강하게 유지하는데 중요해요.',
            '눈에서 빛을 흡수하는 세포를 만드는데 필요해요.',
        ],
        subName: [
            '레티노이드',
            '레티놀',
            '레티닐팔미테이트',
            '레티닐아세테이트',
            '베타카로틴',
            '알파카로틴',
            '감마카로틴',
        ],
        intake: {
            min: 210,
            max: 300,
            detail: '~~',
        },
        sideEffect: ['장기간 고용량 복용시 흡연자 폐암 위험 증가', '과다 복용시 기형 위험 증가'],
        effect: {
            lack: '피부와 눈이 쉽게 건조해질 수 있어요. 어두운 곳에서 앞이 잘 보이지 않을 수 있어요.',
            over: '피부가 건조해지거나 염증이 생기고 탈모가 나타날 수 있어요. 구토와 복통, 두통이 생기기도 해요. 지방간 같은 간 손상이 나타날 수도 있어요. 특히 임신중이라면 태아의 기형을 유발할 수 있으니 반드시 주의하세요.',
        },
    };

    const result = {};

    $(SECTION_SELECTOR)
        .children()
        .each((i, e) => {
            const attrType = [];
            $('> div', e).each((id, { attribs, type }) => {
                attrType.push(attribs?.class);
            });

            const rowType = getRowType(attrType.join(' '));

            if (rowType === false) return;

            if (rowType === 'name') {
                const name = $('> div.title-wrap > span.title', e).text();
                const desc = $('> div.txt1', e)
                    .text()
                    .trim()
                    .replace(/(\r?)\n/g, '')
                    .split('·')
                    .filter(e => e)
                    .map(e => e.trim());

                result[rowType] = name;
                result['description'] = desc;
            }

            if (rowType === 'subName') {
                const subName = [];

                $('> div.tag-wrap', e)
                    .children('div.tag')
                    .each((i, sub) => {
                        subName.push($(sub).text());
                    });

                result[rowType] = subName;
            }

            if (rowType === 'intake') {
                const intake = {
                    min: '',
                    max: '',
                    detail: '',
                };

                const min = $('#lab-min > span.txt').text();
                const max = $('#lab-max > span.txt').text();
                const detail = [$('> div.txt2', e).text(), $('> div.txt3', e).text()];

                intake['min'] = min;
                intake['max'] = max;
                intake['detail'] = detail;

                result[rowType] = intake;
            }

            if (rowType === 'sideEffect') {
                const sideEffect = [];

                $('> div.caution-wrap > div.caution', e).each((i, caution) => {
                    sideEffect.push($(caution).text().trim());
                });

                result[rowType] = sideEffect;
            }

            if (rowType === 'effect') {
                const effect = {
                    lack: '',
                    over: '',
                };

                const over = $('> div.effect-info-wrap > div:nth-child(1) > div.content', e).text();
                const lack = $('> div.effect-info-wrap > div:nth-child(2) > div.content', e).text();

                effect['lack'] = lack;
                effect['over'] = over;

                result[rowType] = effect;
            }
        });

    return result;
};

const getMatchedNutritionData = () => {
    const targetDB = browseJSON('./data/beeHealer/DB/nutDB.json');
    const newList = browseJSON('./data/pillyze/nutrition/nutList.json');

    const matched = [];
    const missed = [];
    const missed_plz = [];

    newList.forEach(e => {
        const { name, idx } = e;
        const isMatched = targetDB.some(e => e.name === name);

        if (name == null) return;

        if (isMatched) matched.push(e);
        else missed.push(e);
    });

    newList.forEach(({ name }) => {
        const isMatched = matched.some(e => e.name === name);

        if (!isMatched) missed_plz.push(name);
    });

    console.log({
        matched: matched.length,
        missed: missed.length,
        missed_plz: missed_plz.length,
    });

    saveListAsJSON('./matched.json', matched);
    saveListAsJSON('./missed.json', missed);
    saveListAsJSON('./missed_plz.json', missed_plz);
};

(async () => {
    getMatchedNutritionData();

    return;

    const totalPillyze = browseJSON('./data/pillyze/product/totalProductList.json');
    const newList = browseJSON('./data/pillyze/nutrition/nutList.json');

    const nutSet = new Set();
    const matched = [];
    const missed = [];

    totalPillyze.forEach(nut => {
        const { nutritions } = nut;

        nutritions.forEach(data => {
            const { nutName } = data;
            nutSet.add(nutName);
        });
    });

    console.log({ size: nutSet.size });

    const nutSet_r = [];
    nutSet.forEach(e => nutSet_r.push(e));

    newList.forEach(e => {
        const { name } = e;
        if (!name) return;

        const isMatched = nutSet_r.some(e => e === name);

        if (isMatched) matched.push(name);
        else missed.push(name);
    });

    console.log({
        matched: matched.length,
        missed: missed.length,
    });

    saveListAsJSON('./matched_r.json', matched);
    saveListAsJSON('./missed_r.json', missed);
})();
