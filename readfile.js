var fs = require('fs');

fs.watchFile('./test.txt', {persistent: true, interval: 0}, function(curr, prev) {
	console.log('current time' + curr.mtime);
	console.log('previous time' + prev.mtime);
});
