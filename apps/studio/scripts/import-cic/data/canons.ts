import {sampleCanons} from './canons.sample'
import {canons375to380} from './canons.375-380'
import {canons381to402} from './canons.381-402'
import {canons403to411} from './canons.403-411'
import {canons412to430} from './canons.412-430'
import {canons431to459} from './canons.431-459'
import {canons460to468} from './canons.460-468'
import {canons469to494} from './canons.469-494'
import {canons495to502} from './canons.495-502'
import {canons503to510} from './canons.503-510'
import {canons511to514} from './canons.511-514'
import {canons515to552} from './canons.515-552'
import {canons553to555} from './canons.553-555'
import {canons556to572} from './canons.556-572'
import {canons573to606} from './canons.573-606'
import {canons607to640} from './canons.607-640'
import {canons641to683} from './canons.641-683'
import {canons684to709} from './canons.684-709'
import {canons710to730} from './canons.710-730'
import {canons731to746} from './canons.731-746'
import {canons747to755} from './canons.747-755'
import {canons756to780} from './canons.756-780'
import {canons781to792} from './canons.781-792'
import {canons793to821} from './canons.793-821'
import {canons822to833} from './canons.822-833'

// IMPORTANT:
// Runtime validation/import must be deterministic and offline.
// Book IV is intentionally NOT imported from the experimental live scraper.
// It will be re-enabled only as checked-in static CanonInput data after acquisition
// and verification against the official Holy See sources.

export const allCanons = [
  ...sampleCanons,
  ...canons375to380,
  ...canons381to402,
  ...canons403to411,
  ...canons412to430,
  ...canons431to459,
  ...canons460to468,
  ...canons469to494,
  ...canons495to502,
  ...canons503to510,
  ...canons511to514,
  ...canons515to552,
  ...canons553to555,
  ...canons556to572,
  ...canons573to606,
  ...canons607to640,
  ...canons641to683,
  ...canons684to709,
  ...canons710to730,
  ...canons731to746,
  ...canons747to755,
  ...canons756to780,
  ...canons781to792,
  ...canons793to821,
  ...canons822to833,
]
