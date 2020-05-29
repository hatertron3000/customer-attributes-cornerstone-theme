/* eslint-disable */
import PageManager from '../../page-manager'
import React from 'react'
import ReactDOM from 'react-dom'
import Attributes from './components/Attributes'

export default class CustomerAttributes extends PageManager {
    onReady() {
        const appClientId = '4ae70rishmz3cxjwv6dj0x6wln4w0j1'
        const attributesApi = 'https://yaqyfd700d.execute-api.us-east-1.amazonaws.com/dev'
        const container = document.getElementById('attributes-container')
        ReactDOM.render(<Attributes
            appClientId={appClientId}
            attributesApi={attributesApi}
            storefrontApiToken={this.context.storefrontApiToken}
        />, container)
    }
}
