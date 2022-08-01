const fs = require("fs");
const cheerio = require("cheerio");

const gatherPillDataRange = async (startPage, endPage, fileName) => {
	const url = `https://kr.iherb.com/c/supplements`;

	const totalResult = [];

	let page = startPage;
	try {
		for (; page <= endPage; ++page) {
			const params = {
				sr: 12,
				noi: 24,
				p: page,
			};

			const { rawResult, responseData } = await useAxios({
				url,
				params,
			});

			const $ = await cheerio.load(responseData);

			const tempSelector = "#FilteredProducts > div > div:nth-child(2) > div";

			const temp = [];

			$(tempSelector)
				.children()
				.each((i, e) => {
					const attrbSelector = "div.product-inner.product-inner-wide > div.absolute-link-wrapper > a";
					temp.push($(attrbSelector, e).attr());

					$(
						"div.product-inner.product-inner-wide > div.absolute-link-wrapper > div.product-title > bdi",
						e
					).text();
				});

			console.log(`${page} page complete :: ${temp.length} data added`);

			totalResult.push(...temp);
		}
	} catch (e) {
		console.error(e);
		console.log(`Last page :: ${page}`);
	}

	fs.writeFileSync(fileName, JSON.stringify(totalResult), "utf8");
};

module.exports = {
	gatherPillDataRange,
};
