
function showAsides() {
    if (getComputedStyle(document.getElementById("left-aside")).display == "none") {
        document.getElementById("left-aside").style.display = "block";
    }
    else document.getElementById("left-aside").style.display = "none";
    //if (getComputedStyle(document.getElementById("right-aside")).display == "none") {
    //    document.getElementById("right-aside").style.display = "block";
    //}
    //else document.getElementById("right-aside").style.display = "none";
}

//enter на поле password
var login = document.getElementById("password");
login.onkeydown = function (c) {
    if (c.keyCode == 13) {
        LogIn();
    }
}


function LogIn() {
    var name = document.forms[0].userName.value;
    var pass = document.forms[0].pass.value;
    if (name != '') {
        var session = wialon.core.Session.getInstance(); //инициализация сессии
        session.initSession('https://trc-api.wialon.com');
        session.login(name, pass, '', function (code) {
            if (code == 0) {
                setTimeout((function () {
                    document.getElementById("logined").innerHTML = "Привет, " + session.getCurrUser().getName() + "!<br><a href=\"#\" onclick=\"LogOut()\">Выйти</a>";
                    document.getElementById("overl").className = "hidden";
                    //получение информации об объекте, публикация их в левый столбец
                    session.loadLibrary('itemIcon');
                    updateFlags(session);
                }), 1000);
            }
            else { alert("Error"); }
        });

    }
}

function updateFlags(session) {
    session.updateDataFlags([{ type: 'type', data: 'avl_unit', flags: 0x00000411, mode: 0 }], function () {
        var items = session.getItems('avl_unit');
        var obj = document.getElementById("objects");
        var objectsData = '';
        for (var i = 0; i < items.length; i++) {
            var itemName = '<span class="objectName">' + items[i].getName() + '</span>';
            var itemIconUrl = '<div class="itemIcon"><img src="' + items[i].getIconUrl(32) + '"/></div>';
            if (items[i].getPosition()) {
                var itemPositionX = 'x: ' + items[i].getPosition().x.toFixed(3) + '&deg;';
                var itemPositionY = 'y: ' + items[i].getPosition().y.toFixed(3) + '&deg;';
                var itemSpeed = 'Скорость: ' + items[i].getPosition().s + ' км/ч';
                var itemTime = new Date(1000 * items[i].getPosition().t);
                var h = itemTime.getHours();
                var min = itemTime.getMinutes();
                var d = itemTime.getDay();
                var mon = itemTime.getMonth();
                var y = itemTime.getFullYear();
                var tx = Date.U
                var timeString = 'Время: ' + h + ':' + (min < 10 ? '0' + min : min) + ' ' + d + '.' + (mon < 9 ? '0' + (+mon + 1) : mon + 1) + '.' + y;
            }
            else {
                var itemPositionX = 'Нет данных об объекте';
                var itemPositionY = '';
                var itemSpeed = '';
                var itemTime = '';
                var h = '';
                var min = '';
                var d = '';
                var mon = '';
                var y = '';
                var timeString = '';
            }
            objectsData += '<li class="item">' + itemIconUrl + '<div class="itemInfo">' + itemName + '<br><span class="coord">' + itemPositionX + ', ' + itemPositionY + '<br>' + itemSpeed + '</span><br><span class="timeStr">' + timeString + '</span></div></li>';
        }
        obj.innerHTML += objectsData;
    });
}

function LogOut() {
    var session = wialon.core.Session.getInstance();
    session.logout(function (code) {
        if (code == 0) {
            document.getElementById("logined").innerHTML = '';
            document.getElementById("objects").innerHTML = '';
            document.getElementById("overl").className = "visible";
            document.forms[0].pass.value = '';
        }
    });
}


// function fact(n) {
// 	if(n == 0 || n == 1) return 1;
// 	else return n * fact(n-1);
// }

