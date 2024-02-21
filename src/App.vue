<script setup>
  import { ref } from "vue";
  import imgs from "../src/assets/imgs.png"
  import search from "../src/assets/search.png"

  //const WEBSOCKET_URL = "ws://[2408:820c:8f7f:28c0:20c:29ff:fe94:ca49]:2345"
  const WEBSOCKET_URL = "wss://www.shugan.tech/wss/"
  let ws = null;
  //let location = {lng:121.5418864,lat:31.3687324,alt:75.2253417,acc:4.2347331,acc_v:2.5}; // update location by gps
  let location = null;
  let senseRange = ref(800);
  var keyword = ref('');
  var module_name = ref('MED');
  var results = ref([]);
  let message = null;
  function navUrl(url){
    window.location.href = url;
  }
  function sense() {
    results.value = [];
    if (location === null) {
      alert("获取位置失败")
      return
    }
    message = JSON.stringify({
      command: 'sense',
      areaType: 1,
      gps: location,
      senseRange: senseRange.value,
      uuid: '0eb25ca4-8b72-49d2-a7c3-1e44f13d3d9a', //todo generate uuid randomly
      targetName: module_name.value,
      targetNamespace: 'SBG',
      matchKeyword: keyword.value,
      clientPort: 0
    });
    document.getElementsByClassName('topSty')[0].style.opacity=0
    document.getElementsByClassName('btmSty')[0].style.top='30px'

    if (ws.readyState !== WebSocket.OPEN) {
      startWebSocket();
      return
    }
    
    ws.send(message)
    message = null;
  }
  function updateBtn(){
    document.getElementsByClassName('topSty')[0].style.opacity=0
    document.getElementsByClassName('btmSty')[0].style.top='30px'

    
  }
  function startWebSocket() {
    if ("WebSocket" in window) {
      ws = new WebSocket(WEBSOCKET_URL);
      ws.onopen = function() {
        if (message !== null) {
          ws.send(message);
          message = null;
        }
      }
      ws.onmessage = async function (evt) {
        const message = await evt.data.text();
        console.log(message)
        const json = JSON.parse(message);
        json.url = `http://[${json.ipAddress}]:${json.port}`;
        const filename = json.iconUrl.split('/icon/')[1].replaceAll('/', '-');
        json.iconUrl = `https://www.shugan.tech/icon/${filename}.jpg`;
        results.value.push(json);
      }
    }
  }

  function successFunc(position) {
    const coordinates = position.coords;
    location = {lng: coordinates.longitude, lat:coordinates.latitude, alt:coordinates.altitude, acc:coordinates.accuracy, acc_v:coordinates.altitudeAccuracy};
  }

  function failFunc(error) {
    const err = error.code + ":" + error.message;
    alert(err);
    location = null;
  }

  function getLocation() {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };
      navigator.geolocation.watchPosition(successFunc, failFunc, options);
    } else {
      location = null;
    }
  }

  function prepare() {
    startWebSocket();
    getLocation();
  }

  window.onload = prepare;



</script>

<template>
  <!-- <div> -->
    <!-- <div>
      <select id="module-name" v-model="module_name">
        <option value="MED">超媒体</option>
        <option value="WEB" disabled>网页</option>
        <option value="FTP" disabled>文件</option>
      </select>
      <input id="keyword-input" type="text" v-model="keyword">
      <button id="sense-button" @click="sense">感知</button>
    </div>
    <div>
      <a v-for="result in results" :href = result.url><img width=50 height= 50  :src=result.iconUrl>{{ result.title }},{{ result.description }}</a>
    </div>
  </div> -->
  <div style="background-color: #fff;">
    <div class="topSty">
      <div class="tabsSty">
      <div class="Selected">
        <div>超媒体</div>
        <div></div>
      </div>
      <div>
        <div>网页</div>
        <div></div>
      </div>
      <div>
        <div>文件</div>
        <div></div>
      </div>
    </div>
    <div style="text-align: center;width: 343;padding-top: 50px;box-sizing:border-box;">
      <img :src="imgs" alt="" style="width: 188px;height: auto;">

    </div>
    </div>
    
    <div>

      <div class="btmSty">
        <!-- <div style="width: 343px;margin: 0 auto;display: flex;">
        <select id="module-name" v-model="senseRange">
            <option :value="200">超近</option>
            <option :value="400">近</option>
            <option :value="800">中</option>
            <option :value="2000">远</option>
            <option :value="5000">超级远</option>
          </select>
      </div> -->
  <div class="centerSearchSty" style="background-color: #fff;">
      
      <div>
        <div style="padding: 0 7px;box-sizing: border-box;display: flex;align-items: center;">
          <img :src="search" style="width: 25px;" alt="">
        </div>
        <div>
          <input placeholder="请输入感知内容" id="keyword-input" type="text" v-model="keyword">
        </div>
      </div>
      <div @click="sense">
        感知
      </div>
      </div>  
      <div class="tabsSty">
        <div :class="senseRange==200?'Selected':''" @click="senseRange=200">
          <div>超近</div>
          <div></div> 
        </div>
        <div :class="senseRange==400?'Selected':''" @click="senseRange=400">
          <div>近</div>
          <div></div> 
        </div>
        <div :class="senseRange==800?'Selected':''" @click="senseRange=800">
          <div>中</div>
          <div></div>
        </div>
        <div :class="senseRange==2000?'Selected':''" @click="senseRange=2000">
          <div>远</div>
          <div></div>
        </div>
        <div :class="senseRange==5000?'Selected':''" @click="senseRange=5000">
          <div>超远</div>
          <div></div>
        </div>
      </div>
 
      <div>
        <div class="listSty" v-for="item in results" @click="navUrl(item.url)">
          <div>
            <img :src="item.iconUrl" alt="">
          </div>
          <div>
            <div>{{ item.title }}</div>
            <div>
              {{ item.description }}
            </div>
          </div>
        </div>
      </div>
    </div>

      </div>
      
    

  </div>
</template>

<style scoped>
select {
background-color: #ffffff;
color: #333;
border: 1px solid #ccc;
border-radius: 5px;
box-shadow: 0 0 5px rgba(0,0,0,0.1);
width: 100px;
height: 30px;
margin-bottom: 15px;
}
select option {
background-color: #f2f2f2;
color: #333;
border: none;
}
*{
  -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none;   /* Chrome/Safari/Opera */
        -moz-user-select: none;      /* Firefox */
        -ms-user-select: none;       /* Internet Explorer/Edge */
        user-select: none;  
        transition: .3s all;
}
.listSty{
  width: 343px;
  margin: 0 auto;
  display: flex;
  margin-top:20px;
  border-bottom: 1px solid #D8D8D8;
  padding-bottom: 20px;
  box-sizing: border-box;
}
.listSty>div:nth-child(1){
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
}
.listSty>div:nth-child(2){
  width: 260px;
  text-align: left;
  padding-left:16px;

}
.listSty>div:nth-child(2)>div:nth-child(1){
  font-size: 23px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  color: #000000;
}
.listSty>div:nth-child(2)>div:nth-child(2){
  font-size: 13px;
font-family: PingFang SC, PingFang SC;
font-weight: 400;
color: #898989;
}

.listSty>div:nth-child(1)>img{
  width: 70px;
  height: 70px;
}

.tabsSty{
  width: 343px;
  height: 60px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  user-select: none;
  display: flex;
  transition: 0s all;
}
.tabsSty>div{
  width: 70px;
  font-size: 26rpx;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  color: #898989;
  transition: 0s all;

}
.tabsSty>.Selected{
  font-size: 14px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  color: #000000;
  transition: 0 all;

}
.tabsSty>.Selected>div:nth-child(2){
  width: 16px;
  height: 2px;
  background: #000000;
  border-radius: 2px;
  margin: 0 auto;
}
.btmSty{
  position: absolute;
  top: 350px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  width: 100%;
}
.centerSearchSty{
  width: 333px;
  height: 40px;
  background: #FFFFFF;
  border-radius: 20px;
  border: 1px solid #9B9B9B;
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  transition: .2s all;

}
.centerSearchSty>div:nth-child(1){
  display: flex;
  align-items: center;
  font-size: 13px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  color: #898989;
}
.centerSearchSty>div:nth-child(1)>div:nth-child(2){
  height: 100%;
}
.centerSearchSty>div:nth-child(1)>div:nth-child(2)>input{
  background:none;  
	outline:none;  
	border:1px solid #ccc;
  height: 95%;
  width:150px ;
  border: 0;
  background: #FFFFFF;
  color: #000000;
}

.centerSearchSty>div:nth-child(2){
  width: 65px;
  height: 40px;
  background: #FE6553;
  border-radius: 20px;
  font-size: 13px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
}


.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}


#sense-button {
  margin: 0.5em;
}

a {
  display: block;
  font-size: x-large;
}

/* img {
  transform: rotate(-90deg);
} */
</style>
