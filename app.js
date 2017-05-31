/**
 * Created by wyq on 17/5/31.
 */
"use strict";
const superagent = require("superagent");
const cheerio = require("cheerio");
const url = require("url");
const eventproxy = require("eventproxy");

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
		// console.log($element);
		// console.log($element.attr("href"));
		let href = url.resolve(targetUrl, $element.attr("href"));
		// console.log(href);
		topicUrls.push(href);
	});
	// console.log(topicUrls);
	return getTopicContent(topicUrls);
}

function getTopicContent(topicUrls) {
	let ep = new eventproxy();

	ep.after("topic_html", topicUrls.length, topics => {
		topics = topics.map(topicPair => {
			let topicUrl = topicPair[0];
			let topicHtml = topicPair[1];
			let $ = cheerio.load(topicHtml);
			let obj = {
				title: $('.topic_full_title').text().trim(),
				href: topicUrl,
				comment1: $('.reply_content').eq(0).text().trim(),
				comment2: $('.reply_content').eq(1).text().trim()
			};
			if ($('.reply_author').get(0) && $('.reply_author').get(0).attribs && $('.reply_author').get(0).attribs.href) {
				let userHref = url.resolve(targetUrl, $('.reply_author').get(0).attribs.href);
				obj.userHref = userHref;
				let userName = $('.reply_author').get(0).children[0].data;
				obj.userName = userName;
			}
			return (obj);
		});
		console.log("outcome:");
		console.log(topics);
	});

	topicUrls.forEach(topicUrl => {
		superagent.get(topicUrl)
			.end((err, res) => {
				console.log("fetch %j successful", topicUrl);
				ep.emit("topic_html", [topicUrl, res.text]);
			});
	});
}