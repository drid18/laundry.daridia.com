Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

var date = new Date().addHours(8).toISOString().substring(0,10);

console.log(date);