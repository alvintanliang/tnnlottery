// 全局变量：抽奖开始标记，定时器，当前选中的用户
var options = {
    moveSpeed: 20,
    showDlg: 400
}
var go = false;
var timer = null;
var current = null;


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
    if (user.name == null || user.image == null) {
        console.log(user);
        return null;
    }
    return user;
}

// 添加本次中奖用户到中奖区
function addToLuckList(userEle) {
    // userEle.addClass("hidden").removeClass("card-focus");

    var user = getUserFromEle(userEle);
    if (user == null) {
        console.error('Failed to get user');
    }


    var html = '<div id="' + user.name + '" class="card card-me card-md">';
    html +=     '<img class="card-img-top" src="' + user.image + '">';
    html +=     '<div class="card-body">' + user.name + '</div>';
    html += '</div>';
    $(".luck-bar").prepend(html);

    userEle.remove();
    userEle = null;
}

// 从中奖区移到抽奖区
function removeFromLuckList(userEle) {
    console.log(userEle);
    var user = getUserFromEle(userEle);

    // $(".user-list").children("#" + user.name).removeClass("hidden");
    html = '<div id="' + user.name + '" class="card bg-light card-me card-sm">';
    html +=     '<img class="card-img-top" src="' + user.image + '">';
    html +=     '<div class="card-body">' + user.name + '</div>';
    html += '</div>';
    $(".user-list").append(html);

    userEle.remove();
}

// 显示中奖确认对话框
function showLotteryDialog() {
    var user = getUserFromEle(current);

    var userEl = $('#lotteryModal').find(".modal-content");
    userEl.children("img:first-child").attr("src", user.image);
    userEl.children("div.card-body").html(user.name);

    $('#lotteryModal').modal({
        backdrop: "static"
    });
}

// 抽奖时:移动到下一个需要高亮显示的用户
function moveToNext() {
    if (current == null || current.length == 0) {
        // 获取用户列表中第一个用户的DOM
        current = $(".user-list").children(".card-sm:first-child");
    } else {
        // 获取下一个用户
        current = current.next();
    }

    while (current.hasClass("hidden")) {
        // 如何用户是隐藏状态，则继续移动到下一个状态
        current = current.next();

        // 如果长度为0，则表示当前已移动到列表末尾
        if (current.length == 0) {
            // 则获取第一个用户（这里假设列表中一定存在未抽到奖的用户，否则就会死循环）
            current = $(".user-list").children(".card-sm:first-child");
        }
    }

    if (current && current.length == 1) {
        current.addClass("card-focus");
    }
}

// 抽奖时：在用户列表中快速移动
function move() {
    if (go) {
        if (current) {
            current.removeClass("card-focus");
        }
        moveToNext();
    }
}

// 开始抽奖
function start() {
    go = true;
    timer = setInterval(move, options.moveSpeed);
}

// 抽奖
function lottery() {
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

// 停止抽奖
function stop() {
    go = false;
    setTimeout(function() {
        clearInterval(timer);
        timer = null;

        if (current) {
            current.removeClass("card-focus");
            current = null;
        }
    }, 50);
}

// 全部重置
function reset() {
    $(".user-list").children(".card-sm").removeClass("card-focus").removeClass("hidden");
    $(".luck-bar").children(".card-md").remove();
}

// 页面加载完毕后
$(document).ready(function(){
    initialize();

    $("button.action-reset").click(function() {
    });

    $("button.action-start").click(function() {
        $("button.action-start").addClass("hidden");
        $("button.action-lottery").removeClass("hidden");
        start();
    });
    
    $("button.action-lottery").click(function() {
        $("button.action-start").removeClass("hidden");
        $("button.action-lottery").addClass("hidden");
        lottery();
    });

    $("button.action-stop").click(function() {
        $("button.action-start").attr("disabled", false);
        $("button.action-stop").attr("disabled", true);
        $("button.action-lottery").attr("disabled", true);
        stop();
    });

    $("button.action-sure").click(function() {
        $('#lotteryModal').modal('hide');
        if (current) {
            addToLuckList(current);
        }
        $("button.action-start").removeClass("hidden");
        $("button.action-lottery").addClass("hidden");
    });
    
    $("button.action-continue").click(function() {
        $('#lotteryModal').modal('hide');
        $("button.action-start").click();
    });

    $("button.action-cancel").click(function() {
        $('#lotteryModal').modal('hide');
        if (current) {
            current.removeClass("card-focus");
            current = null;
        }
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