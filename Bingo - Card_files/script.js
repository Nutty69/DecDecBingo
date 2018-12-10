// if editing in GitHub set to "Spaces" and "2" so things line up a little better, maybe?
// x ? y : z = if x then y else z
 $(document).ready(function(){
   
   var usedArray = new Array(76);	// Why do I have 76 elements when there are only 75 numbers?
   var baseArray = new Array(0,0,0,0,0,1,1,1,1,1,2,2,2,2,3,3,3,3,3,4,4,4,4,4);	/*	The base multiplier for when we store the numbers
																																										The first 5 cells are in the B column
																																										The next 5 are in the I column
																																										The next 4 are in the N column (only four actual numbers, center is free)
																																										The next 5 are in the G column
																																										The last 5 are in the O column
																																								*/
   var number = 0;      // let's start with any number, 0 is a good one
   var addNumber = 0;		// and the number that gets added to it is also 0
   var base = 0;        // and the base number is also 0
   var canStore = true;	// let's assume that we can store data
   var secretCode = "20181208";	// and now for this year's secret code ... it lets us automatically clear the card if we change the secretCode
   var keepCard = true;	// and we'll also assume that the user wants to keep any card they had -- that is if they're allowed to
   
   init();	// let's get this party started!
   
	function init(){	// why is this function inside of the document.ready function? Would it work outside? Is it better inside or out?
		/*	NOTE TO SELF:
			Do we really need these vars here: node, bodyWidth, bodyHeight, minDim, and textSize?
			It looks like maybe we used to set the cell font size as we went along but later decided to 
			move that to its own function
		*/
		/*
			I guess we decided that we didn't really need these here after all
		var node = document.getElementById('page');
		var bodyWidth = node.offsetWidth;
		var bodyHeight = $(window).height();
		var minDim = (bodyWidth<bodyHeight) ? bodyWidth : bodyHeight;
		var textSize = .10*minDim;	// experimentation showed this worked well
		*/
		Math.seedrandom();	// theoretically uses a PRNG that incorporates entropy and other cool stuff
		if (typeof localStorage === 'object') {	// if localStorage is exposed as an object then ...
			// Safari in iOS (as of 8.1) will expose localStorage but not actually allow its use.
			// To compensate, we need to 'try' to see if we can actually store some data.
			try {
				localStorage.setItem('localStorage', 1);	// try to set an item
				localStorage.removeItem('localStorage');	// if it works, remove the unneeded item
			} catch (e) {	// if it doesn't work, an error will be thrown and we'll 'catch' it here
				// Since we can't actually store any data, we need to make a note of that and then let the user know
				canStore = false;
				alert("This site needs to be able to store your card but can\'t. Are you in \"Private\" or \"Incognito\" mode? If so, please try again after switching out of that mode.");
				return;
			}
		}
		
		// By now we know whether we can actually store data.
		// It's possible, though that the user has a card stored.
		// It's possible that the card is from the current year.
		// If that's the case, then we need to let the user know they already have a current card and ask if they want to keep it.
		if ((canStore) && (localStorage.getItem('stored')=="true") && (localStorage.getItem('whatVer')==secretCode))
		{
			var keepCard = window.confirm("You already have a BINGO card.\n\nChoose \"OK\" to keep it or \"Cancel\" to get a new card.");
			if (keepCard != true)
			{
				resetUsedNumbersArray();
				localStorage.clear();
				init();
			}
		}

		// If we get here, it's because we got past the previous block which means that any recursion has completed.
		// Now we can try to fill the card.
		for(var i = 0; i<24; i++){	// Even though there are 25 squares on a BINGO card, we only need to get to 24 since the center square is 'FREE'
			fillCard(i);	// Let's go fill each square with a number and set the background and foreground colors while we're at it.
		};
		
		// Once we get back here, we can store the fact that we've stored a card and we'll set the version to be the current 'secretCode'
		localStorage.setItem('stored','true');
		localStorage.setItem('whatVer',secretCode);

		// Additionally, since we've filled the card, we need to make it 'pretty' by setting the foreground and background colors
		for(var i = 0; i<24; i++)
		{
			if (localStorage.getItem('cell'+i+'bg')!=null)	// If we've stored information about the color of the cell ...
			{
				document.getElementById('cell'+i).style.backgroundColor = localStorage.getItem('cell'+i+'bg');	// we pluck the background color out from storage
				document.getElementById('cell'+i).style.color = localStorage.getItem('cell'+i+'fg');			// and the same for the foreground color
			}
			else	// we haven't stored information about the backgound color so let's do that
			{
				document.getElementById('cell'+i).style.backgroundColor="";	// the background is 'empty' (so CSS takes over)
				document.getElementById('cell'+i).style.color="";			// and foreground is 'empty' (so CSS takes over as well)
			}
		}

		// And we clear the background and foreground of the 'free' square as well so that CSS takes over (I'm not sure if it's necessary)
		document.getElementById('free').style.backgroundColor="";
		document.getElementById('free').style.color="";

		// And, finally, we set the size of the fonts in the cells
		resizeMe();

	} // end function init()

	// Here's where we fill the card...
	function fillCard(i){
		if (canStore)
		{ // we can store stuff
			if ((localStorage.getItem('stored')=="true") && (localStorage.getItem('whatVer')==secretCode))
			{ // we have stored numbers and have a current card so we'll just use the numbers that we already have; we'll set the foreground and background later
				$('#cell'+i).html(localStorage.getItem('cell'+i));	// $ = jQuery access point to the current DOM
			}
			else
			{ // we have not yet stored numbers or we don't have a current card; either way we need to start fresh
				var returnedNumber=0;	// we need a variable to store the 'random' number that we'll ask for
				returnedNumber=getNumber(i);	// I'm not sure why I didn't just use 'var returnedNumber = getNumber(i)' but so be it, here we get a number for the card
				$('#cell'+i).html(returnedNumber);	// And now we change the html of the appropriate cell to be the number we just got
				localStorage.setItem('cell'+i,returnedNumber);	// We also write the number into storage so we can pull it back up later if needed
				localStorage.setItem('cell'+i+'bg',"");	// Here we set the background to be blank (so that we can set it appropriately later)
				localStorage.setItem('cell'+i+'fg',"");	// And the same with the foreground
			}
		}
		else
		{ // we can't store stuff
			var returnedNumber=0;	// we need a variable to store the 'random' number that we'll ask for
			returnedNumber=getNumber(i);	// see above
			$('#cell'+i).html(returnedNumber);	// and again
		}
	} // end function fillCard()

	// Here's where we get a number for the card
	function getNumber(i){
		base = baseArray[i] * 15;	// baseArray[i] holds the multiplier for the cell
		addNumber = Math.floor(Math.random()*15)+1;	// Here we get a 'random' number, make sure that it's from 0-14 and add 1 to it
		number = base + addNumber;	// if we're in the 'B' column, 'base' will be 0, 'addNumber' will be [1..15] so 'number' will be [1..15]; if we're in the 'I' column, 'base' will 15, 'addNumber' will be [1..15] so 'number' will be [16..30]

		if(usedArray[number] != true)	// if we haven't already picked the number we chose for 'number' on the card then
		{
			usedArray[number] = true;	// make sure we mark it as having been used on the card -- BINGO cards can only use a number once
		}
		else	// oops, we've already picked the number, so we need to pick a new one
		{
			return getNumber(i);	// so we'll try to get a new number; whoa, recursion, it makes my head hurt :-)
		}
		return number;	// aha, we've picked a number that we haven't already picked (the awesomeness of recursion) so let's send back up the recursion tree the number we finally chose
	}	// end function getNumber()
	
	// There are times when we already have a card but we want to build a new one:
	// 1) the user clicks/taps the 'new card' button and says 'yes, please'
	// 2) if we tell the user they have a card and ask if they want a new one and they say 'yes, please'
	// In those cases, we need to clear out the array that stores which numbers appear on the card
	function resetUsedNumbersArray(){
		for(var j = 0; j < usedArray.length; j++){
			usedArray[j] = false;
		}	
	}
	 
	// When the user taps the 'new card' button, we come here
	$('#newCard').click(function(){
		// One time someone accidentally tapped 'new card' and lost a nearly filled in card :(
		// Now we ask them to make sure they really do want a new card
		var reallyNew = window.confirm("Do you really want a NEW card?\n\nChoose \"OK\" for a new card or \"Cancel\" to keep the current card.");
		if (reallyNew) {	// Wow, it turns out they really do want a new card
			resetUsedNumbersArray();	// Okay, let's reset the array that stores what numbers appear on the card
			localStorage.clear();	// And get rid of any other data we've stored
			init();	// And start all over again
		}
	 });	// end newcard.click
	 
	 // When the user taps on a square to mark it, we come here
	 $('td').click(function(){
		if ( this.className != "bingohead" ) {	// We don't let the user change the color of the 'BINGO' letters
			var toggle = this.style;			// We get the current 'style' attributes of the cell that's been tapped 
			toggle.backgroundColor = toggle.backgroundColor ? "":"Forestgreen";	// eek, the dreaded ? : operator. No worries: if the bg isn't blank then make it blank, and vice-versa
			toggle.color = toggle.color ? "":"White";	// what, another ? : operator? okay, this time, if the fg isn't blank then make it blank, and vice-versa
			localStorage.setItem(this.id + 'bg', toggle.backgroundColor);		// and make sure we store that info
			localStorage.setItem(this.id + 'fg', toggle.color);					// for both bg and fg
		}
	 });	// end function td.click
	 resizeMe();	// whenever we redo the card, we should make sure that everything fits
 });	// end function document.ready

/*	There are other things that need to happen
		For instance, we need to set the font size for the cell.
		We do this when the window is resized. Some possible times include:
		a change from portrait to landscape orientation on a phone
		when a browser window is resized on a computer
*/
function setCellFontSize(){
	var node=document.getElementById('page');	// lets create a new node equal to the div called 'page'
	var bodyWidth=node.offsetWidth;						// and we'll say that the width is the width of that node
	var bodyHeight=$(window).height();				// and because javascript is really weird about getting the height, we'll use jQuery's helpful tools
	var minDim = (bodyWidth<bodyHeight) ? bodyWidth : bodyHeight;	// You're kidding me, right, another shorthand? Oh well: basically, minDim is the smaller of the height and the width
	var textSize=.11*minDim;	// trial and error showed this to be a nice starting point for font size: 11% of the minimum dimension
	for(var i = 1; i <= 5; i++) {	// there are 5 columns
		document.getElementById('bingoHead'+i).style.fontSize=textSize+"px";	// and a 'BINGO' header in each
	}
	for(var i = 0; i<24; i++){	// and there are 24 cells with numbers in them (25 cells, but 'free' doesn't count
		document.getElementById('cell'+i).style.fontSize=textSize+"px";
	}
	document.getElementById('free').style.fontSize=textSize*.5+"px";	// don't forget the 'free' cell and the 'new card' button
	document.getElementById('newCard').style.fontSize=textSize*.5+"px";	// but both of these have more characters in them, so we'll halve the font size
	document.getElementById('footer').style.fontSize=textSize*.5+"px";
}; // end function setCellFontSize

// When we resize the window, let's see what needs to happen
function resizeMe(){
// We're conducting a test to see what happens if we do everything with vw, vh, vmin, based on viewport size so for now (10/28/16)
// we're going to comment out the call to setCellFontSize so it doesn't happen
//
//	setCellFontSize();	// Right...we need to reset the font sizes
};

var TO = false;	// Let's set a variable we can use for tracking a TimeOut
$(window).resize(function(){	// jQuery can also tell us when the window is resized
	if(TO !== false)			// if we've timed out ...
		clearTimeout(TO);		// clear the timeout so we can start from 0 the next time around
	/*
		When the window is resized, we'll wait a fraction of a second (half a second, actually).
		This allows the resize event to settle a little (some wacky things happen if we try to do anything too quickly after a resize is triggered)
		It also allows the user to continue to resize the window without having the font resized continuously which can slow things down
		So we set a timeout of half a second before we actually execute the function that the resize event triggers
	*/
	TO = setTimeout(resizeMe, 500);
}); // end function resize
