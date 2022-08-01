const { useAxios } = require("../../hook");

const getPillData = async (idx) => {
	const url = `https://www.vimeal.co.kr:8443/api/v1/product/detail/${idx}`;

	const headers = {
		Authorization:
			"Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2MXYxTGVZSlZ2Iiwicm9sZXMiOlsiR1VFU1QiXSwiaWF0IjoxNjU4MTE1NDcwLCJleHAiOjE2NTg3MjAyNzB9.l9eqQGLxd_UKXUNZgvshe7iwF0_Uk_n1V3Wg7qr1boo",
	};

	const { rawResult, responseData } = await useAxios({ url, headers });

	if (!responseData || responseData["message"] != "성공하였습니다.") return {};

	return responseData["data"];
};

module.exports = {
	getPillData,
};
