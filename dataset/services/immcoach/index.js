const fs = require('fs');
const { useAxios } = require('../../hook');

const getAllSearchResult = async () => {
    const totalResult = [];
    const url = 'https://www.immcoach.com/imm-search';

    for (let i = 1; i <= 490; ++i) {
        const params = { sf_paged: i };

        console.log(`now ${i}`);

        const { responseData } = await useAxios({ url, params });

        totalResult.push(responseData);
    }

    return totalResult;
};

module.exports = {
    getAllSearchResult,
};
