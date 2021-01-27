const url = require('url');
const axios = require('axios').default;
const psList = require('ps-list');

function logEverywhere(s, mainWindow) {
    console.log(s);
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(`console.log("${s}")`);
    }
}

function decomposeUrl(_url){
    const components = url.parse(_url, true);
    const params = components.query;
    const protocolName = components.protocol;
    const hostName = components.host;
    const pathName = components.pathname;

    return {
        protocolName,
        hostName,
        pathName,
        params
    }
}

async function intiPlugin(_hostName, _token, mainwindow){
    let res = await axios.request({
        url: `http://${_hostName}/plugin/init`,
        method: 'post',
        headers: {
            Cookie: `connect.sid=s%3A${_token}`
        }
    });

    logEverywhere(res.status, mainwindow);
}

async function sendReport(window, _hostName, _token){
    let status;
    let tool;
    const blackList = ['obs64.exe'];
    let flag = false;
    await psList().then(data => {
        for(let i=0;i<data.length;i++){
            let item = data[i];
            if(blackList.includes(item.name)){
                flag = true;
                logEverywhere("Found : " + item.name, window);
                status = "Alert";
                tool = item.name;
                break;
            }
        }
    });
    if(!flag){
        status = "Ok";
        tool = ''
    }
    logEverywhere("Data : " + status + ' ' + tool, window);
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Cookie: `connect.sid=s%3A${_token}`
        }
    }
    let res = await axios.post(
        `http://${_hostName}/plugin/log`,
        { status, tool },
        config
    )   

    logEverywhere(res.status, window);
}

module.exports = {
    logEverywhere: logEverywhere,
    decomposeUrl: decomposeUrl,
    intiPlugin: intiPlugin,
    sendReport: sendReport
}   