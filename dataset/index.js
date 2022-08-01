const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { useAxios } = require("./hook");
const fakeUA = require("fake-useragent");
const cheerio = require("cheerio");
const url = require("url");
const { getPillData } = require("./services/vimeal");
const { getAllSearchResult } = require("./services/immcoach");
puppeteer.use(StealthPlugin());
console.clear();

const getReviewHtml = async (productId, page) => {
	const url = "https://www.coupang.com/vp/product/reviews/attachment/images";

	const params = {
		productId,
		page,
		viRoleCode: 3,
		size: 300,
	};

	const headers = {
		accept: "*/*",
		"accept-language": "ko-KR,ko;q=0.9",
		"sec-fetch-dest": "empty",
		"sec-fetch-mode": "cors",
		"sec-fetch-site": "same-origin",
		"sec-gpc": "1",
		"x-requested-with": "",
		cookie: "sid=0fb25153df8f463fa4e31ba991c1330b10ef32ad; PCID=24808129754131946590222; MARKETID=24808129754131946590222; x-coupang-accept-language=ko_KR; X-CP-PT-locale=ko_KR; x-coupang-origin-region=KOREA; bm_sz=C8CCC1177C0F40A4F68BFEFBFD7CF2C9~YAAQzZc7F9YttfyBAQAA2h8HABBwApAGgMl+ooUPovCy20kzrmvoAORq0+7NZkn2kejR12boKfTkyA6jiXFybi3GAwjjSrhmF8lFeKQrVXDnYWzXNY54WX4Tk44WDj8YHC8Dy3VItdpX2WDq27M3Nc7i0PX2gkR1/+V73MIXUcak/ug7mp6zBygKHOqI48z1zRwo4VrIka20vTMJKuSDXgnxgIemdyqc9aRSYe2Nyl+fQSDGRCstkulBtot0kWQmBGc8zJ6l85ie9klgUtNJvNkO5ivpzJEvLl+qlPxWrb8pTHS8~4408645~3617861; _fbp=fb.1.1657857840995.1616477302; _abck=23C85272CC7B8BB7196A53B81C0D4240~0~YAAQzZc7Fzs9tfyBAQAADVAHAAhb4qKiKkSj3+0fY9vWLcla/Z+19s1J6g5U51kcwunX2P5+A0m9mzoNr2r0DcYHdWRpMIktMPgF/4mWHH0D2rELyWfRtjEF4NgkwAwO/Su4G0outwOK+PPnBVyKXhHzqdD+WhGvqVTlDd1g8BywfIke3mull4WKalXUxsgRC7IEtTLxBm5ryfjWCQcP3975V1p4tPz+A+u3UdYu/TGBDLB9KY7cyJzygZQSbux+x+ju6VhQ069ExsbyHmJhZFYkT5PiVFv1qcO2HFykXJmGqPWBgPJsylSzhwv63sxckXOnfm/Uu27AAmsLic1vJ0zhMBaYbCfFNW5u0h7+8fBO5CIt0KIqvUC711U2ZiY52kFUz6sYhc6JU9LzQIraA1wZ77R/dAwbeA==~-1~-1~-1; overrideAbTestGroup=%5B%5D; bm_mi=79F5A4D42BC50A6E853C8A9086278EB2~YAAQvgI1F2j1AviBAQAA0keGABDNjXauuWc5/v+McIuaPLAM2zR7hPf241rtxI4tRMRHdjWFO+FpyHEdQyhdnVrqyg+ylELsqf+M9uelF60BdHCk9XPQaq+Pqmb/83jU02cmDvFtfJkmzY69RY4WKJ79HhWaJ21hE1z3a1iAcvrRQEaDaPdLq2QzXSS3Q14Kugwa+ZJLPLnuUO2B+xJuQKUcN0DNCTTmDKaIvjB83AZBgc22MhCDEl9hx4+XlE2h3MEbRbuJR8o/KHY7Tb+3GFt5mHjpBfM2Lt6GzgLdVzCBVg5tyNpBun2lbtUJtXexOVOoce3sdOTsmi8aIBATqJZvVyyIqfLE1zAc2njKOQLpABcIF+I=~1; baby-isWide=small; ak_bmsc=EF6E5DF74A8B6A5708329DB0B5D98A1A~000000000000000000000000000000~YAAQvgI1FzgNA/iBAQAA+4WGABAj/5qOgW4OSU+Qs9deXCRzxcmAlH4MplT/LYx8tzUp9+5WY1FUnkiTl4zOSJGnv4NxEdvZCsZoGLeP+kQgtT+0eCCcCDctna+s1AzzPtF7StgCo3O0p1pGrfRxQ0oz78M1W950s/ppkuoPFvRr+4+ClEWDuZTJdrLakD7d6slwEtgmjyPjSs5fEBqxPG1lOXpNZlIbWnUQaVj+49Of+LFQE7IcT8EKK6S8EHqfMEmkZIQpAhYiGUH5qctVGPnJAJHWdRqnMDKtoqlpJ1swYnpB3NMOfzZnuxIYlOXdQkU48zAxlFNjBJNTm7bU4aVNxfyPhXIU5lXoMOkTtBBXAxIEa1BL7d2mmBt67gJBG9T/+La3rRl8C7+lnpgCPzQr2C7OFyBMICNiJRvViViblH2injyDyR50Y5cnFTVKOKAZonfi05zGcu1pQ5RqdaXGyPSPP2mDQZX/ntZ+JQMY4zLrrf8tPX0BUMNRl/q2BD1Er+B7D0SPrcKY0JRwOfW4aTpOf66kOyYaW/lngGXg3iWNAaU3GIhj; bm_sv=242DD308FBFD226F61D73A7A55FBDD5F~YAAQvgI1F7gNA/iBAQAAPoeGABBwPkaqyNrRadAI5O/8SPMTAQ3ShFBJYcFjAzZ/1gsH7zygwHy7fDNdSkvaEg3nm5163dSqUiIQkBKxACpoygeodDviu94nUXijz9NeUBpOwm2jHPBShbLGfoH5VYq5aj7Dnk+SJOibmATyPCK44K5iyZNWMUBmIAJjwiFQS/KHpfMkQMqAKpD5PIrhrQFEwHkXFMDYk2osLT8ht7Lo09VFfLW6XoVH0Jdw6lFPxw==~1",
		Referer: `https://www.coupang.com/vp/products/${productId}?itemId=${productId}&vendorItemId=3549112936&sourceType=CATEGORY&categoryId=493019&isAddedCart=`,
		"Referrer-Policy": "strict-origin-when-cross-origin",
	};

	const { responseData } = await useAxios({
		url,
		params,
		headers,
	});

	return responseData;
};

const getReviewImgUrl = async (productId) => {
	const result = [];

	let page = 1;

	while (1) {
		const html = await getReviewHtml(productId, page++); // fs.readFileSync("./result_1.html", "utf8");

		const $ = await cheerio.load(html);

		if ($("div.sdp-review__gallery__section__list__not-category").length) break;

		const elemSelector = "li.sdp-review__gallery__section__list__item";
		$(elemSelector).each((i, e) => {
			const { "data-reviewid": rid, src: rawLink } = $("img", e).attr();
			const { protocol, path, host } = url.parse(rawLink);

			const pathContents = path.split("/");

			const refined_path = pathContents.map((e) => (e === "320" ? "q-1" : e)).join("/");

			result.push(`${protocol}//${host}${refined_path}`);
		});
	}

	console.log(" 끝");

	fs.writeFileSync(`./output/coupang/reviewImg/${productId}.json`, JSON.stringify(result), "utf8");
	// return result;
};

(async () => {
	const temp = JSON.parse(fs.readFileSync("./output/immcoach/result.json", "utf8"));

	console.log(temp[0]);
	fs.writeFileSync("./temp.html", temp[0], "utf8");

	return;
	const list = JSON.parse(fs.readFileSync("./data/coupang/refinedResult.json", "utf8"));

	for (let idx = 162; idx < list.length; ++idx) {
		const { name, productId } = list[idx];

		if (!productId) return;

		process.stdout.write(`${name} (id:${productId}) TASK`);

		const temp = await getReviewImgUrl(productId);
	}
})();
