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
var mainScriptTag = 'detectionsTable'
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
//window.loadScript({ source:mainScriptTag, script:"/bower_components/plotly.js/dist/plotly.min.js"});

// ---------------------------------------------------------------------------------------------------
sock.widgetTable[mainScriptTag] = function (optIn) {
  let x0 = 0
  let y0 = 0
  let h0 = 5
  let w0 = 12
  let divKey = 'main'

  optIn.widgetFunc = {
    SockFunc: sockdetectionsTable,
    MainFunc: maindetectionsTable
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
}

// ---------------------------------------------------------------------------------------------------
// additional socket events for this particular widget type
// ---------------------------------------------------------------------------------------------------
let sockdetectionsTable = function (optIn) {}

// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// here we go with the content of this particular widget
// ---------------------------------------------------------------------------------------------------
let maindetectionsTable = function (optIn) {
  // let myUniqueId = unique()
  let widgetType = optIn.widgetType
  let widgetSource = optIn.widgetSource
  let tagArrZoomerPlotsSvg = optIn.baseName
  let widgetId = optIn.widgetId
  let widgetEle = optIn.widgetEle
  let iconDivV = optIn.iconDivV
  let sideId = optIn.sideId

  // let isSouth = window.__nsType__ === 'S'
  // let thisdetectionsTable = this

  let webCompEleId = "detection-table-web-comp"




  let webCompTag = {}
  $.each(widgetEle, function (index, eleNow) {
    webCompTag[eleNow.id] = {
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

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  function initData (dataIn) {

    if (sock.multipleInit({ id: widgetId, data: dataIn })) return

    window.sideDiv = sock.setSideDiv({
      id: sideId,
      nIcon: dataIn.nIcon,
      iconDivV: iconDivV
    })

    plotlyMain.initData(dataIn)
  }
  this.initData = initData

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  function updateData (dataIn) {
    plotlyMain.updateData(dataIn.data)
  }
  this.updateData = updateData

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  let PlotlyMain = function () {
    let com = {}
    let svg = {}
    // let thisMain = this

    let lenD = {}
    lenD.w = {}
    lenD.h = {}
    lenD.w[0] = 1000
    lenD.h[0] = lenD.w[0] / webCompTag.main.whRatio

    let tagdetectionsTable = 'detectionsTable'

    // ---------------------------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------------------------
    function initData (dataIn) {

      // ---------------------------------------------------------------------------------------------------
      // create the main plotly element
      // ---------------------------------------------------------------------------------------------------
      let webCompDivId = webCompEleId
      let webCompDiv = webCompTag.main.widget.getEle(webCompDivId)

      if (!hasVar(webCompDiv)) {
        let parent = webCompTag.main.widget.getEle(webCompTag.main.id)

        let webCompDiv = document.createElement('rta-detection-datatable')
        webCompDiv.setAttribute("id", webCompDivId);
        webCompDiv.id = webCompDivId

        appendToDom(parent, webCompDiv)

        runWhenReady({
          pass: function () {
            return hasVar(webCompTag.main.widget.getEle(webCompDivId))
          },
          execute: function () {
            initData(dataIn)
          }
        })

        return
      }
      sock.emitMouseMove({ eleIn: webCompDiv, data: { widgetId: widgetId } })



      // ---------------------------------------------------------------------------------------------------
      //
      // ---------------------------------------------------------------------------------------------------
      updateDataOnce(dataIn.data)

      runWhenReady({
        pass: function () {
          return locker.isFree(tagdetectionsTable + 'updateData')
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
      if (!locker.isFreeV([tagdetectionsTable + 'updateData'])) {
        // console.log('will delay updateData');
        setTimeout(function () {
          updateData(dataIn)
        }, 10)
        return
      }
      locker.add(tagdetectionsTable + 'updateData')

      var row = JSON.parse('{"label":"A-Test-1", "x":99999.999,"y":"33333","flux_err":"3137.94569515991","time_err":0.00034722222335404,"text":"58130 , 58130.0006944 , 0 +/- 3137.9 *10^-16 , sqrt(TS)= 0","sqrtts":"1000","ra":83.633,"dec":22.015,"t_start_mjd":58130,"t_stop_mjd":58130.0006944,"t_start_tt":"442800000","t_stop_tt":"442800060","detectionid":"9999"}');
      row['y']=String(dataIn.rnd);
      console.log(webCompTag.main.widget.getEle(webCompEleId))
      webCompTag.main.widget.getEle(webCompEleId).addRow(row);


      locker.remove(tagdetectionsTable + 'updateData')
    }
    this.updateData = updateData
  }

  let plotlyMain = new PlotlyMain()
}
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
