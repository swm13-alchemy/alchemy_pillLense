const { useAxios } = require('../../hook');
const fs = require('fs');
const fakeUa = require('fake-useragent');

const CATRGORY_URL = 'https://aimee.kr/resources/functions/autocomplete.php';
const PRODUCT_URL = 'https://energybalanceaimee.kr/api/product_info/';

const getPillDataByCategory = async searchWord => {
    const fetchURL = CATRGORY_URL;

    const { responseData } = await useAxios({
        url: fetchURL,
        data: {
            search_text: searchWord,
            $path_type: '비교하기',
        },
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data', 'User-Agent': fakeUa() },
    });

    return responseData;
};

function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
}

const getResult = async (start, end) => {
    const categories = JSON.parse(fs.readFileSync('./categories.json', 'utf8'));
    let result = [];

    for (let i = start; i < end; ++i) {
        const keyword = categories[i];

        const res = await getPillDataByCategory(keyword);

        result.push({ key: keyword, data: res });
    }

    fs.writeFileSync(`./data/searchResult_${start}-${end}.json`, JSON.stringify(result), 'utf8');
};

const getAllSearchResult = async () => {
    const categories = JSON.parse(fs.readFileSync('./categories.json', 'utf8'));
    for (let i = 0; i < categories.length; i += 100) {
        await getResult(i, i + 100);

        console.log(`${i + 1} - ${i + 101} complete`);
        sleep(10000);
    }
};

const getProductInfo = async idx => {
    const fetchURL = PRODUCT_URL + `${idx}`;

    const { responseData } = await useAxios({
        url: fetchURL,
        headers: { 'Content-Type': 'multipart/form-data', 'User-Agent': fakeUa() },
    });

    return responseData;
};

function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
} // 함수정의

const getAllProductInfo = async () => {
    const pillList = JSON.parse(fs.readFileSync('./data/aimee/pillList.json', 'utf8'))['plusName'];

    const real_pill = pillList.filter(e => e['name']);

    real_pill.sort((a, b) => a.idx - b.idx);

    const result1 = [];
    const result2 = [];
    const result3 = [];
    try {
        while (real_pill.length) {
            const proms = [];
            const target = real_pill.splice(0, 100);

            target.forEach(e => {
                const { idx } = e;
                proms.push(getProductInfo(idx));
            });

            const res = await Promise.all(proms);
            if (real_pill.length < 30000 && real_pill.length >= 20000) result1.push(...res);
            if (real_pill.length < 20000 && real_pill.length >= 10000) result2.push(...res);
            if (real_pill.length < 10000) result3.push(...res);

            console.log(
                `100개 처리 완료. ${result1.length + result2.length + result3.length}개 저장됨.  ${
                    real_pill.length
                }개 남음`
            );
            await sleep(5);
        }
    } catch (e) {
        console.log(`오류로 중단됨. ${result.length}개 저장됨.  ${real_pill.length}개 남음`);
        fs.writeFileSync('./test1.json', JSON.stringify(result1), 'utf8');
        fs.writeFileSync('./test2.json', JSON.stringify(result2), 'utf8');
        fs.writeFileSync('./test3.json', JSON.stringify(result3), 'utf8');
    }

    fs.writeFileSync('./test1.json', JSON.stringify(result1), 'utf8');
    fs.writeFileSync('./test2.json', JSON.stringify(result2), 'utf8');
    fs.writeFileSync('./test3.json', JSON.stringify(result3), 'utf8');
};

module.exports = {
    getPillDataByCategory,
    getProductInfo,
};
