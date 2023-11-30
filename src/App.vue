<script setup>
  import { ref } from "vue";

  const WEBSOCKET_URL = "ws://[2408:820c:8f78:d3b0:20c:29ff:fe94:ca49]:2345"
  let ws = null;
  let location = {lng:121.54188643,lat:31.36873241,alt:75.225341796875,acc:4.2347331047058105,acc_v:2.5}; // update location by gps
  let senseRange = 800;
  var keyword = ref('');
  var module_name = ref("MED");
  var results = ref([]);

  function sense() {
    results.value = [];
    if (ws.readyState === WebSocket.OPEN && location !== null) {
      ws.send(JSON.stringify({
        command: 'sense',
        areaType: 1,
        gps: location,
        senseRange: senseRange,
        uuid: '0eb25ca4-8b72-49d2-a7c3-1e44f13d3d9a', //todo generate uuid randomly
        targetName: module_name.value,
        targetNamespace: 'SBG',
        matchKeyword: keyword.value,
        clientPort: 0
      }))
    }
  }
  
  function startWebSocket() {
    if ("WebSocket" in window) {
      ws = new WebSocket(WEBSOCKET_URL);
      ws.onopen = function() {
        //alert('websocket is open')
      }
      ws.onmessage = async function (evt) {
        const message = await evt.data.text();
        const json = JSON.parse(message);
        json.url = "http://[" + json.ipAddress + "]:" + json.port;
        results.value.push(json);
      }
    }
  }

  function successFunc(position) {
    location = position;
    alert(location);
  }

  function failFunc(error) {
    const err = error.code + ":" + error.message;
    alert(err);
  }

  function getLocation() {
    if (navigator.geolocation) {
      //navigator.geolocation.getCurrentPosition(successFunc, failFunc);
      //todo get geography location by gps
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
  <div>
    <div>
      <select id="module-name" v-model="module_name">
        <option value="MED">超媒体</option>
        <option value="WEB">网页</option>
      </select>
      <input id="keyword-input" type="text" v-model="keyword">
      <button id="sense-button" @click="sense">感知</button>
    </div>
    <div>
      <a v-for="result in results" :href = result.url><img width=50 height= 50  :src=result.iconUrl>{{ result.title }},{{ result.description }}</a>
    </div>
  </div>
</template>

<style scoped>
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

#keyword-input, #module-name{
  margin: 0.5em;
  font-size: x-large;
}
#sense-button {
  margin: 0.5em;
}

a {
  display: block;
  font-size: x-large;
}

img {
  transform: rotate(-90deg);
}
</style>
