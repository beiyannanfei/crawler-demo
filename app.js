/**
 * Created by wyq on 17/5/31.
 */
"use strict";
const superagent = require("superagent");
const cheerio = require("cheerio");
const url = require("url");

const targetUrl = "https://cnodejs.org/";

superagent.get(targetUrl)
	.end((err, res) => {
		if (!!err) {
			return console.log("err: %j", err.message || err);
		}
		// console.log(res.text);
		parseHtml(res.text);
	});


function parseHtml(text) {
	let $ = cheerio.load(text);
	let topicUrls = [];
	$("#topic_list .topic_title").each((idx, element) => {
		// console.log(element);
		let $element = $(element);
		// console.log($element.attr("href"));
		let href = url.resolve(targetUrl, $element.attr("href"));
		console.log(href);
		topicUrls.push(href);
	});
}
