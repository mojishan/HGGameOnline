var singleListUtil = require('./roomsListUtils').RoomList;
var service = require("../../db_service/service");
var Map = require("../../HJCUtils/HJCMap").Map;
var roomList = new singleListUtil;
var scaleInfoList =[ "/12(小)","/18(中)","/24(大)"];
var modeInfoList=["无职业","标准局","风云再起"];
var numMaxList = [12,18,24];
var hallName = "hall";


//该Map用于维护在线玩家信息：key = nick, value={ rid,fid,hallShowInfo}
var onLineList = new Map;

//方法：重名检测
exports.dupliCheck = dupliCheck;
function dupliCheck(checkNick,callback){
    if(onLineList.containsKey(checkNick)){
        var userTick = onLineList.get(checkNick);
        tickFromOnline(checkNick,null);
        callback({res:true,rid:userTick.rid,fid:userTick.fid});
    }else{
        callback({res:false});
    }
}

//方法：玩家上线-1、更新onLineList 2、返回onLineList、roomList和MyInfo
exports.onLine = onLine;
function onLine(nick,fid,callback){
    service.getUserShowInfo(nick,function(ret1){
        if(ret1.code!=200){
           callback(ret1);
        }
        var hallShowInfo = ret1.user;
        onLineList.put(nick,{rid:hallName,fid:fid,hallShowInfo:hallShowInfo});
        var hallList = getHallList();
        var roomList = getRoomList();
        service.getMyInfo(nick,function(ret2){
            if(ret2.code!=200){
                callback(ret2);
            }
            //TODO fiendList需要变为真数据
            callback({code:200,
                data:{hallList:hallList,
                    roomList:roomList,
                    myInfo:ret2.user,
                    myInfo4Show:hallShowInfo,
                    friends:["假数据1","假数据2"]}
            });
        })
    })
}

//方法：玩家从rid断开游戏
exports.offLine = offLine;
function offLine(loster,rid,callback){
    tickFromOnline(loster,rid);
    callback();
}

//方法：玩家创建房间，初始化房间信息，并将创建房间rid返回房主，更行RoomList和onLineList
exports.buildRoom = buildRoom;
function buildRoom(hoster,params,callback){
    var rid = roomList.findMin();
    console.log(rid);
    if(rid==0){
        callback({code:201,info:"房间数量已达上限..."});
    }
    params.rid = rid;
    var newRoom = new Room(hoster,params);
    roomList.set(rid,newRoom);
    changeChannelInfo(hoster,rid);
    callback({code:200,data:{rid:params.rid,rList:getRoomList()}});
}

//方法：玩家进入房间，首先检测密码，再检测房间是否已经满员，预留检测项，更新RoomList和onLineList
exports.enterRoom = enterRoom;
function enterRoom(enterUser,params,callback){
    var rid = params.rid;
    var pswd = params.password;
    var roomInfo = roomList.get(rid);
    if(!roomInfo){
        callback({code:201,info:"请求加入的房间不存在或已经取消..."});
    }
    if(roomInfo!=""&&roomInfo.rPswd!=pswd){
        callback({code:201,info:"密码错误..."});
    }
    if(roomInfo.max <= roomInfo.num){
        callback({code:201,info:"房间已满..."});
    }
    if(rid==0){

    }
    var newRoomInfo = userEnterRoom(enterUser,rid);
    callback({code:200,rmChg:newRoomInfo});
}

//方法：根据RoomList返回给用户可以显示的房间列表信息
exports.getRoomList =  getRoomList;
function getRoomList(){
    var results = [];
    for(var i = 1; i< roomList.count();i++){
        if(roomList.get(i)==null||roomList.get(i)==undefined) continue;
        results.push(spellRoomInfo(roomList.get(i)));
    }
    return results;
}

//方法：根据一个房间的数据，拼接这个房间的显示信息
function spellRoomInfo(room){
    var scaleInfo = scaleInfoList[room.rScale];
    var modeInfo = modeInfoList[room.rMode];
    var result = {
        "rid":room.rid,
        "name":room.rName,
        "num":room.num+scaleInfo,
        "mode":modeInfo,
        "statues":room.state
    }
    return result;
}
Room.prototype ={
    constructor:Room,
    do_sth : function(){}   //原型对象用来定义类的方法
}

//方法：获得在大厅的玩家
function getHallList(){
    var nicks = onLineList.keys();
    var values = onLineList.values();
    var list =[];
    for(var i = 0; i<nicks.length;i++){
        if(values[i].rid===hallName){
            list.push({nick:nicks[i],info:values[i].hallShowInfo});
        }else continue;
    }
    return list;
}

//方法：将onLineList中的指定玩家的进行修改
function changeChannelInfo(nick,rid){
    var userOnLineInfo = onLineList.get(nick);
    if(!!userOnLineInfo){
        userOnLineInfo.rid = rid;
        onLineList.remove(nick);
        onLineList.put(nick,userOnLineInfo);
    }
}
//方法：将onLineList中的指定玩家踢除
function tickFromOnline(nick,sRid,callback){
    var userTick = onLineList.get(nick);
    //userTick已经不存在的原因是：重复登陆(先删掉)，再断开session，此时又检测到session断开，再次执行到这里
    if(userTick==null||userTick==undefined){return;}
    else{
        var rid = userTick.rid;
        if(rid!=sRid){
            console.log("逻辑错误，seesion中绑定rid不等于onLineList维护的rid");
        }
        onLineList.remove(nick);
        userQuitRoom(rid,nick);
    }
}

//方法：将一个新的玩家加入到指定的房间
function userEnterRoom(nick,rid){
    var roomInfo = roomList.get(channel);
    if(!!roomInfo){
        roomInfo.num ++;
        roomList.set(rid,roomInfo);
        changeChannelInfo(nick,rid);
        return roomInfo;
    }
}

//方法：将一个指定的房间删除一个玩家(如果有)
function userQuitRoom(nick,rid){
    var roomInfo = roomList.get(rid);
    if(!!roomInfo){
        roomInfo.num--;
        roomList.set(rid,roomInfo);
        if(rid!=hallName){
            //TODO 这里还有发新的东西
        }
    }
}

/**内部构件：房间（大厅玩家所能看见的房间信息）*/
function Room(hoster,params){
    this.rid = params.rid;                //频道id
    this.rName = params.rname;          //频道名称
    this.rHoster = hoster;              //房主
    this.rMode = params.rmode;         //房间模式 0=无职业 1=标准局
    this.rScale = params.rScale;       //房间规模：0=(6-12) 1=(12-18) 2=(18-24)
    this.rFbdIP = params.rFbdIP;        //是否禁止id true=禁止
    this.rPswd = params.rPswd;          //密码 如果为空则无密码
    this.num = 1;                         //已经加入玩家列表
    this.state = 0;                       //房间状态 0=等待中，1= 已经开始
    this.max = numMaxList[this.rScale]    //房间最大人数
}
