var map = L.map("map").setView([0, 0], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// 口罩數量判別圖標
var greenIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
var orangeIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
var redIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 使用者所在圖標顏色
var blueIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.marker([0, 0], { icon: blueIcon }).addTo(map);

// 定位使用者位置
if ("geolocation" in navigator) {
  console.log("geolocation available");
  // watchPosition - 隨著裝置的位置移動而持續監測
  navigator.geolocation.watchPosition((position) => {
    console.log(position.coords);
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;
    map.setView([userLat, userLng], 13);
    userIcon
      .setLatLng([userLat, userLng])
      .bindPopup(`<h3>您目前的位置</h3>`)
      .openPopup();
  });
} else {
  console.log("geolocation not available");
}

// 使用者按鈕事件
let userBtn = document.getElementById("geoBtn");
userBtn.addEventListener("click", function () {
  map.setView([userLat, userLng], 13);
  userIcon
    .setLatLng([userLat, userLng])
    .bindPopup(`<h3>您目前的位置</h3>`)
    .openPopup();
});

var data;

function getData() {
  // 開啟網路請求
  const xhr = new XMLHttpRequest();
  // 向某伺服器要資料
  xhr.open(
    "get",
    "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json"
  );
  // 執行要資料的動作
  xhr.send(null);
  xhr.onload = function () {
    // 將回傳的資料(字串)轉成物件陣列的 JSON格式
    data = JSON.parse(xhr.responseText).features;

    // 依序將marker倒入圖層
    for (let i = 0; i < data.length; i++) {
      var mask;
      if (data[i].properties.mask_adult == 0) {
        mask = redIcon;
      } else {
        mask = greenIcon;
      }
      markers.addLayer(
        L.marker(
          [data[i].geometry.coordinates[1], data[i].geometry.coordinates[0]],
          {
            icon: mask,
          }
        ).bindPopup(
          '<h1 class="infoName">' +
            data[i].properties.name +
            "</h1>" +
            '<p class="infoAddress"><img src="img/gps.png"><a href="https://www.google.com.tw/maps/place/' +
            data[i].properties.address +
            '" target="_blank">' +
            data[i].properties.address +
            "</a></p>" +
            '<p class="infoAddress"><img src="img/call.png"><a href="tel:' +
            data[i].properties.phone +
            '" target="_blank">' +
            data[i].properties.phone +
            "</a></p>" +
            '<p class="infoMask">成人口罩數量<span>' +
            data[i].properties.mask_adult +
            "</span></p>" +
            '<p class="infoMask">小孩口罩數量<span>' +
            data[i].properties.mask_child +
            " </span></p>" +
            '<p class="infoTime">' +
            data[i].properties.note +
            "</p>" +
            '<p class="infoUpdate">最後更新時間:<span>' +
            data[i].properties.updated +
            "</span></p>"
        )
      );
    }
    map.addLayer(markers);
    addCountyList();
  };
}

// 網頁載入時可預設執行
function init() {
  getData();
  renderDate();
}

init();

// 優化畫面效能 Leaflet.markercluster -設定點擊時的群集縮放等級:disableClusteringAtZoom
var markers = new L.MarkerClusterGroup({ disableClusteringAtZoom: 18 }).addTo(
  map
);

function addMarker() {
  // console.log(data);
  for (let i = 0; i < data.length; i++) {
    let pharmacyName = data[i].properties.name;
    let maskAdult = data[i].properties.mask_adult;
    let maskChild = data[i].properties.mask_child;
    let lat = data[i].properties.coordinates[1];
    let lng = data[i].properties.coordinates[0];
    let pharmacyPhone = data[i].properties.phone;
    let pharmacyNote = data[i].properties.note;
    let lastUpdate = data[i].properties.updated;
    // 依照口罩數量顯示不同的標示顏色 - 1.缺貨-RED；2.少量-ORANGE；3.充足-GREEN
    if (maskAdult == 0 || maskChild == 0) {
      mask = redIcon;
    } else if (
      (maskAdult < 100 && maskAdult !== 0) ||
      (maskChild < 100 && maskChild !== 0)
    ) {
      mask = orangeIcon;
    } else {
      mask = greenIcon;
    }
    markers.addLayer(L.marker([lat, lng], { icon: mask }).bindPopup());
  }
  map.addLayer(markers);
}

// 顯示出今日日期
function renderDate() {
  const dateInfo = new Date();
  const day = dateInfo.getDay();
  let date = dateInfo.getDate();
  let month = dateInfo.getMonth() + 1;
  //   console.log(typeof(month))
  let year = dateInfo.getFullYear();
  // 兩星期轉為毫秒
  const twoWeeks = 1000 * 60 * 60 * 24 * 14;
  // 將毫秒再轉為日期
  const twoWeeksDate = new Date(new Date().getTime() + twoWeeks);
  // console.log(twoWeeksDate)
  let nextBuyTimeDate = twoWeeksDate.getDate();
  let nextBuyTimeMonth = twoWeeksDate.getMonth() + 1;
  let nextBuyTimeYear = twoWeeksDate.getFullYear();
  let today;
  let nextBuyDate;
  if (month.toString().length == 1) {
    month = "0" + month;
  }
  if (date.toString().length == 1) {
    date = "0" + date;
  }
  today = year + "-" + month + "-" + date;

  if (nextBuyTimeMonth.toString().length == 1) {
    nextBuyTimeMonth = "0" + nextBuyTimeMonth;
  }
  if (nextBuyTimeDate.toString().length == 1) {
    nextBuyTimeDate = "0" + nextBuyTimeDate;
  }
  nextBuyDate =
    nextBuyTimeYear + "-" + nextBuyTimeMonth + "-" + nextBuyTimeDate;
  // console.log(nextBuyDate)
  // 將上面取得今天的日期帶入function－judgeChineseDay轉成中文
  const dayChinese = judgeChineseDay(day);
  let todayDateNum = document.getElementById("todayDate-num");
  let infoWeekNum = document.getElementById("infoWeek-num");
  let nextBuyDateNum = document.getElementById("nextBuyDateNum");
  let nextBuyDay = document.getElementById("nextBuyDay");
  todayDateNum.textContent = today;
  infoWeekNum.textContent = dayChinese;
  nextBuyDateNum.textContent = nextBuyDate;
  nextBuyDay.textContent = dayChinese;
}

// 判斷今天星期幾並把數字轉成中字
function judgeChineseDay(day) {
  switch (day) {
    case 1:
      return "一";
      break;
    case 2:
      return "二";
      break;
    case 3:
      return "三";
      break;
    case 4:
      return "四";
      break;
    case 5:
      return "五";
      break;
    case 6:
      return "六";
      break;
    case 0:
      return "日";
      break;
  }
}

// 縣市選單
const countySelector = document.getElementById("countyList");

function addCountyList() {
  let allCounty = [];
  let countyStr = "";
  countyStr += "<option>請選擇縣市</option>";
  for (let i = 0; i < data.length; i++) {
    const countyName = data[i].properties.county;
    // console.log(countyName);
    if (allCounty.indexOf(countyName) == -1 && countyName !== "") {
      allCounty.push(countyName);
      countyStr += `<option value="${countyName}">${countyName}</option>`;
    }
  }
  countySelector.innerHTML = countyStr;
}

countySelector.addEventListener("change", addTownList);

let townSelector = document.getElementById("townList");
townSelector.innerHTML = `<option value="">請選擇鄉鎮區</option>`;

function addTownList(e) {
  let countyValue = e.target.value;
  let townStr = `<option value="">請選擇鄉鎮區</option>`;
  let allTown = [];
  let newTownList = "";
  for (let i = 0; i < data.length; i++) {
    let countyMatch = data[i].properties.county;
    if (countyValue == countyMatch) {
      allTown.push(data[i].properties.town);
    }
  }
  newTownList = new Set(allTown);
  newTownList = Array.from(newTownList);
  for (let i = 0; i < newTownList.length; i++) {
    townStr += `<option>${newTownList[i]}</option>`;
  }

  townSelector.innerHTML = townStr;
  townSelector.addEventListener("change", geoTownView);
}

// 選取鄉鎮定位至該地區
function geoTownView(e) {
  let town = e.target.value;
  let townLatLng = [];
  let county = "";

  for (let i = 0; i < data.length; i++) {
    let townTarget = data[i].properties.town;
    let countyTarget = data[i].properties.county;
    let townLng = data[i].geometry.coordinates[1];
    let townLat = data[i].geometry.coordinates[0];

    if (townTarget == town && countyTarget == countySelector.value) {
      townLatLng = [townLng, townLat];
      county = data[i].properties.county;
    }
  }
  map.setView(townLatLng, 16);
  renderList(town, county);
}

// 接著得到藥局資料
function renderList(town, county) {
  let str = "";
  for (var i = 0; i < data.length; i++) {
    let countyName = data[i].properties.county;
    let townName = data[i].properties.town;
    let pharmacyName = data[i].properties.name;
    let maskAdult = data[i].properties.mask_adult;
    let maskChild = data[i].properties.mask_child;
    let pharmacyAddress = data[i].properties.address;
    let pharmacyPhone = data[i].properties.phone;
    let pharmacyNote = data[i].properties.note;

    if (countyName == county && townName == town) {
      str += `<ul class="maskContent">
        <div class="pharmacyTitle" id="newPharmacy" data-lat="${data[i].geometry.coordinates[1]}" data-lng="${data[i].geometry.coordinates[0]}">
        <li data-name="${pharmacyName}" class="infoTitle"><span>${pharmacyName}</span></li>
        <p class="infoText"><img src="img/gps.png"> ${pharmacyAddress}</p>
        <p class="infoText"><img src="img/call.png"> ${pharmacyPhone}</p>
        <p class="noteText"> ${pharmacyNote}</p>
        <div class="maskNum" data-name="${pharmacyName}">        
        <div class="infoLayout">
        <div class="adultInfo">        
        <img class="adultIcon" src="img/adult.png" alt="">
        <span>${maskAdult}</span> 
        </div>  
        &nbsp;
        <div class="childInfo">  
        <img class="childIcon" src="img/child.png" alt="">
        <span>${maskChild}</span>  
        </div>
        </div>
        </div>
        </div>
        </ul>`;
    }
  }
  document.querySelector(".pharmacyList").innerHTML = str;
  var pharmacyTitle = document.querySelectorAll(".pharmacyTitle");
  var pharmacyNameList = document.querySelectorAll(".maskContent");
  clickPharmacyGo(pharmacyTitle, pharmacyNameList);
}

function clickPharmacyGo(pharmacyTitle, pharmacyNameList) {
  for (var i = 0; i < pharmacyNameList.length; i++) {
    pharmacyTitle[i].addEventListener("click", function (e) {
      goLat = Number(e.currentTarget.dataset.lat);
    //   console.log(Number(e.currentTarget.dataset.lat))
      goLng = Number(e.currentTarget.dataset.lng);      
    //   console.log(Number(e.currentTarget.dataset.lng))
      map.setView([goLat, goLng], 16);
      markers.eachLayer(function (layer) {
        let layerLatLng = layer.getLatLng();
        if (layerLatLng.lat == goLat && layerLatLng.lng == goLng) {
          layer.openPopup();
        }
      });
    });
  }
}

// toggleBtn
let toggleBtn = document.getElementById('toggleBtn')
let toggleBtnImg = document.getElementById('toggleBtnImg')
let leftSide = document.getElementById('leftSide')

toggleBtn.addEventListener('click',function(){
    leftSide.classList.toggle('closeBtn')
    if(leftSide.classList.contains('closeBtn')){
        // console.log('123')
        toggleBtnImg.classList.add('rotateImg')
    } else {
        toggleBtnImg.classList.remove('rotateImg')
    }
})