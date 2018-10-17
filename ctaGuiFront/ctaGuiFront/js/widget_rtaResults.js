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
var mainScriptTag = 'rtaResults'
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
  let x0 = 0
  let y0 = 0
  let h0 = 5
  let w0 = 12
  let divKey = 'main'

  optIn.widgetFunc = {
    SockFunc: sockRtaResults,
    MainFunc: mainRtaResults
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
let sockRtaResults = function (optIn) {
  let widgetType = optIn.widgetType
  let widgetSource = optIn.widgetSource

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  this.syncToAnalysisSession = function (optIn) {
    if (sock.conStat.isOffline()) return

    let dataEmit = {
      widgetSource: widgetSource,
      widgetName: widgetType,
      widgetId: optIn.widgetId,
      methodName: 'syncToAnalysisSession',
      methodArgs: optIn.analysisSessionDetails
    }

    sock.socket.emit('widget', dataEmit)
  }

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  this.stopSyncToAnalysisSession = function (optIn) {
    if (sock.conStat.isOffline()) return

    let dataEmit = {
      widgetSource: widgetSource,
      widgetName: widgetType,
      widgetId: optIn.widgetId,
      methodName: 'stopSyncToAnalysisSession'
    }

    sock.socket.emit('widget', dataEmit)
  }
}


// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// here we go with the content of this particular widget
// ---------------------------------------------------------------------------------------------------
let mainRtaResults = function (optIn) {
  // let myUniqueId = unique()
  let widgetType = optIn.widgetType
  let widgetSource = optIn.widgetSource
  let tagArrZoomerPlotsSvg = optIn.baseName
  let widgetId = optIn.widgetId
  let widgetEle = optIn.widgetEle
  let iconDivV = optIn.iconDivV
  let sideId = optIn.sideId

  // let isSouth = window.__nsType__ === 'S'
  // let thisRtaResults = this

  let formEleId = "form-web-comp"
  let lightCurveEleId = "light-curve-web-comp"
  let detectionTableEleId = "detection-table-web-comp"



  let plotlyTag = {}
  $.each(widgetEle, function (index, eleNow) {
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

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  function initData (dataIn) {

    console.log(dataIn)

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

    //console.log(dataIn)

    plotlyMain.updateData(dataIn.data)
  }
  this.updateData = updateData



  function syncToAnalysisSession (_analysisSessionDetails) {
    console.log("syncToAnalysisSession!")
    sock.widgetV[widgetType].SockFunc.syncToAnalysisSession({ widgetId: widgetId, analysisSessionDetails : _analysisSessionDetails })
  }
  this.syncToAnalysisSession = syncToAnalysisSession

  document.querySelector('base-app').addEventListener('form-submitted', function (e) {
          console.log(e.detail); // true
          syncToAnalysisSession(e.detail)
  })


  function stopSyncToAnalysisSession () {
    console.log("stopSyncToAnalysisSession!")
    sock.widgetV[widgetType].SockFunc.stopSyncToAnalysisSession({ widgetId: widgetId })
  }
  this.stopSyncToAnalysisSession = stopSyncToAnalysisSession

  document.querySelector('base-app').addEventListener('stop-data-stream', function (e) {
          stopSyncToAnalysisSession()
  })
  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  let RtaResultsMain = function () {
    let com = {}
    let svg = {}
    // let thisMain = this

    let lenD = {}
    lenD.w = {}
    lenD.h = {}
    lenD.w[0] = 1000
    lenD.h[0] = lenD.w[0] / plotlyTag.main.whRatio

    let tagRtaResults = 'rtaResults'

    // ---------------------------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------------------------
    function initData (dataIn) {


      // ---------------------------------------------------------------------------------------------------
      // create the Form element
      // ---------------------------------------------------------------------------------------------------
      let formDivId = formEleId //plotlyTag.main.id + 'svg'
      let formDiv = plotlyTag.main.widget.getEle(formDivId)

      if (!hasVar(formDiv)) {

        let parent = plotlyTag.main.widget.getEle(plotlyTag.main.id)



        let formDiv = document.createElement('analysis-session-form')
        formDiv.setAttribute("id", formDivId);
        formDiv.id = formDivId;
        appendToDom(parent, formDiv);


        // Fetching HTML Elements in Variables by ID.
        //let formDiv = document.createElement('h2');
        //formDiv.innerHTML = "Select analysis session";
        //appendToDom(parent, formDiv);



        runWhenReady({
          pass: function () {
            return hasVar(plotlyTag.main.widget.getEle(formDivId))
          },
          execute: function () {
            initData(dataIn)
          }
        })
        return
      }



      // ---------------------------------------------------------------------------------------------------
      // create the LC element
      // ---------------------------------------------------------------------------------------------------
      let lightCurveDivId = lightCurveEleId
      let lightCurveDiv = plotlyTag.main.widget.getEle(lightCurveDivId)

      if (!hasVar(lightCurveDiv)) {
        let parent = plotlyTag.main.widget.getEle(plotlyTag.main.id)

        let lightCurveDiv = document.createElement('light-curve')
        lightCurveDiv.setAttribute('id', lightCurveDivId)
        lightCurveDiv.setAttribute('plottitle', 'Light Curve')
        lightCurveDiv.setAttribute('xLabel', 'MJD [days]')
        lightCurveDiv.setAttribute('classesnumber', 3)
        lightCurveDiv.setAttribute('slidingwindowSize', 50)
        lightCurveDiv.id = lightCurveDivId

        appendToDom(parent, lightCurveDiv)

        runWhenReady({
          pass: function () {
            return hasVar(plotlyTag.main.widget.getEle(lightCurveDivId))
          },
          execute: function () {
            initData(dataIn)
          }
        })
        return
      }
      //sock.emitMouseMove({ eleIn: lightCurveDiv, data: { widgetId: widgetId } })



      // ---------------------------------------------------------------------------------------------------
      // create the Detection Table element
      // ---------------------------------------------------------------------------------------------------
      let detectionTableDivId = detectionTableEleId
      let detectionTableDiv = plotlyTag.main.widget.getEle(detectionTableDivId)

      if (!hasVar(detectionTableDiv)) {
        let parent = plotlyTag.main.widget.getEle(plotlyTag.main.id)

        let detectionTableDiv = document.createElement('rta-detection-datatable')
        detectionTableDiv.setAttribute('id', detectionTableDivId)
        detectionTableDiv.id = detectionTableDivId

        appendToDom(parent, detectionTableDiv)

        runWhenReady({
          pass: function () {
            return hasVar(plotlyTag.main.widget.getEle(detectionTableDivId))
          },
          execute: function () {
            initData(dataIn)
          }
        })
        return
      }
      //sock.emitMouseMove({ eleIn: detectionTableDiv, data: { widgetId: widgetId } })

      // ---------------------------------------------------------------------------------------------------
      //
      // ---------------------------------------------------------------------------------------------------
      //updateDataOnce(dataIn.data)

      runWhenReady({
        pass: function () {
          return locker.isFree(tagRtaResults + 'updateData')
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


      if(dataIn && dataIn.data) {

        console.log(dataIn)

        let msgPayload = JSON.parse(dataIn.data)

        let newP = msgPayload.last_data

        console.log(newP)
        // ------------------
        // Updating LC
        // ------------------
        plotlyTag.main.widget.getEle(lightCurveEleId).addPoint(
                                                              'test',
                                                              parseFloat(newP.x),
                                                              parseFloat(newP.y),
                                                              0.5,
                                                              0.5,
                                                              0,
                                                              0,
                                                              newP.isUpperLimit,
                                                              newP.class
                                                            )


        // ------------------
        // Updating DT
        // ------------------
        plotlyTag.main.widget.getEle(detectionTableEleId).addRow(newP);


        // ------------------
        // Updating Histo - todo
        // -----------------
      }

      runLoop.push({ tag: 'updateData', data: dataIn }) //, time:dataIn.emitTime
    }



    // ---------------------------------------------------------------------------------------------------
    // some random stuff for illustration
    // ---------------------------------------------------------------------------------------------------
    function updateDataOnce (dataIn) {
      if (!locker.isFreeV([tagRtaResults + 'updateData'])) {
        // console.log('will delay updateData');
        setTimeout(function () {
          updateData(dataIn)
        }, 10)
        return
      }
      locker.add(tagRtaResults + 'updateData')



      locker.remove(tagRtaResults + 'updateData')
    }
    this.updateData = updateData
  }

  let plotlyMain = new RtaResultsMain()
}
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
