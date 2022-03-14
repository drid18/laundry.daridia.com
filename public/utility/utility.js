export function getcurrentdate(){
    var c = new Date();
    return `${c.getFullYear()}-${c.getMonth()+1}-${c.getDate()}`
}