const cheerio = require('cheerio');
const { useAxios } = require('../../hook');
const { generateRandomString } = require('../../functions');

// const MAX_PILL_COUNT = 16534;

const getFunctions = $ => {
    const totalFunctions = [];

    for (let t = 1; t <= 2; ++t) {
        const functionSelector = `body > div > div.all-wrap-in.all-wrap-in-020-002 > div.new-wide-wrap.new-wide-wrap-020 > div.new-wide-main.new-wide-main-020-002 > div.section.section3-2 > div > div:nth-child(${
            2 * t
        })`;

        const functions = $(functionSelector).children();

        const functionObj = { type: t == 1 ? 'main' : 'sub', contents: [] };

        for (let i = 0; i < functions['length']; i++) {
            const e = functions[`${i}`];

            functionObj.contents.push(e.children[0]['data']);
        }

        totalFunctions.push(functionObj);
    }

    return totalFunctions;
};

const getNutritions = $ => {
    const nutritions = [];
    $('#nutrientCardDiv > div.info-cards > div').each((i, item) => {
        const oneNut = {
            nutName: '',
            nutAmount: '',
        };

        const key = ['nutName', 'nutAmount', '_'];

        $('span', item).each((idx, e) => {
            if (idx >= 2) return;

            oneNut[key[idx]] = $(e).text();
        });

        nutritions.push(oneNut);
    });

    return nutritions;
};

const getMetaData = $ => {
    const profileBaseSelector =
        'body > div > div.all-wrap-in.all-wrap-in-020-002 > div.new-wide-wrap.new-wide-wrap-020 > div.new-wide-main.new-wide-main-020-002 > div.section.section3-1.section3-1-002';

    const repImgSelector = `${profileBaseSelector} > div > img`;
    const makerSelector = `${profileBaseSelector} > div > div > a > span`;
    const titleSelector = `${profileBaseSelector} > div > div > h1`;

    const repImg = $(repImgSelector).attr()?.src ?? '';
    const maker = $(makerSelector).text();
    const title = $(titleSelector).text();

    const eatingBaseSelector =
        'body > div > div.all-wrap-in.all-wrap-in-020-002 > div.new-wide-wrap.new-wide-wrap-020 > div.new-wide-main.new-wide-main-020-002 > div.section.section3-3';

    const eatingTimingSelector = `${eatingBaseSelector} > div.card-wrap.intake > div > span.txt1`;
    const eatingCountSelector = `${eatingBaseSelector} > div.card-wrap.intake > div > span.txt2`;
    const eatingTipSelector = `${eatingBaseSelector} > div.card-wrap.card-wrap2 > span`;

    const eatingTiming = $(eatingTimingSelector).text();
    const eatingCount = $(eatingCountSelector).text();
    const eatingTip = $(eatingTipSelector).text();

    return { repImg, maker, title, eatingTiming, eatingCount, eatingTip };
};

const getPillData = async idx => {
    const fetchURL = `https://www.pillyze.com/products/${idx}/${generateRandomString(10)}`;

    const { rawResult, responseData: searchData } = await useAxios({ url: fetchURL, method: 'get' });

    const rawHtml = rawResult['data'];
    const $ = await cheerio.load(rawHtml);

    const meta = getMetaData($);
    const func = getFunctions($);
    const nuts = getNutritions($);

    return {
        link: fetchURL,
        ...meta,
        functions: func,
        nutritions: nuts,
    };
};

const getPillDataFromHTML = async rawHTML => {
    const $ = await cheerio.load(rawHTML);

    const meta = getMetaData($);
    const func = getFunctions($);
    const nuts = getNutritions($);

    return {
        ...meta,
        functions: func,
        nutritions: nuts,
    };
};

// const MAX_NUTRITION_COUNT = 1129;
// const MAX_PRODUCT_COUNT = 16534;

/**
 * @param {integer} idx - ????????? Idx
 *
 * ?????? ????????? Idx?????? ?????????, HTML?????? ???????????? ??????
 */
const getHTMLByIdx = async idx => {
    const fetchURL = `https://www.pillyze.com/products/${idx}/${generateRandomString(10)}`;

    const { rawResult, responseData: searchData } = await useAxios({ url: fetchURL, method: 'get' });

    return searchData;
};

/**
 * ???????????? ?????? ????????? ???????????? ??????
 */
const crawlAllData = async () => {
    let result = [];
    let start = 1001;
    let end = start + 499;
    let prom;

    while (start < MAX_PRODUCT_COUNT) {
        try {
            result = [];

            for (let i = start; i <= end; ++i) {
                const sec = Math.floor(Math.random() * 10);
                result.push(getHTMLByIdx(i));

                if (!(i % 50)) {
                    console.log(`${i} ?????? ?????? ??????. sleep... (${sec})`);

                    await new Promise(resolve => setTimeout(resolve, 1000 * sec + 5));
                }
            }

            prom = await Promise.all(result);
        } finally {
            fs.writeFileSync(`./output/pillyze/products/${start}_${end}.json`, JSON.stringify(prom), 'utf8');

            start += 500;
            end += 500;
        }
    }
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

        // Maker ??????
        makerSet.add(maker.trim());

        // Meta-data ??????
        eatingTimingSet.add(eatingTiming.trim());
        eatingCountSet.add(eatingCount.trim());

        // Function ??????
        functions.forEach(row => {
            const isMain = row['type'] === 'main';
            const targetSet = isMain ? mainFuncSet : subFuncSet;

            const contents = row['contents'];

            contents.forEach(cnts => targetSet.add(cnts.trim()));
        });

        // Nutrition ??????
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
            console.log(`${i + 1} ?????? ?????? :: ${j + 1} / ${rawList.length}`);
        }

        console.log(`${i + 1} / ${startIdx + 4}`);
    }

    saveListAsJSON(`./data/pillyze/product/${fileName}`, result);
    saveListAsJSON(`./errorList_${fileName}.json`, errList);
};

const MAX_NUTRITION_COUNT = 1129;

const crawlNutData = async () => {
    const result = [];

    const browser = await puppeteer.launch({
        headless: false,
    });

    const newPage = await browser.newPage();

    for (let i = 501; i <= MAX_NUTRITION_COUNT; ++i) {
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
        name: '?????????A',
        description: [
            ' ?????? ????????? ???????????? ???????????? ?????????, ????????? ????????? ????????? ????????? ????????? ????????? ???????????? ??????????????? ????????????.',
            '????????? ?????? ???????????? ????????? ???????????? ????????????.',
        ],
        subName: [
            '???????????????',
            '?????????',
            '????????????????????????',
            '????????????????????????',
            '???????????????',
            '???????????????',
            '???????????????',
        ],
        intake: {
            min: 210,
            max: 300,
            detail: '~~',
        },
        sideEffect: ['????????? ????????? ????????? ????????? ?????? ?????? ??????', '?????? ????????? ?????? ?????? ??????'],
        effect: {
            lack: '????????? ?????? ?????? ???????????? ??? ?????????. ????????? ????????? ?????? ??? ????????? ?????? ??? ?????????.',
            over: '????????? ?????????????????? ????????? ????????? ????????? ????????? ??? ?????????. ????????? ??????, ????????? ???????????? ??????. ????????? ?????? ??? ????????? ????????? ?????? ?????????. ?????? ?????????????????? ????????? ????????? ????????? ??? ????????? ????????? ???????????????.',
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
                    .split('??')
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

const getAllRefineNutData = async list => {
    const returnList = [];

    for (let i = 0; i < list.length; ++i) {
        const $ = await cheerio.load(list[i]);

        const temp = refineNutDataFromRawHTML($);

        returnList.push(temp);
    }

    return returnList;
};

module.exports = {
    getPillData,
    getPillDataFromHTML,
};
