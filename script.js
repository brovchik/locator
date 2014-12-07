var map = L.map('map');

var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});
map.addLayer(osm);
map.setView([53.93, 27.589], 11);

var markers = {};
var items;
var session;
var servUpdCounter = 0;




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
    	session = wialon.core.Session.getInstance(); //инициализация сессии
    	session.initSession('https://trc-api.wialon.com');
        session.login(name, pass, '', function (code) {
            if (code == 0) {
            	document.getElementById("logined").innerHTML = "Привет, " + session.getCurrUser().getName() + "!<br><a href=\"#\" onclick=\"LogOut()\">Выйти</a>";
                document.getElementById("overl").className = "hidden";
                //получение информации об объекте, публикация их в левый столбец
                session.loadLibrary('itemIcon');
                session.addListener("serverUpdated", updDataFromServer);
                updateFlags(session);
            }
            else { alert("Error"); }
        });

    }
}

function updateFlags(session) {
    session.updateDataFlags([{ type: 'type', data: 'avl_unit', flags: 0x00000411, mode: 0 }], function () {
        var obj = document.getElementById("objects");
        var objectsData = '';
        var point = [];
        items = session.getItems('avl_unit');
        for (var i = 0; i < items.length; i++) {
        	items[i].addListener("changePosition", changesPosition);
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
                var itemTime = wialon.util.DateTime.formatTime(items[i].getPosition().t);
                var id = items[i].getId();
                var ago = session.getServerTime() - items[i].getPosition().t;
                var daysAgo = ago / 86400 | 0;
                var hoursAgo = (ago - 86400 * daysAgo) / 3600 | 0;
                var minutesAgo = (ago - 86400 * daysAgo - 3600 * hoursAgo) / 60 | 0;
                var secondsAgo = ago - 86400 * daysAgo - 3600 * hoursAgo - 60 * minutesAgo;
                ago = (daysAgo > 0 ? daysAgo + ' дней ' : '') + (hoursAgo > 0 ? hoursAgo + ' часов ' : '') + (minutesAgo > 0 ? minutesAgo + ' минут ' : '') + secondsAgo ;
                var timeString = 'Время: ' + itemTime + '<br><span id = "ago' + id + '" class = "coord">' + ago + ' сек. назад</span>';
                markers[id] = L.marker([items[i].getPosition().y, items[i].getPosition().x], { icon: myIcon }).addTo(map).bindPopup("<b>" + items[i].getName() + "</b><br>" + itemPositionX + ' ' + itemPositionY + "<br>" + itemSpeed + "<br>" + timeString);
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
            objectsData += '<li class="item" unit id="' + id + '" onclick="findObject(' + id + ')">' + itemIconUrl + '<div class="itemInfo" id="' + id + 'itemInfo">' + itemName + '<br><span class="coord">' + itemPositionX + ' ' + itemPositionY + '<br>' + itemSpeed + '</span><br><span class="timeStr">' + timeString + '</span></div></li>';
        }
        var bounds = L.latLngBounds(point);
        map.fitBounds(bounds);
        obj.innerHTML += objectsData;
        document.getElementById("left-aside").style.display = "block";
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
// });.

//сдвиг маркера на текущую позицию и изменение в панели объектов
function changesPosition(event) {
    var itemName = event.getTarget().getName();
	var posX = event.getTarget().getPosition().x;
	var posY = event.getTarget().getPosition().y;
	var id  = event.getTarget().getId();
	markers[id].setLatLng(L.latLng(posY, posX));
	map.setView([posY, posX], 20);
	var itemSpeed = 'Скорость: ' + event.getTarget().getPosition().s + ' км/ч';
	var itemTime = wialon.util.DateTime.formatTime(event.getTarget().getPosition().t);
	var ago = session.getServerTime() - event.getTarget().getPosition().t;
	var daysAgo = ago/86400 | 0;
	var hoursAgo = (ago - 86400 * daysAgo)/3600 | 0;
	var minutesAgo = (ago - 86400 * daysAgo - 3600 * hoursAgo)/60 | 0;
	var secondsAgo = ago - 86400 * daysAgo - 3600 * hoursAgo - 60 * minutesAgo;
	ago = (daysAgo > 0 ? daysAgo + ' дней ' : '') + (hoursAgo > 0 ? hoursAgo + ' часов ' : '') + (minutesAgo > 0 ? minutesAgo + ' минут ' : '') + secondsAgo + ' сек. назад';
	var timeString = 'Время: ' + itemTime + '<br><span id = "ago' + id + '" class = "coord">' + ago + ' назад</span>';
	var objData = document.getElementById(id + 'itemInfo');
	objData.innerHTML = itemName + '<br><span class="coord">' + posX.toFixed(3) + '&deg; ' + posY.toFixed(3) + '&deg;<br>' + itemSpeed + '</span><br><span class="timeStr">' + timeString + '</span>';
	servUpdCounter = 0;
}


//выход
function LogOut() {
    var session = wialon.core.Session.getInstance();
    session.logout(function (code) {
        if (code == 0) {
            document.getElementById("logined").innerHTML = '';
            document.getElementById("objects").innerHTML = '';
            document.getElementById("left-aside").style.display = "none";
            document.getElementById("overl").className = "visible";
            document.forms[0].pass.value = '';
            var clearMarker = document.getElementsByClassName('leaflet-marker-pane');
            for (var i = 0; i < clearMarker.length; i++) {
                clearMarker[i].innerHTML = '';
            }
            delete markers;
        }
    });
}



//обновление счетчика времени последнего сообщения раз в 10 сек
function updDataFromServer(event) {
    servUpdCounter++;
    if (servUpdCounter == 10) { //
        for (var i = 0; i < items.length; i++) {
            if (items[i].getPosition()) {
                var id = items[i].getId();
                var ago = session.getServerTime() - items[i].getPosition().t;
                var daysAgo = ago / 86400 | 0;
                var hoursAgo = (ago - 86400 * daysAgo) / 3600 | 0;
                var minutesAgo = (ago - 86400 * daysAgo - 3600 * hoursAgo) / 60 | 0;
                var secondsAgo = ago - 86400 * daysAgo - 3600 * hoursAgo - 60 * minutesAgo;
                ago = (daysAgo > 0 ? daysAgo + ' дней ' : '') + (hoursAgo > 0 ? hoursAgo + ' часов ' : '') + (minutesAgo > 0 ? minutesAgo + ' минут ' : '') + secondsAgo + ' сек. назад';
                var objData = document.getElementById('ago' + id);
                objData.innerHTML = ago;
                servUpdCounter = 0;
            }
        }
    }
}