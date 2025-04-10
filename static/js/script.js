const trackImageElement = document.getElementById('trackImage');
function loadRandomImage(){
    // Fetch the random track image URL from Flask
    return fetch('/track-image',)
    .then(response => response.json())
    .then(data => {
        //console.log("test" + data.image_url);
        if(getImageNumber(trackImageElement.src) == getImageNumber(data.image_url)){
            loadRandomImage();
        }
        else{
            trackImageElement.src = data.image_url;  // Set the image source to the random image URL
        }
    })
    .catch(error => {
        console.error('Error fetching image:', error);
    });
}
window.onload = loadRandomImage();

const mapImageElement = document.getElementById('mapImage');
const mapSelectElement = document.getElementById('mapSelect');
changeImage()
function changeImage(){
    mapImageElement.src = 'static/images/mapImages/' + mapSelectElement.value;
}

/*Returns the map's number
function mapSubstring(mapImageStr){
    mapSelectStr = getImageNumber(mapImageStr);
    //mapSelectStr = mapSelectStr.replace(' ', '_');
    //mapSelectStr = mapSelectStr.substring(0, mapSelectStr.lastIndexOf('_'));
    mapSelectStr = mapSelectStr.substring(0, mapImageStr.indexOf('_'));
    return mapSelectStr;
}*/
function getImageNumber(trackImageStr){
    trackImageStr = trackImageStr.substring(trackImageStr.lastIndexOf('/')+1, trackImageStr.lastIndexOf('.'));
    trackImageStr = trackImageStr.substring(0, trackImageStr.indexOf('_'));
    return trackImageStr
}
function getImageTitle(trackImageStr){
    trackImageStr = trackImageStr.substring(trackImageStr.lastIndexOf('/')+1, trackImageStr.lastIndexOf('.'));
    trackImageStr = trackImageStr.substring(trackImageStr.indexOf('_')+1);
    return trackImageStr
}

//Check if trackMap == selectedMap
async function guess(){
    if(!document.getElementById('pin')){
        window.alert("please place a pin on the map!");
        return
    }
    var trackImageSrc = getImageNumber(trackImageElement.src);
    //trackImageSrc = trackImageSrc.substring(0, trackImageSrc.indexOf('.'));
    mapSelectSrc = getImageNumber(mapImageElement.src);

    if(trackImageSrc == mapSelectSrc){
        console.log("correct!");
        await fetchCoordinates();
    } else {
        console.log(`incorrect. track was ${trackImageSrc}`);
        if(scoreText.textContent.indexOf('+') != -1){
            scoreText.textContent = scoreText.textContent.substring(0, scoreText.textContent.indexOf('+')) + " + 0";   
        }
        else{
            scoreText.textContent = scoreText.textContent + " + 0";
        }
    }
    //Add something so loading image cannot give the same image
    loadRandomImage()
    changeImage()
}

const scoreText = document.getElementById("score");

//Allow user to place pins to guess
mapImageElement.addEventListener('click', function(event) {
    // Get the position of the click relative to the image
    const rect = mapImageElement.getBoundingClientRect();
    console.log(rect.left + " " + event.clientX);
    const x = event.clientX - rect.left; // x-coordinate relative to image
    const y = event.clientY - rect.top;  // y-coordinate relative to image

    var pin;
    // Create a new dot/pin element
    if(!document.getElementById('pin')){
        pin = document.createElement('div');
        pin.id = 'pin';

        pin.style.backgroundColor = 'hsl(53, 93%, 54%)';
        pin.style.border = '2px solid black';
        pin.style.borderRadius = '10px';

        pin.style.width = '6px';
        pin.style.height = '6px';

        pin.style.zIndex = 1;
        pin.style.position = 'absolute';
    } else{
        pin = document.getElementById('pin');
    }
    pin.x = x;
    pin.y = y;

    // Position the pin at the click location
    pin.style.left = `${x - 5}px`; // Adjusting to center the dot
    pin.style.top = `${y - 5}px`;

    // Append the pin to the container
    mapImageContainer.appendChild(pin);
});

// Function to fetch coordinates for a specific image
function fetchCoordinates() {
    // Replace with your server's base URL
    const url = `/update_coordinates`;

    return fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON response
    })
    .then(answers => {
        if (answers.error) {
            alert(answers.error);  // Handle error
        } else {
            
            console.log(answers);
            //answer = answers[]

            let keys = Object.keys(answers);
            let answerIndex = getImageNumber(trackImageElement.src) - 1;
            let trackName = keys[answerIndex];

            if(answerIndex >= 0 && answerIndex < keys.length){
                let tracksData = answers[trackName]; // This will be the object for that track

                // Access property dynamically
                let trackData = tracksData[getImageTitle(trackImageElement.src)];

                console.log('inside');

                if(trackData){
                    console.log(trackData);
                    const x = trackData.x;
                    const y = trackData.y;
                    var score = calculateGuess(x, y);
                    var totalScore = scoreText.textContent.substring(0, scoreText.textContent.indexOf("+")-1);
    
                    console.log(totalScore);
                    scoreText.textContent = +totalScore + score + " + " + score;
                    console.log("scoreText " + scoreText.textContent); 
                }
            }
            else{
                console.log(`Image ID ${trackImageSrc} not found`);
                alert(`Image ID ${trackImageSrc} not found`);
            }
        }
    })
    .catch((error) => {
        console.error('Error fetching the coordinates:', error);
    });
}

//Returns a number 0-100 depending on how close the guess was
//Parameters: Takes in answer's X and Y
function calculateGuess(answerX, answerY){
    if(document.getElementById('pin')){
        const pin = document.getElementById('pin');
        console.log(answerX + " " + answerY + "   " + pin.x + " " + pin.y);

        //Give user a score using distance formula:
        return Math.max(100 - Math.round(Math.sqrt(Math.pow((pin.y - answerY),2) + Math.pow((pin.x - answerX), 2))), 0);
    }
}