var current_tr = document.createElement("TR");
var postitTab = {};
var toUpdate;
var login = "";

function formatApp() {
	for (i in postitTab) {
		if (document.getElementById(i)) {
			document.getElementById(i).style.left = getCookie(i + ".x");
			document.getElementById(i).style.top = getCookie(i + ".y");
			document.getElementById(i).style.zIndex = getCookie(i + ".zindex");
		}
	}
}

function updatePostit() {
	postit = postitTab[toUpdate];
	body = document.contentForm.contentText.value; // New value!
	body = body == "" ? " " : body;
	body = body.replace(/\n/g, "\\n");
	body = body.replace(/\t/g, "\\t");
	body = body.replace(/\s/g, "\\_");
	// TO FIX	
	body = body.replace("<", "");
	body = body.replace(">", "");
	body = body.replace("&", "");

	// the attribute of the postit is not modifiable yet 
	from = postit.getElementsByTagName('from')[0].firstChild.nodeValue;
	to = postit.getElementsByTagName('to')[0].firstChild.nodeValue;
	title = postit.getElementsByTagName('title')[0].firstChild.nodeValue;
	priority = postit.getElementsByTagName('body')[0].attributes
	.getNamedItem("priority").value;
	permission = postit.getElementsByTagName('body')[0].attributes
	.getNamedItem("permission").value;
	since = postit.getElementsByTagName('body')[0].attributes
	.getNamedItem("since").value;
	until = postit.getElementsByTagName('body')[0].attributes
	.getNamedItem("until").value;
	
	// Send a NEWPOSTIT request to the mongoose local server
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "updatePostit?from=" + from + "&to=" + to
			+ "&title=" + title 
			+ "&priority=" + priority 
			+ "&permission=" + permission 
			+ "&body=" + body
			+ "&since=" + since
			+ "&until=" + until
			+ "&key=" + toUpdate, false);
	xhr.send(null);
}

function setPostitContent(postitID) {
	postit = postitTab[postitID];
	toUpdate = postitID;
	from = postit.getElementsByTagName('from')[0].firstChild.nodeValue;
	dest = postit.getElementsByTagName('to')[0].firstChild.nodeValue;
	priority = postit.getElementsByTagName('body')[0].attributes
	.getNamedItem("priority").value;
	permission = postit.getElementsByTagName('body')[0].attributes
	.getNamedItem("permission").value;
	since = postit.getElementsByTagName('body')[0].attributes
	.getNamedItem("since").value;
	until = postit.getElementsByTagName('body')[0].attributes
	.getNamedItem("until").value;
	post = postit.getElementsByTagName('body')[0].firstChild.nodeValue;

	document.contentForm.contentText.value = post;
	document.getElementById("source").value = from;
	document.getElementById("destination").value = dest == "allusers" ? "all users" : dest;
	document.getElementById("since").value = since;
	document.getElementById("until").value = until;

	// Detect old postit and color it in gray...
	cmp = compare(new Date, getDate(until));
	if(cmp == -1 || cmp == 0) {
		document.getElementById("postit").style.backgroundImage = "url(img/color" + priority + ".png)";
	} else { // postit obsolete
		document.getElementById("postit").style.backgroundImage = "url(img/color0.png)";
	}

	// "unsubscribe" or(and) "delete" if the user is the author
	if(from != login){
		switch(permission){
		case "1" : 
			document.getElementById("deleteButton").disabled = true;
			document.getElementById("unsubscribeButton").disabled = true;
			break;
		case "2" : 
			document.getElementById("deleteButton").disabled = true;
			document.getElementById("unsubscribeButton").disabled = false;
			break;
		case "3" : 
			document.getElementById("deleteButton").disabled = false;
			document.getElementById("unsubscribeButton").disabled = true;
			break;
		case "4" : 
		default: 
			document.getElementById("deleteButton").disabled = false;
			document.getElementById("unsubscribeButton").disabled = false;
			break;
		}
	} else {
		document.getElementById("deleteButton").disabled = false;
		if(permission == "1" || permission == "3") {
			document.getElementById("unsubscribeButton").disabled = true;
		} else {
			document.getElementById("unsubscribeButton").disabled = false;
		}
	}
}

function loadPostit() {
	// AJAX request to get the number of postit
	xhr = new XMLHttpRequest();
	xhr.open("GET", "get?key=" + login + "Postit", false);
	xhr.send(null);

	// clean the table
	table = document.getElementById("postitTable");
	if (table.hasChildNodes()) {
		while (table.childNodes.length >= 1) {
			table.removeChild(table.firstChild);
		}
	}

	// Print the postits
	if ((postitKeys = xhr.responseText.split(",")) != "null") {
		for (i = 0; i < postitKeys.length; i++) {
			// fix /n bugs
            postitKeys[i] = postitKeys[i].replace(/\n/g, "");
			
			// AJAX request to get the postit
			xhr.open("GET", "getPostit?key="
					+ postitKeys[i], false);
			xhr.send(null);
			var postit = xhr.responseXML;
			if (!postit) {
				continue;
			}

			title = postit.getElementsByTagName('title')[0].firstChild.nodeValue;
			priority = postit.getElementsByTagName('body')[0].attributes
			.getNamedItem("priority").value;
			from = postit.getElementsByTagName('from')[0].firstChild.nodeValue;
			since = postit.getElementsByTagName('body')[0].attributes
			.getNamedItem("since").value
			until = postit.getElementsByTagName('body')[0].attributes
			.getNamedItem("until").value

			// memorize the content of the postit
			postitTab[postitKeys[i]] = postit;

			// Construct the new item of the table
			td = document.createElement("TD");
			div = document.createElement("DIV");
			div1 = document.createElement("div");
			div2 = document.createElement("div");
			div3 = document.createElement("div");
			txt1 = document.createTextNode(title);
			txt2 = document.createTextNode("From: " + from + ",");
			txt3 = document.createTextNode(since);
			div.setAttribute("id", postitKeys[i]);
			div.setAttribute("class", "drag");
			cmp = compare(new Date, getDate(until));
			if(cmp == -1 || cmp == 0){ 
				div.setAttribute("style", "background-image: url('img/postit" + priority + ".png'); width: 150px; height: 159px;");
			} else { // postit obsolete
				div.setAttribute("style", "background-image: url('img/postit0.png'); width: 150px; height: 159px;");
			}
			div.setAttribute("ondblclick", "setPostitContent('"+postitKeys[i]+"'); displayWindow('#postit');");
			div1.setAttribute("style", "position: relative; top:50px;");
			div2.setAttribute("style", "position: relative; top:90px; font-size: 10px; font-style: italic;");
			div3.setAttribute("style", "position: relative; top:90px; font-size: 9px; font-style: italic;");
			div.appendChild(div1);
			div1.appendChild(txt1);
			div.appendChild(div2);
			div2.appendChild(txt2);
			div.appendChild(div3);
			div3.appendChild(txt3);
			td.appendChild(div);
			if (i % 5 == 0) {
				current_tr = document.createElement("TR");
				current_tr.appendChild(td);
				table.appendChild(current_tr);
			} else {
				current_tr.appendChild(td);
			}
		}
	}
}

function openPostit(postitPath) {
	// AJAX request to get postit content
	xhr = new XMLHttpRequest();
	xhr.open("GET", "openPostit?path=" + postitPath,
			false);
	xhr.send(null);
	var postit = xhr.responseXML;

	form = postit.getElementsByTagName('from')[0].firstChild.nodeValue;
	to = postit.getElementsByTagName('to')[0].firstChild.nodeValue;
	priority = postit.getElementsByTagName('body')[0].attributes
	.getNamedItem("priority").value
	post = postit.getElementsByTagName('body')[0].firstChild.nodeValue;

	document.contentFormNew.contentTextNew.value = post;
	document.getElementById("destinations").value = to;
	document.getElementById("selectPriority").value = priority;
	document.getElementById("postitTextAreaNew").style.backgroundImage = "url(img/color"
		+ priority + ".png)";
	document.getElementById("postitNew").style.backgroundImage = "url(img/color"
		+ priority + ".png)";

	hideWindow('#open');
	displayWindow("#postitNew");
}

function savePostit() {
	window.open(".postit/" + toUpdate);
}

function unsubscribePostit() {
	xhr = new XMLHttpRequest();
	xhr.open("GET", "unsubscribePostit?key=" + toUpdate + "&from="
			+ login, false);
	xhr.send(null);
	refreshPostit();
	hideWindow('#postit');
}

function deletePostit() {
	if(document.getElementById("deleteButton").value == "Unsubscribe"){
		unsubscribePostit();
	} else {
		xhr = new XMLHttpRequest();
		xhr.open("GET", "deletePostit?key=" + toUpdate, false);
		xhr.send(null);
		refreshPostit();
		hideWindow('#postit');
	}
}

function sendNewPostit() {
	// Get the postit attributes
	var from = login;
	var to = document.getElementById("destinations").value;
	to = login + "," + to;
//	if(to == "") {
//		alert("you must choose the receivers!")
//		return;
//	}
	to = to.replace(/\s/g, "");
	var prioElmnt = document.getElementById("selectPriority");
	var priority = prioElmnt.options[prioElmnt.selectedIndex].value;
	var permiElmnt = document.getElementById("selectPermission");
	var permission = permiElmnt.options[permiElmnt.selectedIndex].value;
	var title = document.getElementById("title").value;
	if(title == "") {
		alert("you must enter a title!")
		return;
	}
	
	var body = document.contentFormNew.contentTextNew.value;
	body = body == "" ? " " : body;
	body = body.replace(/\n/g, "\\n");
	body = body.replace(/\t/g, "\\t");
	body = body.replace(/\s/g, "\\_");
	// TO FIX
	body = body.replace("<", "");
	body = body.replace(">", "");
	body = body.replace("&", "");

	var since = getTime();
	var day = document.getElementById("day").value;
	var month = document.getElementById("month").value;
	var year = document.getElementById("year").value;
	if(day == "" || day < 0 || day > 31 || month == "" || month < 0 || month > 12 || year == ""){
		var until = "12/12/9999";
	} else {
		var until = day + "/" + month + "/" + year;
	}

	// Send a NEWPOSTIT request to the mongoose local server
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "hash?key=" + from + body + new Date, false);
	xhr.send(null);
	var key = xhr.responseText;

	xhr.open("GET", "newPostit?from=" + from + "&to=" + to
			+ "&priority=" + priority
			+ "&permission=" + permission
			+ "&title=" + title 
			+ "&body=" + body
			+ "&since=" + since
			+ "&until=" + until
			+ "&key=" + key, false);
	xhr.send(null);

	// refresh the view
	refreshPostit();
	
	hideWindow('#postitNew');
}

function shutdown() {
	fadeOutAll();
	xhr = new XMLHttpRequest();
	xhr.open("GET", "shutdown", false);
	xhr.send(null);
	fadeInWindow("#shutdown");
	fadeInWindow("#loginBack");
	setCookie("myPostitLogin", "", 355);
}

function logout() {
	fadeOutAll();
	xhr = new XMLHttpRequest();
	xhr.open("GET", "logout", false);
	xhr.send(null);
	fadeInWindow("#login");
	fadeOutWindow("#menu");
	fadeOutWindow("#about");
	fadeOutWindow("#help");
	setCookie("myPostitLogin", "");
}

function createAccount() {
	// verify
	login = document.getElementById("loginValue").value;
	var pass = document.getElementById("password").value;
	var confirm = document.getElementById("confirm").value;
	if (pass == "" || login == "") {
		fadeInWindow("#loginErr");
		return;
	}
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "get?key=" + login, false);
	xhr.send(null);
	passKnown = xhr.responseText;
	if (pass == "" || login == "" || passKnown != "null" || pass != confirm) {
		fadeInWindow("#loginErr");
		return;
	}

	// store the new account
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "hash?key=" + pass, false);
	xhr.send(null);
	passH = xhr.responseText;
	xhr.open("GET", "put?key=" + login + "&value=" + passH, false);
	xhr.send(null);

	// add the new user to the mypostit user list
	xhr.open("GET", "get?key=mypostitUsers", false);
	xhr.send(null);
	users = xhr.responseText;
	users = users == "null" ? login : users + "," + login;
	xhr.open("GET", "put?key=mypostitUsers&value=" + users, false);
	xhr.send(null);

//	// Create the 4 default postits
//	var time = getTime();
//	var xhr = new XMLHttpRequest();
//	xhr.open("GET", "hash?key=" + login + "Welcome" + time, false);
//	xhr.send(null);
//	var key = xhr.responseText;
//	xhr.open("GET", "newPostit?from=admin&to=" + login
//	+ "&priority=1" +
//	"&title=Welcome" +
//	"&body=Welcome to myPost-it v1.1 beta" +
//	"&time=" + time + "&key=" + key, false);
//	xhr.send(null);
//	xhr.open("GET", "hash?key=" + login + "to" + time, false);
//	xhr.send(null);
//	key = xhr.responseText;
//	xhr.open("GET", "newPostit?from=admin&to=" + login
//	+ "&priority=2" +
//	"&title=to" +
//	"&body=With myPost-it your can share your postits with your friends" +
//	"&time=" + time + "&key=" + key, false);
//	xhr.send(null);
//	xhr.open("GET", "hash?key=" + login + "myPost-it" + time, false);
//	xhr.send(null);
//	key = xhr.responseText;
//	xhr.open("GET", "newPostit?from=admin&to=" + login
//	+ "&priority=3" +
//	"&title=myPost-it" +
//	"&body=myPostit is a proof of concept of sharing post-it application. It's based on the Publish and Subscribe messaging paradigm." +
//	"&time=" + time + "&key=" + key, false);
//	xhr.send(null);
//	xhr.open("GET", "hash?key=" + login + "v1.1 Beta" + time, false);
//	xhr.send(null);
//	key = xhr.responseText;
//	xhr.open("GET", "newPostit?from=admin&to=" + login
//	+ "&priority=4" +
//	"&title=v1.1 Beta" +
//	"&body=\"Beta\" means you can contribute by sending a report when you find a bug..." +
//	"&time=" + time + "&key=" + key, false);
//	xhr.send(null);

	// application launching
	singin();
}

function singin() {
	// login verification
	login = document.getElementById("loginValue").value;
	var pass = document.getElementById("password").value;
	if (pass == "" || login == "") {
		fadeInWindow("#loginErr");
		return;
	}
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "hash?key=" + pass, false);
	xhr.send(null);
	passH = xhr.responseText;
	xhr.open("GET", "get?key=" + login, false);
	xhr.send(null);
	passKnown = xhr.responseText;
	if (passKnown == "null" || passH != passKnown) {
		fadeInWindow("#loginErr");
		return;
	}

	// store a non persistant cookie for the session
	setCookie("myPostitLogin", login);

	// application launching
	fadeOutWindow("#login");

	// Verify if the user can restore an old session
	xhr.open("GET", "checkPostitLost", false);
	xhr.send(null);
	refreshPostit();
	fadeInWindow("#postitTableContent");
	fadeInWindow("#menu");
	
	// show userName
	document.getElementById("userLogin").value = "("+ login + ")";
}

function refreshPostit() {
	loadPostit();
	formatApp();
}

function updateDestination() {
	dest = document.getElementById("destinations");
	dest.value += dest.value != "" ? "," : "";
	dest.value += document.getElementById("selectUsers").value;
}

function refreshUserList() {
	xhr.open("GET", "get?key=mypostitUsers", false);
	xhr.send(null);
	users = xhr.responseText;
	usersTab = users.split(",");
	sel = document.getElementById("selectUsers");
	sel.options.length = 0;
	option = new Option("all users", "all users");
	option.onclick = updateDestination;
	sel.options[sel.length] = option;
	option = new Option("--------------", "--------------");
	sel.options[sel.length] = option;
	for (i in usersTab) {
		if(usersTab[i] != login){
			option = new Option(usersTab[i], usersTab[i]);
			option.onclick = updateDestination;
			sel.options[sel.length] = option;
		}
	}
	
	// push the priority at 1
	var prioElmnt = document.getElementById("selectPriority");
	var priority = prioElmnt.options[0].selected = "true";
	document.getElementById("postitNew").style.backgroundImage = "url(img/color1.png)";
}

function checkConnection() {
	login = getCookie("myPostitLogin");
	if (login != "") {
		document.getElementById("login").style.display = "none";
		refreshPostit();
	} else {
		document.getElementById("menu").style.display = "none";
		document.getElementById("about").style.display = "none";
		document.getElementById("help").style.display = "none";
	}
}
