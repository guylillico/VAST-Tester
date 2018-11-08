import OmidEvent from './OmidEvent'
import defer from '../../common/util/defer'
import loadScript from '../../common/util/loadScript'
import { OMID_VIDEO_LIFECYCLE_EVENT_TYPES } from '../../common/constants/omid'

const callIfFunction = fn => {
  if (typeof fn === 'function') {
    fn()
  }
}

export default class VerificationClient {
  constructor (adSessionContext, adSessionId, verificationParameters, onEvent) {
    this._adSessionContext = adSessionContext
    this._adSessionId = adSessionId
    this._verificationParameters = verificationParameters
    this._onEvent = onEvent
    this._vendorKey = null
    this._sessionObserver = null
    this._eventListeners = Object.create(null)
    this._dispatchedEvents = Object.create(null)
    this._scheduledSessionEvents = []
    this._deferreds = {
      sessionStart: defer(),
      sessionFinish: defer()
    }
    this._deferreds.sessionStart.promise
      .then(() => {
        this._onEvent('sessionStart')
        return this._deferreds.sessionFinish.promise
      })
      .then(() => {
        this._onEvent('sessionFinish')
      })
  }

  isSupported () {
    return true
  }

  registerSessionObserver (observer, vendorKey) {
    this._onEvent('registeringSessionObserver', { vendorKey })
    this._sessionObserver = observer
    this._vendorKey = vendorKey
    const events = this._scheduledSessionEvents.splice(0)
    for (let i = 0; events.length; ++i) {
      this._dispatchSessionEvent(events[i])
    }
  }

  addEventListener (type, listener) {
    if (type === 'video') {
      for (const actualType of OMID_VIDEO_LIFECYCLE_EVENT_TYPES) {
        this.addEventListener(actualType, listener)
      }
      return
    }
    if (this._eventListeners[type] == null) {
      this._eventListeners[type] = []
    }
    this._eventListeners[type].push(listener)
    const dispatched = this._dispatchedEvents[type]
    if (dispatched == null) {
      return
    }
    const events = dispatched.slice()
    for (let i = 0; i < events; ++i) {
      listener(events[i])
    }
  }

  sendUrl (url, successCallback, failureCallback) {
    this._onEvent('sendingUrl', { url })
    const xhr = new window.XmlHttpRequest()
    xhr.addEventListener('load', () => {
      this._onEvent('urlSent', { url })
      callIfFunction(successCallback)
    })
    xhr.addEventListener('error', () => {
      this._onEvent('urlSendError', { url })
      callIfFunction(failureCallback)
    })
    xhr.open('GET', url)
    xhr.send()
  }

  setTimeout (callback, timeInMillis) {
    return window.setTimeout(callback, timeInMillis)
  }

  clearTimeout (timeoutId) {
    return window.clearTimeout(timeoutId)
  }

  setInterval (callback, timeInMillis) {
    return window.setInterval(callback, timeInMillis)
  }

  clearInterval (intervalId) {
    return window.clearInterval(intervalId)
  }

  injectJavaScriptResource (url, successCallback, failureCallback) {
    this._onEvent('injectingJavaScriptResource', { url })
    loadScript(url).then(
      () => {
        this._onEvent('javaScriptResourceInjected', { url })
        callIfFunction(successCallback)
      },
      () => {
        this._onEvent('javaScriptResourceInjectionError', { url })
        callIfFunction(failureCallback)
      }
    )
  }

  _startSession () {
    this._requestSessionEvent('sessionStart', {
      context: this._adSessionContext,
      verificationParameters: this._verificationParameters
    })
  }

  _finishSession (error) {
    if (error != null) {
      this._requestSessionEvent('sessionError', error)
    }
    this._requestSessionEvent('sessionFinish')
  }

  _dispatchEvent (type, data) {
    const evt = this._newEvent(type, data)
    const listeners = this._eventListeners[type]
    if (listeners != null) {
      for (let i = 0; i < listeners.length; ++i) {
        listeners[i](evt)
      }
    }
    if (this._dispatchedEvents[type] == null) {
      this._dispatchedEvents[type] = []
    }
    this._dispatchedEvents[type].push(evt)
  }

  _requestSessionEvent (type, data = {}) {
    const evt = this._newEvent(type, data)
    if (this._sessionObserver != null) {
      this._dispatchSessionEvent(evt)
    } else {
      this._scheduledSessionEvents.push(evt)
    }
  }

  _dispatchSessionEvent (evt) {
    this._sessionObserver(evt)
    const dfd = this._deferreds[evt.type]
    if (dfd != null) {
      dfd.resolve()
    }
  }

  _newEvent (type, data) {
    return new OmidEvent(this._adSessionId, type, data)
  }
}
