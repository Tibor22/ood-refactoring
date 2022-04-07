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

  parseTime(duration, errorMsg) {
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

  //Add a showing for a specific film to a screen at the provided start time
  addFilmToScreen(movie, screenName, startTime) {
    let result = /^(\d?\d):(\d\d)$/.exec(startTime);
    // console.log(result);
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
    let intendedEndTimeHours = intendedStartTimeHours + durationHours;

    //It takes 20 minutes to clean the screen so add on 20 minutes to the duration
    //when working out the end time
    let intendedEndTimeMinutes = intendedStartTimeMinutes + durationMins + 20;
    if (intendedEndTimeMinutes >= 60) {
      intendedEndTimeHours += Math.floor(intendedEndTimeMinutes / 60);
      intendedEndTimeMinutes = intendedEndTimeMinutes % 60;
    }

    if (intendedEndTimeHours >= 24) {
      return "Invalid start time - film ends after midnight";
    }

    //Find the screen by name
    if (this.find(screenName, this.screens) === undefined) {
      return "Invalid screen";
    }
    let theatre = this.find(screenName, this.screens);
    //Go through all existing showings for this film and make
    //sure the start time does not overlap
    let error = false;
    console.log("THEATHRE", theatre);
    for (let i = 0; i < theatre.showings.length; i++) {
      //Get the start time in hours and minutes
      const startTime = theatre.showings[i].startTime;
      result = /^(\d?\d):(\d\d)$/.exec(startTime);
      if (result == null) {
        return "Invalid start time";
      }

      const startTimeHours = parseInt(result[1]);
      const startTimeMins = parseInt(result[2]);
      if (startTimeHours <= 0 || startTimeMins > 60) {
        return "Invalid start time";
      }

      //Get the end time in hours and minutes
      const endTime = theatre.showings[i].endTime;
      result = /^(\d?\d):(\d\d)$/.exec(endTime);
      if (result == null) {
        return "Invalid end time";
      }

      const endTimeHours = parseInt(result[1]);
      const endTimeMins = parseInt(result[2]);
      if (endTimeHours <= 0 || endTimeMins > 60) {
        return "Invalid end time";
      }

      //if intended start time is between start and end
      const d1 = new Date();
      d1.setMilliseconds(0);
      d1.setSeconds(0);
      d1.setMinutes(intendedStartTimeMinutes);
      d1.setHours(intendedStartTimeHours);

      const d2 = new Date();
      d2.setMilliseconds(0);
      d2.setSeconds(0);
      d2.setMinutes(intendedEndTimeMinutes);
      d2.setHours(intendedEndTimeHours);

      const d3 = new Date();
      d3.setMilliseconds(0);
      d3.setSeconds(0);
      d3.setMinutes(startTimeMins);
      d3.setHours(startTimeHours);

      const d4 = new Date();
      d4.setMilliseconds(0);
      d4.setSeconds(0);
      d4.setMinutes(endTimeMins);
      d4.setHours(endTimeHours);

      if (
        (d1 > d3 && d1 < d4) ||
        (d2 > d3 && d2 < d4) ||
        (d1 < d3 && d2 > d4)
      ) {
        error = true;
        break;
      }
    }

    if (error) {
      return "Time unavailable";
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
