import React, {Component} from 'react'
import PropTypes from 'prop-types'

class Buttons extends Component {
  render () {
    return (
      <div>
        {(this.props.loaded) ? (
          <div>
            <button
              type='button'
              className='btn btn-danger btn--upload btn--basic'
              onClick={this.props.uploadNewClicked}>
            Upload New
            </button>
            <button
              type='button'
              className='btn btn-light btn--check btn--basic'
              onClick={this.props.checkLinksClicked}>
            Check Links
            </button>
          </div>) : null}
      </div>
    )
  }
}

Buttons.propTypes = {
  loaded: PropTypes.bool,
  uploadNewClicked: PropTypes.func,
  checkLinksClicked: PropTypes.func
}

export default Buttons
