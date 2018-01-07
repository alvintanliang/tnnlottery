// 全局变量：抽奖开始标记，定时器，当前选中的用户
var options = {
    moveSpeed: 20,
    showDlg: 700
}
var go = false;
var timer = null;
var current = 0;
var userels = [];


// 页面加载后的初始化:创建用户列表
function initialize() {
    var html = "";
    for (var index in users) {
        var user = users[index];
        html += '<div id="' + user.name + '" class="card bg-light card-me card-sm">';
        html +=     '<img class="card-img-top" src="data/' + user.image + '">';
        html +=     '<div class="card-body">' + user.name + '</div>';
        html += '</div>';
    }
    $(".user-list").empty().html(html);
}

// 根据JQUERY对象获取用户信息
function getUserFromEle(userEle) {
    var user = { name: "", image: "" };
    user.name = userEle.attr("id");
    user.image = userEle.children("img:first-child").attr("src");
    return user;
}

// 添加本次中奖用户到中奖区
function addToLuckList(userEle) {
    userEle.addClass("hidden").removeClass("card-focus");

    var user = getUserFromEle(userEle);
    var html = '<div id="' + user.name + '" class="card card-me card-md">';
    html +=     '<img class="card-img-top" src="' + user.image + '">';
    html +=     '<div class="card-body">' + user.name + '</div>';
    html += '</div>';
    $(".luck-bar").prepend(html);
}

// 从中奖区移到抽奖区
function removeFromLuckList(userEle) {
    var user = getUserFromEle(userEle);

    $(".user-list").children("#" + user.name).removeClass("hidden");

    userEle.remove();
}

// 显示中奖确认对话框
function showLotteryDialog() {
    var user = getUserFromEle(userels[current]);

    var userEl = $('#lotteryModal').find(".modal-content");
    userEl.children("img:first-child").attr("src", user.image);
    userEl.children("div.card-body").html(user.name);

    $('#lotteryModal').modal({
        backdrop: "static"
    });
}

// 抽奖时：在用户列表中快速移动
function move() {
    if (go) {
        if (current < userels.length - 1) {
            userels[current].removeClass("card-focus");
            current += 1;
            userels[current].addClass("card-focus");
        } else {
            userels[current].removeClass("card-focus");
            userels[0].addClass("card-focus");
            current = 0;
        }
    }
}

// 开始抽奖
function start() {
    $(".user-list .card").removeClass("card-focus");
    var tempList = $(".user-list").children(".card");
    for (var i = 0; i < tempList.length; i++) {
        var temp = $(tempList[i]);
        if (!temp.hasClass("hidden")) {
            userels.push(temp);
        }
    }
    current = 0;
    userels[0].addClass("card-focus");

    go = true;
    timer = setInterval(move, options.moveSpeed);
}

// 抽奖
function stop() {
    setTimeout(function() {
        go = false;
        setTimeout(function() {
            clearInterval(timer);
            timer = null;
    
            if (current) {
                showLotteryDialog();
            }
        }, options.showDlg);
    }, 200);
}

// 页面加载完毕后
$(document).ready(function(){
    initialize();

    $("button.action-start").click(function() {
        $("button.action-start").addClass("hidden");
        $("button.action-stop").removeClass("hidden");
        start();
    });
    
    $("button.action-stop").click(function() {
        $("button.action-start").removeClass("hidden");
        $("button.action-stop").addClass("hidden");
        stop();
    });

    $("button.action-sure").click(function() {
        $('#lotteryModal').modal('hide');
        addToLuckList(userels[current]);
    });
    
    $("button.action-continue").click(function() {
        $('#lotteryModal').modal('hide');
        $("button.action-start").click();
    });

    $(".user-list").children(".card-sm").dblclick(function(event) {
        // console.log(event);
        addToLuckList($(event.currentTarget));
    });

    $(".luck-bar").dblclick(function(event) {
        // console.log(element);
        var userEle = null;
        var target = $(event.target);
        if (target.hasClass("card-md")) {
            userEle = target;
        } else {
            userEle = target.closest("div.card-md");;
        }
        if (userEle) {
            removeFromLuckList(userEle);
        }
    });
});