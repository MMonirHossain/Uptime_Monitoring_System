/*
* All the CRUD funtion to access the file system will be written here
*/

//dependeccies

const fs= require('fs');
const path= require('path');

//scaffolding
const lib = {};

//base directory of the data folder

lib.basedir = path.join(__dirname,'/../.data/');

//create new data and write to it
lib.create = function(dir,file,data,callback){
    fs.open( lib.basedir+dir+'/'+file+'.json' , 'wx' , (err1, fileDescriptor)=>{
        if(!err1 && fileDescriptor){
            const stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor,stringData,(err2)=>{
                if(!err2){
                    fs.close(fileDescriptor, (err3)=>{
                        if(!err3){
                            callback(false);
                        }else{
                            callback(err3);
                        }                        
                    });
                }else{
                    callback(err2);
                }
            });
        }else{
            callback(err1);
        }
    });
}

// read from the file
lib.read = function(dir, file, callback){
    fs.readFile( lib.basedir+dir+'/'+file+'.json' , 'utf8' , (err,data)=>{
        callback(err,data);
    });
}

// update exiting file
lib.update = function(dir, file, data, callback){
    //file open for writing
    fs.open( `${lib.basedir+dir}/${file}.json`, 'r+' , (err1, fileDescriptor)=>{
        if(!err1 && fileDescriptor){
            const stringData = JSON.stringify(data);
            fs.ftruncate(fileDescriptor,(err2)=>{
                if(!err2){
                    fs.writeFile(fileDescriptor,stringData,(err3)=>{
                        if(!err3){
                            fs.close(fileDescriptor,(err4)=>{
                                if(!err4){
                                    callback(false);
                                }else{
                                    callback(`${err4}: Could Not close the file`);   
                                }                                
                            });
                        }else{
                            callback(err3);
                        }
                    });
                }else{
                    callback(err2);
                }
            });
        }else{
            callback(err1);
        }
    });
}

//Delete exiting file
lib.delete =function(dir,file,callback){
    fs.unlink(`${lib.basedir+dir}/${file}.json`, (err1)=>{
        if(!err1){
            callback(false);
        }else{
            callback(err1);
        }        
    });
}

//list all the item from a directory

lib.list = (dir,callback)=>{
    fs.readdir(`${lib.basedir+dir}/`,(err1, fileNames)=>{
        if(!err1 && fileNames && fileNames.length >0){
            let trimedFileNames=[];
            fileNames.forEach((fileName)=>{
                trimedFileNames.push(fileName.replace('.json',''));
            });

            callback(false,trimedFileNames);

        }else{
            callback('Error reading files');
        }
    });
};

module.exports = lib; 