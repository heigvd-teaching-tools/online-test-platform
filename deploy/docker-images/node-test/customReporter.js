const { Transform } = require('node:stream');

const CustomReporter = new Transform({
  writableObjectMode: true,
  transform(event, encoding, callback) {
    let output = null;
    switch (event.type) {
      case 'test:start':
        // Optionally output that a test has started
        break;
      case 'test:pass':
        output = `Test ${event.data.name}: passed\n`;
        break;
      case 'test:fail':
        output = `Test ${event.data.name}: failed\n`;
        break;
    }
    callback(null, output);
  }
});

module.exports = CustomReporter;