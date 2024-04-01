// console.log("Start JS")

let currentSong = new Audio()
let songs
let currFolder

function convertSecondsToMinutesSeconds(seconds) {

    if(isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    // Calculate minutes
    let minutes = Math.floor(seconds / 60);
    
    // Calculate remaining seconds
    let remainingSeconds = Math.floor(seconds % 60);
    
    // Format the output with leading zeros
    let formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    return formattedTime;
}

async function getSongs(folder) {

    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response

    let a_s = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < a_s.length; index++) {
        const element = a_s[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}/`)[1])
        }

    }
    

    // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="svgs/musicIcon.svg" alt="music">
                            <div class="info">
                                <div>${song.replaceAll("%20"," ")}</div>
                                <div>Yogesh</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="svgs/play.svg" alt="play now">
                            </div> </li>`
    }

    // attach an eventListener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs
}

const playMusic = (track, pause=false) => {

    // let audio = new Audio("/songs/" + track)
    currentSong.src = `${currFolder}/` + track
    if(!pause) {
        currentSong.play()
        play.src = "svgs/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbum () {
    let a = await fetch(`/songs/`)
    let response = await a.text()

    console.log(response)

    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        console.log(e)
        
    
        if(e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            console.log(folder)

            //get meta data of folder
            try {
                let a = await fetch(`/songs/${folder}/info.json`);
                let response = await a.json();
                console.log("song response", response)
                // Proceed with processing JSON data
                cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder="${folder}">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30">
                    <circle cx="15" cy="15" r="14" fill="#00FF00" stroke="none" />
                    <g transform="translate(4 4)">
                        <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="none" fill="#000000" stroke-width="1.5" stroke-linejoin="round" />
                    </g>
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="card">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>`
            } catch (error) {
                console.error('Error fetching or parsing JSON:', error);
                // Handle the error appropriately
            }
            // console.log(response)
            
            
        }
    }

    // load playlist when card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}

async function main() {
    // get all the songs
    await getSongs("songs/NF")
    playMusic(songs[0], true)

    //disply all albums on the page
    displayAlbum()

    // attach an eventListener to play, prev and next
    let play = document.getElementById("play")
    play.addEventListener("click", () => {
        if(currentSong.paused) {
            currentSong.play()
            play.src = "svgs/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "svgs/play.svg"
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutesSeconds(currentSong.currentTime)}/${convertSecondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%"
    })

    // add an eventListener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //add an eventListener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add an eventListener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    //add an eventListener for prev and next buttons
    document.querySelector("#previous").addEventListener("click", () => {
        console.log("prev click")

        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if (index > 0) {
            playMusic(songs[index-1])
        }
    })

    document.querySelector("#next").addEventListener("click", () => {
        console.log("next click")

        let index = songs.indexOf(currentSong.src.split("/").splice(-1) [0])
        if (index < (songs.length - 1)) {
            playMusic(songs[index+1])
        }
    })

    //add an eventListener for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to : " + e.target.value + " / 100")
        currentSong.volume = parseInt(e.target.value)/100

        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("svgs/mute.svg", "svgs/volume.svg")
        }
    })

    //add an eventListener for mute volume
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("svgs/volume.svg")) {
            e.target.src = e.target.src.replace("svgs/volume.svg", "svgs/mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("svgs/mute.svg", "svgs/volume.svg")
            currentSong.volume = 0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}

main()