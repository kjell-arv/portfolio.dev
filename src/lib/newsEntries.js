import img1 from '../components/img/jwm.JPG'
import spainsvg from '../components/img/4x3/es.svg'
import img2 from '../components/img/holten.jpg'
import NEDsvg from '../components/img/4x3/nl.svg'
import img3 from '../components/img/JEM3.JPG'
import TURsvg from '../components/img/4x3/tr.svg'
import img4 from '../components/img/MalleTL.JPG'
import { applySeedOverrides } from './contentStore'
import { isEntryVisibleOnPublicSite } from './publish'
import { seedCompetitions, seedStories } from './seedContent'
import { applyOrderToList } from './newsOrderStore'

const mediaByKey = {
  camp: { img: img4, flag: spainsvg },
  jwc: { img: img1, flag: spainsvg },
  jec: { img: img2, flag: NEDsvg },
  jem: { img: img3, flag: TURsvg },
}

const baseCompetitions = seedCompetitions.map((item) => ({
  ...item,
  published: true,
  ...mediaByKey[item.key],
}))

const baseStories = seedStories.map((item) => ({
  ...item,
  published: true,
  ...mediaByKey[item.key],
}))

export function getMergedNewsLists(customItems, seedOverrides, opts = {}) {
  const pub = { preview: !!opts.preview }

  const mergedCompetitions = (() => {
    const base = applySeedOverrides(baseCompetitions, seedOverrides).map((item) => ({
      ...item,
      img: item.imageData || item.img,
    }))
    const custom = customItems
      .filter((item) => item.section === 'competitions')
      .map((item) => ({ ...item, img: item.imageData || null, flag: null }))
    const list = [...custom, ...base].filter((item) => isEntryVisibleOnPublicSite(item, pub))
    return applyOrderToList(list, 'competitions')
  })()

  const mergedStories = (() => {
    const base = applySeedOverrides(baseStories, seedOverrides).map((item) => ({
      ...item,
      img: item.imageData || item.img,
    }))
    const custom = customItems
      .filter((item) => item.section === 'stories')
      .map((item) => ({ ...item, img: item.imageData || null, flag: null }))
    const list = [...custom, ...base].filter((item) => isEntryVisibleOnPublicSite(item, pub))
    return applyOrderToList(list, 'stories')
  })()

  const mergedUpdates = applyOrderToList(
    customItems
      .filter((item) => item.section === 'updates')
      .map((item) => ({ ...item, img: item.imageData || null, flag: null }))
      .filter((item) => isEntryVisibleOnPublicSite(item, pub)),
    'updates'
  )

  return { mergedCompetitions, mergedStories, mergedUpdates }
}

export function getAllMergedNewsEntries(customItems, seedOverrides, opts = {}) {
  const { mergedCompetitions, mergedStories, mergedUpdates } = getMergedNewsLists(customItems, seedOverrides, opts)
  return [...mergedCompetitions, ...mergedStories, ...mergedUpdates]
}

export function findNewsEntryById(entryId, customItems, seedOverrides, opts = {}) {
  if (!entryId) return null
  const all = getAllMergedNewsEntries(customItems, seedOverrides, opts)
  return all.find((item) => item.id === entryId) ?? null
}
