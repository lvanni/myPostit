function getVar(nomVariable) {
	var infos = location.href.substring(location.href.indexOf("?") + 1,
			location.href.length)
			+ "&"
	if (infos.indexOf("#") != -1) {
		infos = infos.substring(0, infos.indexOf("#")) + "&";
	}
	var variable = 0;
	nomVariable = nomVariable + "="
	var taille = nomVariable.length;
	if (infos.indexOf(nomVariable) != -1) {
		variable = infos.substring(infos.indexOf(nomVariable) + taille,
				infos.length).substring(
				0,
				infos.substring(infos.indexOf(nomVariable) + taille,
						infos.length).indexOf("&"))
	}
	return variable;
}

function fadeOutAll() {
	fadeOutWindow("#postit");
	fadeOutWindow("#postitNew");
	fadeOutWindow("#postitTableContent");
	document.getElementById("bugreport").style.display = "none";
	document.getElementById("about").style.display = "none";
}

function getTime() {
	date = new Date;
	year = date.getFullYear();
	month = date.getMonth()+1;
	day = date.getDate();
	if (day < 10) {
		day = "0" + day;
	}
	if (month < 10) {
		month = "0" + month;
	}
	return day + "/" + month + "/" + year;
}

//On suppose que la date entrée a été validée auparavant
//au format dd/mm/yyyy
function getDate(strDate){	  
    day = strDate.substring(0,2);
	month = strDate.substring(3,5);
	year = strDate.substring(6,10);
	d = new Date();
	d.setDate(day);
	d.setMonth(month-1);
	d.setFullYear(year); 
	return d;  
}

//Retorune:
//   0 si date_1=date_2
//   1 si date_1>date_2
//  -1 si date_1<date_2	  
function compare(date_1, date_2){
  diff = date_1.getTime()-date_2.getTime();
  return (diff==0?diff:diff/Math.abs(diff));
}