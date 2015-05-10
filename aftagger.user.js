// ==UserScript== 
// @name          e621 AFTagger
// @version       1.1.1
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
	if (!Array.prototype.addAll) {
		Array.prototype.addAll = function(toAdd) {
			var me = this;
			toAdd.forEach(function(i) {
				me.push(i);
			});
		}
	}

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

	var createSelectors = function() {
		var options = new Array("---");
		options.addAll(tags);

		var posts = document.getElementsByClassName("thumb");

		for (var i = 0; i < posts.length; i++) {
			var score = posts[i].getElementsByClassName("post-score")[0];
			score.remove();
			score.style.width = "100%";
			posts[i].appendChild(score);

			var selector = buildSelector(options, options.length == 1 ? 0 : 1);
			selector.className = "mtt-posttype";
			score.appendChild(selector);
		}
	}

	var sendHolder = createSidebarSection("AFTagger");

	var tags = Cookie.get("aftagger-tags").split("\n");
	if (tags[0] == "") {
		tags = [
			"anthro",
			"feral",
			"human hybrid"
		];
	}
	createSelectors();

	var tagsBox = document.createElement("textarea");
	tagsBox.value = tags.join("\n");
	tagsBox.onchange = function(e) {
		tags = e.target.value.trim().replace(/[\t ]+/g, " ").replace(/\n+/g, "\n").split("\n");
		Cookie.put("aftagger-tags", tags.join("\n"));

		removeSelectors();
		createSelectors();
	}
	sendHolder.appendChild(tagsBox);

	var sendButton = document.createElement("button");
	sendButton.onclick = function(e) {
		var postData = [];
		var postElems = document.getElementsByClassName("thumb");
		for (var i = 0; i < postElems.length; i++) {
			if (postElems[i].classList.contains("blacklisted")) continue;
			var optionId = postElems[i].getElementsByClassName("mtt-posttype")[0].value;
			if (tags[optionId - 1]) {
				var postId = getElementPost(postElems[i]);
				TagScript.run(postId, tags[optionId - 1]);
			}
		}
	}
	sendButton.innerHTML = "Send post types";
	sendHolder.appendChild(sendButton);
} + ")();";

h.type = "text/javascript";
document.body.appendChild(h);
