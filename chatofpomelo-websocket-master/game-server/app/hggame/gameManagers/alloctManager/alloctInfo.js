/**该类是从客户端解析并计算后，扔给allocManager的初始分配信息*/
//按照游戏的平衡性，有些设定必须遵循，客户端选职模式也应该强制不合法不能选：
//1、游戏至少为6人至多为24人。
//2、外星人和狼人至少需要7人，且7人时外星人和狼人不能同时登场。
//3、2狼至少需要10人（有外星人至少11人）。
//4、3狼至少16人（有外星人至少17人）。
//5、4狼至少20人（有外星人至少21人）。

exports.alloctInfo = function GetAllocationInfo(ttlNum, jobTurnUpList, jobForcedList, jobWantList){
    this.plyrNum = {                            //阵营分配表
        ttlNum:ttlNum,
        gstMinNum:2,
        gstMaxNum:2,
        wwfNum:0
};

    this.jobTurnUpList = jobTurnUpList;        //可以出场的职业列表(这三个列表不需要传0：无职业)
    this.jobForcedList = jobForcedList;        //必须出场的职业列表
    this.jobWantList = jobWantList;            //职业竞选列表

    this.allocate  = function(ttlNum){
        switch (ttlNum){
            //以下要删除的测试数据
            case 2:
            case 3:
            {  this.plyrNum.gstMinNum = 1;
               this.plyrNum.gstMaxNum = 1;}
               break;
            case 4:
            {  this.plyrNum.gstMinNum = 2;
               this.plyrNum.gstMaxNum = 2;}
               break;
            case 5:
            {  this.plyrNum.gstMinNum = 2;
               this.plyrNum.gstMaxNum = 2;}
               break;
            //以上要删除
            case 6:
            case 7:{
                this.plyrNum.gstMinNum = 2;
                this.plyrNum.gstMaxNum = 2;
            }break;
            case 8:{
                this.plyrNum.gstMinNum = 2;
                this.plyrNum.gstMaxNum = 3;
            }break;
            case 9:{
                this.plyrNum.gstMinNum = 3;
                this.plyrNum.gstMaxNum = 3;
            }break;
            case 10:
            case 11:{
                this.plyrNum.gstMinNum = 3;
                this.plyrNum.gstMaxNum = 4;
            }break;
            case 12:{
                this.plyrNum.gstMinNum = 4;
                this.plyrNum.gstMaxNum = 4;
            }break;
            case 13:
            case 14:{
                this.plyrNum.gstMinNum = 4;
                this.plyrNum.gstMaxNum = 5;
            }break;
            case 15:{
                this.plyrNum.gstMinNum = 5;
                this.plyrNum.gstMaxNum = 5;
            }break;
            case 16:
            case 17:{
                this.plyrNum.gstMinNum = 5;
                this.plyrNum.gstMaxNum = 6;
            }break;
            case 18:{
                this.plyrNum.gstMinNum = 6;
                this.plyrNum.gstMaxNum = 6;
            }break;
            default :console.log("alloctInfo发生致命逻辑错误：检测到游戏不允许的初始分配人数！")
                break;
        }
    };
    this.alloctNum(ttlNum);
};