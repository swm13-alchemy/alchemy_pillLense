const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { useAxios } = require('./hook');
const fakeUA = require('fake-useragent');
const cheerio = require('cheerio');
const url = require('url');
const readline = require('readline');

const { browseJSON, saveListAsJSON, generateRandomString } = require('./functions');
const { getPillData } = require('./services/pillyze');
puppeteer.use(StealthPlugin());
// console.clear();

const fn = () => {
    /**
     * @type []
     */
    const nutListPillyze = browseJSON('./data/pillyze/nutrition/nutList(final).json');

    /**
     * @type []
     */
    const nutListAimee = browseJSON('./data/aimee/nutList.json');

    /**
     * @type []
     */
    const productPillyze = browseJSON('./data/beeHealer/nutritionList.json');

    const matched = [];
    const matchedData = [];
    const unMatched = [];

    nutListPillyze.forEach(e => {
        if (productPillyze.includes(e.name)) {
            matched.push(e.name);
            matchedData.push(e);
        } else unMatched.push(e.name);
    });

    const includesAimee = [];

    matched.forEach(e => {
        if (
            nutListAimee.find(
                item => item['mainNutrientNm'] === e || item['formalNutrientNm'] === e || item['functionNm'] === e
            )
        )
            includesAimee.push(e);
    });

    saveListAsJSON('./matchedAimee.json', includesAimee);
    saveListAsJSON('./matched.json', matchedData);
    saveListAsJSON('./unused.json', unMatched);

    console.log({ used: matched.length, unused: unMatched.length, matchedAimee: includesAimee.length });
};

const fn1 = () => {
    const vst = new Set();

    const matched = browseJSON('./matched.json');

    const uniq = [];
    const doub = [];

    matched.forEach(e => {
        if (vst.has(e.name)) return;

        const count = matched.filter(it => it.name === e.name);

        if (count.length > 1) doub.push({ name: e.name, count: count.length });

        uniq.push(e);

        vst.add(e.name);
    });

    saveListAsJSON('./doub.json', doub);
    saveListAsJSON('./uniq.json', uniq);
};

const fn3 = () => {
    const _new = browseJSON('./result.json');

    const _al = _new.slice(0, 72);
    const _no = _new.slice(72);

    const _ret = _no.map((e, i) => {
        return {
            ...e,
            idx: 300 + i + 1,
        };
    });

    const result = [..._al, ..._ret];

    saveListAsJSON('./result2.json', result);
};

const fn4 = () => {
    const _nutrient = browseJSON('./done.json');

    const db_nutrient = [];
    const db_intake = [];

    _nutrient.forEach((e, i) => {
        const { name, intake, effect, subName, idx } = e;

        db_nutrient.push({
            id: parseInt(idx),
            name: name,
            tips: intake?.detail ?? [],
            unit: '',
            sub_names: subName ?? [],
            lack_info: effect?.lack ?? '',
            over_info: effect?.over ?? '',
        });

        // db_intake.push({
        //     id: i + 1,
        //     nutrient_id: parseInt(idx),
        //     min_age: 0,
        //     max_age: 0,
        //     is_male: 0,
        //     req_min: intake?.min ?? 0,
        //     req_max: intake?.max ?? 0,
        //     req_avg: 0,
        // });
    });

    saveListAsJSON('./db_nutrient.json', db_nutrient);
    // saveListAsJSON('./db_intake.json', db_intake);
};

/**
 * Topic이랑 Nutrition 관련 Table에 맞추어 데이터를 가공하는 코드
 */
const dbMaker_nutrition = () => {
    const topics = browseJSON('./data/beeHealer/topic_new.json');
    const nutrient = browseJSON('./data/beeHealer/DB/db_nutrient_new.json');

    const db_topics = [];
    const db_funcs = [];
    const db_nut_eff = [];

    topics.forEach((tp, idx) => {
        const { topicName, functions, related } = tp;

        const tp_id = idx + 1;

        db_topics.push({
            id: tp_id,
            name: topicName,
        });

        if (!functions) {
            // topic이 곧 효능
            const fn_id = db_funcs.length + 1;

            db_funcs.push({
                id: fn_id,
                name: topicName,
                topic_id: tp_id,
            });

            related.forEach(nut => {
                const nutr_id = nutrient.find(e => e.name === nut).id;
                const db_nut_eff_id = db_nut_eff.length + 1;

                db_nut_eff.push({
                    id: db_nut_eff_id,
                    nutrient_id: nutr_id,
                    efficacy_id: fn_id,
                });
            });
        } else {
            // functions 들이 효능

            functions.forEach(fnc => {
                const fn_name = fnc.funcName;
                const fn_id = db_funcs.length + 1;

                db_funcs.push({
                    id: fn_id,
                    name: fn_name,
                    topic_id: tp_id,
                });

                fnc.related.forEach(nut => {
                    const nutr_id = nutrient.find(e => e.name === nut).id;
                    const db_nut_eff_id = db_nut_eff.length + 1;

                    db_nut_eff.push({
                        id: db_nut_eff_id,
                        nutrient_id: nutr_id,
                        efficacy_id: fn_id,
                    });
                });
            });
        }
    });

    saveListAsJSON('./db_topics.json', db_topics);
    saveListAsJSON('./db_funcs.json', db_funcs);
    saveListAsJSON('./db_nut_eff.json', db_nut_eff);
};

const maker_extractor = () => {
    const totalPillList = browseJSON('./data/pillyze/product/totalProductList.json');

    const db_pill = [];
    const db_ingredient = [];

    const maker = [
        {
            makerName: '제조사명 없음',
            pillName: ['', '', '', '', '', ''],
        },
    ];

    totalPillList.forEach(pill => {
        let isFound = maker.findIndex(e => e?.makerName === pill.maker);

        if (pill.maker === '') isFound = 0;

        if (isFound !== -1) maker[isFound].pillName.push(pill.title);
        else maker.push({ makerName: pill.maker, pillName: [pill.title] });
    });

    saveListAsJSON('./maker.json', maker);
};

const assignPillID = () => {
    const makers = browseJSON('./db_maker.json').slice(1);

    const totalPillList = browseJSON('./data/beeHealer/DB/product/db_pilldata_raw.json');

    const result = [];

    makers.forEach((el, row_idx) => {
        const { pillName, makerName } = el;

        const maker_id = `${row_idx + 1}`.padStart(4, '0');

        pillName.forEach((pill, p_id) => {
            const pill_id = `${p_id + 1}`.padStart(4, '0');

            result.push({
                id: `1${maker_id}${pill_id}`,
                name: pill,
                maker: makerName,
            });
        });
    });

    saveListAsJSON('./db_pill.json', result);
};

const makepillData = () => {
    const pills = browseJSON('./db_pill.json');

    const totalPillList = browseJSON('./data/beeHealer/DB/product/db_pilldata_raw.json');
    const nutDB = browseJSON('./data/beeHealer/DB/new/db_nutrient_new.json');

    const new_pill = [];
    const ingDB = [];
    const err = [];

    pills.forEach((pill, i) => {
        const { id, name, maker } = pill;

        const pillData = totalPillList.find(e => e.title === name);

        new_pill.push({
            id: id,
            name: name,
            information: pillData?.eatingTip ?? '',
            maker: maker,
            daily_dose: pillData?.eatingCount ?? '',
            intake_timing: pillData?.eatingTiming ?? '',
            serving_size: null,
            capsules: null,
        });

        const { nutritions } = pillData;

        nutritions.forEach(ing => {
            const { nutName: _name, nutAmount: _amnt } = ing;

            const ingData = nutDB.find(e => e.name === _name);

            const nutrient_id = ingData ? ingData.id : null;

            const matchValue = str => str.match(/\d*(\.?\d*)/g).filter(e => e)[0];

            const content = matchValue(_amnt);
            const unit = _amnt.replace(content, '');

            ingDB.push({
                pill_id: id,
                nutrient_id: nutrient_id,
                content: content,
                unit: unit,
            });
        });
    });

    // saveListAsJSON('./db_pill_extra.json', new_pill);
    saveListAsJSON('./ingDB.json', ingDB);
    // saveListAsJSON('./err.json', err);

    // totalPillList.forEach((pill, idx) => {
    //     const {
    //         title: name,
    //         maker,
    //         eatingTiming: intake_timing,
    //         eatingCount: daily_dose,
    //         eatingTip: information,
    //         nutritions
    //     } = pill;
    //     const pill_id = idx + 1;
    //     db_pill.push({
    //     })
    // });
};

(async () => {
    makepillData();
})();
