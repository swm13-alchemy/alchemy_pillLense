const cheerio = require('cheerio');
const { useAxios } = require('../../hook');
const { generateRandomString } = require('../../functions');

// const MAX_PILL_COUNT = 16534;

const getFunctions = $ => {
    const totalFunctions = [];

    for (let t = 1; t <= 2; ++t) {
        const functionSelector = `body > div > div.all-wrap-in.all-wrap-in-product > div > div.section.section3-2 > div > div:nth-child(${
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
            if (idx == 2) return;

            oneNut[key[idx]] = $(e).text();
        });

        nutritions.push(oneNut);
    });

    return nutritions;
};

const getMetaData = $ => {
    const makerSelector =
        'body > div > div.all-wrap-in.all-wrap-in-product > div > div.section.section3-1 > div > div > a > span';
    const titleSelector =
        'body > div > div.all-wrap-in.all-wrap-in-product > div > div.section.section3-1 > div > div > h1';

    const maker = $(makerSelector).text();
    const title = $(titleSelector).text();

    const eatingTimingSelector =
        'body > div > div.all-wrap-in.all-wrap-in-product > div > div.section.section3-3 > div.card-wrap.intake > div > span.txt1';
    const eatingCountSelector =
        'body > div > div.all-wrap-in.all-wrap-in-product > div > div.section.section3-3 > div.card-wrap.intake > div > span.txt2';
    const eatingTipSelector = `body > div > div.all-wrap-in.all-wrap-in-product > div > div.section.section3-3 > div.card-wrap.card-wrap2 > span`;

    const eatingTiming = $(eatingTimingSelector).text();
    const eatingCount = $(eatingCountSelector).text();
    const eatingTip = $(eatingTipSelector).text();

    return { maker, title, eatingTiming, eatingCount, eatingTip };
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

module.exports = {
    getPillData,
};
