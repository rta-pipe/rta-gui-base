'use strict'
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// stric mode for the following script or function (must come at the very begining!)
// see: http://www.w3schools.com/js/js_strict.asp
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// mainScriptTag used locally (will be overriden by other scripts...)
// must be compatible with the name of this js file, according to:
//    "/js/widget_"+mainScriptTag+".js"
var mainScriptTag = 'emptyPlotlyExample'
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
console.log("ciao1")
sock.widgetTable[mainScriptTag] = function (optIn) {
  console.log("ciao2")
  let x0 = 0
  let y0 = 0
  let h0 = 5
  let w0 = 12
  let divKey = 'main'

  optIn.widgetFunc = {
    SockFunc: sockEmptyPlotlyExample,
    MainFunc: mainEmptyPlotlyExample
  }
  optIn.widgetDivId = optIn.widgetId + 'widgetDiv'
  optIn.eleProps = {}
  optIn.eleProps[divKey] = {
    autoPos: true,
    isDarkEle: true,
    gsId: optIn.widgetDivId + divKey,
    x: x0,
    y: y0,
    w: w0,
    h: h0,
    content: "<div id='" + optIn.baseName + divKey + "'></div>"
  }

  sock.addToTable(optIn)
  console.log("ciao3")
}

// ---------------------------------------------------------------------------------------------------
// additional socket events for this particular widget type
// ---------------------------------------------------------------------------------------------------
let sockEmptyPlotlyExample = function (optIn) {}

// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// here we go with the content of this particular widget
// ---------------------------------------------------------------------------------------------------
let mainEmptyPlotlyExample = function (optIn) {
  console.log("ciao4")
  // let myUniqueId = unique()
  let widgetType = optIn.widgetType
  let widgetSource = optIn.widgetSource
  let tagArrZoomerPlotsSvg = optIn.baseName
  let widgetId = optIn.widgetId
  let widgetEle = optIn.widgetEle
  let iconDivV = optIn.iconDivV
  let sideId = optIn.sideId

  // let isSouth = window.__nsType__ === 'S'
  // let thisEmptyPlotlyExample = this

  let plotlyExampleEleId = "plotly-example-web-comp"




  let plotlyTag = {}
  $.each(widgetEle, function (index, eleNow) {
    console.log("ciao5")
    plotlyTag[eleNow.id] = {
      id: tagArrZoomerPlotsSvg + eleNow.id,
      widget: eleNow.widget,
      whRatio: eleNow.w / eleNow.h
    }
  })

  // delay counters
  let locker = new Locker()
  locker.add('inInit')

  // function loop
  let runLoop = new RunLoop({ tag: widgetId })
  console.log("ciao6")

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  function initData (dataIn) {
    console.log("ciao7")

    if (sock.multipleInit({ id: widgetId, data: dataIn })) return

    window.sideDiv = sock.setSideDiv({
      id: sideId,
      nIcon: dataIn.nIcon,
      iconDivV: iconDivV
    })

    plotlyMain.initData(dataIn)
  }
  this.initData = initData
  console.log("this.initData",this.initData)

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  function updateData (dataIn) {
    console.log("ciao8")
    plotlyMain.updateData(dataIn.data)
  }
  this.updateData = updateData

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  let PlotlyMain = function () {
    console.log("ciao9")
    let com = {}
    let svg = {}
    // let thisMain = this

    let lenD = {}
    lenD.w = {}
    lenD.h = {}
    lenD.w[0] = 1000
    lenD.h[0] = lenD.w[0] / plotlyTag.main.whRatio

    let tagEmptyPlotlyExample = 'emptyPlotlyExample'

    // ---------------------------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------------------------
    function initData (dataIn) {
      console.log("ciao10")

      // ---------------------------------------------------------------------------------------------------
      // create the main plotly element
      // ---------------------------------------------------------------------------------------------------
      let plotlyDivId = plotlyExampleEleId
      let plotlyDiv = plotlyTag.main.widget.getEle(plotlyDivId)

      if (!hasVar(plotlyDiv)) {
        let parent = plotlyTag.main.widget.getEle(plotlyTag.main.id)

        let plotlyDiv = document.createElement('webcomp-example')
        plotlyDiv.setAttribute("id", plotlyDivId);
        plotlyDiv.setAttribute("plottitle", "Webcomp example");
        plotlyDiv.setAttribute("xLabel", "X label");
        plotlyDiv.setAttribute("yLabel", "Y label");
        plotlyDiv.id = plotlyDivId

        appendToDom(parent, plotlyDiv)

        runWhenReady({
          pass: function () {
            return hasVar(plotlyTag.main.widget.getEle(plotlyDivId))
          },
          execute: function () {
            initData(dataIn)
          }
        })

        return
      }
      sock.emitMouseMove({ eleIn: plotlyDiv, data: { widgetId: widgetId } })



      // ---------------------------------------------------------------------------------------------------
      //
      // ---------------------------------------------------------------------------------------------------
      updateDataOnce(dataIn.data)

      runWhenReady({
        pass: function () {
          return locker.isFree(tagEmptyPlotlyExample + 'updateData')
        },
        execute: function () {
          locker.remove('inInit')
        }
      })
    }
    this.initData = initData

    // ---------------------------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------------------------
    runLoop.init({ tag: 'updateData', func: updateDataOnce, nKeep: 1 })

    function updateData (dataIn) {
      if (!locker.isFree('inInit')) {
        setTimeout(function () {
          updateData(dataIn)
        }, 10)
        return
      }

      runLoop.push({ tag: 'updateData', data: dataIn }) //, time:dataIn.emitTime
    }



    // ---------------------------------------------------------------------------------------------------
    // some random stuff for illustration
    // ---------------------------------------------------------------------------------------------------
    function updateDataOnce (dataIn) {
      if (!locker.isFreeV([tagEmptyPlotlyExample + 'updateData'])) {
        // console.log('will delay updateData');
        setTimeout(function () {
          updateData(dataIn)
        }, 10)
        return
      }
      locker.add(tagEmptyPlotlyExample + 'updateData')

      plotlyTag.main.widget.getEle(plotlyExampleEleId).addPoint(dataIn.time, dataIn.rnd);


      locker.remove(tagEmptyPlotlyExample + 'updateData')
    }
    this.updateData = updateData
  }

  let plotlyMain = new PlotlyMain()
}
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
