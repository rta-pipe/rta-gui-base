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
var mainScriptTag = 'dataQuality'
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
  let h0 = 9
  let w0 = 12
  let divKey = 'main'

  optIn.widgetFunc = {
    SockFunc: sockDataQuality,
    MainFunc: mainDataQuality
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
let sockDataQuality = function (optIn) {
  let widgetType = optIn.widgetType
  let widgetSource = optIn.widgetSource

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  this.syncToDataStream = function (optIn) {
    if (sock.conStat.isOffline()) return

    let dataEmit = {
      widgetSource: widgetSource,
      widgetName: widgetType,
      widgetId: optIn.widgetId,
      methodName: 'syncToDataStream',
      methodArgs: optIn.streamDetails
    }

    sock.socket.emit('widget', dataEmit)
  }

  // ---------------------------------------------------------------------------------------------------
  //
  // ---------------------------------------------------------------------------------------------------
  this.stopSyncToDataStream = function (optIn) {
    if (sock.conStat.isOffline()) return

    let dataEmit = {
      widgetSource: widgetSource,
      widgetName: widgetType,
      widgetId: optIn.widgetId,
      methodName: 'stopSyncToDataStream'
    }

    sock.socket.emit('widget', dataEmit)
  }

}



// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// here we go with the content of this particular widget
// ---------------------------------------------------------------------------------------------------
let mainDataQuality = function (optIn) {
  // let myUniqueId = unique()
  let widgetType = optIn.widgetType
  let widgetSource = optIn.widgetSource
  let tagArrZoomerPlotsSvg = optIn.baseName
  let widgetId = optIn.widgetId
  let widgetEle = optIn.widgetEle
  let iconDivV = optIn.iconDivV
  let sideId = optIn.sideId

  // let isSouth = window.__nsType__ === 'S'
  // let thisDataQuality = this

  let formEleId = "form-web-comp"
  let histogramEleId = "histogram-web-comp"



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














  function syncToDataStream (_streamDetails) {
    console.log("syncToDataStream!")
    sock.widgetV[widgetType].SockFunc.syncToDataStream({ widgetId: widgetId, streamDetails : _streamDetails })
  }
  this.syncToDataStream = syncToDataStream

  document.querySelector('base-app').addEventListener('form-submitted', function (e) {
          console.log(e.detail); // true
          syncToDataStream(e.detail)
  })


  function stopSyncToDataStream () {
    console.log("stopSyncToDataStream!")
    sock.widgetV[widgetType].SockFunc.stopSyncToDataStream({ widgetId: widgetId })
  }
  this.stopSyncToDataStream = stopSyncToDataStream

  document.querySelector('base-app').addEventListener('stop-data-stream', function (e) {
          stopSyncToDataStream()
  })




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
    lenD.h[0] = lenD.w[0] / plotlyTag.main.whRatio

    let tagDataQuality = 'dataQuality'

    // ---------------------------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------------------------
    function initData (dataIn) {

      console.log(dataIn)


      // ---------------------------------------------------------------------------------------------------
      // create the Form element
      // ---------------------------------------------------------------------------------------------------

      let formDivId = formEleId //plotlyTag.main.id + 'svg'
      let formDiv = plotlyTag.main.widget.getEle(formDivId)

      if (!hasVar(formDiv)) {

        let parent = plotlyTag.main.widget.getEle(plotlyTag.main.id)

        let formDiv = document.createElement('data-quality-form')
        formDiv.setAttribute("id", formDivId);
        formDiv.id = formDivId;
        appendToDom(parent, formDiv);



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
      // create the Data Quality element
      // ---------------------------------------------------------------------------------------------------
      let plotlyDivId = histogramEleId
      let plotlyDiv = plotlyTag.main.widget.getEle(plotlyDivId)

      if (!hasVar(plotlyDiv)) {
        let parent = plotlyTag.main.widget.getEle(plotlyTag.main.id)

        let plotlyDiv = document.createElement('data-quality-histogram')
        plotlyDiv.setAttribute('id', plotlyDivId)
        plotlyDiv.setAttribute('plottitle', 'Data Quality Histogram Example')
        plotlyDiv.setAttribute('xLabel', 'EVT1 MC Energy [TeV]')
        plotlyDiv.setAttribute('yLabel', 'Energy count [bin=0.1]')
        plotlyDiv.id = plotlyDivId

        appendToDom(parent, plotlyDiv)

        plotlyTag.main.widget.getEle(plotlyDivId).configure(0, 5, 0.1)


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
      //sock.emitMouseMove({ eleIn: lightCurveDiv, data: { widgetId: widgetId } })




      // ---------------------------------------------------------------------------------------------------
      //
      // ---------------------------------------------------------------------------------------------------
      //updateDataOnce(dataIn.data)

      runWhenReady({
        pass: function () {
          return locker.isFree(tagDataQuality + 'updateData')
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


        console.log("dataIn: ",dataIn)
        let msgPayload = JSON.parse(dataIn.data)
        console.log("msgPayload: ",msgPayload)

        // ------------------
        // Updating DQ
        // ------------------
        plotlyTag.main.widget.getEle(histogramEleId).addPoint(msgPayload.last_data.mc_energy)



      }



      runLoop.push({ tag: 'updateData', data: dataIn }) //, time:dataIn.emitTime
    }

    // ---------------------------------------------------------------------------------------------------
    // some random stuff for illustration
    // ---------------------------------------------------------------------------------------------------
    function updateDataOnce (dataIn) {
      if (!locker.isFreeV([tagDataQuality + 'updateData'])) {
        // console.log('will delay updateData');
        setTimeout(function () {
          updateData(dataIn)
        }, 10)
        return
      }
      locker.add(tagDataQuality + 'updateData')



      // ---------------------------------------------------------------------------------------------------

      locker.remove(tagDataQuality + 'updateData')
    }
    this.updateData = updateData
  }

  let plotlyMain = new PlotlyMain()
}
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
