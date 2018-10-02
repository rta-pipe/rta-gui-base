"use strict";
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// stric mode for the following script or function (must come at the very begining!)
// see: http://www.w3schools.com/js/js_strict.asp
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// mainScriptTag used locally (will be overriden by other scripts...)
// must be compatible with the name of this js file, according to:
//    "/js/widget_"+mainScriptTag+".js"
var mainScriptTag = "dqHistogram";
// ---------------------------------------------------------------------------------------------------

/* global $ */
/* global d3 */
/* global timeD */
/* global hasVar */
/* global sock */
/* global Locker */
/* global RunLoop */
/* global appendToDom */
/* global runWhenReady */
/* global disableScrollSVG */
/* global bckPattern */
/* global colsMix */
/* global unique */

// // load additional js files:
window.loadScript({ source:mainScriptTag, script:"/bower_components/plotly.js/dist/plotly.min.js"});

// ---------------------------------------------------------------------------------------------------
sock.widgetTable[mainScriptTag] = function (optIn) {
  let x0 = 0;
  let y0 = 0;
  let h0 = 5;
  let w0 = 12;
  let divKey = "main";




  optIn.widgetFunc = {
    SockFunc: sockDqHistogram,
    MainFunc: mainDqHistogram
  };
  optIn.widgetDivId = optIn.widgetId + "widgetDiv";
  optIn.eleProps = {};
  optIn.eleProps[divKey] = {
    autoPos: true,
    isDarkEle: true,
    gsId: optIn.widgetDivId + divKey,
    x: x0,
    y: y0,
    w: w0,
    h: h0,
    content: "<div id='" + optIn.baseName + divKey + "'></div>"
  };

  sock.addToTable(optIn);
}

// ---------------------------------------------------------------------------------------------------
// additional socket events for this particular widget type
// ---------------------------------------------------------------------------------------------------
let sockDqHistogram = function (optIn) {};

// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// here we go with the content of this particular widget
// ---------------------------------------------------------------------------------------------------
let mainDqHistogram = function (optIn) {
  // let myUniqueId = unique()
  let widgetType = optIn.widgetType;
  let widgetSource = optIn.widgetSource;
  let tagArrZoomerPlotsSvg = optIn.baseName;
  let widgetId = optIn.widgetId;
  let widgetEle = optIn.widgetEle;
  let iconDivV = optIn.iconDivV;
  let sideId = optIn.sideId;

  // let isSouth = window.__nsType__ === "S"
  // let thisDqHistogram = this

  let plotlyExampleEleId = "plotly-dq-histogram";




  let plotlyTag = {};
  $.each(widgetEle, function (index, eleNow) {
    plotlyTag[eleNow.id] = {
      id: tagArrZoomerPlotsSvg + eleNow.id,
      widget: eleNow.widget,
      whRatio: eleNow.w / eleNow.h
    }
  });

  // delay counters
  let locker = new Locker();
  locker.add("inInit");

  // function loop
  let runLoop = new RunLoop({ tag: widgetId });

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  function initData (dataIn) {
    if (sock.multipleInit({ id: widgetId, data: dataIn })){
      return;
    }

    window.sideDiv = sock.setSideDiv({
      id: sideId,
      nIcon: dataIn.nIcon,
      iconDivV: iconDivV
    });

    plotlyMain.initData(dataIn);
  }
  this.initData = initData;

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  function updateData (dataIn) {
    plotlyMain.updateData(dataIn.data);
  };
  this.updateData = updateData;

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  let PlotlyMain = function () {
    let com = {};
    let svg = {};
    // let thisMain = this

    let lenD = {};
    lenD.w = {};
    lenD.h = {};
    lenD.w[0] = 1000;
    lenD.h[0] = lenD.w[0] / plotlyTag.main.whRatio;

    let tagDqHistogram = "dqHistogram";

    // ---------------------------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------------------------
    function initData (dataIn) {
      // ---------------------------------------------------------------------------------------------------
      // create the main plotly element
      // ---------------------------------------------------------------------------------------------------
      let plotlyDivId = plotlyExampleEleId;
      let plotlyDiv = plotlyTag.main.widget.getEle(plotlyDivId);

      if (!hasVar(plotlyDiv)) {
        let parent = plotlyTag.main.widget.getEle(plotlyTag.main.id);

        let plotlyDiv = document.createElement("data-quality-histogram");
        plotlyDiv.setAttribute("id", plotlyDivId);
        plotlyDiv.setAttribute("width", "100%");
        plotlyDiv.setAttribute("height",  "900px");
        plotlyDiv.setAttribute("plottitle", "Webcomp example");
        plotlyDiv.setAttribute("xLabel", "Event property values");
        plotlyDiv.setAttribute("yLabel", "Events count");
        plotlyDiv.id = plotlyDivId;

        appendToDom(parent, plotlyDiv);

        plotlyTag.main.widget.getEle(plotlyExampleEleId).configure(0, 1, 0.01);


        runWhenReady({
          pass: function () {
            return hasVar(plotlyTag.main.widget.getEle(plotlyDivId));
          },
          execute: function () {
            initData(dataIn);
          }
        })

        return;
      }
      sock.emitMouseMove({ eleIn: plotlyDiv, data: { widgetId: widgetId } });



      // ---------------------------------------------------------------------------------------------------
      //
      // ---------------------------------------------------------------------------------------------------
      updateDataOnce(dataIn.data);

      runWhenReady({
        pass: function () {
          return locker.isFree(tagDqHistogram + "updateData");
        },
        execute: function () {
          locker.remove("inInit");
        }
      })
    }
    this.initData = initData;

    // ---------------------------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------------------------
    runLoop.init({ tag: "updateData", func: updateDataOnce, nKeep: 1 });

    function updateData (dataIn) {
      if (!locker.isFree("inInit")) {
        setTimeout(function () {
          updateData(dataIn);
        }, 10);
        return;
      }

      runLoop.push({ tag: "updateData", data: dataIn }); //, time:dataIn.emitTime
    }



    // ---------------------------------------------------------------------------------------------------
    // some random stuff for illustration
    // ---------------------------------------------------------------------------------------------------
    function updateDataOnce (dataIn) {
      if (!locker.isFreeV([tagDqHistogram + "updateData"])) {
        // console.log("will delay updateData");
        setTimeout(function () {
          updateData(dataIn)
        }, 10)
        return
      }
      locker.add(tagDqHistogram + "updateData");

      plotlyTag.main.widget.getEle(plotlyExampleEleId).addPoint(dataIn.rnd);

      locker.remove(tagDqHistogram + "updateData");
    }
    this.updateData = updateData;
  }

  let plotlyMain = new PlotlyMain();
}
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
