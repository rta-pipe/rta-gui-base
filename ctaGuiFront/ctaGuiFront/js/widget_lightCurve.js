'use strict'
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// stric mode for the following script or function (must come at the very begining!)
// see: http://www.w3schools.com/js/js_strict.asp
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// mainScriptTag used locally (will be overriden by other scripts...)
// must be compatible with the name of this js file, according to:
//    '/js/widget_'+mainScriptTag+'.js'
var mainScriptTag = 'lightCurve'
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
window.loadScript({ source:mainScriptTag, script:'/bower_components/plotly.js/dist/plotly.min.js'})

// ---------------------------------------------------------------------------------------------------
sock.widgetTable[mainScriptTag] = function (optIn) {
  let x0 = 0
  let y0 = 0
  let h0 = 5
  let w0 = 12
  let divKey = 'main'

  optIn.widgetFunc = {
    SockFunc: sockLightCurve,
    MainFunc: mainLightCurve
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
let sockLightCurve = function (optIn) {}

// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// here we go with the content of this particular widget
// ---------------------------------------------------------------------------------------------------
let mainLightCurve = function (optIn) {
  // let myUniqueId = unique()
  let widgetType = optIn.widgetType
  let widgetSource = optIn.widgetSource

  let lightcurvePlot = optIn.baseName
  let widgetId = optIn.widgetId
  let widgetEle = optIn.widgetEle
  let iconDivV = optIn.iconDivV
  let sideId = optIn.sideId

  let lightCurveEleId = 'light-curve-web-comp'



  // let isSouth = window.__nsType__ === 'S'
  // let thisLightCurve = this

  let plotlyTag = {}
  $.each(widgetEle, function (index, eleNow) {
    plotlyTag[eleNow.id] = {
      id: lightcurvePlot + eleNow.id,
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
    if (sock.multipleInit({ id: widgetId, data: dataIn })){ return }

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
    lenD.h[0] = lenD.w[0] / plotlyTag.main.whRatio

    let tagLightCurve = 'lightCurve'

    // ---------------------------------------------------------------------------------------------------
    //
    // ---------------------------------------------------------------------------------------------------
    function initData (dataIn) {
      // ---------------------------------------------------------------------------------------------------
      // create the main plotly element
      // ---------------------------------------------------------------------------------------------------
      let plotlyDivId = lightCurveEleId//plotlyTag.main.id + 'svg'
      let plotlyDiv = plotlyTag.main.widget.getEle(plotlyDivId)

      if (!hasVar(plotlyDiv)) {
        let parent = plotlyTag.main.widget.getEle(plotlyTag.main.id)

        let plotlyDiv = document.createElement('light-curve')
        plotlyDiv.setAttribute('id', plotlyDivId)
        plotlyDiv.setAttribute('plottitle', 'Light Curve')
        plotlyDiv.setAttribute('xLabel', 'MJD [days]')
        plotlyDiv.setAttribute('classesnumber', 3)
        plotlyDiv.setAttribute('slidingwindowSize', 50)
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
          return locker.isFree(tagLightCurve + 'updateData')
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
      if (!locker.isFreeV([tagLightCurve + 'updateData'])) {
        // console.log('will delay updateData')
        setTimeout(function () {
          updateData(dataIn)
        }, 10)
        return
      }
      console.log(dataIn)
      locker.add(tagLightCurve + 'updateData')

      // ---------------------------------------------------------------------------------------------------
      // Update the light curve
      // ---------------------------------------------------------------------------------------------------
      //this.shadowRoot.querySelector().addPoint(
      plotlyTag.main.widget.getEle(lightCurveEleId).addPoint(
                                                    'test',
                                                    dataIn.time,
                                                    dataIn.rnd,
                                                    0.5,
                                                    0.5,
                                                    0.5,
                                                    0.5,
                                                    false,
                                                    1
                                                  )

      /*
      // ---------------------------------------------------------------------------------------------------
      // send some random message to the server ...
      // ---------------------------------------------------------------------------------------------------
      let myMessageData = {}
      myMessageData.widgetId = optIn.widgetId
      myMessageData.myMessage = 'myMessage' + unique()

      let dataEmit = {
        widgetSource: widgetSource,
        widgetName: widgetType,
        widgetId: myMessageData.widgetId,
        methodName: 'sendRndomMessage',
        methodArgs: myMessageData
      }

      sock.socket.emit('widget', dataEmit)
      */


      // ---------------------------------------------------------------------------------------------------
      // do random stuff on updates ...
      // ---------------------------------------------------------------------------------------------------



      locker.remove(tagLightCurve + 'updateData')
    }
    this.updateData = updateData
  }

  let plotlyMain = new PlotlyMain()
}
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
