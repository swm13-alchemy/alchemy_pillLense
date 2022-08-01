const { useAxios } = require("../../hook");
const fakeUa = require("fake-useragent");
const categories = JSON.parse(fs.readFileSync("./categories.json", "utf8"));

const getPillDataByCategory = async (searchWord) => {
	const fetchURL = "https://aimee.kr/resources/functions/autocomplete.php";

	const { responseData } = await useAxios({
		url: fetchURL,
		data: {
			search_text: searchWord,
			$path_type: "비교하기",
		},
		method: "POST",
		headers: { "Content-Type": "multipart/form-data", "User-Agent": fakeUa() },
	});

	return responseData;
};

function sleep(ms) {
	const wakeUpTime = Date.now() + ms;
	while (Date.now() < wakeUpTime) {}
}

const getResult = async (start, end) => {
	let result = [];

	for (let i = start; i < end; ++i) {
		const keyword = categories[i];

		const res = await getPillDataByCategory(keyword);

		result.push({ key: keyword, data: res });
	}

	fs.writeFileSync(`./data/searchResult_${start}-${end}.json`, JSON.stringify(result), "utf8");
};

const getAllSearchResult = async () => {
	for (let i = 0; i < categories.length; i += 100) {
		await getResult(i, i + 100);

		console.log(`${i + 1} - ${i + 101} complete`);
		sleep(10000);
	}
};

module.exports = {
	getPillDataByCategory,
};
