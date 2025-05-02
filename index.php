<?php
error_reporting(0);
// 获取浏览器信息
$ua = $_SERVER['HTTP_USER_AGENT'];
// 检测浏览器类型和内核版本
$isChrome = preg_match('/Chrome\/(\d+)/', $ua, $chromeMatch);
$isFirefox = preg_match('/Firefox\/(\d+)/', $ua, $firefoxMatch);
// 苹果设备
$isAppleDevice = preg_match('/Mac/i', $ua);
$isAppleWebKit = preg_match('/AppleWebKit\/(\d+)/', $ua, $AppleWebKitMatch);
// 内核版本要求
$minChromeVersion = 80;
$minFirefoxVersion = 85;
$minAppleWebKitVersion = 605;
// 显示提示并退出
function showError($message, $ua) {
    // 转义处理消息（保留<br>标签）
    $safeMessage = implode('<br>', array_map(
        function($part) {
            return htmlspecialchars($part, ENT_QUOTES, 'UTF-8');
        },
        explode('<br>', $message)
    ));
    // 转义UA字符串
    $safeUa = htmlspecialchars($ua, ENT_QUOTES, 'UTF-8');
    echo '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#f00;color:white;font-size:30px;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;text-align:center;padding:20px;">
            <svg width="168" height="168" viewBox="0 0 24 24" style="margin-bottom:20px">
                <path fill="white" d="M12 2L1 21h22M12 6l7.5 13H4.5M11 10v4h2v-4m0 6v2h-2v-2"/>
            </svg>
            <p>' . $safeMessage . '<br><br><small style="font-size:16px">' . $safeUa . '</small></p>
          </div>';
    exit;
}
// 检查浏览器内核版本
if ($isChrome && ((int)$chromeMatch[1] < $minChromeVersion)) {
    if (isset($_GET['app']) && $_GET['app'] == "yes") {
        showError('当前设备系统Chrome内核版本过低<br><br>App无法正常启动,请尝试升级系统或换个设备安装App,请谅解!', $ua);
    } else {
        showError('当前浏览器Chrome内核版本过低<br><br>请升级浏览器之后重新打开访问即可恢复正常', $ua);
    }
} elseif ($isFirefox && ((int)$firefoxMatch[1] < $minFirefoxVersion)) {
    showError('当前浏览器Firefox内核版本过低<br><br>请升级浏览器之后重新打开访问即可恢复正常', $ua);
} elseif ($isAppleDevice && ((int)$AppleWebKitMatch[1] < $minAppleWebKitVersion)) {
    showError('当前苹果设备浏览器内核版本过低<br><br>请升级系统之后重新打开访问即可恢复正常', $ua);
} elseif (!$isChrome && !$isFirefox && !$isAppleDevice) {
    showError('当前浏览器无法正常加载数据<br><br>请更换浏览器并使用极速模式(Chrome内核)访问即可恢复正常', $ua);
}
// 只有符合要求的浏览器才会继续加载数据
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <script>
        // 标题请打开title.js文件修改,在此添加<title>标题</title>无效
        document.write('<script src="title.js?' + Date.now() + '"><\/script>');
        // 动态更新viewport
        function updateViewport() {
            const width = Math.round(screen.width * (window.devicePixelRatio || 1));
            let meta = document.querySelector('meta[name="viewport"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = "viewport";
                document.head.appendChild(meta);
            }
            meta.content = `width=${width}`;
        }
        // 初始设置
        updateViewport();
        // 屏幕发生旋转执行更新viewport（延迟确保方向更新）
        window.addEventListener('orientationchange', function() {
            setTimeout(updateViewport, 100);
        });
    </script>
    <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta http-equiv="Refresh" content="3600">
    <link rel="icon" href="favicon.ico" type="image/x-icon">
    <link rel="preload" href="global.css?v=1.1" as="style" onload="this.rel='stylesheet'">
    <link rel="preload" href="map.css?v=1.1" as="style" onload="this.rel='stylesheet'">
    <link rel="preload" href="other.css?v=1.1" as="style" onload="this.rel='stylesheet'">
    <noscript>
        <link rel="stylesheet" href="global.css?v=1.1">
        <link rel="stylesheet" href="map.css?v=1.1">
        <link rel="stylesheet" href="other.css?v=1.1">
        <style>
        .noscript-alert {
            position:fixed;
            top:0; left:0;
            width:100%; height:100%;
            background:#f00;
            color:white;
            font-size:30px;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            z-index:9999;
            text-align:center;
            padding:20px;
        }
        </style>
        <div class="noscript-alert">
            <svg width="168" height="168" viewBox="0 0 24 24" style="margin-bottom:20px">
                <path fill="white" d="M12 2L1 21h22M12 6l7.5 13H4.5M11 10v4h2v-4m0 6v2h-2v-2"/>
            </svg>
            <p>启用JavaScript功能才能正常加载数据<br><br>当前设备设置了禁止运行JavaScript,请重新设置。</p>
        </div>
    </noscript>
    <style>
        /* 全屏+刷新按钮 */
        #fullscreen,#refresh {
            position: fixed;
            top: 16px;
            right: 19px;
            width: 77px;
            height: 40px;
            z-index: 1000;
            box-sizing: border-box;
            background: #333;
            color: white;
            border: none;
            padding: 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        /* 主菜单 */
        .right_nav {
            position: fixed;
            top: 57px;
            right: 19px;
            width: 77px;
            z-index: 1000;
            box-sizing: border-box;
        }
        /* 菜单列表样式 */
        .right_nav > ul {
            list-style: none;
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 4px;
            overflow: hidden;
            height: 35px; /* 初始只显示一项的高度 */
            transition: height 0.3s ease;
        }
        /* 悬停时展开全部菜单项 */
        .right_nav:hover > ul {
            height: 325px; /* 菜单项的总高度 */
        }
        /* 菜单项样式 */
        .right_nav li {
            padding: 8px;
            text-align: center;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        /* 菜单项悬停效果 */
        .right_nav li:hover {
            background-color: rgba(255, 255, 255, 0.1);
        }
        /* 链接样式 */
        .right_nav a {
            color: white;
            text-decoration: none;
            display: block;
            font-size: 14px;
        }
        /* 当前选中项样式 */
        .right_nav li.active {
            background-color: rgba(255, 255, 0, 0.2);
        }
        /* 选中悬停时的文字颜色 */
        .right_nav li.active a,
        .right_nav li:hover a {
            color: #FFEB3B;
        }
        /* 提示 */
        #tishi {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            z-index: 1000;
            text-align: center;
        }
    </style>
</head>
<body class="has-map" style="margin:0" bgcolor="#ffffff">

<div class="qqsj">
    <div class="qqsjl">
        <div class="qqsjlt">全球时间</div>
        <ul class="qqsjll">
          <li><span class="icon icon_cn"></span>北京 <span id="time_bj" class="qqsjtime"></span></li>
          <li><span class="icon icon_uk"></span>伦敦 <span id="time_ld" class="qqsjtime"></span></li>
          <li><span class="icon icon_us"></span>纽约 <span id="time_ny" class="qqsjtime"></span></li>
        </ul>
    </div>
    <div class="zshq" id="zshq">
        <div style="display: flex; justify-content: center; align-items: center; height: 100%;">正在加载全球市场行情数据...</div>
    </div>
</div>

<ul class="right_nav">
    <ul>
        <li class="active"><a>A股全图</a></li>
        <li><a>上证A股</a></li>
        <li><a>深证A股</a></li>
        <li><a>北证A股</a></li>
        <li><a>创业板</a></li>
        <li><a>科创板</a></li>
        <li><a>ST板块</a></li>
        <li><a>可转债</a></li>
        <li><a>ETF</a></li>
    </ul>
</ul>
<select id="select-change" hidden>
    <option value="zdf" selected="selected" color="">涨跌幅</option>
</select>

<?php if ( (isset($_GET['app']) && $_GET['app'] == "yes") || strpos($ua, 'Mobile') !== false || strpos($ua, 'Android') !== false || strpos($ua, 'Mac') !== false ) { echo '<button id="refresh" onclick="if(confirm(\'画面没有全黑的情况下系统会自动刷新无需手动操作,确定要手动刷新吗?\')){location.reload();}">数据刷新</button><button id="fullscreen" hidden></button>'; }else { echo '<button id="fullscreen">全屏模式</button>'; } ?>

<div class="content map">
    <div class="container is-wide">
        <div class="view" hidden>
            <div class="zoom"></div>
        </div>
        <div class="map-scan">
            <div class="content-view-map">
                <div id="map" class="map" style="background:#252931">
                    <div id="body">
                        <div id="mask">
                            <div style="margin-top: 200px; font-size: 20px; color: white;">
                                <div class="loading" style="float:left;"></div>
                                <span>大A数据加载中，请耐心等待...</span>
                            </div>
                        </div>
                    </div>
                    <div id="legend"></div>
                    <div id="hover-wrapper"></div>
                </div>
            </div>
        </div>
        <div id="modal"></div>
    </div>
</div>

<div id="tishi" class="tishi">
    <h3>成交额越大面积越大，画面变化6秒/次，喜欢可赞赏支持~</h3>
    <p><img src="https://www.agwdj.com/tishi.png" style="width: auto; height: 150px;"></p>
    <p>大A市场5000+个股同屏显示,数据加载速度取决于您当前设备性能。</p>
    <p>设备性能较弱时,频繁缩放或快速滑动会导致明显卡顿,请减少此类操作。</p>
    <button onclick="alert('\n赞赏码是维持程序运行所需流量费的唯一来源,非赞赏用户不能关闭！\n\n赞赏用户可发赞赏截图及联系方式到邮箱agwdj@foxmail.com申请!')">永久关闭此提示</button>
    <button id="hidetishi">好的,我知道了!</button>
</div>

<script src="global.js?v=1.1"></script>
<script src="jquery.min.js?v=1.1"></script>
<script src="d3.min.js?v=1.1"></script>
<script src="hammer.min.js?v=1.1"></script>
<script src="react-with-addons.min.js?v=1.1"></script>
<script src="market.js?v=1.1"></script>
<script src="data.js?v=1.1"></script>
<script src="tongji.js?v=1.1"></script>

<script>
// 禁用右键菜单
document.addEventListener('contextmenu', function(e) {
    if (e.pointerType === 'mouse' && e.button === 2) {
        e.preventDefault();
        return false;
    }
});

// 快捷键拦截
document.addEventListener('keydown', function(e) {
    const isBlocked = 
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) || 
        (e.ctrlKey && e.key === 'u') ||
        (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(e.key)); // Mac支持

    if (isBlocked) {
        e.preventDefault();
        window.location.href = "about:blank";
    }
});

// 控制台提示
(function() {
    setInterval(function() {
        try { (function() { return false; }.constructor("debugger").call()); } 
        catch(e) {}
    }, 1000);

    const spamConsole = () => {
        console.clear();
        console.log("%c 此页面文件受保护，禁止调试！", "color:red;font-size:30px;");
        for(let i=0; i<100; i++) console.log("%c 修改任何一个字符都会数据异常！", "color:red;font-size:30px;");
    };
    setInterval(spamConsole, 3000);
})();

// 全屏模式
const btn = document.getElementById('fullscreen');
function updateButtonText() {
    btn.textContent = (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    ) ? '退出全屏' : '全屏模式';
}
btn.addEventListener('click', () => {
    const docEl = document.documentElement;
    const requestFs = 
        docEl.requestFullscreen || 
        docEl.webkitRequestFullscreen || 
        docEl.mozRequestFullScreen || 
        docEl.msRequestFullscreen;
    if (!document.fullscreenElement) {
        requestFs?.call(docEl).then(() => {
            $('#tishi').fadeOut();
        }).catch(err => {
            console.error('全屏失败:', err);
            alert('您当前加载数据的环境不允许全屏！');
        });
    } else {
        document.exitFullscreen();
    }
});
// 监听所有类型浏览器前缀的全屏变化事件
['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
    document.addEventListener(evt, updateButtonText);
});

// 关闭提示
$(document).ready(function() {
    $(document).on('click', '#hidetishi', function() {
        $('#tishi').fadeOut();
    });
});
</script>

</body>
</html>
