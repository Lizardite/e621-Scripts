// ==UserScript== 
// @name          e621 AFTagger
// @version       1.1
// @description   e621 quick anthro/feral tagger
// @author        Lizardite

// @namespace     e621
// @run-at        document-end
// @include       http://e621.net/post
// @include       https://e621.net/post
// @include       http://e621.net/post/*
// @include       https://e621.net/post/*
// @match         http://e621.net/post
// @match         https://e621.net/post
// @match         http://e621.net/post/*
// @match         https://e621.net/post/*
// ==/UserScript== 

var h = document.createElement("script");

h.innerHTML = "(" + function() {
	var createSidebarSection = function(title) {
		var div = document.createElement("div");
		div.style.marginBottom = "1em";

		var titleElem = document.createElement("h5");
		titleElem.innerText = title;
		div.appendChild(titleElem);

		document.getElementsByClassName("sidebar")[0].appendChild(div);
		return div;
	}

	var buildSelector = function(options, defaultOption) {
		var selector = document.createElement("select");

		for (var optionId = 0; optionId < options.length; optionId++) {
			var option = document.createElement("option");
			option.value = optionId;
			option.innerText = options[optionId];
			if (defaultOption == optionId) {
				option.selected = 1;
			}
			selector.appendChild(option);
		}

		return selector;
	}

	var getElementPost = function(elem) {
		while (elem) {
			var matches = elem.id.match(/^p([0-9]+)$/);
			if (matches) {
				return parseInt(matches[1]);
			}
			elem = elem.parentElement;
		}

		return false;
	}

	var removeSelectors = function() {
		var oldSelectors = document.getElementsByClassName("mtt-posttype");
		while (oldSelectors.length) {
			oldSelectors[0].remove();
		}
	}

	var createSelectors = function(tags) {
		var posts = document.getElementsByClassName("thumb");

		tags = "---\n" + tags;
		tags = tags.trim().replace(/[\t ]+/g, " ").replace(/\n+/g, "\n").split("\n");

		for (var i = 0; i < posts.length; i++) {
			var score = posts[i].getElementsByClassName("post-score")[0];
			score.remove();
			score.style.width = "100%";
			posts[i].appendChild(score);

			var selector = buildSelector(tags, tags.length == 1 ? 0 : 1);
			selector.className = "mtt-posttype";
			score.appendChild(selector);
		}
	}

	var sendHolder = createSidebarSection("AFTagger");

	var tags = Cookie.get("aftagger-tags");
	if (!tags) {
		tags = "anthro\nferal\nhuman hybrid";
	}
	createSelectors(tags);

	var tagsBox = document.createElement("textarea");
	tagsBox.value = tags;
	tagsBox.onchange = function(e) {
		removeSelectors();
		createSelectors(e.target.value);
		Cookie.put("aftagger-tags", e.target.value);
	}
	sendHolder.appendChild(tagsBox);

	var sendButton = document.createElement("button");
	sendButton.onclick = function(e) {
		var postData = [];
		var postElems = document.getElementsByClassName("thumb");
		for (var i = 0; i < postElems.length; i++) {
			if (postElems[i].classList.contains("blacklisted")) continue;
			var tagScript = options[postElems[i].getElementsByClassName("mtt-posttype")[0].value].tags;
			if (tagScript) {
				var postId = getElementPost(postElems[i]);
				if (postId !== false) {
					TagScript.run(postId, tagScript);
				}
			}
		}
	}
	sendButton.innerHTML = "Send post types";
	sendHolder.appendChild(sendButton);
} + ")();";

h.type = "text/javascript";
document.body.appendChild(h);
