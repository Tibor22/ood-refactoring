const Screen = require("./screen");

class Cinema {
  constructor() {
    this.films = [];
    this.screens = [];
  }

  find(name, thisArg) {
    return thisArg.find((screen) => screen.name === name);
  }

  validateRating(rating) {
    return ["U", "PG", "12", "15", "18"].some(
      (currRating) => currRating === rating
    );
  }

  //Add a new screen
  addScreen(screenName, capacity) {
    if (capacity > 100) {
      return "Exceeded max capacity";
    }
    //Check the screen doesn't already exist
    if (this.find(screenName, this.screens) != undefined) {
      return "Screen already exists";
    }
    let { ...screen } = new Screen(screenName, capacity);
    this.screens.push(screen);
  }

  parseTime(duration) {
    const result = /^(\d?\d):(\d\d)$/.exec(duration);
    if (result == null) {
      return false;
    }
    const hours = parseInt(result[1]);
    const mins = parseInt(result[2]);

    if (hours <= 0 || mins > 60) {
      return false;
    }
    return [hours, mins];
  }

  //Add a new film
  addFilm(movieName, rating, duration) {
    //Check the film doesn't already exist
    if (this.find(movieName, this.films) != undefined) {
      return "Film already exists";
    }
    //Check the rating is valid
    if (!this.validateRating(rating)) {
      return "Invalid rating";
    }

    //Check duration
    if (!this.parseTime(duration)) {
      return "Invalid duration";
    }

    this.films.push({ name: movieName, rating: rating, duration: duration });
  }

  checkForMovieOverlap(newMovieStart, newMovieEnd, currShowing) {
    console.log(newMovieStart, newMovieEnd, currShowing);
    //Get the start time in hours and minutes
    const startTime = currShowing.startTime;
    if (!this.parseTime(startTime)) {
      return "Invalid start time";
    }
    const [startTimeHours, startTimeMins] = this.parseTime(startTime);
    //Get the end time in hours and minutes
    const endTime = currShowing.endTime;
    if (!this.parseTime(endTime)) {
      return "Invalid end time";
    }
    const [endTimeHours, endTimeMins] = this.parseTime(endTime);
    //if intended start time is between start and end
    const currMovieStart = startTimeHours * 60 + startTimeMins;
    const currMovieEnd = endTimeHours * 60 + endTimeMins;

    if (
      (newMovieStart > currMovieStart && newMovieStart < currMovieEnd) ||
      (newMovieEnd > currMovieStart && newMovieEnd < currMovieEnd) ||
      (newMovieStart < currMovieStart && newMovieEnd > currMovieEnd)
    ) {
      return true;
    }
  }

  //Add a showing for a specific film to a screen at the provided start time
  addFilmToScreen(movie, screenName, startTime) {
    if (!this.parseTime(startTime)) {
      return "Invalid start time";
    }
    const [intendedStartTimeHours, intendedStartTimeMinutes] =
      this.parseTime(startTime);

    if (this.find(movie, this.films) === undefined) {
      return "Invalid film";
    }
    let film = this.find(movie, this.films);
    //From duration, work out intended end time
    //if end time is over midnight, it's an error
    //Check duration
    if (!this.parseTime(film.duration)) {
      return "Invalid duration";
    }
    const [durationHours, durationMins] = this.parseTime(film.duration);
    //Add the running time to the duration
    const intendedEndTimeHours = intendedStartTimeHours + durationHours;
    //It takes 20 minutes to clean the screen so add on 20 minutes to the duration
    //when working out the end time
    const intendedEndTimeMinutes = intendedStartTimeMinutes + durationMins + 20;
    if (intendedEndTimeHours >= 24) {
      return "Invalid start time - film ends after midnight";
    }
    //Find the screen by name
    if (this.find(screenName, this.screens) === undefined) {
      return "Invalid screen";
    }

    const theatre = this.find(screenName, this.screens);
    //Go through all existing showings for this film and make
    //sure the start time does not overlap
    const newMovieStart =
      intendedStartTimeHours * 60 + intendedStartTimeMinutes;
    const newMovieEnd = intendedEndTimeHours * 60 + intendedEndTimeMinutes;
    for (let i = 0; i < theatre.showings.length; i++) {
      if (
        this.checkForMovieOverlap(
          newMovieStart,
          newMovieEnd,
          theatre.showings[i]
        )
      ) {
        return "Time unavailable";
      }
    }
    //Add the new start time and end time to the showing
    theatre.showings.push({
      film: film,
      startTime: startTime,
      endTime: intendedEndTimeHours + ":" + intendedEndTimeMinutes,
    });
  }

  allShowings() {
    let showings = {};
    for (let i = 0; i < this.screens.length; i++) {
      const screen = this.screens[i];
      for (let j = 0; j < screen.showings.length; j++) {
        const showing = screen.showings[j];
        if (!showings[showing.film.name]) {
          showings[showing.film.name] = [];
        }
        showings[showing.film.name].push(
          `${screen.name} ${showing.film.name} (${showing.film.rating}) ${showing.startTime} - ${showing.endTime}`
        );
      }
    }

    return showings;
  }
}

module.exports = Cinema;
