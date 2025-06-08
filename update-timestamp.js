const fs = require('fs');
const path = require('path');

const timestampFile = path.join(__dirname, 'build', 'lastmodified.html');

// Create exactly the same content as your election site, 
// but set a specific date instead of using document.lastModified
const now = new Date();
const content = `<script>
   var date = "${now}";
   var lastModifiedDate = new Date(date);
   var lastmodified = "<hr>Last modified: ";
   document.getElementById("lastmodified").innerHTML = lastmodified.italics() + lastModifiedDate;
</script>`;

fs.writeFileSync(timestampFile, content);
console.log(`✅ Updated timestamp file with: ${now}`);