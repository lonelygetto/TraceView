'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "jsonlink" is now active!');

     // create a new jsonLink
     let NewjsonLink = new jsonLink();
     
    context.subscriptions.push(vscode.commands.registerCommand('extension.JSONLink', () => {
        // Create and show panel
        const panel = vscode.window.createWebviewPanel(
            'showGraph', 
            "Show Graph", 
            vscode.ViewColumn.One, 
            {
                enableScripts : true 
            });

        var json = require(vscode.window.activeTextEditor.document.fileName);
        let jsonString;

        if(vscode.window.activeTextEditor.document.languageId === "json")
        {   
            jsonString = JSON.stringify(json);
        }
        else
        {
            vscode.window.showInformationMessage('This is not a Trace File. Please open a Trace File!');
        }
        

        var FullBuild = NewjsonLink.getBuildString(jsonString);

        // And set its HTML content
        panel.webview.html = getWebviewContent(FullBuild);
        
    }));

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
}

function getWebviewContent(fullbuildString:any) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>Show graph</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    
    </head>
<body>
      <div id="myDiv"></div>
      
      <script type="text/javascript">
      
      ${fullbuildString}   
     
      </script>

</body>
</html>`;
}

class jsonLink {

    public jsonLink()
    {
        // Get the current text editor
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        let doc = editor.document;
        var json = require(doc.fileName);
        
        // Only update status if a json file
        if (doc.languageId === "json") {
                
            let jsonString = JSON.stringify(json);

            var FullString = this.getBuildString(jsonString);
            
        }
        else
        {
            vscode.window.showInformationMessage('This is not a Trace File. Please open a Trace File!');
        }

    }

    
    public getBuildString(jsonString:any): string
    {
        let obj = JSON.parse(jsonString);

        //stores all the ticks in a trace file
        var tickList:number[] = new Array();

            for (let item of obj.trace) {
                tickList.push(item.tick);            
            }

        var varList = new Array();                    
       
        //stores all the vars in a trace file
            for ( var i = 0; i < obj.trace.length; i++) 
            {
                var vars:object = obj.trace[i].vars;
                varList.push(vars);
            }
                        
        var vList0:object = varList[0];

        var keyList:string[] = new Array();

        for(var propt in vList0)
        {            
            keyList.push(propt);            
        }
       

        let MapData : Map<string, any> = new Map<string, any>();

            for(var i = 0;i<keyList.length;i++)
            {
                var keyName= keyList[i];
                let keyValue:any;

                var varList1 = new Array();

                    for (let item of obj.trace) 
                    {                       
                        varList1.push(item.vars[keyName]);            
                    }

                    keyValue =varList1.join(",");  
                    MapData.set(keyName,keyValue);

            }

            var VarNameList = new Array();
            var NewbuildString ="";
            for (let element of MapData.entries())
            {
                var varName = element[0];
                NewbuildString += 
                "var " + varName + " = { " + "\n" +
                            "x: " +" [" + tickList + "]," + "\n"+
                            "y: " + "[" + element[1] +"]," + "\n" +
                            "type : 'scatter' ," +"\n"+
                            "name :"+ "'" +varName+ "'"+"\n"+
                "};"

           
                VarNameList.push(element[0]);
            }    

            var FullBuildString = NewbuildString;
            var dataList =VarNameList.join(",");

            //Build the String as required in Plotly
            FullBuildString = NewbuildString + "\n" +
                              "var data = [" + dataList + "];" + "\n" +
                              "Plotly.newPlot('myDiv', data, {}, {showSendToCloud: true});"

                  
        return FullBuildString;
    }
    
}
// this method is called when your extension is deactivated
export function deactivate() {
}