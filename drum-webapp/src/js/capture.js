import { getConnectedDevices, updateDeviceParam } from "./device"
import {ref, reactive, computed} from 'vue'
const SAMPLE_RAMGE = [5, 50]
const THRESHOLD_RANGE = [0.1, 0.5]

const threshold = ref(0.16)
let captureStarted = ref(false)
const numSample = ref(15)
const th = reactive({ 
  aX: 0, aY: 0, aZ: 0,
  gX: 0, gY: 0, gZ: 0
})
const magnitude = computed(() => {
  return ((th.aX + th.aY + th.aZ + th.gX + th.gY + th.gZ) / 6).toFixed(3)
})
const capturedBuffer = ref([])
const filterCaptureTRef = ref({})
const selectedCapTime = ref(-1)
const captureSnaphot = reactive({t: 0, val: []})

const LIST_VIEWS = ['Main', 'Extracts']
const captureListView = ref(LIST_VIEWS[0])


let temp = []
const onReceiveNewDataForDataCollect = async newVal => {
  if (newVal[3] === '0') {
    const [aX, aY, aZ, gX, gY, gZ] = newVal.slice(4).split(",").map(val => parseFloat(val))
    
    th.aX = Math.abs(aX / 4.0)
    th.aY = Math.abs(aY / 4.0)
    th.aZ = Math.abs(aZ / 4.0)
    th.gX = Math.abs(gX / 2000.0)
    th.gY = Math.abs(gY / 2000.0)
    th.gZ = Math.abs(gZ / 2000.0)
    
    if (captureSnaphot.val.length >= numSample.value) captureSnaphot.val.splice(0, captureSnaphot.val.length - numSample.value + 1)
    captureSnaphot.t = Date.now()
    captureSnaphot.val.push(normaliseData(newVal))

  } else if (newVal[3] === '1') {
    temp.push(newVal.slice(4).split(',').map(d => parseFloat(d)))
    
  } else if (newVal[3] === '2') {
    const t = Date.now()
    capturedBuffer.value.push({t: t, val: temp})
    if (captureListView.value === LIST_VIEWS[1]) {
      filterCaptureTRef.value[t] = true
    }

    captureSnaphot.val.push(...temp)
    console.log(capturedBuffer.value)
    temp = []
  }
    
}

const normaliseAcc = d => ((d + 4.0) / 8.0).toFixed(3)
const normaliseGyro = d => ((d + 2000.0) / 4000.0).toFixed(3)

const normaliseData = rowStr => {
  const [aX, aY, aZ, gX, gY, gZ, 
    // mX, mY, mZ
  ] = rowStr.split(",").map(d => parseFloat(d))
  return [
    normaliseAcc(aX), normaliseAcc(aY), normaliseAcc(aZ),
    normaliseGyro(gX), normaliseGyro(gY), normaliseGyro(gZ)
  ]
}

const startCapture = () => {
  if (!getConnectedDevices().length) return

  captureStarted.value = !captureStarted.value
  updateDeviceParam()
  if(captureStarted.value) selectedCapTime.value = -1
}

const pauseCapture = () => {
  captureStarted.value = false
}

const resetCapture = () => {
  if (captureListView.value === LIST_VIEWS[0]) { // main view
    capturedBuffer.value = capturedBuffer.value.filter(bf => filterCaptureTRef.value[bf.t])
    if (!filterCaptureTRef.value[selectedCapTime.value]) selectedCapTime.value = -1
  } else { // extract view
    capturedBuffer.value = capturedBuffer.value.filter(bf => !filterCaptureTRef.value[bf.t])
    if (filterCaptureTRef.value[selectedCapTime.value]) selectedCapTime.value = -1
    filterCaptureTRef.value = {}
  }
  // capturedBuffer.value = []
  // filterCaptureTRef.value = {}
  // selectedCapTime.value = -1
}

const removeCapturedItem = (timestamp, e) => {
  const index = capturedBuffer.value.findIndex(bf => bf.t === timestamp)
  capturedBuffer.value.splice(index, 1)
  if (selectedCapTime.value === timestamp) {
    // console.log('match', selectedCapTime.value, capturedIndex)
    selectedCapTime.value =  -1
  }

  if (e) e.stopPropagation()
}

const hasAvailableDevices = () => {
  return getConnectedDevices().length
}

export {
  SAMPLE_RAMGE, THRESHOLD_RANGE, threshold, captureStarted, numSample, magnitude,
  capturedBuffer, filterCaptureTRef, selectedCapTime, captureSnaphot, LIST_VIEWS, captureListView,
  onReceiveNewDataForDataCollect, startCapture, pauseCapture, resetCapture, removeCapturedItem, hasAvailableDevices
}
