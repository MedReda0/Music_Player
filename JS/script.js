// Element Selectors
let colors = document.querySelector(":root");
let theme = document.querySelector(".theme");
let search = document.querySelector(".search");
let header_ele = document.querySelectorAll(".ele");
let search_input = document.querySelector(".search input");
let search_icon = document.querySelector(".search i");
let section = document.querySelector("section");
let song_cover = document.querySelector(".song-cover");
let songs_index = document.querySelectorAll(".index");
let songs = document.querySelectorAll("li");
let song_name = document.querySelectorAll(".name");
let progress_bar = document.querySelector(".progress_bar");
let bar = document.querySelector(".bar");
let fill_bar = document.querySelector(".fill_bar");
let bg_cover = document.querySelector(".bg-cover");
let info_song_name = document.querySelector(".song-name");
let artist = document.querySelector(".artist");
let album = document.querySelector(".album");
let play_btn = document.querySelector(".play");
let play_btn_icon = document.querySelector(".play i");
let forward_btn = document.querySelector(".forward");
let backward_btn = document.querySelector(".backward");
let shuffle = document.querySelector(".shuffle");
let repeat = document.querySelector(".repeat");
let current_duration = document.querySelector(".current_duration");
let duration = document.querySelectorAll(".duration");

// Initialize variables
let current_song = localStorage.current_song || 0;
let playing = false;
let song = new Audio();

// Event listener for when the DOM is fully loaded
addEventListener("DOMContentLoaded", () => {
  infoLoad();

  // Initialize song durations
  Array.from(songs).map((ele, idx) => {
    let song_duration = new Audio();
    song_duration.src = ele.getAttribute("song-src");
    if (idx != 9) get_duration(song_duration, idx);
  });

  // Add event listeners to each song
  Array.from(songs).forEach((ele, idx) => {
    ele.addEventListener("click", () => {
      song.pause();
      if (playing) playing = !playing;
      localStorage.setItem("current_song", idx);
      current_song = localStorage.current_song;
      loadsong(current_song);
      playing = !playing;
      song.play();
      playing_check();
      if (repeat.classList.contains("active")) {
        repeat_toggle();
        localItem_toggle("repeat");
      }
    });
  });

  // Control buttons event listeners
  play_btn.addEventListener("click", playingToggle);
  forward_btn.addEventListener("click", song_control(1));
  backward_btn.addEventListener("click", song_control(-1));
  shuffle.addEventListener("click", () => {
    shuffle.classList.toggle("active");
    localItem_toggle("shuffle");
  });
  repeat.addEventListener("click", () => {
    repeat_toggle();
    localItem_toggle("repeat");
  });

  // Update song progress bar on time-update
  song.addEventListener("timeupdate", () => {
    bar.addEventListener("click", function (event) {
      let pos = (event.offsetX / this.offsetWidth) * 100;
      song.currentTime = (pos / 100) * song.duration;
    });
  });

  // Handle song End event
  song.addEventListener("ended", () => {
    setTimeout(() => {
      if (repeat.classList.contains("active")) {
        song.currentTime = 0;
        song.play();
      } else {
        song_forward();
      }
    }, 700);
  });

  // Theme toggle button event listener
  theme.addEventListener("click", () => {
    localStorage.theme == "dark" ? localStorage.removeItem("theme") : localStorage.setItem("theme", "dark");
    check_theme();
  });
});

// Load and display the selected song's details
function loadsong(index) {
  song.src = songs[index].getAttribute("song-src");
  song.load();
  bg_cover.style.backgroundImage = `url(${songs[index].getAttribute("cover-src").replaceAll(" ", "%20")})`;
  song_cover.setAttribute("src", `${songs[index].getAttribute("cover-src")}`);
  info_song_name.textContent = song_name[index].textContent;
  artist.textContent = songs[index].getAttribute("artiste");
  artist.textContent = songs[index].getAttribute("artist");
  album.textContent = songs[index].getAttribute("album");
  Array.from(songs).map(ele => ele.classList.remove("active"));
  songs[index].classList.add("active");
  get_duration(song, duration.length - 1);
  song.addEventListener("timeupdate", () => {
    current_duration.textContent = formatTime(song.currentTime);
    fill_bar.style.width = `${(song.currentTime / song.duration) * 100}%`;
  });
}

// Toggle play/pause state of the song
function playingToggle() {
  if (playing) {
    song.pause();
    playing = !playing;
  } else {
    song.play();
    playing = !playing;
  }
  playing_check();
}

// Play the next song in the list
function song_control(x) {
  if (playing) playingToggle();
  current_song+=x;
  check_shuffle();
  localStorage.current_song = current_song;
  song.currentTime = 0;
  limiter();
  songs[current_song].scrollIntoView({ behavior: "smooth" });
  loadsong(current_song);
  playingToggle();
  if (repeat.classList.contains("active")) {
    repeat_toggle();
    localItem_toggle("repeat");
  }
}

// // Play the previous song in the list
// function song_backward() {
//   if (playing) playingToggle();
//   current_song--;
//   check_shuffle();
//   localStorage.current_song = current_song;
//   limiter();
//   songs[current_song].scrollIntoView({ behavior: "smooth" });
//   loadsong(current_song);
//   playingToggle();
//   if (repeat.classList.contains("active")) {
//     repeat_toggle();
//     localItem_toggle("repeat");
//   }
// }

// Ensure current_song index is within bounds
function limiter() {
  if (current_song >= songs.length || current_song == -1) {
    current_song = 0;
    localStorage.current_song = current_song;
  }
}

// Update play/pause button icon
function playing_check() {
  if (playing) {
    play_btn_icon.classList.remove("fi-ss-play");
    play_btn_icon.classList.add("fi-ss-pause");
  } else {
    play_btn_icon.classList.remove("fi-ss-pause");
    play_btn_icon.classList.add("fi-ss-play");
  }
}

// Shuffle songs if shuffle mode is active
function check_shuffle() {
  if (shuffle.classList.contains("active")) {
    do {
      index = Math.floor(Math.random() * songs.length);
    } while (index == current_song)
    current_song = index;
  }
}

// Toggle repeat mode
function repeat_toggle() {
  repeat.classList.toggle("active");
  repeat.classList.toggle("fi-rr-arrows-repeat");
  repeat.classList.toggle("fi-rr-arrows-repeat-1");
}

// Toggle local storage item
function localItem_toggle(name) {
  localStorage[name] ? localStorage.removeItem(name) : localStorage.setItem(name, "true");
}

// Format time to MM:SS
function formatTime(time) {
  let sec = Math.floor(time % 60);
  let min = Math.floor(time / 60);
  return `${min}:${sec < 10 ? `0${sec}` : sec}`;
}

// Get and display song duration
function get_duration(songV, index) {
  songV.addEventListener("loadedmetadata", () => duration[index].textContent = formatTime(songV.duration));
}

// Sync progress-bar width with the section width
function progress_bar_width() {
  progress_bar.style.width = getComputedStyle(section)["width"];
}

// Check and apply theme
function check_theme() {
  if (localStorage.theme == "dark") {
    theme.classList.add("dark");
    colors.style.setProperty("--primary_color", "#0d071f");
    colors.style.setProperty("--secondary_color", "#c0c8de");
    colors.style.setProperty("--transparent_primary_color", "rgba(13, 7, 31,0.65)");
    colors.style.setProperty("--transparent_secondary_color", "rgba(192, 200, 222, 0.65)");
  } else {
    theme.classList.remove("dark");
    colors.style.setProperty("--primary_color", "#c0c8de");
    colors.style.setProperty("--secondary_color", "#0d071f");
    colors.style.setProperty("--transparent_primary_color", "rgba(192, 200, 222, 0.65)");
    colors.style.setProperty("--transparent_secondary_color", "rgba(13, 7, 31,0.65)");
  }
}

// Toggle search bar display on smaller screens
function search_display() {
  if (search_input.style.width != "100px") {
    search_input.style.width = "100px";
    Array.from(header_ele).map(ele => ele.classList.toggle("desactive"));
  } else {
    search_input.style.width = "0px";
    Array.from(header_ele).map(ele => ele.classList.toggle("desactive"));
  }
}

// Load initial settings and data
function infoLoad() {

  // Check and apply the saved theme
  check_theme();

  // Load the current song and update the UI
  loadsong(current_song);

  // Ensure current_song index is within bounds
  limiter();

  // Save the current time of the song during playback
  song.addEventListener("timeupdate", () => {
    if (playing) localStorage.setItem("current_time", song.currentTime);
  });

  // Set the current time of the song if available in local storage
  if (localStorage.current_time) {
    song.addEventListener("loadedmetadata", () => {
      song.currentTime = localStorage.current_time;
    });
  }

  // Scroll the current song into view
  songs[current_song].scrollIntoView();

  // Apply shuffle and repeat settings if they are saved in local storage
  if (localStorage.shuffle) shuffle.classList.toggle("active");
  if (localStorage.repeat) repeat_toggle();

  // Add click event to display search bar on small screens
  if (innerWidth <= 450) search_icon.addEventListener("click", search_display);

  // Adjust progress bar width on window resize
  window.addEventListener("resize", () => {
    progress_bar_width();
    if (innerWidth >= 450) {
      search_input.style.width = "auto";
    } else {
      search_input.style.width = "0px";
    }
  });

  // Set initial width of the progress bar
  progress_bar_width();

  // Display song indices
  Array.from(songs_index).map((ele, idx) => ele.innerHTML = idx + 1);
}
