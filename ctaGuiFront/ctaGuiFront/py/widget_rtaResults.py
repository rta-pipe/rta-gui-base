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
        self.dataStreamThreadActive = False

    # -----------------------------------------------------------------------------------------------------------
    #
    # -----------------------------------------------------------------------------------------------------------
    def setup(self, *args):
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


        return


    # -----------------------------------------------------------------------------------------------------------
    #
    # -----------------------------------------------------------------------------------------------------------
    def syncToAnalysisSession(self, data):


        self.log.info([
            ['r', " =======> "], ['b', "syncToAnalysisSession event "], ['g', data]
        ])

        data_stream_channel = "astri_gui."+str(data['instrument'])+"."+str(data['observation'])+"."+str(data['analysis'])

        if self.dataStreamChannel != data_stream_channel:
            self.dataStreamChannel = data_stream_channel
            self.log.info([
                ['r', " =======> "], ['b', "New channel name: "], ['g', self.dataStreamChannel ]
            ])

            self.redis.setPubSub(key=self.dataStreamChannel)


            # start a thread which will call updateData() and send 1Hz data updates to
            # all sessions in the group
            optIn = {
                        'widget': self,
                        'dataFunc': self.getDataFromPubSub,
                        'threadType': 'updateData',
                        'sleepTime': 1
                    }

            if not self.dataStreamThreadActive:
                self.mySock.addWidgetTread(optIn=optIn)
                self.dataStreamThreadActive = True

        return


    def stopSyncToAnalysisSession(self):
        with self.mySock.lock:
            if self.dataStreamChannel:
                self.redis.pubSub[self.dataStreamChannel].unsubscribe(self.dataStreamChannel)
                self.redis.pubSub.pop(self.dataStreamChannel, None)
                self.dataStreamChannel = None



    # -----------------------------------------------------------------------------------------------------------
    #
    # -----------------------------------------------------------------------------------------------------------
    def getInitData(self):
        return None
    def getDataFromPubSub(self):
        data = None

        if self.dataStreamChannel:
            data = self.redis.getPubSub(key=self.dataStreamChannel, timeout=0.1, packed=False);
            self.log.info([
                ['r', " =======> "], ['b', "Trying to read data from PubSub: "], ['g', data]
            ])

        if data:
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
