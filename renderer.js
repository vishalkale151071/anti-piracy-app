// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const ps = require('ps-node');
// ps.lookup({}, (err, resultList) => {
//     if(err){
//         throw new Error( err );
//     }
//     for(let i=0;i<resultList.length;i++){
//         console.log(resultList[i].)
//     }
// });

const psList = require('ps-list');
psList().then(data => {
    for(let i=0;i<data.length;i++){
        //console.log(data[i].name);
        if(data[i].name == "obs64.exe"){
            console.log("Alert");
        }
    }
    console.log("Ok.");
});