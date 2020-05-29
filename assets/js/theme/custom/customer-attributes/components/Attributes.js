/* eslint-disable */
import React from 'react'
import PropTypes from 'prop-types'
import AttributesForm from './AttributesForm'

class Attributes extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            attributeNameValuePairs: [],
            editing: false,
            authToken: null,
            notifications: [],
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    componentDidMount() {
        const { appClientId, attributesApi, storefrontApiToken } = this.props

        const authTokenUrl = `/customer/current.jwt?app_client_id=${appClientId}`
        fetch(authTokenUrl)
            .then(res => res.text())
            .then(authToken => {
                this.setState({ authToken })
                const customerAttributesApiUrl = `${attributesApi}/customer-attributes`
                const options = {
                    method: 'GET',
                    headers: {
                        "X-Current-Customer": authToken,
                        "Accept": "application/json"
                    }
                }

                fetch(customerAttributesApiUrl, options)
                    .then(res => res.json())
                    .then(json => {
                        if (!json.data)
                            throw new Error('No data in the response from the customer attributes API.')
                        const attributes = json.data
                        var namedQueries = ''
                        attributes.forEach(attr => {
                            namedQueries += `attribute${attr.id}: attribute(entityId:${attr.id}) {
                                value
                                entityId
                            }`
                        })
                        if (!storefrontApiToken)
                            throw new Error('No storefront API token provided by Stencil.')
                        const url = '/graphql'
                        const options = {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${storefrontApiToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                query: `{
                                    customer {
                                        attributes {
                                            ${namedQueries}
                                        }
                                    }
                                }`
                            })
                        }

                        fetch(url, options)
                            .then(res => res.json())
                            .then(json => {
                                // convert alias response data to an array
                                const attributeValues = []
                                for (const attr in json.data.customer.attributes) {
                                    const { value, entityId } = json.data.customer.attributes[attr]
                                    attributeValues.push({ value, entityId })
                                }
                                const attributeNameValuePairs = attributeValues.map(attrValue => {
                                    const attribute = attributes.find(attr => attr.id === attrValue.entityId)

                                    return {
                                        attribute_id: attrValue.entityId,
                                        type: attribute.type,
                                        value: attrValue.value,
                                        name: attribute.name
                                    }
                                })

                                this.setState({
                                    attributeNameValuePairs,
                                })
                            })
                            .catch(err => {
                                console.error(err)
                                this.setState(prevState => ({
                                    notifications: prevState.notifications.concat('Error retrieving attribute values')
                                }))
                            })

                    })
                    .catch(err => {
                        console.error(err)
                        this.setState(prevState => ({
                            notifications: prevState.notifications.concat('Error retrieving attributes')
                        }))
                    })
            })
            .catch(err => {
                console.error(err)
                this.setState(prevState => ({
                    notifications: prevState.notifications.concat('Error retrieving auth token')
                }))
            })
    }

    handleChange(e) {
        const input = e.target.value
        const id = e.target.id
        this.setState(prevState => ({
            attributeNameValuePairs: prevState.attributeNameValuePairs.map(pair => {
                if (pair.attribute_id == id)
                    pair.value = input
                return pair
            })
        }))
    }

    handleClick(e) {
        e.preventDefault()
        const { authToken } = this.state
        const { attributesApi } = this.props
        const url = `${attributesApi}/customer-attribute-values`
        const options = {
            method: 'PUT',
            body: JSON.stringify(this.state.attributeNameValuePairs),
            headers: {
                "X-Current-Customer": authToken,
                "Content-Type": "application/json"
            }
        }

        fetch(url, options)
            .then(res => res.json())
            .then(json => {
                if (!json.data || !json.meta)
                    throw new Error('Error updating attributes: response body did not include data and meta')
                this.setState(prevState => ({
                    notifications: prevState.notifications.concat('Success! Attribute values have been updated.')
                }))
            })
            .catch(err => {
                console.error(err)
                this.setState(prevState => ({
                    notifications: prevState.notifications.concat('Error updating attribute values, please try again.')
                }))
            })
    }

    render() {
        const { notifications, attributeNameValuePairs } = this.state

        return <div>
            {notifications.length
                ? notifications.map((notification, index) => <div id={`error_${index}`} key={index}>
                    {notification} <span
                        style={[]}
                        onClick={prevState => this.setState(prevState => {
                            let newNotifications = prevState.notifications
                            newNotifications.splice(index)
                            return { notifications: newNotifications, }
                        })}>
                        X
                            </span>
                </div>)
                : null}
            {attributeNameValuePairs.length
                ? <AttributesForm
                    nameValuePairs={attributeNameValuePairs}
                    onChange={this.handleChange}
                    onClick={this.handleClick}
                />
                : null}
        </div>
    }
}

Attributes.propTypes = {
    appClientId: PropTypes.string.isRequired,
    attributesApi: PropTypes.string.isRequired,
    storefrontApiToken: PropTypes.string.isRequired,
}

export default Attributes