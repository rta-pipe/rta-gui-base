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
var mainScriptTag = 'analysisWidget'
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
    SockFunc: sockAnalysisWidget,
    MainFunc: mainAnalysisWidget
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
let sockAnalysisWidget = function (optIn) {}

// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
// here we go with the content of this particular widget
// ---------------------------------------------------------------------------------------------------
let mainAnalysisWidget = function (optIn) {
  // let myUniqueId = unique()
  let widgetType = optIn.widgetType
  let widgetSource = optIn.widgetSource
  console.log(optIn.baseName);
  let lightcurvePlot = optIn.baseName
  let widgetId = optIn.widgetId
  let widgetEle = optIn.widgetEle
  let iconDivV = optIn.iconDivV
  let sideId = optIn.sideId

  let lightCurveEleId = "light-curve-web-comp"



  // let isSouth = window.__nsType__ === 'S'
  // let thisAnalysisWidget = this

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
    lenD.h[0] = lenD.w[0] / plotlyTag.main.whRatio

    let tagAnalysisWidget = 'analysisWidget'

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
        console.log(plotlyDiv)
        plotlyDiv.setAttribute("id", plotlyDivId);
        plotlyDiv.setAttribute("width", "100%");
        plotlyDiv.setAttribute("height", "600px");
        plotlyDiv.setAttribute("plottitle", "Light Curve");
        plotlyDiv.setAttribute("xLabel", "MJD [days]");
        plotlyDiv.setAttribute("classesnumber", 3);
        plotlyDiv.setAttribute("slidingwindowSize", 50);
        plotlyDiv.setAttribute("debug", true);
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

      svg.svg = d3
        .select(plotlyDiv)
        .style('background', '#383B42')
        .append('svg')
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('viewBox', '0 0 ' + lenD.w[0] + ' ' + lenD.h[0])
        .style('position', 'relative')
        .style('width', '100%')
        .style('height', '100%')
        .style('top', '0px')
        .style('left', '0px')
        // .attr("viewBox", "0 0 "+lenD.w[0]+" "+lenD.h[0] * whRatio)
        // .classed("svgInGridStack_inner", true)
        .style('background', '#383B42') // .style("background", "red")// .style("border","1px solid red")
        // .call(com.svgZoom)
        .on('dblclick.zoom', null)

      if (disableScrollSVG) {
        svg.svg.on('wheel', function () {
          d3.event.preventDefault()
        })
      }

      com.svgZoomNode = svg.svg.nodes()[0]

      svg.g = svg.svg.append('g')

      // add one rect as background
      // ---------------------------------------------------------------------------------------------------
      svg.g
        .append('g')
        .selectAll('rect')
        .data([0])
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', lenD.w[0])
        .attr('height', lenD.h[0])
        .attr('fill', '#F2F2F2')

      // the background grid
      bckPattern({
        com: com,
        gNow: svg.g,
        gTag: 'hex',
        lenWH: [lenD.w[0], lenD.h[0]],
        opac: 0.1,
        hexR: 15
      })

      // ---------------------------------------------------------------------------------------------------
      //
      // ---------------------------------------------------------------------------------------------------
      updateDataOnce(dataIn.data)

      runWhenReady({
        pass: function () {
          return locker.isFree(tagAnalysisWidget + 'updateData')
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
      if (!locker.isFreeV([tagAnalysisWidget + 'updateData'])) {
        // console.log('will delay updateData');
        setTimeout(function () {
          updateData(dataIn)
        }, 10)
        return
      }
      console.log(dataIn)
      locker.add(tagAnalysisWidget + 'updateData')

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
                                                  );

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



      locker.remove(tagAnalysisWidget + 'updateData')
    }
    this.updateData = updateData
  }

  let plotlyMain = new PlotlyMain()
}
// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
