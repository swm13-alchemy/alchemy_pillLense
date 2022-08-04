const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { useAxios } = require('./hook');
const fakeUA = require('fake-useragent');
const cheerio = require('cheerio');
const url = require('url');
const { getPillData } = require('./services/vimeal');
const { getAllSearchResult } = require('./services/immcoach');
const { getProductInfo } = require('./services/aimee');
puppeteer.use(StealthPlugin());
// console.clear();

(async () => {})();
