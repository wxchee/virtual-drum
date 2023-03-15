import {reactive} from 'vue'
import {trigger} from '@/components/DataPanel.vue'

const SERVICE_UUID = 'f30c5d5f-ec5a-4c1d-94c5-46e35d810dc5'
const gesture_characteristic_UUID = '2f925c9d-0a5b-4217-8e63-2d527c9211c1'
// const send_characteristic_UUID = 'f8edf338-6bbd-4c3b-bf16-d8d2b6cdaa6e'
const devices = {
  left: reactive({ name: '', gatt: null, char: null }),
  right: reactive({ name: '', gatt: null, char: null })
}

const encoder = new TextEncoder('utf-8')
const decoder = new TextDecoder('utf-8')

const connectBTDevice = async cb => {
  let gestureChar = null
  let device = await navigator.bluetooth.requestDevice({ filters: [{ services: [SERVICE_UUID] }]})
  const deviceType = device.name == 'DRUM_L' ? 'left' : 'right'
  
  device.addEventListener('gattserverdisconnected', () => {
    console.log(device.name, ' disconnect')
    devices[deviceType].gatt = null
    devices[deviceType].char = null
  })

  let gatt = await device.gatt.connect()

  let service = await gatt.getPrimaryService(SERVICE_UUID)
  gestureChar = await service.getCharacteristic(gesture_characteristic_UUID)
  if (gestureChar.properties.notify) {
    gestureChar.addEventListener('characteristicvaluechanged', async e => cb(decoder.decode(e.target.value)))
    await gestureChar.startNotifications()
    
    devices[deviceType].name = device.name
    devices[deviceType].gatt = device.gatt
    devices[deviceType].char = gestureChar
    trigger.ready = true
    console.log(device.name, ' connected.')
  } else {
    console.log('no \'notify\' property, please specify BLENotify under your peripheral device as part of the characteristic property')
  }
}

const disconnectBTDevice = async d => {
  if (d.gatt.connected) {
    await d.gatt.disconnect()
  } else {
    console.log('device is already disconnected')
  }
}

const getConnectedDevices = () => Object.keys(devices)
  .filter(dk => devices[dk].char && devices[dk].char.service.device.gatt.connected)
  .map(dk => devices[dk])

const broadcastTrigger = msg => {
  let sentCount = 0
  const connectedDevices = getConnectedDevices()
  connectedDevices.forEach(async d => {
    await d.char.writeValueWithResponse(encoder.encode(msg))
    console.log('trigger sent to ', d.name)
    sentCount++
    
  })

  return sentCount == connectedDevices.length
}

export {devices, connectBTDevice, disconnectBTDevice, getConnectedDevices, broadcastTrigger}
