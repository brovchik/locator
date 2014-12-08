var map = L.map('map'); //инициализация кариы
var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});
map.addLayer(osm);
map.setView([53.93, 27.589], 11);

var markers = {}; //объект для хранения маркеров
var items; //массив для хранения объектов
var session; //сущность сессии
var servUpdCounter = 0; //счетчик обращений на сервер



// показать/скрыть панель объектов
function showAsides() {
    if (getComputedStyle(document.getElementById("left-aside")).display == "none") {
        document.getElementById("left-aside").style.display = "block";
    }
    else document.getElementById("left-aside").style.display = "none";
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
                //получение информации об объекте, публикация их на панель объектов
                session.loadLibrary('itemIcon'); //библиотека для работы с иконками
                session.addListener("serverUpdated", updDataFromServer); // прослушка обновлений сервера
                updateFlags(session); //загрузка объектов
            }
            else { alert("Error"); }
        });

    }
}

// загрузка объектов
function updateFlags(session) {
    session.updateDataFlags([{ type: 'type', data: 'avl_unit', flags: 0x00000411, mode: 0 }], function () {
        var obj = document.getElementById("objects");
        var objectsData = ''; // аккумулятор для вывода данных
        var point = []; // массив для хранения точек
        items = session.getItems('avl_unit'); //получение объектов
        for (var i = 0; i < items.length; i++) {
        	items[i].addListener("changePosition", changesPosition); // прослушка обновления позиций объекта
            var itemName = '<span class="objectName">' + items[i].getName() + '</span>';
            var itemIconUrl = '<div class="itemIcon"><img src="' + items[i].getIconUrl(32) + '"/></div>';
            var imgUrl = items[i].getIconUrl(32);
            if (items[i].getPosition()) { //проверка на существование объекта
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
                var itemPositionX = 'x: ' + items[i].getPosition().x.toFixed(3) + '&deg;'; // координата х
                var itemPositionY = 'y: ' + items[i].getPosition().y.toFixed(3) + '&deg;'; //координата у
                map.setView([items[i].getPosition().y, items[i].getPosition().x], 20); // настройка вида карты
                var itemSpeed = 'Скорость: ' + items[i].getPosition().s + ' км/ч'; //скорость объекта
                var itemTime = wialon.util.DateTime.formatTime(items[i].getPosition().t); //время последнего сообщения unix-time
                var id = items[i].getId(); // id объекта
                var ago = session.getServerTime() - items[i].getPosition().t; // вычисление интервала времени
                var daysAgo = ago / 86400 | 0;
                var hoursAgo = (ago - 86400 * daysAgo) / 3600 | 0;
                var minutesAgo = (ago - 86400 * daysAgo - 3600 * hoursAgo) / 60 | 0;
                var secondsAgo = ago - 86400 * daysAgo - 3600 * hoursAgo - 60 * minutesAgo;
                ago = (daysAgo > 0 ? daysAgo + ' дней ' : '') + (hoursAgo > 0 ? hoursAgo + ' часов ' : '') + (minutesAgo > 0 ? minutesAgo + ' минут ' : '') + secondsAgo ;
                var timeString = 'Время: ' + itemTime + '<br><span id = "ago' + id + '" class = "coord">' + ago + ' сек. назад</span>'; //строка времени
                //маркер
                markers[id] = L.marker([items[i].getPosition().y, items[i].getPosition().x], { icon: myIcon }).addTo(map).bindPopup("<b>" + items[i].getName() + "</b><br>" + itemPositionX + ' ' + itemPositionY + "<br>" + itemSpeed + "<br>" + timeString);
                //добавление координат в массив
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
            //запись строки вывода в аккумулятор
            objectsData += '<li class="item" unit id="' + id + '" onclick="findObject(' + id + ')">' + itemIconUrl + '<div class="itemInfo" id="' + id + 'itemInfo">' + itemName + '<br><span class="coord">' + itemPositionX + ' ' + itemPositionY + '<br>' + itemSpeed + '</span><br><span class="timeStr">' + timeString + '</span></div></li>';
        }
        // изменение границ карты
        var bounds = L.latLngBounds(point);
        map.fitBounds(bounds);
        obj.innerHTML += objectsData; //вывод строки на страницу
        document.getElementById("left-aside").style.display = "block"; //изначально, если нет объектов, hidden
    });
}

// перемещение вида карты к маркеру
function findObject(id) {
    var item = wialon.core.Session.getInstance().getItem(id);
    if (item.getPosition()) {
        var itemPositionX = item.getPosition().x;
        var itemPositionY = item.getPosition().y;
        map.setView([itemPositionY, itemPositionX], 20);
    }
    else return null;
}

//сдвиг маркера на текущую позицию и изменения в панели объектов
function changesPosition(event) {
    var itemName = '<span class="objectName">' + event.getTarget().getName() + '</span>';
    var posX = event.getTarget().getPosition().x;
	var posY = event.getTarget().getPosition().y;
	var id  = event.getTarget().getId();
	markers[id].setLatLng(L.latLng(posY, posX));
	map.setView([posY, posX]);
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