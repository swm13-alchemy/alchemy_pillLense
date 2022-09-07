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
    const $ = await cheerio.load(rawHTML);;

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

/*
 * @params idx
 * 특정 영양제 Idx값을 가지고, HTML값을 받아주는 함수
 */
const getHTMLByIdx = async idx => {
    const fetchURL = `https://www.pillyze.com/products/${idx}/${generateRandomString(10)}`;

    const { rawResult, responseData: searchData } = await useAxios({ url: fetchURL, method: 'get' });

    return searchData;
};

/*
 * 필라이즈 전체 데이터 긁어오는 함수
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
                    console.log(`${i} 까지 작업 완료. sleep... (${sec})`);

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

module.exports = {
    getPillData,
    getPillDataFromHTML,
};
