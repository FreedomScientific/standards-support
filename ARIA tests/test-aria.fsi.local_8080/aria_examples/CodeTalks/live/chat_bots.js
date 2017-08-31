function userObj(){
   }


function setupKnightmare(){
   knightmare = new userObj();
   knightmare.name = "Knightmare_4";
   knightmare.keywords = new Array();
   knightmare.responses = new Array();
   knightmare.keywords.push("lzlfhc-abi-bk-cdjey`lh~");
   knightmare.responses.push("Mb$}kq$waao$pla$tksav$kb$jmclpieva($hmwpaj$pk$plawa$skv`w$smpl$geva*$Vafqmh`$ia$bvki$i}$wgeppava`$tevpw($ej`$}kq$wlehh$haevj$pla$wagvap$kb$i}$evpw*");
   return knightmare;
   }


function setupStairway2Cali(){
   sc = new userObj();
   sc.name = "Stairway2Cali";
   sc.keywords = new Array();
   sc.responses = new Array();
   sc.keywords.push("wh}}hadc");
   sc.responses.push("]kq$lera$jk$m`ae$lks$iqgl$M$hkra$Ha`$^attahmj%");
   return sc;
   }

function setupGlassK(){
   glassk = new userObj();
   glassk.name = "Glass_K";
   glassk.keywords = new Array();
   glassk.responses = new Array();
   glassk.keywords.push("oalnf-nbly");
   glassk.responses.push("]ael($pla$fk}#w$e$pmia$fkif%");
   glassk.keywords.push("zedyh-~ebh~");
   glassk.responses.push("]ael($pla$fk}#w$e$pmia$fkif%");
   glassk.keywords.push("oalnf-ely");
   glassk.responses.push("]ael($pla$fk}#w$e$pmia$fkif%");
   return glassk;
   }

function setupCLC(){
   clc = new userObj();
   clc.name = "Cool_Like_CLC";
   clc.keywords = new Array();
   clc.responses = new Array();

   clc.keywords.push("ehaab");
   clc.responses.push("Lahhk($lks$eva$}kq$`kmjc;");

   clc.keywords.push("d-yedcf");
   clc.responses.push("Sl}$`k$}kq$plmjo$plep;");

   clc.keywords.push("-yhe-");
   clc.responses.push("@m`$}kq$iaej$.PLA.;");

   clc.keywords.push("-txb-");
   clc.responses.push("@m`$}kq$iaej$.]KQ.;");

   clc.keywords.push("ohnlx~h");
   clc.responses.push("Eva$}kq$wqva$plep#w$pla$vaewkj;");

   clc.keywords.push("-yd`h-");
   clc.responses.push("Wtaeomjc$kb$pmia($mp$vaehh}$bhmaw$slaj$}kq#va$gleppmjc$kjhmja*");

   clc.keywords.push("zho");
   clc.responses.push("Kj$e$saf$vahepa`$jkpa($lera$}kq$waaj$lppt>++sss*ghgskvh`*jap;");

   clc.keywords.push("kdhkbu");
   clc.responses.push("Bmvabk|$mw$i}$berkvmpa$fvkswav%");

   clc.keywords.push("`bwdaal");
   clc.responses.push("M$qwa$Bmvabk|$ej`$Plqj`avfmv`*");

   clc.keywords.push("nadnf");
   clc.responses.push("GHmGo($Wtaeo$mw$esawkia%$lppt>++ghmgowtaeo*ghgskvh`*jap");

   clc.keywords.push("kdh-{bu");
   clc.responses.push("Bmva$Rk|$mw$esawkia%$lppt>++bmvark|*ghgskvh`*jap");

   clc.keywords.push("kdh{bu");
   clc.responses.push("Bmva$Rk|$mw$psk$skv`w($jkp$kja*");

   clc.keywords.push("lglu");
   clc.responses.push("ENE\$gej$fa$eggawwmfha$mb$pla$SEM$EVME$ievoqt$mw$qwa`$tvktavh}*");

   clc.keywords.push("lnnh~~doah");
   clc.responses.push("Eggawwmfmhmp}$mw$rav}$mitkvpejp?$plep#w$sl}$M#i$skvomjc$kj$mp*");

   clc.keywords.push("lnnh~~dodadyt");
   clc.responses.push("Eggawwmfmhmp}$mw$rav}$mitkvpejp?$plep#w$sl}$M#i$skvomjc$kj$mp*");

   return clc;
   }


function setupDShinja(){
   dshinja = new userObj();
   dshinja.name = "DShinja";
   dshinja.keywords = new Array();
   dshinja.responses = new Array();
   return dshinja;
   }

function setupELisa(){
   elisa = new userObj();
   elisa.name = "E-Lisa";
   elisa.keywords = new Array();
   elisa.responses = new Array();
   return elisa;
   }



function getRandomAIMessage(){
   var randNum = Math.random();
   if (randNum < .10){
      return "DShinja: LOL";
      }
   if (randNum < .20){
      return "DShinja: Wow, that was random.";
      }
   if (randNum < .30){
      return "DShinja: Serious?";
      }
   if (randNum < .40){
      return "DShinja: ROFL";
      }
   if (randNum < .50){
      return "DShinja: This chat system is awesome!";
      }
   if (randNum < .60){
      return "DShinja: Oh, I see.";
      }
   if (randNum < .70){
      return "E-Lisa: This is fun.";
      }
   if (randNum < .80){
      return "E-Lisa: Really?";
      }
   if (randNum < .99){
      return "E-Lisa: LOL";
      }
   return "E-Lisa: Charles is so clever.";
   }
