var map = L.map('map');

var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});
map.addLayer(osm);
map.setView([53.93, 27.589], 11);

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
            	document.getElementById("logined").innerHTML = "Привет, " + session.getCurrUser().getName() + "!<br><a href=\"#\" onclick=\"LogOut()\">Выйти</a>";
                document.getElementById("overl").className = "hidden";
                //получение информации об объекте, публикация их в левый столбец
                session.loadLibrary('itemIcon');
                updateFlags(session);
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
        var point = [];
        
        for (var i = 0; i < items.length; i++) {
            var itemName = '<span class="objectName">' + items[i].getName() + '</span>';
            var itemIconUrl = '<div class="itemIcon"><img src="' + items[i].getIconUrl(32) + '"/></div>';
            var imgUrl = items[i].getIconUrl(32);
            if (items[i].getPosition()) {
            	var myIcon = L.icon({
				    iconUrl: imgUrl,
				    iconRetinaUrl: imgUrl,
				    iconSize: [32, 32],
				    iconAnchor: [22, 94],
				    popupAnchor: [-3, -76],
				    shadowUrl: '',
				    shadowRetinaUrl: '',
				    shadowSize: [,],
				    shadowAnchor: [, ]
				});
                var itemPositionX = 'x: ' + items[i].getPosition().x.toFixed(3) + '&deg;';
                var itemPositionY = 'y: ' + items[i].getPosition().y.toFixed(3) + '&deg;';
                map.setView([items[i].getPosition().y, items[i].getPosition().x], 20);
                var itemSpeed = 'Скорость: ' + items[i].getPosition().s + ' км/ч';
                var itemTime = new Date(1000 * items[i].getPosition().t);
                var id = items[i].getId();
                var h = itemTime.getHours();
                var min = itemTime.getMinutes();
                var d = itemTime.getDay();
                var mon = itemTime.getMonth();
                var y = itemTime.getFullYear();
                var timeString = 'Время: ' + h + ':' + (min < 10 ? '0' + min : min) + ' ' + d + '.' + (mon < 9 ? '0' + (+mon + 1) : mon + 1) + '.' + y;
                L.marker([items[i].getPosition().y, items[i].getPosition().x], { icon: myIcon }).addTo(map).bindPopup("<b>" + items[i].getName() + "</b><br>" + itemPositionX + itemPositionY + "<br>" + itemSpeed + "<br>" + timeString);
                point.push([items[i].getPosition().y, items[i].getPosition().x]);
            }
            else {
                var itemPositionX = 'Нет данных об объекте';
                var itemPositionY = '';
                var itemSpeed = '';
                var itemTime = '';
                var id = items[i].getId();
                var h = '';
                var min = '';
                var d = '';
                var mon = '';
                var y = '';
                var timeString = '';
            }
            objectsData += '<li class="item" unit-id="' + id + '" onclick="findObject(' + id + ')">' + itemIconUrl + '<div class="itemInfo">' + itemName + '<br><span class="coord">' + itemPositionX + ' ' + itemPositionY + '<br>' + itemSpeed + '</span><br><span class="timeStr">' + timeString + '</span></div></li>';
        }
        var bounds = L.latLngBounds(point);
        map.fitBounds(bounds);
        obj.innerHTML += objectsData;
    });
}


function findObject(id) {
    
    var item = wialon.core.Session.getInstance().getItem(id);
    if (item.getPosition()) {
        var itemPositionX = item.getPosition().x;
        var itemPositionY = item.getPosition().y;
        map.setView([itemPositionY, itemPositionX], 20);
    }
    else return null;
}
// var obj = document.getElementById("objects");
// obj.addEventListener('click', function(event) {
// 	console.log(this);
// });

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

