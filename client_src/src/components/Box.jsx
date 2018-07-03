import React from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import Pagination from 'react-js-pagination'

import pdf from '../assets/pdf-file.svg'

class Box extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  render () {
    let box = ''
    let loader = ''
    let statusIcon = ''
    let itemId = 0

    if (!this.props.statusLoading) {
      loader = 'd-none'
    }

    if (this.props.loading) {
      box = <div className='card card__loading'>
        <i className='material-icons card__spinner'> data_usage
        </i>
        <p> Extracting
          <p className='small'>
          Documents are only stored for process duration and erased.<br />
          Extracted data is not stored or used for any other purposes.
          </p>
        </p>

      </div>
    } else if (!this.props.loading && !this.props.loaded) {
      box = <div className='card card--uploadbox'>
        <Dropzone accept='application/pdf'
          multiple={false}
          onDrop={this.props.dropped}
          onDropRejected={this.props.dropRejected}
          type='file'
          className='form-control uploadbox'>
          <img className='uploadbox--image' src={pdf} alt='pdf icon' />
          <h5 className='uploadbox--title'>
            Drag &amp; Drop
          </h5>
          <p className='uploadbox--text'>
            Choose a file or drag it here
          </p>
        </Dropzone>
      </div>
    } else if (this.props.loaded) {
      const indexOfLastItem = this.props.activePage * this.props.pageItemCount
      const indexOfFirstItem = indexOfLastItem - this.props.pageItemCount
      const currentItems = this.props.linksCheck.slice(
        indexOfFirstItem,
        indexOfLastItem
      )

      if (currentItems.length > 0) {
        box =
          <div className='card'>
            <div className='table-responsive-lg'>
              <div className={'card__statusloading ' + loader}>
                <p><i className='material-icons card__statusspinner'> data_usage
                </i><br /> Checking Links
                </p>
              </div>
              <table className='table'>
                <thead className='thead--shadow'>
                  <tr>
                    <th scope='col' className='th--noborder'>
                      Link
                    </th>
                    <th scope='col' className='th--noborder2'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>{ currentItems.map(item => {
                  itemId++
                  /* Switch to switch case */
                  if (item.status === 'dead') {
                    statusIcon = <div className='statusIcons'>
                      <i className='material-icons icon--dead'>
                      cancel
                      </i>
                      <span
                        className='tooltiptext tooltip-left tooltiptext--error'>
                      Address Reachable.<br />
                      Link Dead.
                      </span>
                    </div>
                  } else if (item.status === 'alive') {
                    statusIcon = <i className='material-icons icon--alive'>
                    check_circle
                    </i>
                  } else if (item.status === null) {
                    statusIcon = <div className='statusIcons'>
                      <i className='material-icons icon--info'>
                      info
                      </i>
                      <span className='tooltiptext tooltip-left'>
                      Unsupported URL
                      </span>
                    </div>
                  } else if (item.status === '-') {
                    statusIcon = <span>-</span>
                  } else {
                    statusIcon = <div className='statusIcons'>
                      <i className='material-icons icon--notf'>
                      warning
                      </i>
                      <span className='tooltiptext tooltip-left'>
                        {item.status}
                      </span>
                    </div>
                  }
                  return (
                    <tr key={itemId}>
                      <td className='td--links'>
                        { item.link}
                        <a
                          href={item.link}
                          className='td--link'
                          target='_blank'>
                          <i className='material-icons material-icons--size16'>
                            launch
                          </i>
                        </a>
                      </td>
                      <td>
                        {statusIcon}
                      </td>
                    </tr>
                  )
                })}
                </tbody>
              </table>
            </div>
            <nav aria-label='Page navigation example'>
              <Pagination hideFirstLastPages
                activePage={this.props.activePage}
                itemsCountPerPage={this.props.pageItemCount}
                totalItemsCount={this.props.linksCheck.length}
                pageRangeDisplayed={5}
                onChange={this.props.pageChanged}
                itemClass={'page-item'}
                linkClass={'page-link'}
                activeLinkClass={'active'}
                linkClassPrev={'page-link page-link--prev'}
                linkClassNext={'page-link page-link--next'}
                prevPageText={'‹'}
                nextPageText={'›'} />
            </nav>
          </div>
      } else {
        box =
          <div className='card card__loading'>
            <i className='material-icons'>
              refresh
            </i>
            <p>
              No Links Found.Try again.
              <p className='small'>
              Upload manually and check if URL method doesn't work.
              </p>
            </p>
          </div>
      }
    }

    return (
      <div>
        {box}
      </div>
    )
  }
}

Box.propTypes = {
  loading: PropTypes.bool,
  loaded: PropTypes.bool,
  linksCheck: PropTypes.array,
  dropped: PropTypes.func,
  pageChanged: PropTypes.func,
  pageItemCount: PropTypes.number,
  activePage: PropTypes.number,
  statusLoading: PropTypes.bool,
  dropRejected: PropTypes.func
}

export default Box
