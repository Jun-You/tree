<script setup>
import coordtransform from 'coordtransform'
  import { ref ,onMounted} from "vue";
  import imgs from "../src/assets/imgs.png"
  import start from "../src/assets/start.png"
  import x from "../src/assets/x.png"

  import end from "../src/assets/end.png"

  import search from "../src/assets/search.png"
  import AMapLoader from '@amap/amap-jsapi-loader';
  var markers = []
  var mouseTool=ref('');
  var previousStep=ref(null)
  var mapShowType=ref(false)
  var Polygons= ref("")
  //const WEBSOCKET_URL = "ws://[2408:820c:8f7f:28c0:20c:29ff:fe94:ca49]:2345"
  const WEBSOCKET_URL = "wss://www.shugan.tech/wss/"
  let ws = null;
  //let location = {lng:121.5418864,lat:31.3687324,alt:75.2253417,acc:4.2347331,acc_v:2.5}; // update location by gps
  let location = ref(null);
  let senseRange = ref(800);
  var keyword = ref('');
  var module_name = ref('MED');
  var results = ref([]);
  let displayIcp = ref(true);
  let message = null;
  let downType = ref(1)
  let areaType = ref(1); // 1 for range, 2 for polygon
  //let longitudes = [121,122,122,121];
  //let latitudes = [31,31,32,32];
  let longitudes = null;
  let latitudes = null;
  let AMap=''
  let map=''
  let circle=''
  let map1=""
  var circle1=''
  function navUrl(url){
    window.location.href = url;
  }
  function alertText(params) {
    alert(params)
  }
  function sense() {
    document.getElementsByClassName("btmSty")[0].style.top='50px'
    switch(areaType.value) {
      case 1:senseByRange();
            break;
      case 2:senseByPolygon();
            break;
      default:
            break;
    }
    
  }

  function senseByRange() {
    results.value = [];
    if (location.value === null) {
      alert("获取位置失败")
      return
    }
   let loc={...location.value}
   let wgs84= coordtransform.gcj02towgs84(loc.lng,loc.lat)
   loc.lng=wgs84[0]
   loc.lat=wgs84[1]
    message = JSON.stringify({
      command: 'sense',
      areaType: 1,
      gps: loc,
      senseRange: senseRange.value,
      uuid: '0eb25ca4-8b72-49d2-a7c3-1e44f13d3d9a', //todo generate uuid randomly
      targetName: module_name.value,
      targetNamespace: 'STD',
      matchKeyword: keyword.value,
      clientPort: 0
    });

    updateBtn();

    if (ws.readyState !== WebSocket.OPEN) {
      startWebSocket();
      return
    }
    
    ws.send(message)
    message = null;
    displayIcp.value = false;
  }

  function senseByPolygon() {
    results.value = [];
    if (null === longitudes || longitudes.length < 3) {
      alert('未正确选择范围');
      return;
    }
    let lngs=[]
    let lats=[]
    latitudes.map((lat,index)=>{
   let wgs84= coordtransform.gcj02towgs84(longitudes[index],lat)
      lngs.push(wgs84[0])
      lats.push(wgs84[1])
    })
    message = JSON.stringify({
      command: 'sense',
      areaType: 2,
      longitudes: lngs,
      latitudes: lats,
      uuid: '0eb25ca4-8b72-49d2-a7c3-1e44f13d3d9a', //todo generate uuid randomly
      targetName: module_name.value,
      targetNamespace: 'STD',
      matchKeyword: keyword.value,
      clientPort: 0
    });

    updateBtn();

    if (ws.readyState !== WebSocket.OPEN) {
      startWebSocket();
      return
    }
    
    ws.send(message)
    message = null;
    displayIcp.value = false;
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
        // console.log(message)
        const json = JSON.parse(message);
        json.url = `http://[${json.ipAddress}]:${json.port}`;
        //json.url = `http://interface.shugan.tech/supermedia/${json.ipAddress.replaceAll(':','-')}/${json.port}`;
        //const filename = json.iconUrl.split('/icon/')[1].replaceAll('/', '-');
        //json.iconUrl = `https://www.shugan.tech/icon/${filename}.jpg`;
        const path = json.iconUrl.split('/icon/')[1];
        json.iconUrl = `https://www.shugan.tech/icon/${path}`;
        results.value.push(json);
      }
    }
  }
  function successFunc(data) {
    // let lnglats=data.position.split(',')
    //  alert(data.position.getLng()+'---'+data.position.getLat())   
    location.value = {lng: data.position.getLng(), lat: data.position.getLat(), alt:0, acc:data.accuracy, acc_v:0};
    
    // const coordinates = position.coords;

    // AMap.convertFrom([coordinates.longitude,coordinates.latitude], "gps", function (status, result) {
    // if (status === "complete" && result.info === "ok") {
    //   var lnglats = result.locations; 
    //   location.value = {lng: lnglats[0].lng, lat: lnglats[0].lat, alt:coordinates.altitude, acc:coordinates.accuracy, acc_v:coordinates.altitudeAccuracy};
      
    // }
    // });
  } 

  function failFunc(error) {
    const err =error.message;
    alert(err);
    location.value = null;
  }

  function getLocation() {
  var geolocation = new AMap.Geolocation({
          enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：5s
            buttonPosition:'RB',    //定位按钮的停靠位置
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
  })

      geolocation.getCurrentPosition(function(status,result){
            if(status=='complete'){
              successFunc(result)
            }else{
              failFunc(result)
            }
        })

        geolocation.watchPosition(function(status,result){
            if(status=='complete'){
              successFunc(result)
            }else{
              failFunc(result)
            }
        })
    // if (navigator.geolocation) {
    //   const options = {
    //     enableHighAccuracy: true,
    //     timeout: 5000,
    //     maximumAge: 0
    //     // provider:"amap",
    //     // coordsType:"gcj02",
    //     // Geolocation:true
    //   };
    //   navigator.geolocation.watchPosition(successFunc, failFunc, options);
    // } else {
    //   location.value = null;
    // }
  }

  function prepare() {
    
    startWebSocket();
    getLocation();
  }

  
  onMounted(()=>{

        AMapLoader.load({
        key: "38a3a9977699d79ce43064f6a836ddbd",              // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: ['AMap.MouseTool',"AMap.Polygon","AMap.Marker","AMap.Pixel","AMap.convertFrom","AMap.Geolocation"],           // 需要使用的的插件列表，如比例尺'AMap.Scale'等
        AMapUI: {
            version: '1.1', // AMapUI 缺省 1.1
            plugins: [] // 需要加载的 AMapUI ui插件
        },
        Loca: {
            // 是否加载 Loca， 缺省不加载
            version: '2.0.0' // Loca 版本，缺省 1.3.2
        }
    }).then((AMap1) => {
      AMap=AMap1
      prepare()
     


    }).catch((e)=>{
    });
  })
  function drawCircle(radius){
    document.getElementsByClassName("btmSty")[0].style.top='50px'
    let time=300
    if( document.getElementsByClassName("fullScreen")[0].style.height=='244px'){
      time=0
    }
    document.getElementsByClassName("fullScreen")[0].style.height='244px'
    
    setTimeout(() => {
      
    if (location.value === null) {
      alert("获取位置失败")
      return
    }
    var latitude =  location.value.lat//31.3687324//
      var longitude =location.value.lng//121.5418864//
    if(map==''){
      map = new AMap.Map("myMap1",{
          center: [longitude,latitude],
          zoom: 14
      }) 
    }
    if (navigator.geolocation) {
      // console.log("Latitude: ");
      try {
        circle.remove()
      } catch (error) {        
      }
      try {
        circle1.remove()        
        
      } catch (error) {
        
      }
      circle1 = new AMap.Circle({
            center: [longitude,latitude], //圆心
            radius, //半径
            borderWeight:0, //描边的宽度
            strokeColor: "#FF33FF", //轮廓线颜色
            strokeOpacity: 1, //轮廓线透明度
            strokeWeight: 1, //轮廓线宽度
            fillOpacity: 0.4, //圆形填充透明度
            strokeStyle: "solid", //轮廓线样式
            strokeDasharray: [10, 10],
            fillColor: "#1791fc", //圆形填充颜色
            zIndex: 50, //圆形的叠加顺序
          });
          map.add(circle1);
          map.setFitView([ circle1 ])
        // console.log("Latitude: " + latitude + ", Longitude: " + longitude);


    } else {
    }
  }, time);
  }
  function cancelDraw(){
    try {
      if(mouseTool.overlays.polygon[0]._opts.path.length!=0){
      map1.remove(markers);
      markers=[]
      mouseTool.close(true)
      // destroyMap()
      return
    }
    } catch (error) {
      
    }
   


    document.getElementsByClassName("btmSty")[0].style.top='50px'
    try {
      var latitude =  location.value.lat//31.3687324//
      var longitude =location.value.lng//121.5418864//
      map = new AMap.Map("myMap1",{
          center:[longitude,latitude],
          zoom: 20
      })
    } catch (error) {
      map = new AMap.Map("myMap1",{
          zoom: 20
      })
    }


    if(previousStep.value!=null&&previousStep.value!=-1){
      senseRange.value=previousStep.value
      drawCircle(previousStep.value)
    }

   
      mapShowType.value=false

  }
  function closePolygon(){
    document.getElementsByClassName("btmSty")[0].style.top='50px'

    let path=[]
    try {
    path=mouseTool.overlays.polygon[0]._opts.path
      
    } catch (error) {
      mapShowType.value=false
      return
    }
    longitudes=[]
    latitudes=[]
    path.map(e=>{
      longitudes.push(e[0])
      latitudes.push(e[1])
    })

    mouseTool.close(false)
    map1.destroy()


    setTimeout(() => {
      map = new AMap.Map("myMap1",{
          center:path[0],
          zoom: 20
      })
      circle = new AMap.Polygon({
            path,
            strokeColor: "#FF33FF", 
            strokeOpacity: 1,
            strokeWeight: 6,
            strokeOpacity: 0.2,
            fillColor: '#1791fc',
            fillOpacity: 0.4,
            // 线样式还支持 'dashed'
            strokeStyle: "solid",
        });
        // console.log(circle)
        map.add(circle);
        map.setFitView([ circle ])
    }, 0);
    mapShowType.value=false
  }
  function destroyMap(params) {
    document.getElementsByClassName("fullScreen")[0].style.height='244px'

    //清除map组件
    try {
      map.destroy()
    } catch (error) {
      
    }
    setTimeout(() => {
      map1 = new AMap.Map("myMap2",{
          center:location.value?[location.value.lng,location.value.lat]:[121.5418864,31.3687324],
          zoom: 14
      })
      
      map1.on('click', function(e) {
        setTimeout(() => {
        down1()
          
        }, 0);
      })

    }, 0);
    
  }
  function down1(){
    if(mouseTool.overlays.polygon.length!=0&&downType.value==2){
       let marker = new AMap.Marker({
          position: mouseTool.overlays.polygon[0]._opts.path[mouseTool.overlays.polygon[0]._opts.path.length-1]
        });
        markers.push(marker)
        marker.setMap(map1);
    }
       
  }
  function drawPolygon () {
   
    mouseTool = new AMap.MouseTool(map1)

    mouseTool.polygon({
        strokeColor: "#FF33FF", 
        strokeOpacity: 1,
        strokeWeight: 6,
        strokeOpacity: 0.2,
        fillColor: '#1791fc',
        fillOpacity: 0.4,
        // 线样式还支持 'dashed'
        strokeStyle: "solid",
        // strokeStyle是dashed时有效
        // strokeDasharray: [30,10],
      })
    }
//  window.onload = prepare;

  /**
  let port = null;
  let reader = null;
  let writer = null;
  const filters = [
    { usbVendorId: 0xbabe, usbProductId: 0x1314 }
  ];

  async function setting(){
    if ('serial' in navigator) {
      try{
        port = await navigator.serial.requestPort({ filters });
        
      } catch(err){
        console.log(err)
      }
      if (port !== null) {
        await port.open({baudRate: 12800})
        while (port.readable) {
          reader = port.readable.getReader();

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) {
                // 允许稍后关闭串口。
                //reader.releaseLock();
                break;
              }
              if (value) {
                console.log(value);
              }
            }
          } catch (error) {
            // TODO: 处理非致命的读错误。
          }
        }
        //reader = port.readable.getReader();
      } else {
      }
    }
  }

  */



</script>

<template>
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
    <!--
    <div>
      <button id="setting" @click="setting">设置</button>
    </div>
    -->
    <div style="text-align: center;width: 343;padding-top: 50px;box-sizing:border-box;">
      <img :src="imgs" alt="" style="width: 188px;height: auto;">

    </div>
    </div>
    
    <div>

      <div class="btmSty">
        <div id="myMap1" class="fullScreen">
        
      </div>
  <div class="centerSearchSty" style="background-color: #fff;">
      
      <div>
        <div style="padding: 0 7px;box-sizing: border-box;display: flex;align-items: center;">
          <img :src="search" style="width: 25px;" alt="">
        </div>
        <div>
          <input placeholder="请输入感知内容" id="keyword-input" type="text" v-model="keyword">
        </div>
      </div>
      <div @click="(location!=null&&areaType==1)||(longitudes!=null&&areaType==2)?(sense()):alertText('正获取位置或自定义选择位置')" :style="(location!=null&&areaType==1)||(longitudes!=null&&areaType==2)?'':'filter: grayscale(100%);'">
        {{ (location!=null&&areaType==1)||(longitudes!=null&&areaType==2)?'感知':'定位中' }}
      </div>
      </div>  
      <div class="tabsSty">
        <div :class="senseRange==200?'Selected':''" @click="senseRange=200,areaType=1,drawCircle(200)" >
          <div>超近</div>
          <div></div> 
        </div>
        <div :class="senseRange==400?'Selected':''" @click="senseRange=400,areaType=1,drawCircle(400)">
          <div>近</div>
          <div></div> 
        </div>
        <div :class="senseRange==800?'Selected':''" @click="senseRange=800,areaType=1,drawCircle(800)">
          <div>中</div>
          <div></div>
        </div>
        <div :class="senseRange==2000?'Selected':''" @click="senseRange=2000,areaType=1,drawCircle(2000)">
          <div>远</div>
          <div></div>
        </div>
        <div :class="senseRange==5000?'Selected':''" @click="senseRange=5000,areaType=1,drawCircle(5000)">
          <div>超远</div>
          <div></div>
        </div>
        <div :class="senseRange==-1?'Selected':''" @click="previousStep=senseRange,senseRange=-1,areaType=2,destroyMap(),mapShowType=true">
          <div>自定义</div>
          <div></div>
        </div>
      </div>
      
      
      <div style="min-height: 40vh;">
        
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
    

      <div v-if="displayIcp" style="color: #ccc;text-align: center;padding-bottom: 50px;">
        <a href="http://beian.miit.gov.cn/" style="font-size: 15px;color: #ccc;">
          沪ICP备2024053151号

        </a>
       </div>

    </div>

      </div>
      <div @click="" class="popSty" v-if="mapShowType">
        <div id="myMap2" style="width: 100vw;height: 100vh;"></div>
       
        <div class="popSty1">
          <div @click="downType=1,areaType=1,cancelDraw()" >
            <div>
              <img :src="x" alt="" srcset="" style="width:70px ;">
            </div>
            <div>
              取消
            </div>
          </div>
          <div @click="downType=2,drawPolygon()" v-if="downType==1">
            <div>
              <img :src="start" alt="" srcset="" style="width:70px ;">
            </div>
            <div>
              开始绘制
            </div>
          </div>
          <div @click="closePolygon(),downType=1" v-if="downType==2">
            <div style="padding-top: 10px;box-sizing: border-box;">
              <img :src="end" alt="" srcset="" style="width:70px ;">
            </div>
            <div>
              完成绘制
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<style scoped>
#container{
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}
.popSty{
  width: 100vw;
  height: 100vh;
  position: fixed;
  bottom: 0;
  left: 0;

}
.fullScreen{
  width: 343px;
  height: 0;
  margin: 0 auto;
  margin-bottom: 15px;
}
.smallFcreen{
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}
.popSty1{
  width: 100%;
  height: 30%;
  position: fixed;
  bottom: 0;
  left: 0;
  background: linear-gradient( 180deg, rgba(219,226,234,0) 0%, rgba(130,143,167,0.8) 16%);
  display: flex;
  align-items: center;
  justify-content: center;
}
/* .popSty1>:nth-child(1){
  width: 20px;
  height: 20px;
  background-color: #fff;
  border-radius: 50%;
  position: absolute;
  right: 30px;
  top: 50px;
  display: flex;
  justify-content: center;
  align-items: center;

} */

.popSty1>:nth-child(2),.popSty1>:nth-child(1){
  width: 120px;
  height: 120px;
  background: #FFFFFF;
  border-radius: 50%;
  color: #131313;
}
.popSty1>:nth-child(2):active,.popSty1>:nth-child(1):active{
  opacity: .7;
}
.popSty1>:nth-child(2){
  margin-left: 15px
}
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
