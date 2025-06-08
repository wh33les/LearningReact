const fs = require('fs');
const path = require('path');

const timestampFile = path.join(__dirname, 'build', 'lastmodified.html');

if (fs.existsSync(timestampFile)) {
    const timestamp = new Date().toLocaleString();
    const content = `<script>
   var lastmodified = "<hr>Last modified: ";
   document.getElementById("lastmodified").innerHTML = lastmodified.italics() + "${timestamp}";
</script>`;

    fs.writeFileSync(timestampFile, content);
    console.log(`✅ Updated timestamp: ${timestamp}`);
}