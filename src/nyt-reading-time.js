/**
 *
 *
 *
 */

function elementInViewport(el) {
  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;

  while (el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }

  return (
    top >= window.pageYOffset &&
    left >= window.pageXOffset &&
    top + height <= window.pageYOffset + window.innerHeight &&
    left + width <= window.pageXOffset + window.innerWidth
  );
}

function readingTime(duration) {
  var minutes = parseInt(duration / 60, 10);
  var seconds = parseInt(duration % 60, 10);

  options.debug &&
    console.log("nyt reading time:", minutes, "minutes", seconds, "seconds");
  return minutes + " minutes " + seconds + " seconds";
}

function createElement(tagName, css) {
  css = css || {};
  var node = document.createElement(tagName);
  for (var key in css) {
    node.style[key] = css[key];
  }
  return node;
}

function loadingDots(node, text, delay) {
  node.innerHTML = text;
  var dots = [];
  var interval = window.setInterval(function() {
    node.innerHTML = dots.join("") + text;
    dots.push(".");
    if (dots.length > 3) {
      clearInterval(interval);
    }
  }, delay || 400);
}

var options = {
  debug: true,
  ui: true,
  storageKey: "ratio",
  defaultRatio: 0.16,
};

// acceptable ratio: 0.16

var Ratio = {
  get: function() {
    return parseFloat(localStorage.getItem(options.storageKey), 10) || options.defaultRatio;
  },
  add: function(value) {
    var ratio = this.get();
    if (ratio) {
      value = (value + ratio) / 2;
    }
    localStorage.setItem(options.storageKey, value);
  }
};

var ratio = Ratio.get();

const hostnames = {
    'www.nytimes.com': '.StoryBodyCompanionColumn p',
    'www.theguardian.com': '[itemprop="articleBody"] > p',
}

function getCount() {
    const query = hostnames[window.location.hostname];
    if (query) {
        var storyContent = [].slice.call(document.querySelectorAll(query))
        return storyContent.reduce(function (prev, current) {
            return prev + current.textContent.split(' ').length;
        }, 0)
    }
    return null;
}

var count = getCount();
if (count) {
  if (options.ui) {
    var node = createElement("div", {
      position: "fixed",
      top: "160px",
      right: "0",
      marginRight: "35px",
      width: "180px",
      textAlign: "center",
      padding: "1em 1em 0.5em 1em",
      borderStyle: "solid",
      borderColor: "#000",
      borderWidth: 0,
      borderBottomWidth: "1px",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      fontFamily: "nyt-imperial,georgia,'times new roman',times,serif",
    });

    var text = createElement("div");
    if (ratio) {
      var duration = ratio * count;
      text.innerHTML = readingTime(duration);
    } else {
      text.innerHTML = "???";
    }

    var bubble = createElement("div", {
      backgroundColor: "red",
      width: "12px",
      height: "12px",
      borderRadius: "6px",
      visibility: "hidden",
      opacity: "0.3"
    });

    node.appendChild(bubble);
    node.appendChild(text);

    node.title = count + " words";

    node.onmouseover = function() {
      bubble.style.opacity = "1";
    };
    node.onmouseout = function() {
      bubble.style.opacity = "0.3";
    };

    var start, timer;
    node.onclick = function() {
      if (start !== undefined && timer === undefined) {
        timer = (new Date().getTime() - start) / 1000;
        bubble.style.visibility = "hidden";
        text.innerHTML = readingTime(timer);
        Ratio.add(timer / count);
      } else if (start === undefined) {
        start = new Date().getTime();
        bubble.style.visibility = "visible";
        loadingDots(text, "recording");
      }
    };

    document.body.appendChild(node);
  }
} else {
  options.debug && console.log("no storyContent found.");
}
