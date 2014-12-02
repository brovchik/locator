function HideOverlay() {
	var name = document.forms[0].userName.value;
		var pass = document.forms[0].pass.value;
	setTimeout((function(){
		console.log(name);
		console.log(pass);
		if(name == "BREV" && pass =="BREV") {
			document.getElementById("header").innerHTML = "<div class=\"logined\">Привет, "+name+"!</div>";
			document.getElementById("overl").className="hidden";
		}	
		else {alert("Invalid user "+name+"! Enter again");}
		
	}), 1000);
}

function showAsides() {
	if(getComputedStyle(document.getElementById("left-aside")).display=="none") {
		document.getElementById("left-aside").style.display = "block";
	}
	else document.getElementById("left-aside").style.display = "none";
	if(getComputedStyle(document.getElementById("right-aside")).display=="none") {
		document.getElementById("right-aside").style.display = "block";
	}
	else document.getElementById("right-aside").style.display = "none";
}

// function fact(n) {
// 	if(n == 0 || n == 1) return 1;
// 	else return n * fact(n-1);
// }

