/* eslint-disable */
import React from 'react'
import PropTypes from 'prop-types'

function AttributesForm({ nameValuePairs, onChange, onClick }) {
    return <form>
        {nameValuePairs.map((pair, key) => <div key={key} className="form-field">
            <label
                htmlFor={`attribute_value_${pair.attribute_id}`}
                className="form-label">
                {pair.name}
            </label>
            <input
                name={`attribute_value_${pair.attribute_id}`}
                id={pair.attribute_id}
                className="form-input"
                key={key}
                type={pair.type === 'string'
                    ? 'text'
                    : pair.type}
                onChange={onChange}
                value={pair.type === 'date' && pair.value.indexOf('T') > 0 // Remove timestamps from ISO8601 dates where needed
                    ? pair.value.slice(0, pair.value.indexOf('T'))
                    : pair.value} />
        </div>)}
        <div className="form-field"><input
            type="submit"
            className="button button--primary"
            value="Save"
            onClick={onClick}
        />
        </div>
    </form>
}

AttributesForm.propTypes = {
    nameValuePairs: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
}

export default AttributesForm