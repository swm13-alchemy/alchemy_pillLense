const fs = require("fs");
const cheerio = require("cheerio");

// 1. 모든 Href 정보 수집
const getRefinedSearchResult = async () => {
	let page = 0;
	const raw = JSON.parse(fs.readFileSync("./data/coupang/pageData.json", "utf8"));

	const result = [];
	for (; page < 9; ++page) {
		const $ = await cheerio.load(raw[page]);

		const listSelector = `#productList`;

		const list = $(listSelector).children();

		list.each((i, e) => {
			const attr = $("a", e).attr();
			const name = $("a > dl > dd > div:nth-child(2)", e).text().trim();
			const img = $("a > dl > dt > img", e).attr();

			const data = {
				href: `https://coupang.com${attr["href"]}`,
				productId: attr["data-product-id"],
				itemId: attr["data-item-id"],
				imgSrc: `https:${img["src"]}`,
				name,
			};

			result.push(data);
		});
	}

	fs.writeFileSync("./data/coupang/refinedResult.json", JSON.stringify(result), "utf8");
};

// 2. HTML 파일 긁어오기
const getAllHtml = async (start) => {
	const browser = await puppeteer.launch({
		// headless: false,
	});
	await browser.userAgent(fakeUA());

	const page = await browser.newPage();

	const list = JSON.parse(fs.readFileSync(`./data/coupang/refinedResult.json`, "utf8"));

	let result = [];

	for (let now = start; now < list.length; ++now) {
		const { href, name: title, id, imgSrc } = list[now];

		await page.goto(href);

		await page.waitForTimeout(3000);
		console.log(`${now + 1} 번째 작업 진행중`);

		const html = await page.content();

		const obj = {
			html,
			title,
			id,
			imgSrc,
		};

		result.push(obj);

		if (parseInt((now + 1) % MAX_JSON_DATA_LENGTH) === 0) {
			fs.writeFileSync(
				`./output/coupang/coupang_detail_${parseInt((now + 1) / MAX_JSON_DATA_LENGTH)}.json`,
				JSON.stringify(result),
				"utf8"
			);

			result = [];
			console.log(`${now + 1} 번째 작업 처리 후 Flush됨`);
		}
	}

	if (result.length) {
		fs.writeFileSync(`./output/coupang/coupang_detail_last.json`, JSON.stringify(result), "utf8");
		console.log(`마지막 작업 처리 후 Flush됨`);

		result = [];
	}

	await browser.close();
};

// 3. HTML Parsing
const refineDetailData = async (f_idx) => {
	const htmlList = JSON.parse(fs.readFileSync(`./data/coupang/pageData.json`, "utf8"));

	const result = [];
	for (let now = 0; now < htmlList.length; ++now) {
		const $ = await cheerio.load(htmlList[now]["html"]);

		const makerSel =
			"#contents > div.prod-atf > div > div.prod-buy.new-oos-style.not-loyalty-member.eligible-address.without-subscribe-buy-type.DISPLAY_0 > a";

		const maker = $(makerSel).text();

		const titleSel =
			"#contents > div.prod-atf > div > div.prod-buy.new-oos-style.not-loyalty-member.eligible-address.without-subscribe-buy-type.DISPLAY_0 > div.prod-buy-header > h2";

		const title = $(titleSel).text();

		const repImgSel = "#repImageContainer > div.prod-image__items";

		const repImg = [];

		$(repImgSel)
			.children()
			.each((i, e) => {
				const content = $("img", e)
					.attr()
					["data-src"].split("/")
					.map((e) => (e == "48x48ex" ? "492x492ex" : e))
					.filter((e) => e);

				repImg.push(`https://${content.join("/")}`);
			});

		const tableSel = "#itemBrief > div > table > tbody";
		const table = $(tableSel).children();

		const tableResult = [];
		table.each((i, tableRow) => {
			$(tableRow).each((i, tableData) => {
				const th = [];
				const td = [];

				$(tableData)
					.children("th")
					.each((idx, el) => {
						th.push($(el).text());
					});
				$(tableData)
					.children("td")
					.each((idx, el) => {
						td.push($(el).text());
					});

				tableResult.push(
					th.map((item, idx) => {
						return { [item]: td[idx] };
					})
				);
			});
		});

		const imgSel = "#productDetail > div.product-detail-content-inside > div > div.type-IMAGE_NO_SPACE";
		const imgAttr = [];

		$(imgSel)
			.children()
			.each((i, e) => {
				imgAttr.push(`https:${$(e).children("img").attr()["src"]}`);
			});

		const obj = {
			maker,
			title,
			repImg,
			tableResult,
			imgAttr,
			id: htmlList[now]["id"],
			imgSrc: htmlList[now]["imgSrc"],
		};

		result.push(obj);
		console.log(`${now + 1} 번째 작업 끝 `);
	}

	fs.writeFileSync(`./output/coupang/refined/refined_${f_idx}.json`, JSON.stringify(result), "utf8");
};
