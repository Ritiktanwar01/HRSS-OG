

export function formattedDatetime(dateStr:string){

// Parse into a Date object
console.log("Original date string:", dateStr);
const dt = new Date(dateStr);

// Format into dd/mm/YY H:S
const formatted = dt.toLocaleString("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});
return formatted;
}