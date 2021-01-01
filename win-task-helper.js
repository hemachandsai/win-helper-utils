
const ioHook = require('iohook');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const player = require('sound-play');
const path = require('path');

let turnOnCommand = `regedit.exe /S ${path.join(__dirname, "proxy_on.reg")}`;
let turnOffCommand = `regedit.exe /S ${path.join(__dirname, "proxy_off.reg")}`;
let powerShellLaunchCommand = `powershell -Command "Start-Process cmd -Verb RunAs"`;
let incommandMode = false;
let proxyEnabled = false;
let mp3Files = {
    "error": "error.mp3",
    "proxyon": "proxy-on.mp3",
    "proxyoff": "proxy-off.mp3"
}

async function execCommand(command, callback) {
    try {
        const {
            stdout,
            stderr
        } = await exec(command);
        if(stdout) console.log('stdout:', stdout);
        if(stderr) console.log('stderr:', stderr);
        if (stderr) {
            playAudio(mp3Files.error);
        }
        if (!stderr && !stdout) callback(true);
    } catch (e) {
        console.log(e)
        playAudio(mp3Files.error);
    }
}

async function playAudio(fileName) {
    try {
        const filePath = path.join(__dirname, 'mp3', fileName);
        await player.play(filePath);
    } catch (error) {
        console.error(error)
    }
}

ioHook.on("keypress", event => {
    //alt+c
    if (!incommandMode && event.altKey && event.rawcode === 67) {
        incommandMode = true;
        setTimeout(() => {
            incommandMode = false;
        }, 5000)
        return;
    }
    if(!incommandMode){
        return;
    }
    //ctrl+shift+p
    if (event.shiftKey && event.ctrlKey && event.rawcode === 80) {
        if (proxyEnabled) {
            execCommand(turnOffCommand, (res) => {
                if (res) playAudio(mp3Files.proxyoff)
            })
        } else {
            execCommand(turnOnCommand, (res) => {
                if (res) playAudio(mp3Files.proxyon)
            })
        }
        proxyEnabled = !proxyEnabled
    }
    //ctrl+shift+n
    if (event.shiftKey && event.ctrlKey && event.rawcode === 78) {
        execCommand(powerShellLaunchCommand, (res) => {
            if (res) playAudio(mp3Files.proxyon)
        })
    }
    incommandMode = false;

    //ctrl+shift+e
    if (event.shiftKey && event.ctrlKey && event.rawcode === 69) {
        process.exit(0);
    }
});

ioHook.start();