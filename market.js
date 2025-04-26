// 交易时间判断函数
function isTradingTime() {
    var now = new Date();
    var day = now.getDay();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var currentTime = hours * 100 + minutes;
    
    // 周末不交易（0=周日，6=周六）
    if (day === 0 || day === 6) return false;
    // 交易时间段判断
    // 上午时段：9:15-11:30 下午时段：13:00-15:00（因用户画面需过渡上一交易日数据,所以设置912提前更新数据）
    return (currentTime >= 912 && currentTime <= 1130) || (currentTime >= 1300 && currentTime <= 1500);
}

// 核心变量声明
var treemap, lastCode, zntyMapPerf = {},
    tmpCode = "ALL",
    zntyMapAdditional = {},
    isRefreshing = false,
    isManualResize = false; // 是否为手动resize

// 数据初始化
function initD3Data() {
    treemap = null;
    zntyMapPerf = {};
    zntyMapAdditional = {};
}

// 主绘图函数
function drawMap(s, c) {
    // 非交易时间段跳过更新（首次加载或resize事件不受交易时间限制）
    if(!c && !isManualResize && lastCode === tmpCode && !isTradingTime()) {
        console.log("非交易时段(9:15-11:30,13:00-15:00),暂停更新markets");
        return;
    }
    
    if (isRefreshing) return;
    
    try {
        // 直接显示容器
        var container = d3.select("#map-container");

        // 容器尺寸计算
        var e = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 10;
        $(".narrow").is(":visible") || (e -= 100),
        $("#body").height(e);
        var d = $("#body").width(),
            a = $(".map_scale").outerWidth(!0);
        $(".zn_tip").width(d - a - 10),
        
        // 初始化treemap布局
        treemap = d3.layout.treemap()
            .sort((a,b) => a.scale - b.scale)
            .size([d, e])
            .value(d => d.scale)
            .padding(d => d.depth === 1 ? [17,1,1,1] : d.depth === 2 ? [12,1,2,1] : 0);
            
            // 数据加载逻辑
            var t = null;
            switch (tmpCode) {
                case "":
                    tmpCode = "ALL";
                case "ALL":
                case "SH":
                case "SZ":
                case "BJ":
                case "CY":
                case "KC":
                case "ST":
                case "KZZ":
                case "ETF":
                // 优先读取缓存
                var cachedData = getLocalStorageWithExpiration(tmpCode);
                if (cachedData) {
                    processMapData(JSON.parse(cachedData));
                    break;
                }
                // 请求市场数据
                isRefreshing = true;
                $.ajax({
                    url: "https://market.agwdj.com/market.php?code="+tmpCode+"&url="+window.location.href,
                    type: "GET",
                    dataType: "json",
                    success: function(e) {
                        if (e?.data) {
                            setLocalStorageWithExpiration(tmpCode, JSON.stringify(e.data), 1);
                            processMapData(e.data);
                            lastCode = tmpCode;
                        }
                    },
                    complete: function() {
                        isRefreshing = false;
                    }
                });
            }
            
        // 数据处理
        function processMapData(e) {
            if (!e) return;
            try {
                var nodes = treemap.nodes(e),
                    perfData = {},
                    dateData = {};
                
                nodes.forEach(node => {
                    if (node.condition) {
                        if ("act_date" == $("#select-change").val()) {
                            var date = new Date(node.condition);
                            node.condition = new Date() < date ? -1 : 1;
                            dateData[node.name] = dateFormatUtil(date);
                        }
                        perfData[node.name] = node.condition;
                    }
                });
                
                if ("act_date" == $("#select-change").val()) {
                    zntyMapAdditional = dateData;
                }
                zntyMapPerf = perfData;
                
                zntyInitMap(d, nodes[0], s, c);
            } catch (err) {
                console.error("数据处理错误:", err);
                initD3Data();
            }
        }
    } catch (error) {
        console.error("绘制地图错误:", error);
        initD3Data();
    } finally {
        isManualResize = false; // 重置标记
    }
}

// 安全刷新（含交易时间判断）
function safeRefresh() {
    if (!isTradingTime()) return;
    !isRefreshing && drawMap(
        $("#select-change option:selected").attr("color"), 
        window.ignoreAuth
    );
}

// 页面初始化
$(function() {
    // 直接创建容器
    d3.select("body").append("div").attr("id", "map-container");
    
    // 初始化数据
    initD3Data();
    
    // 默认参数设置
    $("#select-change").val("zdf");
    drawMap("", true);
    
    // 事件绑定
    $("#select-change").change(function() {
        if ("zdf" != $(this).val()) {
            $(".square").addClass("square_disable")
                .attr("data-tips", "目前只有涨跌幅指标有当日复盘的功能哦~");
        } else {
            $(".square").removeClass("square_disable");
        }
        $(".bubSearchResult").hide();
        $(".left_inp1").val("");
        drawMap($(this).find("option:selected").attr("color"));
    });
    
    $(".right_nav li").click(function() {
        $(".bubSearchResult").hide();
        $(".left_inp1").val("");
        $(".right_nav li").removeClass("active");
        $(this).addClass("active");
        tmpCode = ["ALL","SH","SZ","BJ","CY","KC","ST","KZZ","ETF"][$(this).index()];
        drawMap($("#select-change option:selected").attr("color"));
    });
    
    $(window).resize(function() {
        isManualResize = true; // 标记为手动resize
        setTimeout(function() {
            drawMap(
                $("#select-change option:selected").attr("color"),
                window.ignoreAuth
            );
        }, 100);
    });
    
    // 每66.666秒自动刷新一次markets
    setInterval(safeRefresh, 66666);
});

// 以下是辅助函数
function restoreParents(a, e) {
    e && (a.parent = e),
    (a.children || []).forEach(function(e) {
        restoreParents(e, a)
    })
}

function createNode(e, a, t) {
    var n = new Object;
    return n.name = e,
    n.id = a,
    n.scale = t,
    n.children = [],
    n
}

function zntyRestorePerf(e) {
    void 0 !== zntyMapPerf[e.name] && (e.perf = zntyMapPerf[e.name]),
    void 0 !== zntyMapAdditional[e.name] && (e.additional = zntyMapAdditional[e.name]),
    (e.children || []).forEach(function(e) {
        zntyRestorePerf(e)
    })
}

function setLocalStorageWithExpiration(e, a, t) {
    t = t * 60 * 1000;
    t = {
        value: a,
        expiration: (new Date).getTime() + t
    };
    localStorage.setItem(e, JSON.stringify(t))
}

function getLocalStorageWithExpiration(e) {
    var a = JSON.parse(localStorage.getItem(e));
    return a ? (new Date).getTime() > a.expiration ? (localStorage.removeItem(e), null) : a.value: null
}

function zntyInitMap(e, a, t, n) {
    restoreParents(a),
    zntyRestorePerf(a),
    zntyInitCanvas(a, "sec", "", e, t, "", "", !0, n),
    ifAlertReadyTime()
}

function ifAlertReadyTime() {
    var e = (new Date).getDay(),
    a = (new Date).getHours(),
    t = (new Date).getMinutes();
    0 != e && 6 != e && (8 == a && 50 <= t || 9 == a && t < 15) && $("#select-change").val()
}

function getMonth(e) {
    var a = "";
    return (a = e.getMonth() + 1) < 10 && (a = "0" + a),
    a
}

function getDay(e) {
    var a = "";
    return (a = e.getDate()) < 10 && (a = "0" + a),
    a
}

function dateFormatUtil(e) {
    var a = "";
    return a += e.getFullYear(),
    a += "-" + getMonth(e),
    a += "-" + getDay(e)
}