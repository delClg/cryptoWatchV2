const area = document.getElementById("boxArea");
const toggle = document.getElementsByClassName("toggleBut");
const autoUpdateToggle = document.getElementById("autoUpdate");
const timeDelay = document.getElementById("timeDelay");
const svSettings = document.getElementById("svSettingsBtn");

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
      for (let i = 0; i < 1; i++) {
        for (let j = 0; j < 1; j++) {
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
