const assertService = require('./index')
const Memdb = require('memdb')
const options = {
    createIfMIssing: true,
    valueEncoding: 'json'
}
let db = Memdb(options)

var AssetService = require('./index');


var { Readable,  Transform }= require('stream')
var util = require('util');
var namesgenerator = require('docker-namesgenerator')
  , names = {}
  , i
  , name
  ;


function NameGenerator(options) {
  if (! (this instanceof NameGenerator)) return new NameGenerator(options);
  if (! options) options = {};
  options.objectMode = true;
  Readable.call(this, options);
}

util.inherits(NameGenerator, Readable);

NameGenerator.prototype._read = function read() {
  var self = this;
  generateName(function(err, name) {
    if (err) return self.emit('error', err);
    self.push({name:name});
  });
};

function Manipulator(options) {
  if (! (this instanceof Manipulator)) return new Manipulator(options);
  if (! options) options = {};
  options.objectMode = true;
  Transform.call(this, options);
}

util.inherits(Manipulator, Transform)

Manipulator.prototype._transform = function _transform(obj, encoding, callback) {
  obj.status = 'created'
  this.push(obj);
  callback();
};

var writeStream = AssetService(db).createWritableStream();
var namegenerator = new NameGenerator({highWaterMark: 10});
var manipulator = new Manipulator({highWaterMark: 10});

function generateName(cb){
  var checker = function(name) {
    return names.hasOwnProperty(name);
  };
  name = namesgenerator(checker);
  cb(null,name)
}

namegenerator.pipe(manipulator).pipe(writeStream)
