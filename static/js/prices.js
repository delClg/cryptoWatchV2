const area = document.getElementById("boxArea");
const toggle = document.getElementsByClassName("toggleBut");
const autoUpdateToggle = document.getElementById("autoUpdate");
const timeDelay = document.getElementById("timeDelay");
const svSettings = document.getElementById("svSettingsBtn");
const menu = document.querySelector("#top-bar .link");
const leftPane = document.getElementById("left-pane");
const modalBackground = document.getElementById("modal");
const body = document.getElementsByTagName("body")[0];

function handleScreenAndMenu() {
  if (leftPane.style.display == "block") {
    leftPane.style.display = "none";
    leftPane.style.left = "100%";
    leftPane.style.right = "";
    modalBackground.style.display = "none";
    // enableScroll(modalBackground);
    body.style.position = "";
  } else {
    leftPane.style.display = "block";
    leftPane.style.right = "0";
    leftPane.style.left = "";
    modalBackground.style.display = "block";
    modalBackground.addEventListener("click", outsideTouch);
    // disableScroll(modalBackground);
    body.style.position = "fixed";
  }
}

function outsideTouch(e) {
  if (e.target == modalBackground) {
    modalBackground.style.display = "none";
    leftPane.style.display = "none";
    leftPane.style.left = "100%";
    leftPane.style.right = "";
    modalBackground.removeEventListener("click", outsideTouch);
    // enableScroll(modalBackground);
    body.style.position = "";
  }
}

let smallScreen = window.matchMedia("(max-width: 800px)");
function smallScreenHandler(x) {
  if (x.matches) {
    menu.addEventListener("click", handleScreenAndMenu);
  } else {
    menu.removeEventListener("click", handleScreenAndMenu);
    leftPane.style.display = "";
    leftPane.style.left = "";
    leftPane.style.right = "";
  }
}
smallScreenHandler(smallScreen);
smallScreen.addEventListener("change", smallScreenHandler);

var autoUpdateInterval = null;
var timeDelayS = "";

autoUpdateToggle.addEventListener("change", () => {
  if (autoUpdateToggle.checked) {
    timeDelay.disabled = false;
  } else {
    timeDelayS = 0;
    timeDelay.disabled = true;
    svSettings.disabled = false;
  }
});

timeDelay.addEventListener("input", () => {
  if (timeDelayS == timeDelay.value) {
    svSettings.disabled = true;
  } else svSettings.disabled = false;
});

svSettings.addEventListener("click", () => {
  svSettings.disabled = true;
  if (autoUpdateInterval != null) {
    clearAsyncInterval(autoUpdateInterval);
  }
  if (timeDelayS === 0) return;
  timeDelayS = Math.floor(parseInt(timeDelay.value));
  if (timeDelayS < 2) timeDelayS = 2;
  else if (timeDelayS > 20) timeDelayS = 20;
  autoUpdateInterval = setAsyncInterval(updateData, timeDelayS * 1000);
});

for (let j = 0; j < toggle.length; j++) {
  let i = toggle[j];
  toggle[j].addEventListener("click", () => {
    let child = i.parentElement.querySelector(".optList");
    if (child.className.match(/(?:^|\s)invisList(?!\S)/)) {
      child.className = child.className.replace(/(?:^|\s)invisList(?!\S)/g, "");
      child.className += " visList";
      i.style.color = "var(--pink)";
    } else {
      child.className = child.className.replace(/(?:^|\s)visList(?!\S)/g, "");
      child.className += " invisList";
      i.style.color = "grey";
    }
  });
}

var pvData = {};

fetch(
  "https://data.messari.io/api/v1/assets?fields=id,slug,symbol,metrics/market_data/price_usd"
).then((res) => {
  res.json().then((data) => {
    for (let i = 0; i < data.data.length; i++) {
      pvData[data.data[i].slug] = parseFloat(
        data.data[i].metrics.market_data.price_usd
      );
      addCryptoData(
        data.data[i].slug,
        data.data[i].symbol,
        data.data[i].metrics.market_data.price_usd
      );
    }
  });
});

// Template for a box of crypto info
{
  /* <div class="cryptoBox">
    <h3>name <span>symbol</span></h3>
    <p>value</p>
</div> */
}
// End
function addCryptoData(name, symbol, price) {
  let cryptoBox = document.createElement("div");
  cryptoBox.className += " cryptoBox";
  let ch2 = document.createElement("h2");
  ch2.innerHTML = `${name}`;
  let cp = document.createElement("p");
  cp.innerHTML = `Price: $${price}`;
  cp.className += " price";
  // let csp = document.createElement("sup");
  // csp.innerHTML = symbol;
  // ch2.appendChild(csp);
  cryptoBox.appendChild(ch2);
  cryptoBox.appendChild(cp);
  area.appendChild(cryptoBox);
}

async function updateData() {
  let cryptos = document.getElementsByClassName("cryptoBox");
  fetch(
    "https://data.messari.io/api/v1/assets?fields=id,slug,symbol,metrics/market_data/price_usd"
  ).then((res) => {
    res.json().then((data) => {
      for (let i = 0; i < cryptos.length; i++) {
        for (let j = 0; j < data.data.length; j++) {
          if (cryptos[i].querySelector("h2").innerHTML == data.data[j].slug) {
            cryptos[i].querySelector(
              "p"
            ).innerHTML = `Price: $${data.data[j].metrics.market_data.price_usd}`;
            let price = cryptos[i].querySelector("h2").innerHTML;
            if (pvData.hasOwnProperty(price)) {
              if (
                pvData[price] <
                parseFloat(data.data[j].metrics.market_data.price_usd)
              ) {
                // cryptos[i]
                //     .querySelector(".price")
                //     .className.match(/(?:^|\s)MyClass(?!\S)/)
                cryptos[i].querySelector(".price").className = cryptos[i]
                  .querySelector(".price")
                  .className.replace(/(?:^|\s)incText(?!\S)/g, "");
                cryptos[i].querySelector(".price").className = cryptos[i]
                  .querySelector(".price")
                  .className.replace(/(?:^|\s)decText(?!\S)/g, "");
                cryptos[i].querySelector(".price").className += " incText";
              } else {
                // console.log(
                //   pvData[price],
                //   parseFloat(data.data[j].metrics.market_data.price_usd)
                // );
                cryptos[i].querySelector(".price").className = cryptos[i]
                  .querySelector(".price")
                  .className.replace(/(?:^|\s)decText(?!\S)/g, "");
                cryptos[i].querySelector(".price").className = cryptos[i]
                  .querySelector(".price")
                  .className.replace(/(?:^|\s)incText(?!\S)/g, "");
                cryptos[i].querySelector(".price").className += " decText";
              }
            }
            break;
          }
        }
      }
      for (let i = 0; i < data.data.length; i++) {
        pvData[data.data[i].slug] = parseFloat(
          data.data[i].metrics.market_data.price_usd
        );
      }
    });
  });
}
// setTimeout(updateData, 3000);
// // setInterval(updateData, 5000);

// Async setTimeout stuff at https://dev.to/jsmccrumb/asynchronous-setinterval-4j69

const asyncIntervals = [];

const runAsyncInterval = async (cb, interval, intervalIndex) => {
  await cb();
  if (asyncIntervals[intervalIndex].run) {
    asyncIntervals[intervalIndex].id = setTimeout(
      () => runAsyncInterval(cb, interval, intervalIndex),
      interval
    );
  }
};

const setAsyncInterval = (cb, interval) => {
  if (cb && typeof cb === "function") {
    const intervalIndex = asyncIntervals.length;
    asyncIntervals.push({ run: true, id: 0 });
    runAsyncInterval(cb, interval, intervalIndex);
    return intervalIndex;
  } else {
    throw new Error("Callback must be a function");
  }
};

const clearAsyncInterval = (intervalIndex) => {
  if (asyncIntervals[intervalIndex].run) {
    clearTimeout(asyncIntervals[intervalIndex].id);
    asyncIntervals[intervalIndex].run = false;
  }
};
// setAsyncInterval(async () => {
//   console.log("start");
//   const promise = new Promise((resolve) => {
//     setTimeout(resolve("all done"), 3000);
//   });
//   await promise;
//   console.log("end");
// }, 1000);

// Code to stop scroll

// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires { passive: false } when adding event
var supportsPassive = false;
try {
  window.addEventListener(
    "test",
    null,
    Object.defineProperty({}, "passive", {
      get: function () {
        supportsPassive = true;
      },
    })
  );
} catch (e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent =
  "onwheel" in document.createElement("div") ? "wheel" : "mousewheel";

// call this to Disable
function disableScroll(x) {
  x.addEventListener("DOMMouseScroll", preventDefault, false); // older FF
  x.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  x.addEventListener("touchmove", preventDefault, wheelOpt); // mobile
  x.addEventListener("keydown", preventDefaultForScrollKeys, false);
}

// call this to Enable
function enableScroll(x) {
  x.removeEventListener("DOMMouseScroll", preventDefault, false);
  x.removeEventListener(wheelEvent, preventDefault, wheelOpt);
  x.removeEventListener("touchmove", preventDefault, wheelOpt);
  x.removeEventListener("keydown", preventDefaultForScrollKeys, false);
}
