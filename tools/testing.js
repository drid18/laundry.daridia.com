// Date.prototype.addHours = function (h) {
//     this.setTime(this.getTime() + (h * 60 * 60 * 1000));
//     return this;
// }

// var date = new Date().addHours(8).toISOString().substring(0,10);

// console.log(date);

var date = new Date()
console.log(Date.now());
console.log(getRndInteger(10000,99999));
// console.log(date.getTime());

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}