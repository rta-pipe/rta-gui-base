import os
import copy
import gevent
from gevent import sleep
from gevent.coros import BoundedSemaphore
from math import sqrt, ceil, floor
from datetime import datetime
import random
from random import Random
import ctaGuiUtils.py.utils as utils
from ctaGuiUtils.py.utils import myLog, Assert, deltaSec, telIds, getTime
from ctaGuiUtils.py.utils_redis import redisManager


# -----------------------------------------------------------------------------------------------------------
#  rtaResults
# -----------------------------------------------------------------------------------------------------------
class rtaResults():
    # privat lock for this widget type
    lock = BoundedSemaphore(1)

    # all session ids for this user/widget
    wgtGrpToSessV = dict()

    # -----------------------------------------------------------------------------------------------------------
    #
    # -----------------------------------------------------------------------------------------------------------
    def __init__(self, widgetId="", mySock=None, *args, **kwargs):
        self.log = myLog(title=__name__)

        # the id of this instance
        self.widgetId = widgetId
        # the parent of this widget
        self.mySock = mySock
        Assert(log=self.log, msg=[
               " - no mySock handed to", self.__class__.__name__], state=(self.mySock is not None))

        # widget-class and widget group names
        self.widgetName = self.__class__.__name__
        self.widgetGroup = self.mySock.usrGrpId+''+self.widgetName

        self.redis = redisManager(name=self.widgetName, log=self.log)

        # turn on periodic data updates
        self.doDataUpdates = True
        # some etra logging messages for this module
        self.logSendPkt = False
        #
        self.nIcon = -1

        self.dataStreamChannel = None

    # -----------------------------------------------------------------------------------------------------------
    #  Executed every page reload !!
    # -----------------------------------------------------------------------------------------------------------
    def setup(self, *args):
        self.log.info([
            ['w', "-------------->"], ['r', "setup()"]
        ])

        with self.mySock.lock:
            wgt = self.redis.hGet(
                name='widgetV', key=self.widgetId, packed=True)
            self.nIcon = wgt["nIcon"]

        # override the global logging variable with a name corresponding to the current session id
        self.log = myLog(title=str(self.mySock.userId)+"/" +
                         str(self.mySock.sessId)+"/"+__name__+"/"+self.widgetId)



        # initial dataset and send to client
        optIn = {'widget': self, 'dataFunc': self.getInitData}
        self.mySock.sendWidgetInit(optIn=optIn)


        # Stops the data thread if it is active
        self.stopSyncToAnalysisSession()

        return


    # -----------------------------------------------------------------------------------------------------------
    #
    # -----------------------------------------------------------------------------------------------------------
    def syncToAnalysisSession(self, data):


        self.log.info([
            ['r', " =======> "], ['b', "syncToAnalysisSession event "], ['g', data]
        ])

        data_stream_channel = "gui_data.astri_rta."+str(data['instrument'])+"."+str(data['observation'])+"."+str(data['analysis'])

        # new channel!
        if self.dataStreamChannel != data_stream_channel:

            self.log.info([
                ['r', " syncToAnalysisSession() "], ['b', "self.dataStreamChannel: "], ['g', self.dataStreamChannel ], ['r', " is not equal to "], ['b', "data_stream_channel: "], ['g', data_stream_channel]
            ])

            self.dataStreamChannel = data_stream_channel
            self.log.info([
                ['r', " =======> "], ['b', "New channel name: "], ['g', self.dataStreamChannel ]
            ])



            # Download existing data if it exist
            data = self.getExistingData(self.dataStreamChannel)

            dataEmit = {
                "widgetType": self.widgetName, 'evtName': 'existingData', 'data': data
            }

            self.log.info([
                ['r', " ===DEBUG====> "], ['b', "self.wgtGrpToSessV: "], ['g', self.wgtGrpToSessV]
            ])

            """ TOFIX
            with self.mySock.lock:
                sessIdV = self.wgtGrpToSessV[self.widgetGroup]
                self.log.info([
                    ['r', " =======> "], ['b', "syncToAnalysisSession sending existing data.  sessIdV: "], ['g', sessIdV], ['b', "data length: "], ['r', len(data)]
                ])
                self.socketEvtWidgetV(evtName='existingData',
                                      data=dataEmit, sessIdV=sessIdV)
            """

            # Set streaming synchronization
            self.redis.setPubSub(key=self.dataStreamChannel)
            optIn = {
                        'widget': self,
                        'dataFunc': self.getDataFromPubSub,
                        'threadType': 'updateData',
                        'sleepTime': 1
                    }
            self.mySock.addWidgetTread(optIn=optIn)

        else:
            self.log.info([
                ['r', " syncToAnalysisSession() "], ['b', "self.dataStreamChannel: "], ['g', self.dataStreamChannel ], ['r', " is equal to "], ['b', "data_stream_channel: "], ['g', data_stream_channel]
            ])

        return


    def stopSyncToAnalysisSession(self):
        with self.mySock.lock:
            self.log.info([
                ['r', "stopSyncToAnalysisSession() "],
                ['b', " dataStreamChannel is: "], ['y', self.dataStreamChannel],
                ['b', " self.wgtGrpToSessV: "], ['y', self.wgtGrpToSessV],
                ['b', " self.widgetGroup: "], ['y', self.widgetGroup],
                ['b', " self.redis.pubSub: "], ['y', self.redis.pubSub]

            ])
            if self.widgetGroup in self.wgtGrpToSessV:
                if len(self.wgtGrpToSessV[self.widgetGroup]) > 0 :

                    # Unsubscribing..
                    if self.dataStreamChannel:
                        self.redis.pubSub[self.dataStreamChannel].unsubscribe(self.dataStreamChannel)
                        self.redis.pubSub.pop(self.dataStreamChannel, None)
                        self.dataStreamChannel = None
                    else:
                        self.log.info([['r', "stopSyncToAnalysisSession() "],['b', " cant unsubscribe, self.dataStreamChannel is None. Anyway, self.redis.pubSub = "], ['y', self.redis.pubSub]])

                    # Stopping greenlet thread
                    self.mySock.clearThreadsByType(self.widgetGroup)
                    self.wgtGrpToSessV.pop(self.widgetGroup, None)

                else:
                    self.log.info([
                        ['r', "len(self.wgtGrpToSessV[self.widgetGroup])="], ['b', len(self.wgtGrpToSessV[self.widgetGroup])]
                    ])
            else:
                self.log.info([
                    ['r', "self.widgetGroup: "], ['b', self.widgetGroup], ['r', " is not in "], ['r', "self.wgtGrpToSessV: "], ['b', self.wgtGrpToSessV]
                ])


    def topolino(self):
        self.log.info([
            ['r', " =======> "], ['b', "topolino()"], ['g', self.mySock.threadToSigD]
        ])



    # -----------------------------------------------------------------------------------------------------------
    #
    # -----------------------------------------------------------------------------------------------------------
    def getInitData(self):
        return None


    def getExistingData(self, keyLocation):

        dataTypes = ["detection"]#,keyLocation+".other"

        existingData = {}

        for dataType in dataTypes:

            dataTypeLocation = keyLocation+"."+dataType

            data = self.redis.zGet(
                name=dataTypeLocation, packed=False, packedScore=False)

            if len(data) > 0:
                # zGet returns a list of couples [ (data,score ), .. ].
                dataWithoutScore = [c[0] for c in data]
                existingData[dataType] = dataWithoutScore
            else:
                existingData[dataType] = None

            self.log.info([
                ['r', "getExistingData() data from : "], ['b', dataTypeLocation]
            ])



        self.log.info([
            ['r', " getExistingData() of "], ['b', dataTypes], ['r', " merged data: "], ['b', len(existingData["detection"])]
        ])


        return existingData

    def getDataFromPubSub(self):
        data = None

        if self.dataStreamChannel:
            data = self.redis.getPubSub(key=self.dataStreamChannel, timeout=0.1, packed=False);
            self.log.info([
                ['r', " =======> getDataFromPubSub() "], ['b', "Trying to read data from PubSub: "], ['g', data]
            ])

        else:
            self.log.info([
                ['r', " =======> getDataFromPubSub() "], ['b', "dataStreamChannel is Null "]
            ])

        return data



    def getDataOriginal(self):
        data = {
            "rnd": Random(getTime()).random(), 'time': getTime()
        }
        self.log.info([
            ['r', " =======> Original getdata"], ['g', data]
        ])

        return data



    # -----------------------------------------------------------------------------------------------------------
    #
    # -----------------------------------------------------------------------------------------------------------
    def backFromOffline(self):
        # with rtaResults.lock:
        #   print '-- backFromOffline',self.widgetName, self.widgetId
        return


    # -----------------------------------------------------------------------------------------------------------
    #
    # -----------------------------------------------------------------------------------------------------------
    def sendRndomMessage(self, data):
        # self.log.info([
        #     ['y', ' - got event: sendRndomMessage('],
        #     ['g', str(data['myMessage'])], ['y', ")"]
        # ])

        return



    """
    dataEmit = {
        'widgetType': self.widgetName,
        'evtName': "updateData",
        'data': self.syncToAnalysisSession()
    }

    self.mySock.socketEvtWidgetV(
        evtName=dataEmit['evtName'],
        data=dataEmit,
        sessIdV=[self.mySock.sessId],
        widgetIdV=[self.widgetId]
    )
    """
