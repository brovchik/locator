function HideOverrlay() {
	document.getElementById("overl").className="hidden";	
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

function fact(n) {
	if(n == 0 || n == 1) return 1;
	else return n * fact(n-1);
}