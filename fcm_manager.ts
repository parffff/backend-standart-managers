import fbAdmin from 'firebase-admin'
import { Message, MessagingPayload, MulticastMessage } from 'firebase-admin/messaging'
import { Injectable } from '@nestjs/common'

@Injectable()
export default class FCM {
  admin: fbAdmin.app.App
  constructor(key: string | fbAdmin.ServiceAccount) {
    if (fbAdmin.apps.length === 0) {
      this.admin = fbAdmin.initializeApp({
        credential: fbAdmin.credential.cert(key),
      })
    } else {
      this.admin = fbAdmin.app()
    }
  }

  sendToSingleToken(payload: Message) {
    this.admin
      .messaging()
      .send(payload)
      .then((response) => {
        console.log('Уведомление успешно отправлено: ', response)
      })
      .catch((error) => {
        console.log('При отправке возникла ошибка: ', error)
      })
  }

  sendToMultipleTokens(payload: MulticastMessage) {
    this.admin
      .messaging()
      .sendEachForMulticast(payload)
      .then((response) => {
        console.log('Уведомление успешно отправлено: ', response)
      })
      .catch((error) => {
        console.log('При отправке возникла ошибка: ', error)
      })
  }

  subscribeToTopic(registrationTokens: string | string[], topic: string) {
    // Подписка устройств(-а) пользователей на уведомления определенной тематики
    this.admin
      .messaging()
      .subscribeToTopic(registrationTokens, topic)
      .then(function (response) {
        console.log('Успешно подписано на тему: ', response)
      })
      .catch(function (error) {
        console.log('При подписке возникла ошибка:', error)
      })
  }

  unsubscribeFromTopic(registrationTokens: string | string[], topic: string) {
    // Отписка устройств(-а) пользователей от уведомлений определенной тематики
    this.admin
      .messaging()
      .unsubscribeFromTopic(registrationTokens, topic)
      .then(function (response) {
        console.log('Успешно отписано от темы:', response)
      })
      .catch(function (error) {
        console.log('При отписке возникла ошибка:', error)
      })
  }

  sendToTopic(topic: string, payload: MessagingPayload) {
    this.admin
      .messaging()
      .sendToTopic(topic, payload)
      .then(function (response) {
        console.log('Успешно отправленно в группу:', response)
      })
      .catch(function (error) {
        console.log('При отправке возникла ошибка:', error)
      })
  }
}
