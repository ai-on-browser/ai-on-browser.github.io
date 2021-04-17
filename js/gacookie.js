// ref https://github.com/burnworks/ga-cookie-opt-in-js

const gaCookieOptInKey = 'ga_cookie_opt_in'
const cookieOptin = localStorage.getItem(gaCookieOptInKey)
if (cookieOptin === 'yes') {
    window['ga-disable-G-D07CDNTP5E'] = false
} else {
    window['ga-disable-G-D07CDNTP5E'] = true
}

window.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const cookieOptin = localStorage.getItem(gaCookieOptInKey)
    if (cookieOptin === 'no') {
        window['ga-disable-G-D07CDNTP5E'] = true
    } else if (cookieOptin === 'yes') {
        window['ga-disable-G-D07CDNTP5E'] = false
    } else {
        window['ga-disable-G-D07CDNTP5E'] = true

        const noticeBase = document.createElement('div')
        noticeBase.classList.add('ga-notice')
        const notice = document.createElement('div')
        notice.classList.add('ga-notice-content')
        const message = document.createElement('div')
        message.classList.add('ga-message')
        message.textContent = 'This site uses Google Analytics cookies to record your website browsing data. You do not have to accept it to use this site.'
        notice.append(message)
        const buttons = document.createElement('div')
        const acceptBtn = document.createElement('button')
        acceptBtn.classList.add('accept')
        acceptBtn.textContent = 'Accept'
        acceptBtn.onclick = () => {
            localStorage.setItem(gaCookieOptInKey, 'yes')
            noticeBase.remove()
            window['ga-disable-G-D07CDNTP5E'] = false
        }
        buttons.append(acceptBtn)
        const rejectBtn = document.createElement('button')
        rejectBtn.classList.add('reject')
        rejectBtn.textContent = 'Reject'
        rejectBtn.onclick = () => {
            localStorage.setItem(gaCookieOptInKey, 'no')
            noticeBase.remove()
        }
        buttons.append(rejectBtn)
        notice.append(buttons)
        noticeBase.append(notice)
        document.body.append(noticeBase)
    }
})