console.log(module);

// we can simply use exports, no need to use module 
module.exports.getDate = getDate;

// to get day of the present date in js, we use date object
function getDate()
{
    var today=new Date();

// adding options to add day, month and year, etc to out current date
var options=
{
    weekday:"long",
    day:"numeric",
    month:"long",
    year:"numeric"
}
var day=today.toLocaleDateString("en-UK", options);
return day;
}