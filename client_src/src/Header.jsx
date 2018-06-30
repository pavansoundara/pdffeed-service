import React from 'react'

const Header = () => {
  return (
    <div className='app__header'>
      <div className='row justify-content-md-center'>
        <div className='app__logo col-md-12'>
          <div className='app__logotext noselect'>
            <span className='app__logotext--red'> Pdf
            </span>Feed
            <sup className='app__logotext--super'> Beta
            </sup>
          </div>
        </div>
        <div className='app__logocap col-md-12'>
          <h6>
            Extract links from pdf.Check for broken links in pdf.
          </h6>
        </div>
      </div>
    </div>
  )
}

Header.propTypes = {}

export default Header
