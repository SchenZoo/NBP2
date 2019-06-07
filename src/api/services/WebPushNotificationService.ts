import { Service } from 'typedi'
import admin = require('firebase-admin')
import path = require('path')
import { WebPushSubModel } from '../database/models/WebPushSubscription'

@Service()
export class WebPushNotificationService {
  constructor() {
    const serviceAccount = require(path.resolve('firebase-credentials.json'))
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://moj-trening-a96b2.firebaseio.com',
    })
  }

  public async sendWebPushNotification(payload: admin.messaging.MessagingPayload, receiverId: string) {
    const subscriptions = await WebPushSubModel.find({ user: receiverId })
    subscriptions.forEach(subscription => {
      admin
        .messaging()
        .sendToDevice(subscription.token, payload)
        .then(res => {
          console.log('webpush sent')
        })
        .catch(err => {
          console.log('webpush failed')
        })
    })
  }

  public makeWebPushNotification(title: string, body: string, tag: string, link: string, icon?: string): admin.messaging.MessagingPayload {
    return {
      notification: {
        title,
        body,
        icon: icon ? icon : `${process.env.APP_HOST}:${process.env.APP_PORT}/public/nodejslogo.png`,
        tag,
        clickAction: link,
        sound: 'default',
      },
      data: {
        dateOfArrival: Date.now().toString(),
        primaryKey: '1',
        url: link,
      },
    } as admin.messaging.MessagingPayload
  }
}
