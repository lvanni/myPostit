function displayWindow(elementID){
	jQuery.noConflict();  
	jQuery(document).ready(function(){
		jQuery(elementID).show("fast");
	});
}

function hideWindow(elementID){
	jQuery.noConflict();  
	jQuery(document).ready(function(){
		jQuery(elementID).hide("fast");
	});
}

function fadeInWindow(elementID){
	jQuery.noConflict();  
	jQuery(document).ready(function(){
		jQuery(elementID).fadeIn("slow");
	});
}

function fadeOutWindow(elementID){
	jQuery.noConflict();  
	jQuery(document).ready(function(){
		jQuery(elementID).fadeOut("slow");
	});
}

function hideAllMenu(){
	hideWindow("#myPostitItem");
	hideWindow("#fileItem");
	hideWindow("#toolsItem");
	hideWindow("#postitAction");
	document.getElementById("postitMenu").style.background = "none";
	document.getElementById("fileMenu").style.background = "none";
	document.getElementById("toolsMenu").style.background = "none";	
	document.getElementById("helpMenu").style.background = "none";
}

function menuOver(elt){
	elt.style.backgroundColor = "#d4792f";
}

function displayMenu(elementID, elt){
	hideAllMenu();
	displayWindow(elementID);
	menuOver(elt);
}

function changePriority(priority){
	document.getElementById("postitNew").style.backgroundImage = "url(../img/color" + priority + ".png)";
}
