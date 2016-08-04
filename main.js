'use strict';

const Async = require('async');
const Path = require('fire-path');
const Fs = require('fire-fs');

module.exports = {
  load () {
  },
  unload () {
  },
  messages: {
    'editor:build-start'(event, options){
    },

    'editor:build-finished'(event, options) {
      try{ 
        let tasks = options['sdkList'];

        let dest = Path.join(options.dest, 'jsb-' + options.template );
        let opts = {
          cwd: options.dest
        };

        Async.eachSeries(tasks, function (task, done) {
          if(task['checked']){
            let projectJsonPath = Path.join(dest, '.cocos-package.json');
            let json = JSON.parse(Fs.readFileSync(projectJsonPath));
            let value = task['value'];
            if (!json[value]){     
              Editor.log('Import ' + task['text'] + ' to ' + dest);
              let args = ['package', 'import', '-b', task['value'], '--runincocos'];  
              let child = Editor.NativeUtils.getCocosSpawnProcess(args, opts);
            
              child.stdout.on('data', (data) => {
                Editor.log(data.toString());
              });
              child.on('close', (code, signal) => {
                done();
              });
              child.on('error', function (err) {
                Editor.error(err);
                done();
              });
            }else{
              done();
            }
            
          }else{
            done();
          }
        }, function (err) {
          if (err) Editor.error(err);
        });
        }    
      catch (err) {
        Editor.error(err);
      }

    }
  },
};