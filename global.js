// 检查URL参数判断是否通过app访问
var urlParams = new URLSearchParams(window.location.search);
var isAppMode = urlParams.get('app') === 'yes';
// 检查UA判断是否是移动设备
var userAgent = navigator.userAgent || '';
var isMobileDevice = /Mobile|Android|Mac/i.test(userAgent);
// 组合条件：如果通过app访问或者是移动设备
var shouldUseMobileBehavior = isAppMode || isMobileDevice;

// 全球时间
function initGlobalTime() {
  function updateTimes() {
    const now = new Date();
    document.getElementById('time_bj').textContent = formatTime(now);
    
    // 伦敦时间（北京时间-7小时）
    const londonTime = new Date(now.getTime() - 7 * 60 * 60 * 1000);
    document.getElementById('time_ld').textContent = formatTime(londonTime);
    
    // 纽约时间（北京时间-12小时）
    const newyorkTime = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    document.getElementById('time_ny').textContent = formatTime(newyorkTime);
  }
  
  function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  // 立即更新时间
  updateTimes();
  // 每秒更新时间
  setInterval(updateTimes, 1000);
}

// 全球实时行情
function initStockMarket() {
  
  const apiUrl = 'https://push2.eastmoney.com/api/qt/ulist.np/get?secids=1.000001,0.399001,0.399006,1.000688,0.899050,1.000016,1.000300,1.000905,100.DJIA,100.NDX,100.SPX,100.GDAXI,100.FCHI,100.FTSE,100.MCX,100.TSX,100.MXX,100.BVSP,100.OSEBX,100.PSI20,100.HEX,100.BFX,100.PX,100.HSI,124.HSTECH,134.HSI_M,100.TWII,100.N225,100.KS11,100.KOSPI200,100.KLSE,100.STI,100.PSI,100.JKSE,100.VNINDEX,100.SET,100.SENSEX,100.KSE100,100.CSEALL,100.MIB,100.AXX,100.ISEQ,100.OMXSPI,00.OMXC20,100.ATX,100.OMXC20,100.CRB,104.CN00Y,8.070120,8.060120,101.GC00Y,102.CL00Y,133.USDCNH,100.UDI,112.B00Y,103.YM00Y,103.NQ00Y,103.ES00Y,100.AS51,100.AORD,100.NZ50,100.RTS,100.SX5E,100.ASE,100.IBEX,100.SSMI,100.AEX,100.WIG,100.ICEXI,100.BDI&fields=f1,f2,f3,f4,f12,f13,f14,f107,f152&ut=6d2ffaa6a585d612eda28417681d58fb';
  
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.rc == 0 && data.data && data.data.diff) {
        // 将数据分成三部分
        const chunkSize = Math.ceil(data.data.diff.length / 3);
        const html = [];
        html.push(makeHTML(data.data.diff.slice(0, chunkSize)));
        html.push(makeHTML(data.data.diff.slice(chunkSize, chunkSize * 2)));
        html.push(makeHTML(data.data.diff.slice(chunkSize * 2)));
        document.getElementById('zshq').innerHTML = html.join('');
      } else {
        document.getElementById('zshq').innerHTML = '<div style="padding:10px;">加载全球市场行情数据失败，请稍后再试...</div>';
      }
    })
    .catch(error => {
      console.error('Error fetching stock data:', error);
      document.getElementById('zshq').innerHTML = '<div style="padding:10px;">加载全球市场行情数据失败: ' + error.message + '</div>';
    });
}

// 生成HTML
function makeHTML(array) {
  var html = ['<ul>'];
  
  array.forEach(function (v) {
    var classname = 'icon_close';
    if (v.f107 == 1 || v.f107 == 2 || v.f107 == 4) {
      classname = 'icon_open';
    }
    var updown = 'draw';
    if (typeof v.f4 === 'number') {
      if (v.f4 > 0) {
        updown = 'up';
      }
      if (v.f4 < 0) {
        updown = 'down';
      }
    }
    
    if (shouldUseMobileBehavior) { // 通过app访问或者是移动设备,输出无链接样式
      html.push('<li><span class="icon ' + classname + '"></span> ' + v.f14 + '&nbsp;&nbsp;<span class="stock' + updown + '">' + (v.f2 / Math.pow(10, v.f1)).toFixed(v.f1) + '</span>&nbsp;&nbsp;<span class="stock' + updown + '">' + (v.f4 / Math.pow(10, v.f1)).toFixed(v.f1) + '</span>&nbsp;&nbsp;<span class="stock' + updown + '">' + (Math.abs(v.f3) / 100).toFixed(v.f152) + '%</span></li>');
    } else { // 正常PC模式带打开链接样式
      html.push('<li><a href="https://www.agwdj.com/url.php?lx=global&dm=' + v.f13 + '.' + v.f12 + '&url=' + window.location.href + '" target="_blank"><span class="icon ' + classname + '"></span> ' + v.f14 + '&nbsp;&nbsp;<span class="stock' + updown + '">' + (v.f2 / Math.pow(10, v.f1)).toFixed(v.f1) + '</span>&nbsp;&nbsp;<span class="stock' + updown + '">' + (v.f4 / Math.pow(10, v.f1)).toFixed(v.f1) + '</span>&nbsp;&nbsp;<span class="stock' + updown + '">' + (Math.abs(v.f3) / 100).toFixed(v.f152) + '%</span></a></li>');
    }
  });
  html.push('</ul>');
  return html.join('');
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  // 立即初始化时间和行情
  initGlobalTime();
  initStockMarket();
  
  // 每6秒刷新一次数据
  setInterval(initStockMarket, 6000);
});