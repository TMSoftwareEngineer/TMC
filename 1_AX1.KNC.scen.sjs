// Copyright (c) 2020 Dassault Systemes Simulia Corp.

/* ********************************************************************************************* 
* include statement for different functions used within this script
********************************************************************************************* */
var ScriptName = Spck.getScriptName();
var ScriptFile = new File(ScriptName);
var ScriptPath = ScriptFile.path;
eval(Script.includeSource(ScriptPath+"/functions.sjs",true));
eval(Script.includeSource(ScriptPath+"/modifyParameters.sjs",true));

function main(args)
{
   print (" "); 
   print ("SCRIPT: ****************************************************************************");
   print ("SCRIPT: ***   START OF SCENARIO SOLVER SCRIPT: 1_AX1.KNC                         ***");
   print ("SCRIPT: ****************************************************************************");
   print (" ");  
   
   
   //*****************************************************
   // get + check + print script path+name
   //*****************************************************
   
   var SCRIPTNAME = Spck.getScriptName(); 
   
   print (" ");  
   print ("SCRIPT: ************ SCRIPTNAME               : "+SCRIPTNAME);
    
   if (SCRIPTNAME.right(4).toLowerCase()!=".sjs") {throw("SCRIPT: Analysis aborted because file-extension of script file is not '.sjs' ")}
       
   //*****************************************************
   // derive wizard model file pathes+names from SCRIPTNAME
   //*****************************************************
       
   var MODELNAME        = SCRIPTNAME.left(SCRIPTNAME.length-4)+".spck";
   var SPFName          = SCRIPTNAME.left(SCRIPTNAME.length-4)+".spf";
   SPFName              = SPFName.replace("/main_model","/results");
   
   var SBRBASENAME      = SCRIPTNAME.left(SCRIPTNAME.length-4).right(SCRIPTNAME.length-4-SCRIPTNAME.lastIndexOf("/")-1);
   var SBRBASENAMESHORT = SCRIPTNAME.left(SCRIPTNAME.length-9).right(SCRIPTNAME.length-9-SCRIPTNAME.lastIndexOf("/")-1);
   
   var HTMLNAME         = SPFName.left(SPFName.length-4)+".html";  
   var CSVNAME          = SPFName.left(SPFName.length-4)+".csv";  
   
   //*****************************************************
   // write logfile to result folder
   //*****************************************************
   
   logFile_location(SPFName);  
   
   //*****************************************************
   // get postprocessor path
   //*****************************************************
   
   var PostProcessorExecute = Spck.getExecutable( "simpack-post" );
   
   //*****************************************************
   // print derived variable names in message area
   //*****************************************************
     
   print ("SCRIPT: ************ MODELNAME                : "+MODELNAME);                                          
   print ("SCRIPT: ************ SPFName                  : "+SPFName);                                          
   print ("SCRIPT: ************ SBRBASENAME              : "+SBRBASENAME);                                          
   print ("SCRIPT: ************ SBRBASENAMESHORT         : "+SBRBASENAMESHORT);                                          
   print ("SCRIPT: ************ HTMLNAME                 : "+HTMLNAME);
   print ("SCRIPT: ************ CSVNAME                  : "+CSVNAME);
   print ("SCRIPT: ************ PostProcessorExecute     : "+PostProcessorExecute);
   print (" ")
   
   //*****************************************************
   // open model
   //*****************************************************
   print (" ");  
   print ("SCRIPT: ************ Open model"); 
   print (" ");  
   var MODEL = Spck.openModel(MODELNAME); 
   
   //*****************************************************
   // modify model subvars via json file
   //*****************************************************
   
   modifyParameters(MODEL);
   var MODEL = Spck.openModel(MODELNAME); 

   //*****************************************************
   // get loadcase settings & preprocessing
   //*****************************************************
   
   // get flag to decide if time integration or driven equilibrium should be calculated
   var solver_flag  = Spck.Slv.eval(MODEL.findElement("$PLC.$TPL.$G_SC.$G_TIME_INTEGRATION_CONFIG.$_SOLVER_SWITCH").str.val);

   
   //*****************************************************
   // get and optionally modify loadcase solver settings
   //*****************************************************
   
   var SLVSETTINGS = getSlvSettings(MODEL);
   
   
   //*****************************************************
   // start solver
   //*****************************************************
   
   if ( solver_flag == "0" )
   {
      print (" ");  
      print ("SCRIPT: ************ Start Driven Equilibrium Calculation");
      Spck.Slv.dequi(MODEL);
      print ("SCRIPT: ************ Completed Driven Equilibrium Calculation");  
      print (" ");
   }
   else
   {
      print (" ");  
      print ("SCRIPT: ************ Start Time Integration");
      Spck.Slv.integ(MODEL);
      print ("SCRIPT: ************ Completed Time Integration");  
      print (" ");
   }
   
   //*****************************************************
   // start measurements
   //*****************************************************
    
   print (" ");   
   print ("SCRIPT: ************ Start Measurements");
   Spck.Slv.meas(MODEL);
   print ("SCRIPT: ************ Completed Measurements");
   print (" ");    
   
   
   //*****************************************************
   // start html export
   //*****************************************************

   print ("SCRIPT: ************ Run post processor script (html_export.qs) in silent mode to create html-file");
   var html = SPFName.left(SPFName.lastIndexOf("/"))+"/html_export.qs";  
  
   var myArgs = new Array();
   myArgs[0] = PostProcessorExecute;
   myArgs[1] = "-s";
   myArgs[2] = html;
   myArgs[3] = SPFName;
   Process.execute(myArgs)
   
   
   print ("SCRIPT: ************ Run post processor script (acii_export.qs) in silent mode to create csv-file");
   var ascii = SPFName.left(SPFName.lastIndexOf("/"))+"/ascii_export.qs" 
   
   var myArgs = new Array();
   myArgs[0] = PostProcessorExecute;
   myArgs[1] = "-s";
   myArgs[2] = ascii;
   myArgs[3] = SPFName;
   myArgs[4] = CSVNAME
   Process.execute(myArgs)

   
   print ("SCRIPT: ************ Post processor script completed"); 
   print ("");  
   
   print ("SCRIPT: ****************************************************************************");
   print ("SCRIPT: ***   END OF SCENARIO SOLVER SCRIPT: 1_AX1.KNC                           ***");
   print ("SCRIPT: ****************************************************************************");
}
