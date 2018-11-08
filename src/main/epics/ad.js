import { of as _of } from 'rxjs'
import {
  combineLatest,
  delay,
  filter,
  map,
  mapTo,
  mergeMap,
  takeUntil
} from 'rxjs/operators'
import { ofType, combineEpics } from 'redux-observable'
import {
  END_TEST,
  SCHEDULE_AD_START,
  SET_CONFIG,
  VAST_EVENT,
  VERIFICATION_SCRIPTS_STARTED,
  scheduleAdStart,
  setAdActive,
  startAd
} from '../actions'
import { PRELOAD_SIMULATION_TIME } from '../../common/settings'

const scheduleAdStartEpic = action$ =>
  action$.pipe(
    ofType(SET_CONFIG),
    map(({ payload: config }) => config),
    filter(Boolean),
    mergeMap(config =>
      action$.pipe(
        ofType(VAST_EVENT),
        filter(({ payload: { type } }) => type === 'loaded'),
        combineLatest(
          config.verificationSessionRequired
            ? action$.ofType(VERIFICATION_SCRIPTS_STARTED)
            : _of(null)
        ),
        mapTo(config),
        takeUntil(action$.ofType(END_TEST))
      )
    ),
    map(config =>
      scheduleAdStart(config.startDelayed, config.verificationSessionRequired)
    )
  )

const adStartEpic = action$ =>
  action$.pipe(
    ofType(SCHEDULE_AD_START),
    mergeMap(({ payload: settings }) => {
      let result = _of(settings)
      if (settings.delayed) {
        result = result.pipe(
          delay(PRELOAD_SIMULATION_TIME),
          takeUntil(action$.ofType(END_TEST))
        )
      }
      return result
    }),
    map(settings =>
      startAd(settings.delayed, settings.verificationSessionRequired)
    )
  )

const mapVastEventsToAdActive = (vastEvents, active) => action$ =>
  action$.pipe(
    ofType(VAST_EVENT),
    filter(({ payload: { type } }) => vastEvents.indexOf(type) >= 0),
    mapTo(setAdActive(active))
  )

export default combineEpics(
  scheduleAdStartEpic,
  adStartEpic,
  mapVastEventsToAdActive(['start'], true),
  mapVastEventsToAdActive(['complete', 'skip', 'error'], false)
)
