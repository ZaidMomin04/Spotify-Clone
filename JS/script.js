let currentSong = new Audio();
let big_play = document.getElementById("play");
let small_play;
let index = 0;
let songs;
let song_names;
let currFolder;
let songUL;

const production = true;

const allPlay = () => {
  let plays = document.querySelectorAll(".playNow>img");
  plays.forEach((e) => {
    e.src = `/ICONS/play.svg`;
  });
};

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let respone = await a.text();
  let div = document.createElement("div");
  div.innerHTML = respone;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }

  song_names = songs.map((e) => {
    let s = "/";
    let parts = e.split(s);
    parts = parts[parts.length - 1];
    return parts;
  });

  // Show all the song in playlist
  songUL = document.body
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of song_names) {
    songUL.innerHTML += `<li>
                        <img src="ICONS/music.svg" alt="">
                        <div class="songInfo">
                            <div>${song.replaceAll("%20", " ")}</div>
                        </div>
                        <div class="playNow flex">
                            <span class="white-space">Play Now</span>
                            <img class="invert" src="ICONS/play.svg" alt="">
                        </div> </li>`;
  }

  // Attach an Event Listener to Songs
  Array.from(document.body.querySelectorAll(".songList li")).forEach(
    (element) => {
      element.addEventListener("click", (e) => {
        let m = element.querySelector(".songInfo").firstElementChild.innerHTML;
        let small_play = element.querySelector(".playNow>img");

        if (currentSong.paused) {
          small_play.src = `/ICONS/pause.svg`;
          playMusic(m);
        } else {
          currentSong.pause();
          small_play.src = `/ICONS/play.svg`;
          big_play.src = `/ICONS/play.svg`;
          allPlay();
        }
      });
    }
  );
  return song_names;
}

function getSmallPlay() {
  let i;
  let parts = currentSong.src.split("/");
  parts = decodeURI(parts[parts.length - 1]);
  let x = songUL.querySelectorAll(".songInfo");
  let curr = Array.from(x).map((e) => {
    return e.querySelector("div").innerHTML;
  });
  curr.forEach((value, index) => {
    if (value === parts) {
      i = index;
    }
  });

  let s = songUL.querySelectorAll(".playNow>img")[i];
  return s;
}

const playMusic = (track, pause = false) => {

  currentSong.src = `${currFolder}/` + track;
  small_play = getSmallPlay();

  if(currentSong.currentTime>=0 && currentSong.played) {
    allPlay();
  }
  if (!pause) {
    currentSong.play();
    big_play.src = `/ICONS/pause.svg`;
    small_play.src = `/ICONS/pause.svg`;
  }
  
  document.querySelector(".song-Name").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = `00:00 : 04:39`;
};

function secondsToHHMM(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.round(seconds % 60);

  // Add leading zeros if necessary
  var minutesStr = minutes < 10 ? "0" + minutes : minutes;
  var secondsStr =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return minutesStr + ":" + secondsStr;
}
async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let respone = await a.text();
  let div = document.createElement("div");
  div.innerHTML = respone;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".card-container");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0].replace("%20", " ");
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card rounded">
          <img class="play-btn" src="ICONS/play-icon.svg" alt="" height="60">
          <img class="card-img rounded"
              src="/songs/${folder}/cover.jpg">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
      </div>`;
    }
  }

  // Load the Playlist Whenever the card is clicked
  Array.from(document.querySelectorAll(".card")).forEach((element) => {
    element.addEventListener("click", async (item) => {
      songs = await getSongs(`/songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // Get the List of all Songs
  await getSongs(`songs/Desi Rap`);
  playMusic(song_names[0], true);

  // Display all the albums on the page
  displayAlbums();

  big_play.addEventListener("click", () => {
    small_play = getSmallPlay();
    if (currentSong.paused) {
      currentSong.play();
      big_play.src = `/ICONS/pause.svg`;
      small_play.src = `/ICONS/pause.svg`;
    } else {
      currentSong.pause();
      big_play.src = `/ICONS/play.svg`;
      small_play.src = `/ICONS/play.svg`;
      allPlay();
    }
  });

  // Listen for timeupdate events
  currentSong.addEventListener("timeupdate", () => {
    let x = secondsToHHMM(currentSong.currentTime);
    let d = secondsToHHMM(currentSong.duration);
    document.querySelector(".songTime").innerHTML = x + " : " + d;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an Event Listener to Seek Bar
  document.body.querySelector(".seek-bar").addEventListener("click", (e) => {
    let percentage = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.body.querySelector(".circle").style.left = percentage + "%";
    currentSong.currentTime = (currentSong.duration * percentage) / 100;
  });

  // Add an Event Listener for HamBurger
  document.body.querySelector("#hamburger").addEventListener("click", () => {
    document.body.querySelector(".left").style.left = "0";
  });
  // Add an Event Listener for Cross
  document.body.querySelector("#cross-icon").addEventListener("click", (e) => {
    document.body.querySelector(".left").style.left = "-120%";
  });

  // Add an Event Listener to the "Previous" button
  let previous = document.body.querySelector("#previous");
  previous.addEventListener("click", () => {
    // Get the index of the current song in the song_names array
    let index = song_names.indexOf(currentSong.src.split("/").slice(-1)[0]);
    
    // Check if there's a previous song available
    if (index - 1 >= 0) {
      // If so, play the previous song
      playMusic(song_names[index - 1]);
    } else {
      // If not (i.e., if index becomes negative), play the last song in the playlist
      playMusic(song_names[song_names.length - 1]);
    }
  });

  // Add an Event Listener to the "Next" button
  let next = document.body.querySelector("#next");
  next.addEventListener("click", () => {
    // Get the index of the current song in the song_names array
    let index = song_names.indexOf(currentSong.src.split("/").slice(-1)[0]);
    // Check if there's a next song available
    if (index + 1 < song_names.length) {
      // If so, play the next song
      playMusic(song_names[index + 1]);
    } else {
      // If not (i.e., if index exceeds the length of the song_names array), restart from the first song
      playMusic(song_names[0]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume <= 0) {
        document.querySelector(".volume>img").src = `/ICONS/mute.svg`;
      } else {
        document.querySelector(".volume>img").src = `/ICONS/volume.svg`;
      }
    });

  // Add an Event Listener to mute the track
  let v = document.querySelector(".volume>img");
  v.addEventListener("click", (e) => {
    if (currentSong.volume > 0) {
      currentSong.volume = 0;
      v.src = `/ICONS/mute.svg`;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      currentSong.volume = 0.4;
      v.src = `/ICONS/volume.svg`;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 40;
    }
  });
}

main();
