const Cinema = require("./src/cinema");

const cinema = new Cinema();
console.log("NEW SCREEN:", cinema.addScreen("Screen #1", 50));
console.log(cinema.addScreen("Screen #2", 100));

console.log(cinema.addFilm("Dune", "12", "2:30"));
console.log(cinema.addFilm("The Alpinist", "15", "1:15"));

// console.log(cinema.addFilmToScreen("The Alpinist", "Screen #1", "10:00"));
// console.log(cinema.addFilmToScreen("The Alpinist", "Screen #2", "10:00"));
// console.log(cinema.addFilmToScreen("The Alpinist", "Screen #2", "11:30"));

console.log(cinema.addFilmToScreen("Dune", "Screen #1", "12:40"));
console.log(cinema.addFilmToScreen("Dune", "Screen #1", "19:40"));
console.log(cinema.addFilmToScreen("Dune", "Screen #1", "23:40"));

console.log(cinema.allShowings());

console.log(cinema);
