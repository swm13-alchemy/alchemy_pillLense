const axios = require("axios");

const useAxios = async (props = { url: "", data: {}, headers: {}, method: "get", params: {} }) => {
	const { url: fetchURL = "", data: formData = {}, headers = {}, method: _method = "get", params = {} } = props;

	const _headers = headers ?? {
		Accept: "*/*",
		"Content-Type": "multipart/form-data",
		"user-agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.66 Safari/537.36",
		"x-requested-with": "XMLHttpRequest",
	};

	const config = {
		url: fetchURL,
		method: _method,
		data: formData,
		headers: _headers,
		params: params,
	};

	let rawResult;

	try {
		rawResult = await axios(config);
		const responseData = rawResult.data;

		return { rawResult, responseData };
	} catch (e) {
		console.error(e);
		return {};
	}
};

module.exports = {
	useAxios,
};
