import fs from "fs";
import request from "request";
import logger from "./util/logger";

let dictionary;

module.exports = {
  init: function (config) {
    if(!dictionary && config){

      // check if file or directory
      if(typeof(config) === 'string' && fs.existsSync(config)){
        // error if directory
        if(!fs.lstatSync(config).isFile()){
          logger.warn("Error reading nightwatch extra dictionary from [" + config + "]. Path must be a file!");
          return;
        }
        let content = fs.readFileSync(config, 'utf8');
        try{
          dictionary = JSON.parse(content);
        }catch(e){
          // error if JSON parse fails
          logger.warn("Error parsing nightwatch extra dictionary from file [" + config + "]. File Content: [" + content + "]. " + e + ". Contents must be a valid json object with key/value pairs.");
        }
      }else{

        // try to parse string if it's json
        if(typeof(config) === 'string' && config.startsWith("{")){
          try{
            config = JSON.parse(config);
          }catch(e){
            // error if invalid
            logger.warn("Error loading error dictionary from [" + config + "]. " + e + ". Config should be a valid file string, url string, or a url object accpted by https://github.com/request/request#requestoptions-callback.");
            return;
          }
        }

        request(config, function (error, response, body) {
          if(error){
            logger.warn("Error loading error dictionary from [" + JSON.stringify(config) + "]. " + error + ". Config should be a valid file string, url string, or a url object accpted by https://github.com/request/request#requestoptions-callback.");
            return;
          }
          try{
            dictionary = JSON.parse(body);
          }catch(e){
            logger.warn("Error parsing nightwatch extra dictionary. Dictionary: [" + JSON.stringify(body) + "]. " + e + ". Contents must be a valid json object with key/value pairs.");
          }
        });
      }
    }
  },
  format: function (error) {
    let ret = error;
    if(dictionary){
      for(var key in dictionary){
        let value = dictionary[key];
        let regex = new RegExp(key);
        if(error.match(regex)){
          ret = error.replace(regex, value);
        }
      }
    }
    return ret;
  }
}