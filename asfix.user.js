// ==UserScript== 
// @name          e621 Mode Fix
// @version       1.0.1
// @description   Workaround for a crash caused by "prompt()" inside an "onchange" event
// @author        Lizardite

// @namespace     e621
// @run-at        document-idle

// @include       http://e621.net/post
// @include       https://e621.net/post
// @include       http://e621.net/post/*
// @include       https://e621.net/post/*
// @include       http://e621.net/post?*
// @include       https://e621.net/post?*

// @match         *://*.e621.net/post
// @match         *://*.e621.net/post/*
// @match         *://*.e621.net/post?*
// ==/UserScript== 

var h = document.createElement("script");

h.innerHTML = "(" + function() {
	var injectFunction = function() {
		var e = document.getElementById("mode");
		if (e) {
			e.onchange = function() {
				setTimeout(function() {
					PostModeMenu.change.apply(PostModeMenu);
				}, 1);
			}
		} else {
			setTimeout(injectFunction, 100);
		}
	}
	injectFunction();
} + ")();";
h.type = "text/javascript";
document.body.appendChild(h);
