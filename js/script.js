console.log("lets write javascript");

// Global Variables
let currentSong = new Audio();
let songs;
let currFolder;

function convertSecondsToMinutesSeconds(secondsWithMilliseconds) {
    var totalSeconds = Math.floor(secondsWithMilliseconds);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    // Adding leading zeros if necessary
    var minutesStr = minutes < 10 ? "0" + minutes : minutes;
    var secondsStr = seconds < 10 ? "0" + seconds : seconds;
    return minutesStr + ":" + secondsStr;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log(as);

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    //show all the songs in the playlist
    let songsUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songsUL.innerHTML = ""
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML +
            `<li>   <div class="songListInfo flex">
                        <img class="invert" src="resources/music.svg" alt="music">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Artist name</div>
                        </div>
                    </div>
                    <img class="invert" src="resources/playnow.svg" alt="playnow"> </li>`
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "resources/pause.svg";
    }
    else {
        play.src = "resources/play.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function DisplayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    console.log(div);
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];   

        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            console.log(e.href);
            let folder = e.href.split("/").slice(-2)[0];
            console.log(folder);
            // Get the Data of the folder 
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card pointer">
            <div class="card_image">
                <img src="/songs/${folder}/cover.jpg" alt="Sanam">
                <div class="play-button"><img src="resources/play.svg" alt="play button"></div>
            </div>
            <div class="cardText">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>
        </div>`
        }
    }

    // Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            // Play first song wheneverr playlist is clicked
            playMusic(songs[0])
        })
    })
}

async function main() {

    //get list of all the songs
    await getSongs(`songs/${currFolder}`)
    playMusic(songs[0], true)

    // Display all the albums on the page
    await DisplayAlbums()

    //Attach an event listener to play, next and previous buttons
    // play =>
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "resources/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "resources/play.svg";
        }
    })
    // previous=>
    previous.addEventListener("click", () => {
        console.log(currentSong.src);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    // next=>
    next.addEventListener("click", () => {
        console.log(currentSong.src);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add event listener for space bar to play/pause
    document.addEventListener("keydown", () => {
        if (event.code === 'Space') {
            if (currentSong.paused) {
                currentSong.play();
                play.src = "resources/pause.svg";
            } else {
                currentSong.pause();
                play.src = "resources/play.svg";
            }
        }
    });

    // Add event listener for arrow keys to forward/backward the song
    document.addEventListener("keydown", function (event) {
        if (event.code === 'ArrowLeft') {
            // Move backward
            currentSong.currentTime -= 5; // Move 10 seconds backward
        } else if (event.code === 'ArrowRight') {
            // Move forward
            currentSong.currentTime += 5; // Move 10 seconds forward
        }
    });

    // listen for timeUpdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${convertSecondsToMinutesSeconds(currentSong.currentTime)} / ${convertSecondsToMinutesSeconds(currentSong.duration)}`

        if(currentSong.duration > 0){
            document.querySelector(".seekbar").value = (currentSong.currentTime / currentSong.duration) * 100;
        }
        else{
            document.querySelector(".seekbar").value = 0;
        }
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("input", e => {
        let percent = e.target.value;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listener for hamburgerClose
    document.querySelector(".hamburgerClose").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

}

main()
