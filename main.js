require('dotenv').config();
const { Telegraf } = require('telegraf');
const { SerialPort } = require('serialport');
const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);
let isConnect = true;

// Serial port setup
const port = new SerialPort({
    path: "COM9",
    baudRate: 9600
});

// When the serial port is opened
port.on('open', function () {
    console.log('✅ Connected to Arduino on '+ port.path);
});

// Listening to data coming from the Arduino
port.on('data', function (data) {
    // for debug code arduino response
    console.log('📥 Arduino Response:', data.toString());
    if(global.chatId  &&  data.toString() != "0") {
        SendToUsers(global.chatId,data.toString()).catch((err)=>{
            console.log(err);
        });
    }
});

// checked arduino  is connected
port.on('error', function (err) {
    isConnect = false;
    console.log('❌ Serial Port Error:', err.message);
});


bot.command('start', (ctx) => {
    ctx.reply('Hello! Welcome to  Arduino bot.');
});

// Receive text messages from the user and send them to the Arduino
bot.on('text', async (ctx) => {
    const receivedMessage = ctx.message.text;
    global.chatId = ctx.chat.id;
    if (isConnect){
        SendToArduino(receivedMessage);
    }else{
        ctx.reply("📡 Arduino is not connected ");
    }
});

function  SendToArduino(text){
     port.write(text+'\n',(err)=>{
         if (err) {
             console.log('❌ Error writing:', err.message);
         }
     })
}

async function SendToUsers(chatID,message){
    try{
        await bot.telegram.sendMessage(chatID,message);
    }
    catch (error) {
        return error ;
    }
}
// Run the bot
bot.launch()
    .catch(err=>{console.log(err);});``
