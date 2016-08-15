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
        let tasks = options.sdkList;
        let dest = '';
        if(options.platform == "web-mobile") {
          dest = Path.join(options.dest, options.platform);
        }else{
          dest = Path.join(options.dest, 'jsb-' + options.template);
        } 
        let opts = {
          cwd: dest
        };
        
        Async.eachSeries(tasks, function (task, done) {
          if(task.checked){
            let projectJsonPath = Path.join(dest, '.cocos-package.json');
            let value = task.value;
            if (Fs.existsSync(projectJsonPath)){
                let json = JSON.parse(Fs.readFileSync(projectJsonPath));
                if(json[value] && options.platform != "web-mobile") {
                  done();
                  return ;
                }
            }
            Editor.log('Import ' + task.text + ' to ' + dest);
              let args = ['package', 'import', '-b', value, '--runincocos', '-v'];  
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